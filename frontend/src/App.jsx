import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./utils/autcontext";
import "./index.css";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "./components/Loading";
import Roadmap from "./pages/Roadmap";
import DiscussionPage from "./pages/DiscussionPage";

import RecommendationTest from "./pages/RecommendationTest";
import LandingPage from "./pages/landingpage.jsx";
import ChatBotPage from "./pages/ChatBotPage";
import AuthRedirectRoute from "./components/authredirect";
import ProfilePage from "./pages/profilepage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";

function App() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        {/* ✅ Protected Routes */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
         path="/"
         element={
          <LandingPage/>
         }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discussion"
          element={
            <ProtectedRoute>
              <DiscussionPage />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatBotPage />
            </ProtectedRoute>
          }
        />
        
        {/* Profile routes - both with and without userId */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
            <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Public Routes */}

        <Route path="/login" element={
          <AuthRedirectRoute>
            <Login />
          </AuthRedirectRoute>
        } />
        <Route path="/register" element={
          <AuthRedirectRoute>
            <Register />
          </AuthRedirectRoute>
        } />

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
