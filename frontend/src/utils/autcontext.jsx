// src/context/AuthContext.jsx
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

    // ✅ Check authentication using localStorage first to avoid cold backend call
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = localStorage.getItem("user");
                const isLoggedIn = localStorage.getItem("isLoggedIn");

                if (userData) {
                    setUser(JSON.parse(userData));
                } else if (isLoggedIn) {
                    const response = await api.get("/user/current-user", { withCredentials: true });
                    if (response.data?.data?.userobject) {
                        setUser(response.data.data.userobject);
                        localStorage.setItem("user", JSON.stringify(response.data.data.userobject));
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // ✅ Optional: Warmup backend (once per tab session)
    useEffect(() => {
        const warmup = async () => {
            const hasPinged = sessionStorage.getItem("pinged");
            if (!hasPinged) {
                try {
                    await api.get("/ping");
                    sessionStorage.setItem("pinged", "true");
                } catch (err) {
                    // Ignore ping failure
                }
            }
        };
        warmup();
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            if (!response?.data?.user) {
                throw new Error("Invalid response from the server");
            }
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("isLoggedIn", "true");
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
            if (!response?.data?.user) {
                throw new Error("Invalid response from the server");
            }
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("isLoggedIn", "true");
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
            const res = await authService.logout();
            // console.log(res);
           //  console.log(res.data.statuscode);
             if(res.data.statuscode==200){
                localStorage.removeItem("user");
                localStorage.removeItem("isLoggedIn");
                setUser(null);
                toast.success('Logged out successfully');
                navigate("/login");
             }
        } catch (error) {
            toast.error('Error logging out');
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
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
