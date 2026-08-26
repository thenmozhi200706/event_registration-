import React from "react";
import { Navigate } from "react-router-dom";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import useAuth from "../../hooks/useAuth";
import "./Login.css";

const Login = () => {
  const {
    user,
    loading,
    error,
    isAdmin,
    isOrganizer,
    isParticipant,
  } = useAuth();

  // ----------------------------------
  // Redirect already logged-in users
  // ----------------------------------

  if (!loading && user) {

    if (isAdmin) {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    if (isOrganizer) {
      return (
        <Navigate
          to="/organizer/dashboard"
          replace
        />
      );
    }

    if (isParticipant) {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }
  }

  // ----------------------------------
  // Login page
  // ----------------------------------

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-header">

          <h1>
            EventSphere
          </h1>

          <h2>
            Welcome Back
          </h2>

          <p>
            Login to manage your events
            and registrations.
          </p>

        </div>


        {error && (
          <div className="login-error">
            {error}
          </div>
        )}


        <div className="login-content">

          <GoogleLoginButton />

        </div>


        <div className="login-footer">

          <p>
            Continue with your Google account
            to access EventSphere.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;