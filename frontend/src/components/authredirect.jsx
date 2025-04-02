import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/autcontext";

function AuthRedirectRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Prevents flashing before auth check completes

  return user ? <Navigate to="/" replace /> : children;
}

export default AuthRedirectRoute;
