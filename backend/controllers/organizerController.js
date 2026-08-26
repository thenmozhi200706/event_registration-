// backend/controllers/organizerController.js

const Organizer = require("../models/Organizer");
const User = require("../models/User");
const Event = require("../models/Event");

const generateOTP =
    require("../utils/generateOTP");

const generateToken =
    require("../utils/generateToken");

const {
    sendOTPEmail,
    sendWelcomeEmail,
} = require("../utils/sendEmail");


// =====================================================
// ORGANIZER — VERIFY OTP
// =====================================================
//
// POST /api/organizer/verify-otp
//
// Body:
//
// {
//     "email": "organizer@gmail.com",
//     "otp": "123456"
// }
//
// Public route
//
// =====================================================

const verifyOrganizerOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
            otp,
        } = req.body || {};


        // =================================================
        // VALIDATE INPUT
        // =================================================

        if (!email || !otp) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and OTP are required",

            });

        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        const normalizedOTP =
            String(otp)
                .trim();


        if (!normalizedEmail) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer email is required",

            });

        }


        if (
            !/^\d{6}$/.test(
                normalizedOTP
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP must contain exactly 6 digits",

            });

        }


        // =================================================
        // FIND ORGANIZER
        // =================================================

        const organizer =
            await Organizer.findOne({
                email:
                    normalizedEmail,
            });


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer invitation not found",

            });

        }


        // =================================================
        // ALREADY VERIFIED
        // =================================================

        if (
            organizer.otpVerified === true &&
            organizer.isActive === true
        ) {

            let existingUser =
                await User.findOne({
                    email:
                        normalizedEmail,
                });


            if (!existingUser) {

                existingUser =
                    await User.create({

                        name:
                            organizer.name,

                        email:
                            organizer.email,

                        role:
                            "organizer",

                        isActive:
                            true,

                    });

            } else {

                if (
                    existingUser.role ===
                    "admin"
                ) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "This Gmail belongs to an admin account",

                    });

                }


                existingUser.name =
                    organizer.name;

                existingUser.role =
                    "organizer";

                existingUser.isActive =
                    true;


                await existingUser.save();

            }


            const token =
                generateToken(
                    existingUser
                );


            return res.status(200).json({

                success: true,

                message:
                    "Organizer is already verified",

                token,

                user: {

                    id:
                        existingUser._id,

                    name:
                        existingUser.name,

                    email:
                        existingUser.email,

                    role:
                        existingUser.role,

                    isActive:
                        existingUser.isActive,

                },

            });

        }


        // =================================================
        // CHECK OTP
        // =================================================

        if (
            !organizer.otpCode ||
            !organizer.otpExpiresAt
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "No active OTP found. Please request a new OTP.",

            });

        }


        // =================================================
        // CHECK EXPIRATION
        // =================================================

        if (
            new Date(
                organizer.otpExpiresAt
            ).getTime() <=
            Date.now()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "OTP has expired. Please request a new OTP.",

            });

        }


        // =================================================
        // COMPARE OTP
        // =================================================

        if (
            String(
                organizer.otpCode
            ).trim() !==
            normalizedOTP
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid OTP",

            });

        }


        // =================================================
        // FIND USER
        // =================================================

        let user =
            await User.findOne({
                email:
                    normalizedEmail,
            });


        // =================================================
        // NEVER CONVERT ADMIN
        // =================================================

        if (
            user &&
            user.role === "admin"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This Gmail belongs to an admin account",

            });

        }


        // =================================================
        // ACTIVATE ORGANIZER
        // =================================================

        organizer.otpVerified =
            true;

        organizer.isActive =
            true;

        organizer.verifiedAt =
            new Date();

        organizer.otpCode =
            null;

        organizer.otpExpiresAt =
            null;


        await organizer.save();


        // =================================================
        // CREATE / UPDATE USER
        // =================================================

        if (!user) {

            user =
                await User.create({

                    name:
                        organizer.name,

                    email:
                        organizer.email,

                    role:
                        "organizer",

                    isActive:
                        true,

                });

        } else {

            user.name =
                organizer.name;

            user.role =
                "organizer";

            user.isActive =
                true;


            await user.save();

        }


        // =================================================
        // WELCOME EMAIL
        // =================================================

        try {

            await sendWelcomeEmail({

                email:
                    organizer.email,

                name:
                    organizer.name,

            });

        } catch (emailError) {

            console.error(
                "Welcome email failed:",
                emailError
            );

        }


        // =================================================
        // GENERATE JWT
        // =================================================

        const token =
            generateToken(
                user
            );


        // =================================================
        // SUCCESS RESPONSE
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Organizer verified and activated successfully",

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

            organizer: {

                id:
                    organizer._id,

                name:
                    organizer.name,

                email:
                    organizer.email,

                otpVerified:
                    organizer.otpVerified,

                isActive:
                    organizer.isActive,

                verifiedAt:
                    organizer.verifiedAt,

            },

        });

    } catch (error) {

        console.error(
            "========== Verify Organizer OTP Error =========="
        );

        console.error(error);

        console.error(
            "================================================="
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Organizer OTP verification failed",

        });

    }

};


