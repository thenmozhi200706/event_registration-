// backend/controllers/authController.js

const User = require("../models/User");
const Organizer = require("../models/Organizer");

const generateToken = require("../utils/generateToken");

// =====================================================
// FRONTEND URL
// =====================================================

const getClientUrl = () => {
    const url =
        process.env.CLIENT_URL ||
        "http://localhost:5173";

    return url.replace(/\/+$/, "");
};


// =====================================================
// REDIRECT TO FRONTEND AUTH SUCCESS
// =====================================================

const redirectWithToken = (res, token) => {
    const clientUrl = getClientUrl();

    const redirectUrl =
        `${clientUrl}/auth/success?token=${encodeURIComponent(token)}`;

    console.log("========================================");
    console.log("EventSphere Google Authentication");
    console.log("Redirect URL:", redirectUrl);
    console.log("Token generated:", Boolean(token));
    console.log("========================================");

    return res.redirect(302, redirectUrl);
};


// =====================================================
// GOOGLE LOGIN SUCCESS
// =====================================================
//
// Google OAuth callback:
//
// /api/auth/google/callback
//
// Successful login:
//
// /auth/success?token=JWT
//
// Pending organizer:
//
// /organizer/verify-otp?email=email
//
// =====================================================

const googleLoginSuccess = async (req, res) => {

    try {

        console.log("========================================");
        console.log("GOOGLE LOGIN CALLBACK");
        console.log("req.user:", req.user);
        console.log("========================================");


        // =================================================
        // CHECK PASSPORT USER
        // =================================================

        if (!req.user) {

            console.error(
                "Google authentication failed: req.user is missing"
            );

            return res.redirect(
                `${getClientUrl()}/login?error=google_auth_failed`
            );
        }


        // =================================================
        // GET EMAIL
        // =================================================

        const email = String(
            req.user.email || ""
        )
            .trim()
            .toLowerCase();


        if (!email) {

            console.error(
                "Google account email was not returned."
            );

            return res.redirect(
                `${getClientUrl()}/login?error=email_missing`
            );
        }


        console.log(
            "Google authenticated email:",
            email
        );


        // =================================================
        // FIND ORGANIZER
        // =================================================

        const organizer =
            await Organizer.findOne({
                email,
            });


        // =================================================
        // PENDING ORGANIZER
        // =================================================
        //
        // Organizer exists but OTP is not verified
        // or account is not active.
        //
        // =================================================

        if (
            organizer &&
            (
                organizer.otpVerified !== true ||
                organizer.isActive !== true
            )
        ) {

            console.log(
                "Pending organizer detected:",
                email
            );


            let user =
                await User.findOne({
                    email,
                });


            // =================================================
            // CREATE USER IF MISSING
            // =================================================

            if (!user) {

                user =
                    await User.create({

                        name:
                            organizer.name ||
                            req.user.name ||
                            "Organizer",

                        email:
                            email,

                        googleId:
                            req.user.googleId ||
                            req.user.id ||
                            null,

                        profileImage:
                            req.user.profileImage ||
                            req.user.picture ||
                            "",

                        role:
                            "organizer",

                        isActive:
                            false,

                    });

            } else {

                // =============================================
                // NEVER CHANGE ADMIN TO ORGANIZER
                // =============================================

                if (
                    user.role === "admin"
                ) {

                    const token =
                        generateToken(user);

                    return redirectWithToken(
                        res,
                        token
                    );
                }


                // =============================================
                // UPDATE ORGANIZER USER
                // =============================================

                user.name =
                    organizer.name ||
                    user.name ||
                    req.user.name ||
                    "Organizer";

                user.googleId =
                    req.user.googleId ||
                    req.user.id ||
                    user.googleId;

                user.profileImage =
                    req.user.profileImage ||
                    req.user.picture ||
                    user.profileImage ||
                    "";

                user.role =
                    "organizer";

                user.isActive =
                    false;


                await user.save();
            }


            // =================================================
            // SEND TO OTP VERIFICATION
            // =================================================

            const otpUrl =
                `${getClientUrl()}` +
                `/organizer/verify-otp` +
                `?email=${encodeURIComponent(email)}`;


            console.log(
                "Pending organizer redirect:",
                otpUrl
            );


            return res.redirect(
                302,
                otpUrl
            );
        }


        // =================================================
        // ACTIVE ORGANIZER
        // =================================================

        if (
            organizer &&
            organizer.otpVerified === true &&
            organizer.isActive === true
        ) {

            console.log(
                "Active organizer detected:",
                email
            );


            let user =
                await User.findOne({
                    email,
                });


            // =================================================
            // CREATE USER IF MISSING
            // =================================================

            if (!user) {

                user =
                    await User.create({

                        name:
                            organizer.name ||
                            req.user.name ||
                            "Organizer",

                        email:
                            email,

                        googleId:
                            req.user.googleId ||
                            req.user.id ||
                            null,

                        profileImage:
                            req.user.profileImage ||
                            req.user.picture ||
                            "",

                        role:
                            "organizer",

                        isActive:
                            true,

                    });

            } else {

                // =============================================
                // NEVER CHANGE ADMIN TO ORGANIZER
                // =============================================

                if (
                    user.role === "admin"
                ) {

                    const token =
                        generateToken(user);

                    return redirectWithToken(
                        res,
                        token
                    );
                }


                // =============================================
                // UPDATE ORGANIZER
                // =============================================

                user.name =
                    organizer.name ||
                    user.name ||
                    req.user.name ||
                    "Organizer";

                user.googleId =
                    req.user.googleId ||
                    req.user.id ||
                    user.googleId;

                user.profileImage =
                    req.user.profileImage ||
                    req.user.picture ||
                    user.profileImage ||
                    "";

                user.role =
                    "organizer";

                user.isActive =
                    true;


                await user.save();
            }


            // =================================================
            // GENERATE JWT
            // =================================================

            const token =
                generateToken(user);


            if (!token) {

                throw new Error(
                    "JWT token generation failed."
                );
            }


            return redirectWithToken(
                res,
                token
            );
        }


        // =================================================
        // NORMAL USER / ADMIN / PARTICIPANT
        // =================================================

        let user =
            await User.findOne({
                _id: req.user._id,
            });


        // =================================================
        // FALLBACK BY EMAIL
        // =================================================

        if (!user) {

            user =
                await User.findOne({
                    email,
                });
        }


        // =================================================
        // USER NOT FOUND
        // =================================================

        if (!user) {

            console.error(
                "Authenticated Google user not found:",
                email
            );

            return res.redirect(
                `${getClientUrl()}/login?error=user_not_found`
            );
        }


        // =================================================
        // UPDATE GOOGLE INFORMATION
        // =================================================

        let changed = false;


        if (
            req.user.googleId &&
            user.googleId !== req.user.googleId
        ) {

            user.googleId =
                req.user.googleId;

            changed = true;
        }


        if (
            req.user.profileImage &&
            user.profileImage !== req.user.profileImage
        ) {

            user.profileImage =
                req.user.profileImage;

            changed = true;
        }


        if (
            req.user.picture &&
            user.profileImage !== req.user.picture
        ) {

            user.profileImage =
                req.user.picture;

            changed = true;
        }


        if (
            !user.name &&
            req.user.name
        ) {

            user.name =
                req.user.name;

            changed = true;
        }


        if (changed) {
            await user.save();
        }


        // =================================================
        // CHECK ACCOUNT STATUS
        // =================================================

        if (
            user.isActive === false &&
            user.role !== "participant" &&
            user.role !== "user"
        ) {

            console.log(
                "Inactive account:",
                email
            );

            return res.redirect(
                `${getClientUrl()}/login?error=account_inactive`
            );
        }


        // =================================================
        // GENERATE JWT
        // =================================================

        const token =
            generateToken(user);


        if (!token) {

            throw new Error(
                "JWT token generation failed."
            );
        }


        console.log(
            "JWT generated successfully for:",
            email
        );


        // =================================================
        // REDIRECT FRONTEND
        // =================================================

        return redirectWithToken(
            res,
            token
        );

    } catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "GOOGLE LOGIN ERROR"
        );

        console.error(error);

        console.error(
            "========================================"
        );


        return res.redirect(
            `${getClientUrl()}/login?error=google_login_failed`
        );
    }
};


