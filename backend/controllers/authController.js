// backend/controllers/authController.js

const User = require("../models/User");
const Organizer = require("../models/Organizer");

const generateToken =
    require("../utils/generateToken");


// =====================================================
// GOOGLE LOGIN SUCCESS
// =====================================================
//
// Google login flow:
//
// ADMIN
//   -> /auth/success?token=...
//
// PARTICIPANT
//   -> /auth/success?token=...
//
// PENDING ORGANIZER
//   -> /organizer/verify-otp?email=...
//
// ACTIVE ORGANIZER
//   -> /auth/success?token=...
//
// =====================================================

const googleLoginSuccess = async (
    req,
    res
) => {

    try {

        // =================================================
        // CHECK AUTHENTICATED USER
        // =================================================

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Google authentication failed",

            });

        }


        // =================================================
        // NORMALIZE EMAIL
        // =================================================

        const email =
            String(
                req.user.email || ""
            )
                .trim()
                .toLowerCase();


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Google account email not available",

            });

        }


        // =================================================
        // CHECK ORGANIZER
        // =================================================

        const organizer =
            await Organizer.findOne({
                email,
            });


        // =================================================
        // PENDING ORGANIZER
        // =================================================
        //
        // Organizer exists but OTP has not been verified.
        //
        // DO NOT generate a normal JWT.
        //
        // Send organizer directly to OTP page.
        //
        // =================================================

        if (
            organizer &&
            (
                organizer.otpVerified !== true ||
                organizer.isActive !== true
            )
        ) {

            // ---------------------------------------------
            // Make sure the corresponding User exists.
            // Passport normally creates this already.
            // ---------------------------------------------

            let user =
                await User.findOne({
                    email,
                });


            // ---------------------------------------------
            // Create User if missing
            // ---------------------------------------------

            if (!user) {

                user =
                    await User.create({

                        name:
                            organizer.name ||
                            req.user.name ||
                            "Organizer",

                        email:
                            organizer.email,

                        googleId:
                            req.user.googleId ||
                            null,

                        profileImage:
                            req.user.profileImage ||
                            "",

                        role:
                            "organizer",

                        isActive:
                            false,

                    });

            } else {

                // -----------------------------------------
                // Never convert admin into organizer
                // -----------------------------------------

                if (
                    user.role ===
                    "admin"
                ) {

                    const token =
                        generateToken(
                            user
                        );


                    const redirectUrl =
                        `${process.env.CLIENT_URL}` +
                        `/auth/success` +
                        `?token=${encodeURIComponent(
                            token
                        )}`;


                    return res.redirect(
                        redirectUrl
                    );
                }


                // -----------------------------------------
                // Make sure this user is an organizer
                // but keep account inactive until OTP.
                // -----------------------------------------

                user.name =
                    organizer.name ||
                    user.name ||
                    req.user.name;

                user.googleId =
                    req.user.googleId ||
                    user.googleId;

                user.profileImage =
                    req.user.profileImage ||
                    user.profileImage ||
                    "";

                user.role =
                    "organizer";

                user.isActive =
                    false;


                await user.save();

            }


            // ---------------------------------------------
            // Store email for OTP page
            // ---------------------------------------------

            const redirectUrl =
                `${process.env.CLIENT_URL}` +
                `/organizer/verify-otp` +
                `?email=${encodeURIComponent(
                    email
                )}`;


            return res.redirect(
                redirectUrl
            );

        }


        // =================================================
        // ACTIVE ORGANIZER
        // =================================================
        //
        // OTP already verified.
        //
        // Ensure User is active and has organizer role.
        //
        // =================================================

        if (
            organizer &&
            organizer.otpVerified === true &&
            organizer.isActive === true
        ) {

            let user =
                await User.findOne({
                    email,
                });


            // ---------------------------------------------
            // Create missing User
            // ---------------------------------------------

            if (!user) {

                user =
                    await User.create({

                        name:
                            organizer.name ||
                            req.user.name ||
                            "Organizer",

                        email:
                            organizer.email,

                        googleId:
                            req.user.googleId ||
                            null,

                        profileImage:
                            req.user.profileImage ||
                            "",

                        role:
                            "organizer",

                        isActive:
                            true,

                    });

            } else {

                // -----------------------------------------
                // Never convert admin account
                // -----------------------------------------

                if (
                    user.role ===
                    "admin"
                ) {

                    const token =
                        generateToken(
                            user
                        );


                    const redirectUrl =
                        `${process.env.CLIENT_URL}` +
                        `/auth/success` +
                        `?token=${encodeURIComponent(
                            token
                        )}`;


                    return res.redirect(
                        redirectUrl
                    );
                }


                user.name =
                    organizer.name ||
                    user.name ||
                    req.user.name;

                user.googleId =
                    req.user.googleId ||
                    user.googleId;

                user.profileImage =
                    req.user.profileImage ||
                    user.profileImage ||
                    "";

                user.role =
                    "organizer";

                user.isActive =
                    true;


                await user.save();

            }


            // ---------------------------------------------
            // Generate JWT from REAL User document
            // ---------------------------------------------

            const token =
                generateToken(
                    user
                );


            const redirectUrl =
                `${process.env.CLIENT_URL}` +
                `/auth/success` +
                `?token=${encodeURIComponent(
                    token
                )}`;


            return res.redirect(
                redirectUrl
            );

        }


        // =================================================
        // NORMAL ADMIN / PARTICIPANT LOGIN
        // =================================================
        //
        // If no Organizer record exists, use the User
        // authenticated by Passport.
        //
        // =================================================

        let user =
            await User.findOne({
                _id:
                    req.user._id,
            });


        // ---------------------------------------------
        // Fallback: find by email
        // ---------------------------------------------

        if (!user) {

            user =
                await User.findOne({
                    email,
                });

        }


        // ---------------------------------------------
        // User must exist
        // ---------------------------------------------

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated user account was not found",

            });

        }


        // =================================================
        // GENERATE JWT
        // =================================================

        const token =
            generateToken(
                user
            );


        // =================================================
        // FRONTEND SUCCESS PAGE
        // =================================================

        const redirectUrl =
            `${process.env.CLIENT_URL}` +
            `/auth/success` +
            `?token=${encodeURIComponent(
                token
            )}`;


        return res.redirect(
            redirectUrl
        );


    } catch (error) {

        console.error(
            "========== Google Login Error =========="
        );

        console.error(error);

        console.error(
            "========================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Google login failed",

        });

    }

};


// =====================================================
// GET CURRENT LOGGED-IN USER
// =====================================================
//
// GET /api/auth/me
//
// Requires JWT.
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
// DEVELOPMENT — ADMIN JWT
// =====================================================
//
// POST /api/auth/dev/admin-token
//
// Development only.
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
                email:
                    adminEmail,
            });


        // ---------------------------------------------
        // Create admin if missing
        // ---------------------------------------------

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


        // ---------------------------------------------
        // Generate token
        // ---------------------------------------------

        const token =
            generateToken(
                user
            );


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