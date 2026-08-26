  import React from "react";
  import { googleLogin } from "../../services/authService";
  import "./GoogleLoginButton.css";

  const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
      googleLogin();
    };

    return (
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="google-login-button"
      >
        <span className="google-icon">G</span>
        <span>Continue with Google</span>
      </button>
    );
  };

  export default GoogleLoginButton;