import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { IoSearchOutline } from "react-icons/io5";
import Header from '../components/Header';
import { FaUserFriends, FaCommentAlt, FaBook, FaClock, FaFilter, FaTag, FaThumbsUp, FaRegThumbsUp, FaComment } from "react-icons/fa";
import DiscussionModal from '../components/DiscussionModal';
import DiscussionDetails from '../components/DiscussionDetails';
import { useAuth } from '../utils/autcontext';

function DiscussionPage() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [groupInfo, setGroupInfo] = useState({
    name: "Competitive Programming",
    description: "A community of competitive programmers sharing resources, discussing problems, and preparing for contests.",
    members: 5,
    discussions: 0
  });
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async (searchTerm = "") => {
    try {
      setError(null);
  
      // Build API request with search parameter
      let url = '/discussion';
      const params = {};
      
      if (searchTerm) {
        params.search = searchTerm;
      }
  
      console.log("Fetching discussions with params:", params);
      const response = await api.get(url, { params });
  
      setDiscussions(response.data.data.discussions);
      setGroupInfo((prev) => ({
        ...prev,
        discussions: response.data.data.total || 0
      }));
    } catch (error) {
      console.error("Error fetching discussions:", error);
      setError(error.response?.data?.message || "Failed to fetch discussions.");
    }
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
  
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  
    // Add debounce to prevent too many API calls
    debounceTimeoutRef.current = setTimeout(() => {
      fetchDiscussions(value);
    }, 300);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openDiscussionDetails = (discussion) => {
    setSelectedDiscussion(discussion);
    setIsDetailsOpen(true);
  };

  const closeDiscussionDetails = () => {
    setIsDetailsOpen(false);
    setSelectedDiscussion(null);
  };

  // Discussion Card Component
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

  return (
    <div className='w-full flex flex-col items-center'>
      <Header />
      <div className="min-h-screen bg-[#06141D] text-gray-200 p-6 w-full">
        {/* Group Statistics Bar */}
        <div className="bg-[#0c1c29] rounded-lg p-3 mb-6 flex flex-wrap justify-center md:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <FaUserFriends className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Members</p>
                <p className="text-lg font-semibold text-white">{groupInfo.members}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-500/20 p-2 rounded-full">
                <FaCommentAlt className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Discussions</p>
                <p className="text-lg font-semibold text-white">{groupInfo.discussions}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={openModal}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
            <FaCommentAlt className="h-4 w-4" /> New Discussion
          </button>
        </div>

        {/* Header with group info */}
        <div className="flex flex-col mb-10 bg-gradient-to-r from-[#0c1c29] to-[#122435] p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h1 className="text-3xl font-bold text-white mb-3">
            {groupInfo.name} Group
          </h1>
          <p className="text-gray-300 max-w-3xl leading-relaxed">
            {groupInfo.description}
          </p>
        </div>

        {/* Main content area with full-width discussions */}
        <div className="w-full">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-4 bg-[#0c1c29] border border-[#2a3c4e] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white shadow-md"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center">
              <span className="text-red-400 mr-2">⚠️</span>
              {error}
            </div>
          )}

          {/* Discussion Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {discussions.length > 0 ? (
              discussions.map((discussion) => (
                <DiscussionCard 
                  key={discussion._id} 
                  discussion={discussion} 
                  onClick={() => openDiscussionDetails(discussion)}
                />
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3 text-center p-12 bg-[#151f2a] rounded-lg shadow-lg border border-[#2a3c4e]">
                <FaCommentAlt className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-4 text-lg">No discussions found in this group</p>
                <button 
                  onClick={openModal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md">
                  Start a New Discussion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discussion Modal */}
      <DiscussionModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        fetchDiscussions={fetchDiscussions} 
      />

      {/* Discussion Details Modal */}
      <DiscussionDetails
        discussion={selectedDiscussion}
        isOpen={isDetailsOpen}
        onClose={closeDiscussionDetails}
        fetchDiscussions={fetchDiscussions}
      />
    </div>
  );
}

export default DiscussionPage;