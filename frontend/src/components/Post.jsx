import React, { useEffect, useState } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { IoTimeOutline, IoSend, IoEllipsisHorizontal } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../utils/autcontext";

function Post({ postId, posts, avatar, createdBy, title, content, likes, comments: initialComments, createdAt, addCommentToPost, onDelete }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isPostCreator, setisPostCreator] = useState(false);

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

  useEffect(() => {
    const getcomments = async () => {
      setCommentsLoading(true);
      try {
        const response = await api.get(`/post/${postId}/getcomment`);
        if (response.status === 200) {
          setComments(response.data.data.result);
        }
      } catch (error) {
        console.error("Error fetching comments:", error.response ? error.response.data : error.message);
      } finally {
        setCommentsLoading(false);
      }
    };
    if (showComments) {
      getcomments();
    }
  }, [showComments, postId]);

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
      createdby: { id: user._id, username: user.username },
      createdAt: new Date().toISOString(),
    };

    try {
      let response = await api.post(`/post/${postId}/addcomment`, { text: commentText });
      if (response.status !== 200) {
        throw new Error("Error occurred while commenting on the post");
      }
      const commentsResponse = await api.get(`/post/${postId}/getcomment`);
      if (commentsResponse.status === 200) {
        setComments(commentsResponse.data.data.result);
      }
  
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
  useEffect(() => {
    console.log("user id", user._id);
    console.log("created by ", createdBy)
    console.log("created by ", createdBy.id._id)
    setisPostCreator(
      user &&
      createdBy &&
      user._id?.toString() === (createdBy.id._id)?.toString()
    );
  }, [user, createdBy, posts]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-secondary rounded-2xl shadow-lg border border-card-border p-6 mb-6 overflow-hidden hover:shadow-xl transition-shadow duration-300 mt-8"

    >
      {/* Post Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <img
            src={avatar || `https://ui-avatars.com/api/?name=${createdBy.username}&background=random`}
            alt={`${createdBy.username}'s avatar`}
            className="w-14 h-14 rounded-full object-cover border-2 border-accent/20 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-secondary"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-text-primary mb-1 truncate">
                {createdBy.username}
              </h3>
              <div className="flex items-center text-text-muted text-sm">
                <IoTimeOutline className="mr-1.5 text-accent" />
                <span>{formattedDate}</span>
              </div>
            </div>
            
            {isPostCreator && (
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-200 group"
                  title="Delete Post"
                >
                  <FaTrash className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-3 leading-tight">
          {title}
        </h2>
        <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between py-3 px-1 border-t border-card-border">
        <div className="flex items-center space-x-6">
          <button
            onClick={isLiked ? handleremovelike : handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isLiked 
                ? 'text-accent bg-accent/10 hover:bg-accent/20' 
                : 'text-text-muted hover:text-accent hover:bg-accent/10'
            }`}
          >
            {isLiked ? (
              <AiFillLike className="text-lg" />
            ) : (
              <AiOutlineLike className="text-lg" />
            )}
            <span className="font-medium">{likeCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200"
          >
            <FaRegComment className="text-lg" />
            <span className="font-medium">{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-card-border pt-4 mt-4"
          >
            {/* Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mb-6">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`}
                alt="Your avatar"
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-card border border-card-border rounded-full px-4 py-3 pr-12 text-text-primary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-accent hover:text-accent-light disabled:text-text-muted disabled:cursor-not-allowed p-2 rounded-full hover:bg-accent/10 transition-all duration-200"
                >
                  <IoSend className="text-lg" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            {commentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                <span className="ml-3 text-text-muted">Loading comments...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => {
                  const isCommentCreator = user && comment.createdBy && (user._id?.toString() === (comment.createdBy._id || comment.createdBy.id)?.toString());
                  return (
                    <div key={index} className="flex items-start space-x-3 group">
                      <img
                        src={`https://ui-avatars.com/api/?name=${comment.createdBy?.username || "Unknown"}&background=random`}
                        alt={`${comment.createdBy?.username || "Unknown"}'s avatar`}
                        className="w-9 h-9 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-card rounded-2xl p-4 shadow-sm border border-card-border">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-text-primary text-sm">
                              {comment.createdBy?.username || <span className="text-red-500">[Unknown User]</span>}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-text-muted text-xs">
                                {formatCommentDate(comment.createdAt)}
                              </span>
                              {isCommentCreator && (
                                <button
                                  className="text-red-400 hover:text-red-600 text-xs font-medium px-2 py-1 rounded-full hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title="Delete Comment"
                                  onClick={async () => {
                                    try {
                                      await api.post(`/post/${postId}/deletecomment`, { commentid: comment._id });
                                      const commentsResponse = await api.get(`/post/${postId}/getcomment`);
                                      if (commentsResponse.status === 200) {
                                        setComments(commentsResponse.data.data.result);
                                      }
                                    } catch (error) {
                                      console.error("Error deleting comment:", error.response ? error.response.data : error.message);
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-text-secondary text-sm leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default Post;