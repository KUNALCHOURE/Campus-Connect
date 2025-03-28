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
    const { page = 1, limit = 10, tag, search } = req.query;
    const query = {};

    // Add tag filter if provided
    if (tag) {
        query.tags = tag;
    }

    // Add search filter if provided
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } }
        ];
    }

    const discussions = await discussion.find(query)
        .populate('createdBy.id', 'username')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await discussion.countDocuments(query);

    return res.status(200)
        .json(new Apiresponse(200, {
            discussions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        }, "Discussions fetched successfully"));
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

// Like/Unlike a discussion
const toggleLike = asynchandler(async (req, res) => {
    const { discussionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Apierror(400, "Invalid discussion ID");
    }

    const discussionData = await discussion.findById(discussionId);

    if (!discussionData) {
        throw new Apierror(404, "Discussion not found");
    }

    const userLiked = discussionData.likes.includes(req.user._id);

    if (userLiked) {
        discussionData.likes = discussionData.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
        discussionData.likes.push(req.user._id);
    }

    await discussionData.save();

    return res.status(200)
        .json(new Apiresponse(200, {
            likes: discussionData.likes.length,
            liked: !userLiked
        }, userLiked ? "Discussion unliked successfully" : "Discussion liked successfully"));
});

export {
    createDiscussion,
    getDiscussions,
    getDiscussionById,
    updateDiscussion,
    deleteDiscussion,
    addComment,
    toggleLike
};