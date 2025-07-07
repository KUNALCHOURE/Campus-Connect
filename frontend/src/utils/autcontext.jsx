// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authservice';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);
const SESSION_DURATION = 24 * 60 * 60 * 1000;


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = localStorage.getItem("user");
                const expiry = localStorage.getItem("expiry");
                const isLoggedIn = localStorage.getItem("isLoggedIn");

                if (userData && expiry) {
                    const isExpired = Date.now() > Number(expiry);
                    if (isExpired) {
                        console.log("Session expired. Logging out.");
                        localStorage.clear();
                        setUser(null);
                        return;
                    }
                    setUser(JSON.parse(userData));
                    return;
                }

                // Fallback: If no userData but isLoggedIn, fetch from server
                if (isLoggedIn) {
                    const response = await api.get("/user/current-user", { withCredentials: true });
                    if (response.data?.data?.userobject) {
                        const userFromBackend = response.data.data.userobject;
                        setUser(userFromBackend);
                        localStorage.setItem("user", JSON.stringify(userFromBackend));
                        const newExpiry = Date.now() + SESSION_DURATION;
                        localStorage.setItem("expiry", newExpiry.toString());
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

    useEffect(() => {
        const warmup = () => {
            const hasPinged = sessionStorage.getItem("pinged");
            if (!hasPinged) {
                api.get("/use").catch(() => {});
                sessionStorage.setItem("pinged", "true");
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
            const user = response.data.user;
            const expiry = Date.now() + SESSION_DURATION;

            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("expiry", expiry.toString());

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
            const user = response.data.user;
            const expiry = Date.now() + SESSION_DURATION;

            setUser(user);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("expiry", expiry.toString());

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
            if (res.data.statuscode === 200) {
                localStorage.clear();
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
