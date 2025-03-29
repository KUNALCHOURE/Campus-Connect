import React, { useEffect, useState } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { IoTimeOutline, IoSend, IoEllipsisHorizontal } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../utils/autcontext";

function Post({ postId, avatar, createdBy, title, content, likes, comments: initialComments, createdAt, addCommentToPost, onDelete }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Format the created date to a more elegant format
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formattedDate = formatDate(createdAt);

  const formatCommentDate = (dateString) => {
    if (!dateString) return "Recent";
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (error) {
      return "Recent";
    }
  };

  useEffect(() => {
    if (user && user.likedPosts) {
      setIsLiked(user.likedPosts.includes(postId));
    }
  }, [user, postId]);

  const handleLike = async () => {
    try {
      let res = await api.post("/post/likepost", { postid: postId });
      if (res.status === 200) {
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error liking the post:", error.response ? error.response.data : error.message);
    }
  };

  const handleremovelike = async () => {
    try {
      let res = await api.post('post/unlikepost', { postid: postId });
      if (res.status !== 200) {
        throw new Error("Error occurred while unliking the post");
      }
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } catch (e) {
      console.log("Error", e.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!user || !user.username) {
      console.error("User is not logged in or username is missing");
      return;
    }

    const newComment = {
      text: commentText,
      createdBy: { username: user.username },
      createdAt: new Date().toISOString(),
    };

    try {
      let response = await api.post(`/post/${postId}/addcomment`, { text: commentText });
      if (response.status !== 200) {
        throw new Error("Error occurred while commenting on the post");
      }

      setComments((prevComments) => [...prevComments, newComment]);
      addCommentToPost(postId, newComment);
      setCommentText("");
      setSubmittingComment(false);
    } catch (error) {
      console.error("Error posting the comment:", error.response ? error.response.data : error.message);
      setSubmittingComment(false);
    }
  };

  // Function to handle post deletion
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await api.post("/post/deletepost", { postid: postId });
      if (response.status !== 200) {
        throw new Error("Error occurred while deleting the post");
      }

      // Notify the parent component to remove the post from the list
      onDelete(postId);
    } catch (error) {
      console.error("Error deleting the post:", error.response ? error.response.data : error.message);
    }
  };

  // Check if the current user is the post creator
  const isPostCreator = user && createdBy && user._id === createdBy._id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-secondary rounded-xl shadow-md border border-card-border p-5 mb-6 overflow-hidden"
    >
      {/* Post Header */}
      <div className="flex items-start gap-3">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={avatar || `https://ui-avatars.com/api/?name=${createdBy.username}&background=random`}
            alt={`${createdBy.username}'s avatar`}
            className="w-12 h-12 rounded-full object-cover border-2 border-accent/30"
          />
          <motion.div 
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center border-2 border-secondary"
            whileHover={{ scale: 1.2 }}
          >
            <span className="text-white text-[10px] font-bold">+</span>
          </motion.div>
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <motion.h3 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-semibold text-text-primary"
              >
                {createdBy.username}
              </motion.h3>
              <motion.div 
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center text-text-muted text-xs"
              >
                <IoTimeOutline className="mr-1" />
                <span>{formattedDate}</span>
              </motion.div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Delete Button (only visible to the post creator) */}
              {isPostCreator && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                  title="Delete Post"
                >
                  <FaTrash />
                </motion.button>
              )}
              <button className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-card transition-colors">
                <IoEllipsisHorizontal />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold text-text-primary mb-2">{title}</h2>
        <p className="text-text-secondary whitespace-pre-wrap">{content}</p>
      </div>

      {/* Post Actions */}
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={isLiked ? handleremovelike : handleLike}
          className="flex items-center space-x-1 text-text-muted hover:text-accent transition-colors"
        >
          {isLiked ? (
            <AiFillLike className="text-accent" />
          ) : (
            <AiOutlineLike />
          )}
          <span>{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-text-muted hover:text-accent transition-colors"
        >
          <FaRegComment />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-card-border pt-4"
          >
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-card border border-card-border rounded-full px-4 py-2 text-text-primary focus:outline-none focus:border-accent"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="text-accent hover:text-accent-light transition-colors"
              >
                <IoSend />
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${comment.createdBy.username}&background=random`}
                    alt={`${comment.createdBy.username}'s avatar`}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-card rounded-lg p-3">
                      <p className="text-text-primary text-sm">{comment.text}</p>
                      <div className="flex items-center text-text-muted text-xs mt-1">
                        <span>{comment.createdBy.username}</span>
                        <span className="mx-1">•</span>
                        <span>{formatCommentDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default Post;