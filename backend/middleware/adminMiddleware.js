// server/middleware/adminMiddleware.js

/*
============================================================
EVENTSPHERE - ADMIN AUTHORIZATION MIDDLEWARE
============================================================

This middleware should be used AFTER authMiddleware.

Expected:

req.user = {
    _id,
    name,
    email,
    role
}

============================================================
*/


const adminMiddleware = (req, res, next) => {
    try {
        // User must already be authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // Check admin role
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. Admin privileges required.",
            });
        }

        // Admin verified
        next();

    } catch (error) {
        console.error(
            "Admin Middleware Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Authorization middleware error",
        });
    }
};


module.exports = adminMiddleware; 