// =====================================================
// GET CURRENT LOGGED-IN USER
// =====================================================
//
// GET /api/auth/me
//
// Authorization:
// Bearer JWT
//
// =====================================================

const getCurrentUser = async (
    req,
    res
) => {

    try {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "User authentication required",

            });
        }


        return res.status(200).json({

            success: true,

            user: {

                id:
                    req.user._id,

                name:
                    req.user.name,

                email:
                    req.user.email,

                googleId:
                    req.user.googleId,

                profileImage:
                    req.user.profileImage,

                whatsappNumber:
                    req.user.whatsappNumber,

                age:
                    req.user.age,

                instituteName:
                    req.user.instituteName,

                department:
                    req.user.department,

                year:
                    req.user.year,

                role:
                    req.user.role,

                isActive:
                    req.user.isActive,

                createdAt:
                    req.user.createdAt,

                updatedAt:
                    req.user.updatedAt,

            },

        });

    } catch (error) {

        console.error(
            "Get Current User Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch current user",

        });
    }
};


// =====================================================
// LOGOUT
// =====================================================
//
// POST /api/auth/logout
//
// =====================================================

const logout = async (
    req,
    res
) => {

    try {

        return res.status(200).json({

            success: true,

            message:
                "Logout successful",

        });

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Logout failed",

        });
    }
};


// =====================================================
// DEVELOPMENT ADMIN JWT
// =====================================================
//
// POST /api/auth/dev/admin-token
//
// Development only.
//
// =====================================================

const devAdminToken = async (
    req,
    res
) => {

    try {

        const adminEmail =
            process.env.ADMIN_EMAIL
                ?.trim()
                .toLowerCase();


        if (!adminEmail) {

            return res.status(500).json({

                success: false,

                message:
                    "ADMIN_EMAIL is not configured in .env",

            });
        }


        let user =
            await User.findOne({
                email: adminEmail,
            });


        // =================================================
        // CREATE ADMIN
        // =================================================

        if (!user) {

            user =
                await User.create({

                    name:
                        "EventSphere Admin",

                    email:
                        adminEmail,

                    role:
                        "admin",

                    isActive:
                        true,

                });

        } else {

            user.role =
                "admin";

            user.isActive =
                true;

            await user.save();
        }


        // =================================================
        // GENERATE TOKEN
        // =================================================

        const token =
            generateToken(user);


        return res.status(200).json({

            success: true,

            message:
                "Development admin JWT generated successfully",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role,

                isActive:
                    user.isActive,

            },

        });

    } catch (error) {

        console.error(
            "Development Admin Token Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to generate admin JWT",

        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    googleLoginSuccess,

    getCurrentUser,

    logout,

    devAdminToken,

};