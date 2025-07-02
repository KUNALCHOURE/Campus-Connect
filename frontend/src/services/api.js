import axios from "axios";

const api = axios.create({
  //baseURL: "https://campus-connect-1-b62l.onrender.com/api/v1", // Use this in production
  baseURL: "http://localhost:3000/api/v1", // Use this in development
  withCredentials: true, // Ensures cookies (tokens) are sent with requests
});

// Get user profile by userId
export const getUserProfile = async (userId) => {
  try {
    // Validate userId before making the request
    if (!userId || userId === 'undefined') {
      throw new Error('Invalid user ID provided');
    }
    
    console.log(`Fetching profile for user ID: ${userId}`);
    const response = await api.get(`/profile/${userId}`);
    return response;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Get posts of a user by userId
export const getUserPosts = async (userId) => {
  try {
    // Validate userId before making the request
    if (!userId || userId === 'undefined') {
      throw new Error('Invalid user ID provided');
    }
    
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updatedData) => {
  try {
    // Validate userId before making the request
    if (!userId || userId === 'undefined') {
      throw new Error('Invalid user ID provided');
    }
    
    console.log(`Updating profile for user ID: ${userId}`, updatedData);
    const response = await api.put(`/profile/${userId}`, updatedData);
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// LEADERBOARD RELATED API CALLS

// Get leaderboard sorted by problems solved
export const getSolvedLeaderboard = async (platform = null) => {
  try {
    const params = platform ? { platform } : {};
    console.log(`Fetching solved leaderboard for platform: ${platform}`);
    const response = await api.get(`/leaderboard/solved`, { params });
    console.log(`✅ Solved leaderboard response:`, JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error fetching solved leaderboard:", error);
    throw error;
  }
};

// Get leaderboard sorted by contest rating
export const getContestLeaderboard = async (platform = null) => {
  try {
    const params = platform ? { platform } : {};
    const response = await api.get(`/leaderboard/contest`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching contest leaderboard:", error);
    throw error;
  }
};

// Update user's competitive programming usernames in leaderboard
export const updateLeaderboardUser = async (userData) => {
  try {
    const response = await api.post(`/leaderboard/update-user`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating leaderboard user:", error);
    throw error;
  }
};

// Sync all users with competitive links to the leaderboard
export const syncUsersToLeaderboard = async () => {
  try {
    const response = await api.post(`/leaderboard/sync`);
    return response.data;
  } catch (error) {
    console.error("Error syncing users to leaderboard:", error);
    throw error;
  }
};

// Update stats for all users in the leaderboard
export const updateAllLeaderboardStats = async () => {
  try {
    const response = await api.post(`/leaderboard/update-all`);
    return response.data;
  } catch (error) {
    console.error("Error updating all leaderboard stats:", error);
    throw error;
  }
};

// Test scraper functionality with provided usernames
export const testScrapers = async (testUsernames) => {
  try {
    const response = await api.post(`/leaderboard/test-scrapers`, testUsernames);
    return response.data;
  } catch (error) {
    console.error("Error testing scrapers:", error);
    throw error;
  }
};

// Refresh the leaderboard data by triggering scrapers
export const refreshLeaderboardData = async () => {
  try {
    const response = await api.post(`/leaderboard/refresh`);
    return response.data;
  } catch (error) {
    console.error("Error refreshing leaderboard data:", error);
    throw error;
  }
};

export default api;
