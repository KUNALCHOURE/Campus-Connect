import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authservice';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate=useNavigate();
    const login = async (credentials) => {
        try {
            const data = await authService.login(credentials);
            setUser(data.data.user);
            toast.success('Welcome back!');
            navigate("/home");
        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again.');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (!response || !response.data || !response.data.user) {
                throw new Error("Invalid response from the server");
            }
            console.log(response.data.user)
            setUser(response.data.user);
            const welcomeMessage = userData.role === 'hotel_lister' 
                ? 'Welcome to Wanderlust as a Hotel Lister!' 
                : 'Welcome to Wanderlust!';
            toast.success(welcomeMessage);
        } catch (error) {
            const errorMessage = error?.message || error?.response?.data?.message || "Signup failed. Please try again.";
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Error logging out');
            throw error;
        }
    };

 

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/user/getuser");
                console.log("API Response:", response);
 // *****Yes, exactly! When you call setUser(newValue), React does not update user immediately. Instead, it schedules the update and re-renders the component later. 
                if (response.data.data.userinfo) {
                    console.log("Before setUser:", user);  // Logs old state (null at first)
                    setUser(response.data.data.userinfo);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);
    
    useEffect(() => {
        console.log("Updated User:", user); // ✅ Logs whenever `user` is updated
    }, [user]);
    
    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                login, 
                logout, 
                register, 
                loading,
               
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};