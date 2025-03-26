import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/autcontext";
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Prevents redirection before auth check completes

  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;