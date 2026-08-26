// backend/routes/authRoutes.js

const express = require("express");
const passport = require("passport");

const {
    googleLoginSuccess,
    getCurrentUser,
    logout,
    devAdminToken
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// GOOGLE LOGIN
// ==========================================
//
// GET /api/auth/google
//
// Starts Google OAuth authentication.
//

router.get(
    "/google",
    passport.authenticate("google", {
        scope: [
            "profile",
            "email"
        ],
        session: false
    })
);


// ==========================================
// GOOGLE CALLBACK
// ==========================================
//
// GET /api/auth/google/callback
//
// Google redirects here after login.
//

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,

        failureRedirect:
            `${process.env.CLIENT_URL}/login?error=google_auth_failed`
    }),
    googleLoginSuccess
);


// ==========================================
// GET CURRENT USER
// ==========================================
//
// GET /api/auth/me
//
// Header:
// Authorization: Bearer YOUR_TOKEN
//

router.get(
    "/me",
    protect,
    getCurrentUser
);


// ==========================================
// LOGOUT
// ==========================================
//
// POST /api/auth/logout
//
// Header:
// Authorization: Bearer YOUR_TOKEN
//

router.post(
    "/logout",
    protect,
    logout
);


// ==========================================
// DEVELOPMENT ADMIN JWT
// ==========================================
//
// POST /api/auth/dev/admin-token
//
// This is ONLY for local backend development
// and Postman testing.
//
// Remove this route before production.
//

router.post(
    "/dev/admin-token",
    devAdminToken
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;