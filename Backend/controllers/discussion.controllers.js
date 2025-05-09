import mongoose from 'mongoose';
import { discussion } from '../models/Discussion.model.js';
import Apierror from '../utils/Apierror.js';
import Apiresponse from '../utils/Apiresponse.js';
import asynchandler from '../utils/asynchandler.js';

// Create a new discussion
const createDiscussion = asynchandler(async (req, res) => {
    const { title, content, tags } = req.body;

    if (!title || !content || !tags) {
        throw new Apierror(400, "Please provide all required fields");
    }

    const createdBy = {
        id: req.user._id,
        username: req.user.username
    };

    const newDiscussion = await discussion.create({
        title,
        content,
        tags,
        createdBy
    });

    if (!newDiscussion) {
        throw new Apierror(500, "Error while creating discussion");
    }

    return res.status(201)
        .json(new Apiresponse(201, newDiscussion, "Discussion created successfully"));
});

// Get all discussions with pagination and filters
const getDiscussions = asynchandler(async (req, res) => {
    try {
        const { search, tag } = req.query;

        // Define a filter object
        const filter = {};

        // If a search term is provided, search in title and content
        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
            filter.$or = [
                { title: searchRegex },
                { content: searchRegex }
            ];
        }

        // If a tag is provided, filter by tag
        if (tag) {
            filter.tags = tag;
        }

        const discussions = await discussion
            .find(filter) // Apply the filter
            .populate('createdBy.id', 'username')
            .sort({ createdAt: -1 });

        const total = await discussion.countDocuments(filter);

        return res.status(200).json(new Apiresponse(200, {
            discussions,
            total,
            pages: 1, // Adjust if paginating
            currentPage: 1
        }, "Discussions fetched successfully"));
    } catch (error) {
        console.error("Error in getDiscussions:", error);
        throw new Apierror(500, "Error fetching discussions");
    }
});
// Get a single discussion by ID
const getDiscussionById = asynchandler(async (req, res) => {
    const { discussionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const discussionData = await discussion.findById(discussionId)
        .populate('createdBy.id', 'username')
        .populate('comments.createdBy.id', 'username');

    if (!discussionData) {
        throw new Apierror(404, "Discussion not found");
    }

    // Increment view count
    discussionData.views += 1;
    await discussionData.save();

    return res.status(200)
        .json(new Apiresponse(200, discussionData, "Discussion fetched successfully"));
});

// Update a discussion
const updateDiscussion = asynchandler(async (req, res) => {
    const { discussionId } = req.params;
    const { title, content, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const discussionData = await discussion.findById(discussionId);

    if (!discussionData) {
        throw new Apierror(404, "Discussion not found");
    }

    // Check if user is the creator
    if (discussionData.createdBy.id.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "You can only update your own discussions");
    }

    const updatedDiscussion = await discussion.findByIdAndUpdate(
        discussionId,
        {
            $set: {
                title,
                content,
                tags
            }
        },
        { new: true }
    );

    return res.status(200)
        .json(new Apiresponse(200, updatedDiscussion, "Discussion updated successfully"));
});

// Delete a discussion
const deleteDiscussion = asynchandler(async (req, res) => {
    const { discussionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const discussionData = await discussion.findById(discussionId);

    if (!discussionData) {
        throw new Apierror(404, "Discussion not found");
    }

    // Check if user is the creator
    if (discussionData.createdBy.id.toString() !== req.user._id.toString()) {
        throw new Apierror(403, "You can only delete your own discussions");
    }

    await discussion.findByIdAndDelete(discussionId);

    return res.status(200)
        .json(new Apiresponse(200, {}, "Discussion deleted successfully"));
});

// Add a comment to a discussion
const addComment = asynchandler(async (req, res) => {
    const { discussionId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const discussionData = await discussion.findById(discussionId);

    if (!discussionData) {
        throw new Apierror(404, "Discussion not found");
    }

    const comment = {
        text,
        createdBy: {
            id: req.user._id,
            username: req.user.username
        }
    };

    discussionData.comments.push(comment);
    await discussionData.save();

    return res.status(200)
        .json(new Apiresponse(200, discussionData, "Comment added successfully"));
});
const toggleLike = asynchandler(async (req, res) => {
    const { discussionId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const currentDiscussion = await discussion.findById(discussionId);
    if (!currentDiscussion) {
        throw new Apierror(404, "Discussion not found");
    }

    // Initialize likedDiscussions array if it doesn't exist
    if (!req.user.likedDiscussions) {
        req.user.likedDiscussions = [];
    }

    // Check if the user has already liked the discussion
    const userLiked = req.user.likedDiscussions.some(id => id.toString() === discussionId.toString());

    if (userLiked) {
        // Unlike: Decrease likes count and remove from user's likedDiscussions
        currentDiscussion.likes = Math.max(0, currentDiscussion.likes - 1);
        req.user.likedDiscussions = req.user.likedDiscussions.filter(id => id.toString() !== discussionId.toString());
    } else {
        // Like: Increase likes count and add to user's likedDiscussions
        currentDiscussion.likes += 1;
        req.user.likedDiscussions.push(discussionId);
    }

    await currentDiscussion.save();
    await req.user.save();

    return res.status(200).json(new Apiresponse(200, {
        likes: currentDiscussion.likes,
        liked: !userLiked
    }, userLiked ? "Discussion unliked successfully" : "Discussion liked successfully"));
});

// Get like status for a discussion
const getLikeStatus = asynchandler(async (req, res) => {
    const { discussionId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const discussion = await discussion.findById(discussionId);
    if (!discussion) {
        throw new Apierror(404, "Discussion not found");
    }

    // Initialize likedDiscussions array if it doesn't exist
    if (!req.user.likedDiscussions) {
        req.user.likedDiscussions = [];
    }

    const liked = req.user.likedDiscussions.some(id => id.toString() === discussionId.toString());

    return res.status(200).json(new Apiresponse(200, { 
        liked,
        likes: discussion.likes
    }, "Like status fetched successfully"));
});

// Delete a comment
const deleteComment = asynchandler(async (req, res) => {
    const { discussionId, commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new Apierror(400, "Invalid discussion or comment ID");
    }

    const discussion = await discussion.findById(discussionId);
    if (!discussion) {
        throw new Apierror(404, "Discussion not found");
    }

    const comment = discussion.comments.id(commentId);
    if (!comment) {
        throw new Apierror(404, "Comment not found");
    }

    // Check if user is the comment creator
    if (comment.createdBy.id.toString() !== userId.toString()) {
        throw new Apierror(403, "You can only delete your own comments");
    }

    comment.remove();
    await discussion.save();

    return res.status(200).json(new Apiresponse(200, {}, "Comment deleted successfully"));
});

export {
    createDiscussion,
    getDiscussions,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    addComment,
    toggleLike,
    getLikeStatus,
    deleteComment
};