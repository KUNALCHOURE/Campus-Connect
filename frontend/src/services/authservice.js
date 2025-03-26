// src/services/authService.js
import api from './api';

const authService = {
    login: async (credentials) => {
        try {
            console.log("AuthService - Credentials:", credentials);
            const response = await api.post('/user/login', credentials);
            console.log("AuthService - Response Data:", response.data);
            return response.data; // Make sure this is correct
        } catch (error) {
            console.error("API Error:", error.message);
            throw error.response?.data || error.message;
        }
    },
    


    register: async (userData) => {
        try {
            console.log("inside the register ");
            console.log(userData);
            const response = await api.post('/user/register', userData);
            console.log("data added");
            return response.data;
        } catch (error) {
            console.error("API Error:", error.message);
    
            // Extract proper error message
            const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
    
            // Throw an error object with the correct message
            throw new Error(errorMessage);
        }
    },
    

    logout: async () => {
        try {
            console.log("hello");
            const response = await api.get('/user/logout');
            return response;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
export default authService;