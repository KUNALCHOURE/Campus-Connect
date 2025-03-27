import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authservice';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // ✅ Check authentication on app start (without localStorage)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get("/user/current-user", { withCredentials: true }); // ✅ Ensure cookies are sent
                console.log("Auth Check API Response:", response);
    
                if (response.data?.data?.userobject) {
                    console.log(response.data.data.userobject);
                    setUser(response.data.data.userobject);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null); // ✅ Clear user if session expired
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (!response || !response.data || !response.data.user) {
                throw new Error("Invalid response from the server");
            }
            console.log("Login Response:", response.data);

            setUser(response.data.user);
            toast.success('Welcome back!');
            navigate("/home");
        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again.');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            console.log("Inside register function in AuthContext", userData);
            
            const response = await authService.register(userData);
            console.log("Register Response:", response.data);

            if (!response || !response.data || !response.data.user) {
                throw new Error("Invalid response from the server");
            }

            setUser(response.data.user);
          
            navigate("/home");
        } catch (error) {
            console.error("Error during registration:", error);
            const errorMessage = error?.message || error?.response?.data?.message || "Signup failed. Please try again.";
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
           let res= await authService.logout();
           console.log(res);
           if(res.status==200){
            setUser(null);
            console.log(user);
            toast.success('Logged out successfully');
            
           }
        } catch (error) {
            toast.error('Error logging out');
            throw error;
        }
    };

 

    return (
        <AuthContext.Provider 
            value={{ user, setUser, login, logout, register, loading, }}
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
