// backend/routes/authRoutes.js

const express = require("express");
const passport = require("passport");

const {
    googleLoginSuccess,
    getCurrentUser,
    logout,
    devAdminToken,
} = require("../controllers/authController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// GOOGLE LOGIN
// =====================================================
//
// GET /api/auth/google
//
// =====================================================

router.get(
    "/google",
    passport.authenticate(
        "google",
        {
            scope: [
                "profile",
                "email",
            ],

            session: false,
        }
    )
);


// =====================================================
// GOOGLE CALLBACK
// =====================================================
//
// GET /api/auth/google/callback
//
// =====================================================

router.get(
    "/google/callback",

    passport.authenticate(
        "google",
        {
            session: false,

            failureRedirect:
                `${(
                    process.env.CLIENT_URL ||
                    "http://localhost:5173"
                ).replace(/\/+$/, "")}` +
                "/login?error=google_auth_failed",
        }
    ),

    googleLoginSuccess
);


// =====================================================
// CURRENT USER
// =====================================================
//
// GET /api/auth/me
//
// Authorization:
// Bearer JWT
//
// =====================================================

router.get(
    "/me",
    protect,
    getCurrentUser
);


// =====================================================
// LOGOUT
// =====================================================
//
// POST /api/auth/logout
//
// =====================================================

router.post(
    "/logout",
    protect,
    logout
);


// =====================================================
// DEVELOPMENT ADMIN TOKEN
// =====================================================
//
// POST /api/auth/dev/admin-token
//
// =====================================================

router.post(
    "/dev/admin-token",
    devAdminToken
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;