import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { saveAuthData, getCurrentUser } from "../../services/authService";
import { getToken } from "../../utils/storage";
import useAuth from "../../hooks/useAuth";
import "./AuthSuccess.css";

const AuthSuccess = () => {
  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  const [status, setStatus] = useState("Completing login...");
  const [error, setError] = useState("");

  useEffect(() => {
    const completeAuthentication = async () => {
      try {
        setStatus("Checking authentication...");

        /*
         * The backend should redirect to this page after
         * successful Google authentication.
         *
         * Example:
         * http://localhost:5173/auth/success?token=YOUR_JWT
         */

        const params = new URLSearchParams(window.location.search);

        const token = params.get("token");

        if (token) {
          saveAuthData({
            token,
          });
        }

        const storedToken = getToken();

        if (!storedToken) {
          throw new Error(
            "Authentication token was not received from the server."
          );
        }

        setStatus("Loading your account...");

        const currentUser = await getCurrentUser();

        if (!currentUser) {
          throw new Error("Unable to load user information.");
        }

        setUser(currentUser);

        // ----------------------------------
        // Role-based redirect
        // ----------------------------------

        if (currentUser.role === "admin") {
          navigate("/admin/dashboard", {
            replace: true,
          });

          return;
        }

        if (currentUser.role === "organizer") {
          navigate("/organizer/dashboard", {
            replace: true,
          });

          return;
        }

        if (
          currentUser.role === "participant" ||
          currentUser.role === "user"
        ) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }

        throw new Error(
          "Your account has an invalid or unsupported role."
        );
      } catch (err) {
        console.error("Authentication failed:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Authentication failed. Please try again."
        );

        setStatus("");
      }
    };

    completeAuthentication();
  }, [navigate, setUser]);

  // ----------------------------------
  // Already authenticated
  // ----------------------------------

  if (user && !error) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    if (user.role === "organizer") {
      return <Navigate to="/organizer/dashboard" replace />;
    }

    if (
      user.role === "participant" ||
      user.role === "user"
    ) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // ----------------------------------
  // Authentication screen
  // ----------------------------------

  return (
    <div className="auth-success-page">
      <div className="auth-success-container">

        {!error ? (
          <>
            <div className="auth-loader">
              <div className="spinner"></div>
            </div>

            <h2>Signing you in...</h2>

            <p>{status}</p>
          </>
        ) : (
          <>
            <div className="auth-error-icon">
              ✕
            </div>

            <h2>Authentication Failed</h2>

            <p className="auth-error-message">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="auth-back-button"
            >
              Back to Login
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthSuccess;