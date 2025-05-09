import axios from "axios";

const api = axios.create({
  // baseURL: "https://campus-connect-1-b62l.onrender.com/api/v1", // Use this in production
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

export default api;
