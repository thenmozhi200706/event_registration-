// frontend/src/services/authService.js

import api from "../api/api";

import {
  setToken,
  setUser,
  getUser,
  clearAuth,
} from "../utils/storage";

// =====================================================
// GOOGLE LOGIN
// =====================================================
//
// Starts Google OAuth.
//
// Backend:
// GET /api/auth/google
//
// The backend will determine whether the account is:
// - admin
// - organizer
// - participant
//
// =====================================================

export const googleLogin = () => {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";

  // Remove trailing slashes
  const normalizedBaseUrl =
    apiBaseUrl.replace(/\/+$/, "");

  // Start Google OAuth
  window.location.href =
    `${normalizedBaseUrl}/auth/google`;
};

// =====================================================
// GET CURRENT USER
// =====================================================
//
// GET /api/auth/me
//
// Requires:
// Authorization: Bearer TOKEN
//
// =====================================================

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");

    const user =
      response?.data?.user ||
      response?.data;

    if (user) {
      setUser(user);
    }

    return user;
  } catch (error) {
    console.error(
      "Get current user failed:",
      error?.response?.data ||
        error?.message ||
        error
    );

    throw error;
  }
};

// =====================================================
// STORE AUTHENTICATION DATA
// =====================================================
//
// Stores:
// - JWT token
// - User
//
// =====================================================

export const saveAuthData = ({
  token,
  user,
} = {}) => {
  if (token) {
    setToken(token);
  }

  if (user) {
    setUser(user);
  }
};

// =====================================================
// GET STORED USER
// =====================================================

export const getStoredUser = () => {
  return getUser();
};

// =====================================================
// LOGOUT
// =====================================================
//
// POST /api/auth/logout
//
// JWT is removed from frontend regardless of whether
// the backend logout request succeeds.
//
// =====================================================

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error(
      "Logout API request failed:",
      error?.response?.data ||
        error?.message ||
        error
    );
  } finally {
    clearAuth();
  }
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

const authService = {
  googleLogin,
  getCurrentUser,
  saveAuthData,
  getStoredUser,
  logout,
};

export default authService;