// =====================================================
// ORGANIZER — RESEND OTP
// =====================================================
//
// POST /api/organizer/resend-otp
//
// Body:
//
// {
//     "email": "organizer@gmail.com"
// }
//
// =====================================================

const resendOrganizerOTP = async (
    req,
    res
) => {

    try {

        const {
            email,
        } = req.body || {};


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required",

            });

        }


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        const organizer =
            await Organizer.findOne({
                email:
                    normalizedEmail,
            });


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer invitation not found",

            });

        }


        // =================================================
        // ALREADY ACTIVE
        // =================================================

        if (
            organizer.isActive ||
            organizer.otpVerified
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer account is already active",

            });

        }


        // =================================================
        // GENERATE NEW OTP
        // =================================================

        const otp =
            String(
                generateOTP()
            ).trim();


        organizer.otpCode =
            otp;

        organizer.otpExpiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        organizer.otpVerified =
            false;


        await organizer.save();


        // =================================================
        // SEND OTP
        // =================================================

        await sendOTPEmail({

            email:
                organizer.email,

            name:
                organizer.name,

            otp:
                otp,

        });


        return res.status(200).json({

            success: true,

            message:
                "New OTP sent successfully",

        });

    } catch (error) {

        console.error(
            "========== Resend Organizer OTP Error =========="
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to resend OTP",

        });

    }

};


// =====================================================
// ORGANIZER — GET PROFILE
// =====================================================

const getOrganizerProfile = async (
    req,
    res
) => {

    try {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required",

            });

        }


        const userEmail =
            String(
                req.user.email || ""
            )
                .trim()
                .toLowerCase();


        if (!userEmail) {

            return res.status(400).json({

                success: false,

                message:
                    "Authenticated user email not found",

            });

        }


        const organizer =
            await Organizer.findOne({
                email:
                    userEmail,
            });


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer profile not found",

            });

        }


        if (!organizer.isActive) {

            return res.status(403).json({

                success: false,

                message:
                    "Organizer account is disabled",

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

                role:
                    req.user.role,

                profileImage:
                    req.user.profileImage ||
                    "",

                isActive:
                    req.user.isActive,

            },

            organizer: {

                id:
                    organizer._id,

                name:
                    organizer.name,

                email:
                    organizer.email,

                otpVerified:
                    organizer.otpVerified,

                isActive:
                    organizer.isActive,

                addedByAdminId:
                    organizer.addedByAdminId,

                verifiedAt:
                    organizer.verifiedAt,

                createdAt:
                    organizer.createdAt,

                updatedAt:
                    organizer.updatedAt,

            },

        });

    } catch (error) {

        console.error(
            "========== Get Organizer Profile Error =========="
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch organizer profile",

        });

    }

};


// =====================================================
// ORGANIZER — GET MY EVENTS
// =====================================================

const getOrganizerEvents = async (
    req,
    res
) => {

    try {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required",

            });

        }


        const events =
            await Event.find({

                organizerId:
                    req.user._id,

            })
                .populate(
                    "organizerId",
                    "name email profileImage"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                events.length,

            events,

        });

    } catch (error) {

        console.error(
            "========== Get Organizer Events Error =========="
        );

        console.error(error);


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch organizer events",

        });

    }

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    verifyOrganizerOTP,

    resendOrganizerOTP,

    getOrganizerProfile,

    getOrganizerEvents,

};