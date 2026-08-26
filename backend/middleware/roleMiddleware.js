// backend/middleware/roleMiddleware.js

/*
 * ROLE AUTHORIZATION MIDDLEWARE
 *
 * Usage:
 *
 * authorizeRoles("admin")
 *
 * authorizeRoles("organizer")
 *
 * authorizeRoles("admin", "organizer")
 *
 * This middleware must be used AFTER
 * authMiddleware.js because it needs
 * req.user.
 */

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        /*
         * Check whether user is authenticated
         */
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        /*
         * Check whether the user's role
         * is included in the allowed roles.
         */
        if (
            !allowedRoles.includes(
                req.user.role
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to access this resource",
            });
        }

        /*
         * User has the required role.
         * Continue to controller.
         */
        next();
    };
};


/*
 * Export middleware
 */
module.exports = authorizeRoles;