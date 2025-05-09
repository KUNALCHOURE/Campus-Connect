import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { IoSendSharp } from 'react-icons/io5';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaTrash } from 'react-icons/fa';
import { useAuth } from '../utils/autcontext';
import { formatDistanceToNow } from 'date-fns';

function DiscussionList({ discussions, fetchDiscussions }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [error, setError] = useState({});
  const [likedStatus, setLikedStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDiscussions, setFilteredDiscussions] = useState([]);

  useEffect(() => {
    // Filter discussions based on search term
    if (searchTerm.trim() === '') {
      setFilteredDiscussions(discussions);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = discussions.filter(discussion => 
        discussion.title.toLowerCase().includes(lowercasedSearch) || 
        discussion.content.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredDiscussions(filtered);
    }
  }, [searchTerm, discussions]);

  useEffect(() => {
    const checkLikeStatuses = async () => {
      const statuses = {};
      for (const discussion of discussions) {
        try {
          const response = await api.get(`/discussion/${discussion._id}/like-status`);
          statuses[discussion._id] = response.data.data.liked;
        } catch (error) {
          console.error(`Error checking like status for discussion ${discussion._id}:`, error);
        }
      }
      setLikedStatus(statuses);
      setIsLoading(false);
    };

    checkLikeStatuses();
  }, [discussions]);

  const handleCommentChange = (discussionId, e) => {
    setCommentText({ ...commentText, [discussionId]: e.target.value });
    setError({ ...error, [discussionId]: null });
  };

  const handleCommentSubmit = async (discussionId, e) => {
    e.preventDefault();
    if (!commentText[discussionId]?.trim()) return;

    setIsSubmitting({ ...isSubmitting, [discussionId]: true });
    setError({ ...error, [discussionId]: null });

    try {
      await api.post(`/discussion/${discussionId}/comments`, {
        text: commentText[discussionId]
      });
      
      setCommentText({ ...commentText, [discussionId]: "" });
      fetchDiscussions();
    } catch (error) {
      setError({
        ...error,
        [discussionId]: error.response?.data?.message || "Failed to post comment"
      });
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting({ ...isSubmitting, [discussionId]: false });
    }
  };

  const handleLike = async (discussionId) => {
    try {
      const response = await api.post(`/discussion/${discussionId}/like`);
      setLikedStatus(prev => ({
        ...prev,
        [discussionId]: response.data.data.liked
      }));
      fetchDiscussions();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDeleteComment = async (discussionId, commentId) => {
    try {
      await api.delete(`/discussion/${discussionId}/comments/${commentId}`);
      fetchDiscussions();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm("Are you sure you want to delete this discussion?")) return;
    
    try {
      await api.delete(`/discussion/${discussionId}`);
      fetchDiscussions();
    } catch (error) {
      console.error("Error deleting discussion:", error);
    }
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {discussions.map((discussion) => (
        <div key={discussion._id} className="bg-[#151f2a] p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          {/* Discussion Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-bold text-xl text-white mb-2">{discussion.title}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Posted by <span className="text-blue-400">{discussion.createdBy.username}</span></span>
                <span>•</span>
                <span>{formatDate(discussion.createdAt)}</span>
              </div>
            </div>
            {user && user._id === discussion.createdBy.id && (
              <button
                onClick={() => handleDeleteDiscussion(discussion._id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <FaTrash />
              </button>
            )}
          </div>

          {/* Discussion Content */}
          <p className="text-gray-300 mb-4 whitespace-pre-wrap">{discussion.content}</p>

          {/* Tags */}
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {discussion.tags.map((tag, index) => (
                <span key={index} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <hr className="my-4 border-gray-700" />

          {/* Interaction Buttons */}
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => handleLike(discussion._id)}
              className={`flex items-center space-x-2 transition-colors ${
                likedStatus[discussion._id] ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              {likedStatus[discussion._id] ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span>{discussion.likes || 0}</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-400">
              <FaComment />
              <span>{discussion.comments?.length || 0}</span>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={(e) => handleCommentSubmit(discussion._id, e)} className="mt-4">
            <div className="flex flex-row gap-4">
              <textarea
                placeholder="Add a comment..."
                value={commentText[discussion._id] || ""}
                onChange={(e) => handleCommentChange(discussion._id, e)}
                className="p-3 bg-gray-800 border border-gray-700 rounded-lg w-full h-16 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting[discussion._id]}
                className={`bg-blue-600 h-fit w-fit text-white py-2 px-4 rounded-lg mt-3 hover:bg-blue-700 transition duration-300 flex items-center space-x-2 ${
                  isSubmitting[discussion._id] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{isSubmitting[discussion._id] ? 'Posting...' : 'Comment'}</span>
                <IoSendSharp />
              </button>
            </div>
          </form>

          {error[discussion._id] && (
            <div className="text-red-500 text-sm mt-2">{error[discussion._id]}</div>
          )}

          {/* Comments Section */}
          <div className="mt-6 space-y-4">
            {discussion.comments && discussion.comments.length > 0 ? (
              discussion.comments.map((comment, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-300 mb-2">{comment.text}</p>
                      <div className="text-xs text-gray-400">
                        <p>By: <span className="text-gray-200 font-medium">{comment.createdBy.username}</span></p>
                        <p>{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                    {user && user._id === comment.createdBy.id && (
                      <button
                        onClick={() => handleDeleteComment(discussion._id, comment._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default DiscussionList;