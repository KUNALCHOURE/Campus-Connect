import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTimes, FaThumbsUp, FaRegThumbsUp, FaComment, FaTag, FaUser, FaEdit, FaTrash, FaSave } from "react-icons/fa";
import { useAuth } from '../utils/autcontext';

function DiscussionDetails({ discussion, isOpen, onClose, fetchDiscussions }) {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        tags: ''
    });
    const [localDiscussion, setLocalDiscussion] = useState(null);

    // Update local state when discussion changes
    useEffect(() => {
        if (discussion) {
            setLocalDiscussion(discussion);
            setEditForm({
                title: discussion.title || '',
                content: discussion.content || '',
                tags: (discussion.tags || []).join(', ')
            });
            setLiked(user?.likedDiscussions?.includes(discussion._id) || false);
            setLikeCount(discussion.likes || 0);
        }
    }, [discussion, user]);

    if (!isOpen || !discussion) return null;

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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        setError('');

        try {
            const response = await api.post(`/discussion/${discussion._id}/comments`, { text: commentText });
            // Update local state immediately
            setLocalDiscussion(prev => ({
                ...prev,
                comments: [...(prev.comments || []), response.data.data.comments[response.data.data.comments.length - 1]]
            }));
            setCommentText('');
            // Also update parent state
            fetchDiscussions();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to post comment');
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (isLiking || !user) return;
        setIsLiking(true);
        try {
            const response = await api.post(`/discussion/${discussion._id}/like`);
            // Update local state
            setLiked(response.data.data.liked);
            setLikeCount(response.data.data.likes);
            setLocalDiscussion(prev => ({
                ...prev,
                likes: response.data.data.likes
            }));
            // Update parent state
            fetchDiscussions();
        } catch (error) {
            console.error('Error toggling like:', error);
            setError(error.response?.data?.message || 'Failed to toggle like');
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this discussion?")) return;

        try {
            await api.delete(`/discussion/${discussion._id}`);
            fetchDiscussions();
            onClose();
        } catch (error) {
            console.error('Error deleting discussion:', error);
            setError(error.response?.data?.message || 'Failed to delete discussion');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveEdit = async () => {
        setIsSubmitting(true);
        setError('');

        try {
            const formattedTags = editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const response = await api.put(`/discussion/${discussion._id}`, {
                title: editForm.title,
                content: editForm.content,
                tags: formattedTags
            });
            
            setIsEditing(false);
            // Update local state
            setLocalDiscussion(response.data.data);
            // Update parent state
            fetchDiscussions();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update discussion');
            console.error('Error updating discussion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm({
            title: discussion.title || '',
            content: discussion.content || '',
            tags: (discussion.tags || []).join(', ')
        });
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 overflow-y-auto">
            <div className="bg-[#151f2a] rounded-lg w-full max-w-4xl my-8 relative overflow-hidden flex flex-col h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-[#151f2a] z-10">
                    <h2 className="text-xl font-semibold text-white">Discussion</h2>
                    <div className="flex items-center space-x-2">
                        {user && user._id === discussion.createdBy.id.toString() && (
                            <>
                                {isEditing ? (
                                    <>
                                        <button 
                                            onClick={handleSaveEdit}
                                            disabled={isSubmitting}
                                            className="text-gray-400 hover:text-green-500 transition-colors"
                                            title="Save Changes"
                                        >
                                            <FaSave />
                                        </button>
                                        <button 
                                            onClick={handleCancelEdit}
                                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                                            title="Cancel Edit"
                                        >
                                            <FaTimes />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleEdit}
                                            className="text-gray-400 hover:text-blue-500 transition-colors"
                                            title="Edit Discussion"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete Discussion"
                                        >
                                            <FaTrash />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <img
                            src={`https://ui-avatars.com/api/?name=${discussion.createdBy.username}&background=random`}
                            alt={discussion.createdBy.username}
                            className="h-12 w-12 rounded-full"
                        />
                        <div>
                            <h3 className="font-semibold text-white text-lg">{discussion.createdBy.username}</h3>
                            <p className="text-sm text-gray-400">
                                Posted on {formatDate(discussion.createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        {isEditing ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title}
                                    onChange={handleEditChange}
                                    className="w-full p-3 bg-[#0d1520] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <textarea
                                    name="content"
                                    value={editForm.content}
                                    onChange={handleEditChange}
                                    className="w-full p-3 bg-[#0d1520] border border-gray-700 rounded-md text-white min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="tags"
                                    value={editForm.tags}
                                    onChange={handleEditChange}
                                    placeholder="Enter tags (comma separated)"
                                    className="w-full p-3 bg-[#0d1520] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {error && (
                                    <div className="text-red-500 text-sm">{error}</div>
                                )}
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-white mb-4">{discussion.title}</h1>
                                <p className="text-gray-300 whitespace-pre-line">{discussion.content}</p>
                                
                                {discussion.tags && discussion.tags.length > 0 && (
                                    <div className="flex flex-wrap mt-4 gap-2">
                                        {discussion.tags.map((tag, index) => (
                                            <div key={index} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                                                <FaTag className="h-3 w-3" />
                                                <span>{tag}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        
                        <div className="flex items-center space-x-8 mt-6 text-gray-400">
                            <button 
                                onClick={handleLike}
                                disabled={isLiking || !user}
                                className={`flex items-center space-x-2 transition-colors ${
                                    liked ? 'text-blue-500' : 'hover:text-blue-500'
                                }`}
                                title={liked ? "Unlike discussion" : "Like discussion"}
                            >
                                {liked ? (
                                    <FaThumbsUp className="text-blue-500" />
                                ) : (
                                    <FaRegThumbsUp />
                                )}
                                <span>{likeCount}</span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <FaComment className="h-4 w-4" />
                                <span>{localDiscussion?.comments?.length || 0} comments</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-700 my-6" />

                    {/* Comments Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleCommentSubmit} className="mb-8">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add your comment..."
                                className="w-full p-3 bg-[#0d1520] border border-gray-700 rounded-md text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {localDiscussion?.comments && localDiscussion.comments.length > 0 ? (
                                localDiscussion.comments.map((comment, index) => (
                                    <div key={index} className="bg-[#1a283a] p-4 rounded-lg">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
                                                <FaUser className="text-gray-300 h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{comment.createdBy.username}</p>
                                                <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 mt-2">{comment.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscussionDetails;