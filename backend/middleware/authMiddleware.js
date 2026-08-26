// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");

const User = require("../models/User");


/*
 * PROTECT ROUTE
 *
 * Checks whether the request contains
 * a valid JWT token.
 *
 * Expected header:
 *
 * Authorization: Bearer YOUR_JWT_TOKEN
 */
const protect = async (req, res, next) => {
    try {
        /*
         * Get Authorization header
         */
        const authHeader =
            req.headers.authorization;

        /*
         * Check whether Authorization header
         * exists and uses Bearer authentication.
         */
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        /*
         * Extract token
         *
         * Example:
         * Bearer abc123
         *
         * Result:
         * abc123
         */
        const token =
            authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token missing",
            });
        }

        /*
         * Verify JWT
         */
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        /*
         * Find user from database
         */
        const user =
            await User.findById(
                decoded.id
            );

        /*
         * User doesn't exist
         */
        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "User not found",
            });
        }

        /*
         * Check account status
         */
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been disabled",
            });
        }

        /*
         * Attach user to request
         *
         * Controllers can now access:
         *
         * req.user
         */
        req.user = user;

        /*
         * Continue to next middleware/controller
         */
        next();

    } catch (error) {
        console.error(
            "========== Authentication Error =========="
        );

        console.error(error);

        console.error(
            "==========================================="
        );

        /*
         * JWT expired
         */
        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication token expired",
            });
        }

        /*
         * JWT invalid
         */
        if (
            error.name ===
            "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token",
            });
        }

        /*
         * Other authentication errors
         */
        return res.status(401).json({
            success: false,
            message:
                error.message ||
                "Authentication failed",
        });
    }
};


/*
 * Export middleware
 */
module.exports = protect;