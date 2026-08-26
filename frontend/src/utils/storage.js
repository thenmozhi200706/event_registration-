const TOKEN_KEY = "eventSphereToken";
const USER_KEY = "eventSphereUser";

// -------------------------
// Token
// -------------------------

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// -------------------------
// User
// -------------------------

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

// -------------------------
// Clear authentication
// -------------------------

export const clearAuth = () => {
  removeToken();
  removeUser();
};

// -------------------------
// Check authentication
// -------------------------

export const isAuthenticated = () => {
  return Boolean(getToken());
};