import { useState } from 'react';
import api from '../services/api';
import { FaTag, FaThumbsUp, FaRegThumbsUp, FaComment } from "react-icons/fa";
import { useAuth } from '../utils/autcontext';
function DiscussionCard({ discussion, onClick }) {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [liked, setLiked] = useState(user?.likedDiscussions?.includes(discussion._id) || false);
    const [likeCount, setLikeCount] = useState(discussion.likes);

    const handleReadMoreClick = (e) => {
        e.stopPropagation();
        setIsExpanded(true);
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        if (isLiking || !user) return;
        setIsLiking(true);
        try {
            const response = await api.post(`/discussion/${discussion._id}/like`);
            setLiked(response.data.data.liked);
            setLikeCount(response.data.data.likes);
        } catch (error) {
            console.error("Error toggling like:", error);
        } finally {
            setIsLiking(false);
        }
    };

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
            year: 'numeric'
        });
    };

    const username = discussion.createdBy?.username || "Anonymous";

    return (
        <div 
            className="bg-[#151f2a] p-6 rounded-lg shadow-lg cursor-pointer hover:bg-[#1a283a] transition-colors"
            onClick={onClick}
        >
            <div className="flex items-center space-x-4 mb-4">
                <img
                    src={`https://ui-avatars.com/api/?name=${username}&background=random`}
                    alt={username}
                    className="h-10 w-10 rounded-full"
                />
                <div>
                    <h3 className="font-semibold text-white">{username}</h3>
                    <p className="text-sm text-gray-400">{formatDate(discussion.createdAt)}</p>
                </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-3">{discussion.title}</h2>
            <div className="text-gray-300 mb-4">
                {isExpanded || discussion.content.length <= 200 ? (
                    <p>{discussion.content}</p>
                ) : (
                    <>
                        <p>{discussion.content.substring(0, 200)}...</p>
                        <button 
                            onClick={handleReadMoreClick}
                            className="text-blue-400 hover:text-blue-300 text-sm mt-1"
                        >
                            Read more
                        </button>
                    </>
                )}
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
                <span className="flex items-center space-x-1">
                    <FaTag className="h-4 w-4" />
                    <span>{discussion.tags && discussion.tags.length > 0 ? discussion.tags[0] : "Competitive Programming"}</span>
                </span>
                <button 
                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                    onClick={handleLike}
                    disabled={isLiking || !user}
                >
                    {liked ? (
                        <FaThumbsUp className="h-4 w-4 text-blue-500" />
                    ) : (
                        <FaRegThumbsUp className="h-4 w-4" />
                    )}
                    <span>{likeCount}</span>
                </button>
                <span className="flex items-center space-x-1">
                    <FaComment className="h-4 w-4" />
                    <span>{discussion.comments ? discussion.comments.length : 0}</span>
                </span>
            </div>
        </div>
    );
}

export default DiscussionCard;