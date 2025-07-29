import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaTag, FaUser, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { useAuth } from '../utils/autcontext';

function DiscussionDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [discussion, setDiscussion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', content: '', tags: '' });
    const [localDiscussion, setLocalDiscussion] = useState(null);

    useEffect(() => {
        const fetchDiscussion = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/discussion/${id}`);
                setDiscussion(response.data.data);
                setLocalDiscussion(response.data.data);
                setEditForm({
                    title: response.data.data.title || '',
                    content: response.data.data.content || '',
                    tags: (response.data.data.tags || []).join(', ')
                });
                setLiked(user?.likedDiscussions?.includes(response.data.data._id) || false);
                setLikeCount(response.data.data.likes || 0);
            } catch (err) {
                setError('Failed to load discussion');
            } finally {
                setLoading(false);
            }
        };
        fetchDiscussion();
    }, []);

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
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setIsSubmitting(true);
        setError('');
        try {
            const response = await api.post(`/discussion/${id}/comments`, { text: commentText });
            setLocalDiscussion(prev => ({
                ...prev,
                comments: [...(prev.comments || []), response.data.data.comments[response.data.data.comments.length - 1]]
            }));
            setCommentText('');
            const refetch = await api.get(`/discussion/${id}`);
            setDiscussion(refetch.data.data);
            setLocalDiscussion(refetch.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        if (isLiking || !user) return;
        setIsLiking(true);
        try {
            const response = await api.post(`/discussion/${id}/like`);
            setLiked(response.data.data.liked);
            setLikeCount(response.data.data.likes);
            setLocalDiscussion(prev => ({ ...prev, likes: response.data.data.likes }));
            const refetch = await api.get(`/discussion/${id}`);
            setDiscussion(refetch.data.data);
            setLocalDiscussion(refetch.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to toggle like');
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this discussion?")) return;
        try {
            await api.delete(`/discussion/${id}`);
            navigate('/discussion');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete discussion');
        }
    };

    const handleEdit = () => setIsEditing(true);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const formattedTags = editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            const response = await api.put(`/discussion/${id}`, {
                title: editForm.title,
                content: editForm.content,
                tags: formattedTags
            });
            setIsEditing(false);
            setLocalDiscussion(response.data.data);
            setDiscussion(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update discussion');
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

    if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading discussion...</div>;
    if (!discussion) return <div className="flex items-center justify-center h-screen text-red-400">Discussion not found.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0e1724] to-[#101827] text-white py-8 px-4 md:px-8">
            <div className="max-w-5xl mx-auto space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">{discussion.title}</h1>
                        <p className="text-sm text-gray-400 mt-1">Posted by <span className="font-semibold">{discussion.createdBy?.username || 'Anonymous'}</span> on {formatDate(discussion.createdAt)}</p>
                    </div>
                    {user && user._id === discussion.createdBy?.id?.toString() && (
                        <div className="flex items-center gap-3 text-lg">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSaveEdit} disabled={isSubmitting} className="hover:text-green-400"><FaSave /></button>
                                    <button onClick={handleCancelEdit} className="hover:text-yellow-400"><FaTimes /></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleEdit} className="hover:text-blue-400"><FaEdit /></button>
                                    <button onClick={handleDelete} className="hover:text-red-400"><FaTrash /></button>
                                </>
                            )}
                        </div>
                    )}
                </header>

                <section className="bg-[#141f2d] p-6 rounded-xl shadow-xl space-y-6">
                    {isEditing ? (
                        <>
                            <input name="title" value={editForm.title} onChange={handleEditChange} className="w-full p-3 rounded-lg bg-[#0d1520] border border-gray-700 text-white" />
                            <textarea name="content" value={editForm.content} onChange={handleEditChange} className="w-full p-3 rounded-lg bg-[#0d1520] border border-gray-700 text-white min-h-[180px]" />
                            <input name="tags" value={editForm.tags} onChange={handleEditChange} placeholder="Comma-separated tags" className="w-full p-3 rounded-lg bg-[#0d1520] border border-gray-700 text-white" />
                        </>
                    ) : (
                        <>
                            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{discussion.content}</p>
                            {discussion.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {discussion.tags.map((tag, i) => (
                                        <span key={i} className="text-sm bg-blue-800/50 text-blue-300 px-3 py-1 rounded-full inline-flex items-center gap-1">
                                            <FaTag className="text-xs" /> {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex gap-6 text-gray-400">
                        <button onClick={handleLike} disabled={isLiking || !user} className={`flex items-center gap-2 ${liked ? 'text-blue-400' : 'hover:text-blue-300'}`}>
                            {liked ? <FaThumbsUp /> : <FaRegThumbsUp />} <span>{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <FaComment /> <span>{localDiscussion?.comments?.length || 0} comments</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Comments</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <form onSubmit={handleCommentSubmit} className="mb-6 space-y-4">
                        <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="w-full p-3 rounded-lg bg-[#0d1520] border border-gray-700 text-white min-h-[100px]" required />
                        <div className="text-right">
                            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white disabled:opacity-50">
                                {isSubmitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                    <div className="space-y-4">
                        {localDiscussion?.comments?.length > 0 ? (
                            localDiscussion.comments.map((comment, i) => (
                                <div key={i} className="bg-[#1b2a3b] p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                                            <FaUser className="text-white text-sm" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{comment.createdBy?.username || 'Anonymous'}</p>
                                            <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300">{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default DiscussionDetailsPage;
