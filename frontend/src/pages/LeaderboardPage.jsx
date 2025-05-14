import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import { getSolvedLeaderboard, getContestLeaderboard, syncUsersToLeaderboard, updateAllLeaderboardStats, testScrapers } from '../services/api';
import { FaTrophy, FaCode, FaStar, FaFilter, FaSync, FaUserPlus, FaChartLine, FaBug } from 'react-icons/fa';
import { SiLeetcode, SiCodeforces } from 'react-icons/si';
import { useAuth } from '../utils/autcontext.jsx';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardType, setLeaderboardType] = useState('solved'); // 'solved' or 'contest'
  const [platform, setPlatform] = useState(''); // '', 'leetcode', 'codeforces'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  
  // Check if user is an admin (for admin actions)
  const isAdmin = user?.role === 'admin' || user?.username === 'admin';

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, platform]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (leaderboardType === 'solved') {
        data = await getSolvedLeaderboard(platform || null);
      } else {
        data = await getContestLeaderboard(platform || null);
      }
      
      console.log('Leaderboard data received:', data);
      
      if (data && data.length > 0) {
        // Log the structure of the first entry to understand the data format
        console.log('First entry structure:', JSON.stringify(data[0], null, 2));
      }
      
      setLeaderboardData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data. Please try again later.');
      setLoading(false);
    }
  };

  // Sync users with competitive profiles from the User model
  const handleSyncProfiles = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await syncUsersToLeaderboard();
      
      setMessage({
        type: 'success',
        text: `Successfully synced profiles! Added ${result.addedCount} new users, updated ${result.updatedCount} existing users.`
      });
      
      // Refresh leaderboard data after sync
      fetchLeaderboard();
    } catch (error) {
      console.error('Error syncing profiles:', error);
      setMessage({
        type: 'error',
        text: 'Failed to sync profiles. Please try again later.'
      });
    } finally {
      setActionLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  // Update all leaderboard stats
  const handleUpdateStats = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      const result = await updateAllLeaderboardStats();
      
      setMessage({
        type: 'success',
        text: `Successfully updated stats for ${result.updatedCount} out of ${result.totalUsers} users.`
      });
      
      // Refresh leaderboard data after update
      fetchLeaderboard();
    } catch (error) {
      console.error('Error updating stats:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update stats. Please try again later.'
      });
    } finally {
      setActionLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  // Test scrapers with sample usernames
  const handleTestScrapers = async () => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });
      
      // Sample usernames for testing - replace with actual known usernames
      const testData = {
        leetcodeUsername: 'leetcode',
        codeforcesUsername: 'tourist'
      };
      
      const result = await testScrapers(testData);
      
      console.log('Scraper test results:', result);
      
      setMessage({
        type: 'success',
        text: 'Scraper test results logged to console. Check browser console for details.'
      });
    } catch (error) {
      console.error('Error testing scrapers:', error);
      setMessage({
        type: 'error',
        text: 'Failed to test scrapers. Check console for details.'
      });
    } finally {
      setActionLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const getPlatformIcon = (platformName) => {
    switch(platformName) {
      case 'leetcode':
        return <SiLeetcode className="text-yellow-500" />;
      case 'codeforces':
        return <SiCodeforces className="text-blue-500" />;
      default:
        return <FaCode className="text-gray-400" />;
    }
  };

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'text-yellow-400 bg-yellow-400/10'; // Gold
      case 1: return 'text-gray-300 bg-gray-400/10'; // Silver
      case 2: return 'text-amber-600 bg-amber-600/10'; // Bronze
      default: return 'text-blue-400 bg-blue-400/10';
    }
  };
  
  // Helper function to get solved problems count for a platform
  const getSolvedProblems = (entry, platform) => {
    if (!entry) return 0;
    
    if (platform) {
      // Try different possible paths to the data
      return entry[`${platform}Solved`] || 
             entry[`${platform}Stats`]?.totalSolved || 
             (platform === 'leetcode' && entry.leetcodeStats?.totalSolved) ||
             (platform === 'codeforces' && entry.codeforcesStats?.totalSolved) ||
             0;
    } else {
      // For "All Platforms" view
      return entry.totalSolved || 
             (entry.leetcodeStats?.totalSolved || 0) + 
             (entry.codeforcesStats?.totalSolved || 0);
    }
  };
  
  // Helper function to get rating for a platform
  const getRating = (entry, platform) => {
    if (!entry) return 0;
    
    if (platform) {
      // Try different possible paths to the data
      return entry[`${platform}Rating`] || 
             entry[`${platform}Stats`]?.contestRating || 
             (platform === 'leetcode' && entry.leetcodeStats?.contestRating) ||
             (platform === 'codeforces' && entry.codeforcesStats?.contestRating) ||
             0;
    } else {
      // For "All Platforms" view
      return entry.maxContestRating || 
             Math.max(
               entry.leetcodeStats?.contestRating || 0,
               entry.codeforcesStats?.contestRating || 0
             );
    }
  };
  
  // Helper function to get username for a platform
  const getUsernameForPlatform = (entry, platform) => {
    if (!entry || !platform) return 'N/A';
    
    return entry[`${platform}Username`] || 
           (platform === 'leetcode' && entry.leetcodeUsername) ||
           (platform === 'codeforces' && entry.codeforcesUsername) ||
           'N/A';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#06141D]">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-[#0c1c29] rounded-lg p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Competitive Programming Leaderboard</h1>
              <p className="text-gray-300">
                Track and compare your competitive programming progress with peers across major platforms.
              </p>
            </div>
            
            {/* Admin actions */}
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <button
                onClick={handleSyncProfiles}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                ) : (
                  <FaUserPlus className="h-4 w-4" />
                )}
                <span>Sync Profiles</span>
              </button>
              
              {isAdmin && (
                <button
                  onClick={handleUpdateStats}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <FaChartLine className="h-4 w-4" />
                  )}
                  <span>Update All Stats</span>
                </button>
              )}
              
              {isAdmin && (
                <button
                  onClick={handleTestScrapers}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    <FaBug className="h-4 w-4" />
                  )}
                  <span>Test Scrapers</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Status Messages */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-900/30 border border-green-500 text-green-200' 
                : 'bg-red-900/30 border border-red-500 text-red-200'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex gap-3">
              <button 
                onClick={() => setLeaderboardType('solved')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 
                  ${leaderboardType === 'solved' ? 'bg-blue-600 text-white' : 'bg-[#151f2a] text-gray-300'}`}
              >
                <FaCode /> Problems Solved
              </button>
              <button 
                onClick={() => setLeaderboardType('contest')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 
                  ${leaderboardType === 'contest' ? 'bg-blue-600 text-white' : 'bg-[#151f2a] text-gray-300'}`}
              >
                <FaStar /> Contest Rating
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-[#151f2a] text-gray-300 px-4 py-2 rounded-md appearance-none pr-10 border border-gray-700 min-w-[140px]"
                >
                  <option value="">All Platforms</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="codeforces">Codeforces</option>
                </select>
                <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              
              <button 
                onClick={fetchLeaderboard}
                className="p-2 bg-[#151f2a] text-gray-300 rounded-md hover:bg-[#1a283a]"
                title="Refresh leaderboard"
              >
                <FaSync />
              </button>
            </div>
          </div>
          
          {/* Leaderboard Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#151f2a] text-gray-300 text-sm uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-md">Rank</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">
                      {leaderboardType === 'solved' ? 'Problems Solved' : 'Rating'}
                    </th>
                    {platform && (
                      <th className="px-4 py-3 rounded-tr-md">Username</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a283a]">
                  {leaderboardData.length > 0 ? (
                    leaderboardData.map((entry, index) => (
                      <tr key={index} className="bg-[#0c1c29] hover:bg-[#1a283a] transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getMedalColor(index)}`}>
                            {index < 3 ? <FaTrophy /> : index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            {entry.userDetails?.profileimage || entry.user?.profileimage ? (
                              <img 
                                src={entry.userDetails?.profileimage || entry.user?.profileimage} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                                {entry.userDetails?.username?.[0]?.toUpperCase() || 
                                 entry.user?.username?.[0]?.toUpperCase() ||
                                 entry.localUsername?.[0]?.toUpperCase() || 'U'}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">
                                {entry.userDetails?.username || entry.user?.username || entry.localUsername}
                              </div>
                              {entry.user?._id && (
                                <Link 
                                  to={`/profile/${entry.user._id}`}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  View Profile
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {leaderboardType === 'solved' ? (
                            <>
                              <span className="font-bold text-white mr-2">
                                {platform 
                                  ? getSolvedProblems(entry, platform)
                                  : getSolvedProblems(entry, null)}
                              </span>
                              <span className="text-gray-400 text-sm">problems</span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-white mr-2">
                                {platform 
                                  ? getRating(entry, platform)
                                  : getRating(entry, null)}
                              </span>
                              <span className="text-gray-400 text-sm">rating</span>
                            </>
                          )}
                        </td>
                        {platform && (
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              {getPlatformIcon(platform)}
                              <span className="ml-2 text-gray-300">
                                {getUsernameForPlatform(entry, platform)}
                              </span>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-[#0c1c29]">
                      <td colSpan={platform ? 4 : 3} className="px-4 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <FaCode className="text-gray-500 text-4xl mb-4" />
                          <p className="mb-2">No leaderboard data available</p>
                          <div className="flex gap-4 mt-2">
                            <button 
                              onClick={handleSyncProfiles}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                            >
                              Sync User Profiles
                            </button>
                            <button 
                              onClick={() => navigate('/profile')}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Update Your Profile
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Info Section */}
        <div className="bg-[#0c1c29] rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">How to Join the Leaderboard</h2>
          <p className="text-gray-300 mb-4">
            You can add your competitive programming profiles in your user profile settings. We'll fetch your stats automatically and update the leaderboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#151f2a] p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-yellow-500/10 rounded-md">
                  <SiLeetcode className="text-yellow-500 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-white">LeetCode</h3>
              </div>
              <p className="text-gray-400 text-sm">
                We track your total solved problems from your public LeetCode profile.
              </p>
            </div>
            
            <div className="bg-[#151f2a] p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-md">
                  <SiCodeforces className="text-blue-400 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-white">Codeforces</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Your Codeforces submissions and contest rating are tracked via the Codeforces API.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Update Your Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage; 