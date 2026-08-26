import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./ProtectedRoute.css";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ----------------------------------
  // Authentication loading
  // ----------------------------------

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // ----------------------------------
  // User not logged in
  // ----------------------------------

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // ----------------------------------
  // Role protection
  // ----------------------------------

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    // Redirect according to actual role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "organizer") {
      return (
        <Navigate
          to="/organizer/dashboard"
          replace
        />
      );
    }

    if (
      user.role === "participant" ||
      user.role === "user"
    ) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  // ----------------------------------
  // Access granted
  // ----------------------------------

  return <Outlet />;
};

export default ProtectedRoute;