import { createContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  getStoredUser,
  logout as logoutService,
} from "../services/authService";
import { getToken } from "../utils/storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------------------------------
  // Load current logged-in user
  // ----------------------------------

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();

      // No JWT means user is not logged in
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);

        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        console.error(
          "Failed to load current user:",
          error.response?.data || error.message
        );

        setUser(null);
        setError("Your session has expired. Please login again.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // ----------------------------------
  // Logout
  // ----------------------------------

  const logout = async () => {
    try {
      setLoading(true);

      await logoutService();

      setUser(null);
      setError(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Refresh user
  // ----------------------------------

  const refreshUser = async () => {
    try {
      setError(null);

      const currentUser = await getCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error(
        "Failed to refresh user:",
        error.response?.data || error.message
      );

      setUser(null);
      throw error;
    }
  };

  // ----------------------------------
  // Role helpers
  // ----------------------------------

  const isAdmin = user?.role === "admin";

  const isOrganizer = user?.role === "organizer";

  const isParticipant =
    user?.role === "participant" ||
    user?.role === "user";

  // ----------------------------------
  // Context value
  // ----------------------------------

  const value = {
    user,
    setUser,

    loading,
    error,

    isAuthenticated: Boolean(user),

    isAdmin,
    isOrganizer,
    isParticipant,

    refreshUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;