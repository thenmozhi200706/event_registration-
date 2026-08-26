// backend/routes/authRoutes.js

const express = require("express");

const passport = require("passport");

const {
    googleLoginSuccess,
    getCurrentUser,
    logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/*
 * GOOGLE LOGIN
 *
 * Starts Google OAuth authentication.
 *
 * URL:
 * GET /api/auth/google
 */
router.get(
    "/google",

    passport.authenticate("google", {
        scope: [
            "profile",
            "email",
        ],

        session: false,
    })
);


/*
 * GOOGLE CALLBACK
 *
 * Google redirects the user here after
 * successful authentication.
 *
 * URL:
 * GET /api/auth/google/callback
 */
router.get(
    "/google/callback",

    passport.authenticate("google", {
        session: false,

        failureRedirect:
            `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    }),

    googleLoginSuccess
);


/*
 * GET CURRENT USER
 *
 * Requires a valid JWT token.
 *
 * URL:
 * GET /api/auth/me
 *
 * Header:
 * Authorization: Bearer YOUR_TOKEN
 */
router.get(
    "/me",

    protect,

    getCurrentUser
);


/*
 * LOGOUT
 *
 * Requires authentication.
 *
 * URL:
 * POST /api/auth/logout
 */
router.post(
    "/logout",

    protect,

    logout
);


/*
 * Export router
 */
module.exports = router;