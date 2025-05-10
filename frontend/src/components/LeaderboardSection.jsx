import { useState } from 'react';
import { updateLeaderboardUser } from '../services/api';
import { SiLeetcode, SiCodechef, SiCodeforces } from 'react-icons/si';
import { FaSave, FaSync } from 'react-icons/fa';
import { useAuth } from '../utils/autcontext';

const LeaderboardSection = ({ userData, refreshUserData }) => {
  const { user } = useAuth();
  const isCurrentUser = user?._id === userData?._id;
  
  const [competitive, setCompetitive] = useState({
    leetcode: userData?.competitiveLinks?.leetcode || '',
    codechef: userData?.competitiveLinks?.codechef || '',
    codeforces: userData?.competitiveLinks?.codeforces || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setCompetitive({
      ...competitive,
      [e.target.name]: e.target.value
    });
  };

  const updateLeaderboard = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Create payload for updating leaderboard
      const leaderboardData = {
        localUsername: userData?.username,
        leetcodeUsername: competitive.leetcode || undefined,
        codechefUsername: competitive.codechef || undefined,
        codeforcesUsername: competitive.codeforces || undefined
      };
      
      // Send update to leaderboard
      await updateLeaderboardUser(leaderboardData);
      
      setMessage({ 
        type: 'success', 
        text: 'Your competitive programming profiles have been added to the leaderboard!' 
      });
      
      // Wait briefly to show success message
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update leaderboard. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#151f2a] rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <FaSync className="mr-2 text-blue-400" />
        Competitive Programming
      </h2>

      {isCurrentUser ? (
        <>
          <p className="text-gray-300 mb-4">
            Add your competitive programming profiles to appear on the leaderboard.
            We'll automatically fetch your stats and rankings.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center min-w-[120px]">
                <SiLeetcode className="text-xl text-yellow-500 mr-2" />
                <span className="text-gray-300">LeetCode</span>
              </div>
              <input
                type="text"
                name="leetcode"
                value={competitive.leetcode}
                onChange={handleInputChange}
                placeholder="Your LeetCode username"
                className="flex-grow px-4 py-2 bg-[#0c1c29] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center min-w-[120px]">
                <SiCodechef className="text-xl text-red-400 mr-2" />
                <span className="text-gray-300">CodeChef</span>
              </div>
              <input
                type="text"
                name="codechef"
                value={competitive.codechef}
                onChange={handleInputChange}
                placeholder="Your CodeChef username"
                className="flex-grow px-4 py-2 bg-[#0c1c29] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center min-w-[120px]">
                <SiCodeforces className="text-xl text-blue-400 mr-2" />
                <span className="text-gray-300">Codeforces</span>
              </div>
              <input
                type="text"
                name="codeforces"
                value={competitive.codeforces}
                onChange={handleInputChange}
                placeholder="Your Codeforces username"
                className="flex-grow px-4 py-2 bg-[#0c1c29] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {message.text && (
            <div className={`p-3 mb-4 rounded ${
              message.type === 'success' 
                ? 'bg-green-900/30 text-green-200 border border-green-500' 
                : 'bg-red-900/30 text-red-200 border border-red-500'
            }`}>
              {message.text}
            </div>
          )}
          
          <button
            onClick={updateLeaderboard}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Update Leaderboard Profiles
              </>
            )}
          </button>
        </>
      ) : (
        // View-only mode for other users' profiles
        <div>
          <p className="text-gray-300 mb-4">
            {userData?.username}'s competitive programming profiles:
          </p>
          
          <div className="space-y-4">
            {userData?.competitiveLinks?.leetcode ? (
              <div className="flex items-center gap-3">
                <SiLeetcode className="text-xl text-yellow-500" />
                <a 
                  href={`https://leetcode.com/${userData.competitiveLinks.leetcode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {userData.competitiveLinks.leetcode}
                </a>
              </div>
            ) : null}
            
            {userData?.competitiveLinks?.codechef ? (
              <div className="flex items-center gap-3">
                <SiCodechef className="text-xl text-red-400" />
                <a 
                  href={`https://www.codechef.com/users/${userData.competitiveLinks.codechef}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {userData.competitiveLinks.codechef}
                </a>
              </div>
            ) : null}
            
            {userData?.competitiveLinks?.codeforces ? (
              <div className="flex items-center gap-3">
                <SiCodeforces className="text-xl text-blue-400" />
                <a 
                  href={`https://codeforces.com/profile/${userData.competitiveLinks.codeforces}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {userData.competitiveLinks.codeforces}
                </a>
              </div>
            ) : null}
            
            {!userData?.competitiveLinks?.leetcode && 
             !userData?.competitiveLinks?.codechef && 
             !userData?.competitiveLinks?.codeforces && (
              <p className="text-gray-400 italic">
                No competitive programming profiles added yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardSection; 