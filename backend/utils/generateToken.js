// backend/utils/generateToken.js

const jwt = require("jsonwebtoken");


/*
 * GENERATE JWT TOKEN
 *
 * Creates an authentication token for
 * Admin, Organizer, and Participant users.
 *
 * Token contains:
 * - User ID
 * - Email
 * - Role
 *
 * Token validity:
 * - 7 days
 */
const generateToken = (user) => {
    try {
        /*
         * Create JWT payload
         */
        const payload = {
            id: user._id.toString(),

            email: user.email,

            role: user.role,
        };

        /*
         * Generate JWT
         */
        const token = jwt.sign(
            payload,

            process.env.JWT_SECRET,

            {
                expiresIn: "7d",
            }
        );

        return token;
    } catch (error) {
        console.error(
            "========== Generate Token Error =========="
        );

        console.error(error);

        console.error(
            "=========================================="
        );

        throw error;
    }
};


/*
 * Export function
 */
module.exports = generateToken;