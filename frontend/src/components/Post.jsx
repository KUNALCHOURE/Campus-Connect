import React, { useEffect, useState } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { IoTimeOutline, IoSend, IoEllipsisHorizontal } from "react-icons/io5";
import { FaTrash } from "react-icons/fa"; // Add trash icon for delete
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
              {user && user._id === createdBy.id._id.toString() && (
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
          
          <motion.h2
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold mt-3 mb-2 text-text-primary"
          >
            {title}
          </motion.h2>
        </div>
      </div>

      {/* Post Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 mb-5 text-text-secondary leading-relaxed"
      >
        <p className="whitespace-pre-line">{content}</p>
      </motion.div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-card-border pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isLiked ? handleremovelike : handleLike}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${
            isLiked 
              ? "text-accent bg-accent/10" 
              : "text-text-muted hover:text-accent hover:bg-accent/5"
          } transition-all duration-300`}
        >
          {isLiked ? (
            <AiFillLike className={`text-lg ${isLiked ? "animate-pulse-custom" : ""}`} />
          ) : (
            <AiOutlineLike className="text-lg" />
          )}
          <span className="text-sm font-medium">{likeCount}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
            showComments 
              ? "text-accent bg-accent/10" 
              : "text-text-muted hover:text-accent hover:bg-accent/5"
          }`}
        >
          <FaRegComment className="text-lg" />
          <span className="text-sm font-medium">{comments.length}</span>
        </motion.button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <div className="border-t border-card-border my-3"></div>
            
            <form onSubmit={handleCommentSubmit} className="flex items-end space-x-2 mb-4">
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-input text-text-primary border border-card-border rounded-lg p-3 min-h-[80px] focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className={`flex items-center justify-center bg-accent hover:bg-accent-hover text-white rounded-lg p-3 h-10 w-10 ${
                  submittingComment || !commentText.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <IoSend />
              </motion.button>
            </form>
            
            <motion.div 
              className="space-y-4 mt-4 max-h-96 overflow-y-auto pr-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-lg p-3 flex gap-3"
                  >
                    <div className="flex-shrink-0">
                      {comment.createdBy?.username ? (
                        <img 
                          src={`https://ui-avatars.com/api/?name=${comment.createdBy.username}&background=random`} 
                          alt={`${comment.createdBy.username}'s avatar`} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="w-8 h-8 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-text-primary text-sm">
                          {comment.createdBy?.username || "Unknown User"}
                        </h4>
                        <span className="text-xs text-text-muted">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mt-1">{comment.text}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p 
                  className="text-center text-text-muted py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No comments yet. Be the first to comment!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default Post;