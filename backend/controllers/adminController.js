// backend/controllers/adminController.js

const Organizer = require("../models/Organizer");
const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");

const generateOTP = require("../utils/generateOTP");

const {
    sendOTPEmail,
} = require("../utils/sendEmail");


// =====================================================
// ADMIN — DASHBOARD
// =====================================================

const getAdminDashboard = async (req, res) => {
    try {

        const [
            totalOrganizers,
            totalEvents,
            totalRegistrations,
            revenueResult,
            recentEvents,
            recentOrganizers,
        ] = await Promise.all([

            Organizer.countDocuments(),

            Event.countDocuments(),

            Registration.countDocuments(),

            Payment.aggregate([
                {
                    $match: {
                        status: "paid",
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$amount",
                        },
                    },
                },
            ]),

            Event.find()
                .select(
                    "title venue eventDate registrationFee status createdAt organizerId"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),

            Organizer.find()
                .select(
                    "name email isActive otpVerified createdAt addedByAdminId"
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),
        ]);


        const totalRevenue =
            revenueResult.length > 0
                ? Number(
                    revenueResult[0].total
                ) || 0
                : 0;


        return res.status(200).json({

            success: true,

            message:
                "Admin dashboard loaded successfully",

            totalOrganizers,

            totalEvents,

            totalRegistrations,

            totalRevenue,

            recentEvents,

            recentOrganizers,
        });

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to load admin dashboard",
        });
    }
};


// =====================================================
// ADMIN — ADD ORGANIZER
// =====================================================
//
// POST /api/admin/organizers
//
// Body:
//
// {
//     "name": "Gowtham",
//     "email": "ssaggowtham@gmail.com"
// }
//
// FLOW:
//
// 1. Admin enters name + Gmail
// 2. Check whether Gmail already exists
// 3. If participant exists:
//       Convert participant -> organizer
// 4. If organizer exists:
//       Resend OTP
// 5. If new:
//       Create User + Organizer
// 6. Generate OTP
// 7. Send OTP
// 8. Organizer verifies OTP
// 9. Organizer becomes active
//
// =====================================================

const addOrganizer = async (req, res) => {
    try {

        const {
            name,
            email,
        } = req.body;


        // =================================================
        // VALIDATION
        // =================================================

        if (!name || !email) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer name and Gmail address are required",
            });
        }


        const organizerName =
            String(name).trim();


        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        if (!organizerName) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer name is required",
            });
        }


        // =================================================
        // GMAIL VALIDATION
        // =================================================

        if (
            !normalizedEmail.endsWith(
                "@gmail.com"
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Organizer email must be a Gmail address",
            });
        }


        // =================================================
        // CHECK EXISTING USER
        // =================================================

        let existingUser =
            await User.findOne({
                email: normalizedEmail,
            });


        // =================================================
        // CHECK EXISTING ORGANIZER
        // =================================================

        let organizer =
            await Organizer.findOne({
                email: normalizedEmail,
            });


        // =================================================
        // ADMIN ACCOUNT PROTECTION
        // =================================================

        if (
            existingUser &&
            existingUser.role === "admin"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This Gmail belongs to an admin account and cannot be used as an organizer",
            });
        }


        // =================================================
        // GENERATE OTP
        // =================================================

        const otp =
            generateOTP();


        const otpExpiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );


        // =================================================
        // CASE 1
        // EXISTING ORGANIZER
        // =================================================

        if (organizer) {

            // ---------------------------------------------
            // Organizer already active
            // ---------------------------------------------

            if (organizer.isActive) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This organizer is already active",
                });
            }


            // ---------------------------------------------
            // Update organizer information
            // ---------------------------------------------

            organizer.name =
                organizerName;

            organizer.otpCode =
                otp;

            organizer.otpExpiresAt =
                otpExpiresAt;

            organizer.otpVerified =
                false;

            organizer.isActive =
                false;

            organizer.addedByAdminId =
                req.user._id;


            await organizer.save();


            // ---------------------------------------------
            // Make sure User account exists
            // ---------------------------------------------

            if (!existingUser) {

                existingUser =
                    await User.create({

                        name:
                            organizerName,

                        email:
                            normalizedEmail,

                        role:
                            "organizer",

                        isActive:
                            false,
                    });

            } else {

                // -----------------------------------------
                // Existing user must be organizer
                // -----------------------------------------

                existingUser.name =
                    organizerName;

                existingUser.role =
                    "organizer";

                existingUser.isActive =
                    false;

                await existingUser.save();
            }


            // ---------------------------------------------
            // SEND OTP
            // ---------------------------------------------

            await sendOTPEmail({

                email:
                    normalizedEmail,

                name:
                    organizerName,

                otp:
                    otp,
            });


            return res.status(200).json({

                success: true,

                message:
                    "Organizer already exists. A new OTP has been sent successfully",

                organizerId:
                    organizer._id,

                email:
                    organizer.email,

                otpRequired:
                    true,
            });
        }


        // =================================================
        // CASE 2
        // EXISTING USER — PARTICIPANT
        // =================================================
        //
        // This is the important fix.
        //
        // If Gmail already belongs to a participant,
        // do NOT return 409.
        //
        // Convert the existing User into organizer.
        //
        // =================================================

        if (
            existingUser &&
            existingUser.role === "participant"
        ) {

            console.log(
                "Existing participant found. Promoting to organizer:",
                normalizedEmail
            );


            // ---------------------------------------------
            // UPDATE USER
            // ---------------------------------------------

            existingUser.name =
                organizerName;

            existingUser.role =
                "organizer";

            existingUser.isActive =
                false;


            await existingUser.save();


            // ---------------------------------------------
            // CREATE ORGANIZER RECORD
            // ---------------------------------------------

            organizer =
                await Organizer.create({

                    name:
                        organizerName,

                    email:
                        normalizedEmail,

                    otpCode:
                        otp,

                    otpExpiresAt:
                        otpExpiresAt,

                    otpVerified:
                        false,

                    isActive:
                        false,

                    addedByAdminId:
                        req.user._id,
                });


            // ---------------------------------------------
            // SEND OTP
            // ---------------------------------------------

            await sendOTPEmail({

                email:
                    normalizedEmail,

                name:
                    organizerName,

                otp:
                    otp,
            });


            return res.status(201).json({

                success: true,

                message:
                    "Existing account converted to organizer and OTP sent successfully",

                organizerId:
                    organizer._id,

                email:
                    organizer.email,

                otpRequired:
                    true,

                convertedExistingUser:
                    true,
            });
        }


        // =================================================
        // CASE 3
        // EXISTING USER WITH UNKNOWN ROLE
        // =================================================

        if (
            existingUser &&
            existingUser.role !== "organizer"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This Gmail is already registered with another account role",
            });
        }


        // =================================================
        // CASE 4
        // NEW ORGANIZER
        // =================================================

        organizer =
            await Organizer.create({

                name:
                    organizerName,

                email:
                    normalizedEmail,

                otpCode:
                    otp,

                otpExpiresAt:
                    otpExpiresAt,

                otpVerified:
                    false,

                isActive:
                    false,

                addedByAdminId:
                    req.user._id,
            });


        // =================================================
        // CREATE USER ACCOUNT
        // =================================================

        try {

            existingUser =
                await User.create({

                    name:
                        organizerName,

                    email:
                        normalizedEmail,

                    role:
                        "organizer",

                    isActive:
                        false,
                });

        } catch (userCreateError) {

            // ---------------------------------------------
            // If User creation fails after Organizer
            // creation, remove the organizer record.
            // ---------------------------------------------

            await Organizer.findByIdAndDelete(
                organizer._id
            );


            if (
                userCreateError.code === 11000
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This Gmail is already registered with another user",
                });
            }


            throw userCreateError;
        }


        // =================================================
        // SEND OTP
        // =================================================

        await sendOTPEmail({

            email:
                normalizedEmail,

            name:
                organizerName,

            otp:
                otp,
        });


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(201).json({

            success: true,

            message:
                "Organizer added successfully and OTP sent to Gmail",

            organizerId:
                organizer._id,

            email:
                organizer.email,

            otpRequired:
                true,
        });

    } catch (error) {

        console.error(
            "Add Organizer Error:",
            error
        );


        // =================================================
        // DUPLICATE KEY ERROR
        // =================================================

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This Gmail is already registered",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to add organizer",
        });
    }
};


// =====================================================
// ADMIN — GET ALL ORGANIZERS
// =====================================================

const getOrganizers = async (req, res) => {
    try {

        const organizers =
            await Organizer.find()
                .populate(
                    "addedByAdminId",
                    "name email"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({

            success: true,

            count:
                organizers.length,

            organizers,
        });

    } catch (error) {

        console.error(
            "Get Organizers Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch organizers",
        });
    }
};


// =====================================================
// ADMIN — GET ORGANIZER BY ID
// =====================================================

const getOrganizerById = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        const organizer =
            await Organizer.findById(id)
                .populate(
                    "addedByAdminId",
                    "name email"
                );


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer not found",
            });
        }


        return res.status(200).json({

            success: true,

            organizer,
        });

    } catch (error) {

        console.error(
            "Get Organizer Error:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid organizer ID",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch organizer",
        });
    }
};


// =====================================================
// ADMIN — UPDATE ORGANIZER
// =====================================================
//
// PUT /api/admin/organizers/:id
//
// Body:
//
// {
//     "name": "New Name",
//     "email": "new@gmail.com"
// }
//
// =====================================================

const updateOrganizer = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        const {
            name,
            email,
        } = req.body;


        // =================================================
        // FIND ORGANIZER
        // =================================================

        const organizer =
            await Organizer.findById(id);


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer not found",
            });
        }


        // =================================================
        // SAVE OLD EMAIL
        // =================================================

        const oldEmail =
            organizer.email;


        // =================================================
        // UPDATE NAME
        // =================================================

        if (
            name !== undefined
        ) {

            const newName =
                String(name).trim();


            if (!newName) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Organizer name cannot be empty",
                });
            }


            organizer.name =
                newName;
        }


        // =================================================
        // UPDATE EMAIL
        // =================================================

        let emailChanged =
            false;


        let newEmail =
            oldEmail;


        if (
            email !== undefined
        ) {

            newEmail =
                String(email)
                    .trim()
                    .toLowerCase();


            if (!newEmail) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Organizer email cannot be empty",
                });
            }


            if (
                !newEmail.endsWith(
                    "@gmail.com"
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Organizer email must be a Gmail address",
                });
            }


            emailChanged =
                newEmail !== oldEmail;


            // ---------------------------------------------
            // CHECK OTHER ORGANIZER
            // ---------------------------------------------

            if (emailChanged) {

                const existingOrganizer =
                    await Organizer.findOne({

                        email:
                            newEmail,

                        _id: {
                            $ne: id,
                        },
                    });


                if (existingOrganizer) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "Another organizer already uses this Gmail",
                    });
                }


                // -----------------------------------------
                // CHECK USER ACCOUNT
                // -----------------------------------------

                const existingUser =
                    await User.findOne({

                        email:
                            newEmail,
                    });


                if (existingUser) {

                    return res.status(409).json({

                        success: false,

                        message:
                            "This Gmail is already registered with another user",
                    });
                }
            }


            organizer.email =
                newEmail;
        }


        // =================================================
        // SAVE ORGANIZER
        // =================================================

        await organizer.save();


        // =================================================
        // UPDATE USER ACCOUNT
        // =================================================
        //
        // User is connected through old email.
        //
        // =================================================

        const user =
            await User.findOne({

                email:
                    oldEmail,

                role:
                    "organizer",
            });


        if (user) {

            if (
                name !== undefined
            ) {

                user.name =
                    organizer.name;
            }


            if (emailChanged) {

                user.email =
                    newEmail;
            }


            user.isActive =
                organizer.isActive;


            await user.save();
        }


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Organizer updated successfully",

            organizer,
        });

    } catch (error) {

        console.error(
            "Update Organizer Error:",
            error
        );


        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Email address is already in use",
            });
        }


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid organizer ID",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to update organizer",
        });
    }
};


// =====================================================
// ADMIN — TOGGLE ORGANIZER STATUS
// =====================================================
//
// PATCH /api/admin/organizers/:id/status
//
// Body:
//
// {
//     "isActive": true
// }
//
// or
//
// {
//     "isActive": false
// }
//
// =====================================================

const toggleOrganizerStatus = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        // =================================================
        // FIND ORGANIZER
        // =================================================

        const organizer =
            await Organizer.findById(id);


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer not found",
            });
        }


        // =================================================
        // SUPPORT BOTH REQUEST STYLES
        // =================================================
        //
        // Preferred:
        //
        // { isActive: true }
        //
        // Also supports:
        //
        // { status: true }
        //
        // This prevents frontend/backend naming
        // mismatch problems.
        //
        // =================================================

        let requestedStatus;


        if (
            typeof req.body.isActive ===
            "boolean"
        ) {

            requestedStatus =
                req.body.isActive;

        } else if (
            typeof req.body.status ===
            "boolean"
        ) {

            requestedStatus =
                req.body.status;

        } else {

            // ---------------------------------------------
            // If no boolean was supplied,
            // toggle the current status.
            // ---------------------------------------------

            requestedStatus =
                !organizer.isActive;
        }


        // =================================================
        // UPDATE ORGANIZER STATUS
        // =================================================

        organizer.isActive =
            requestedStatus;


        // =================================================
        // IF DISABLED
        // =================================================

        if (!requestedStatus) {

            organizer.otpVerified =
                false;
        }


        await organizer.save();


        // =================================================
        // UPDATE USER ACCOUNT
        // =================================================

        const user =
            await User.findOne({

                email:
                    organizer.email,

                role:
                    "organizer",
            });


        if (user) {

            user.isActive =
                organizer.isActive;

            await user.save();

        } else if (requestedStatus) {

            // ---------------------------------------------
            // Safety fallback.
            //
            // If Organizer exists but User was deleted,
            // recreate the organizer login account.
            // ---------------------------------------------

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
        }


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                `Organizer ${
                    organizer.isActive
                        ? "enabled"
                        : "disabled"
                } successfully`,

            organizer,
        });

    } catch (error) {

        console.error(
            "Toggle Organizer Error:",
            error
        );


        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "Organizer email is already registered",
            });
        }


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid organizer ID",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to update organizer status",
        });
    }
};


// =====================================================
// ADMIN — DELETE ORGANIZER
// =====================================================
//
// DELETE /api/admin/organizers/:id
//
// =====================================================

const deleteOrganizer = async (
    req,
    res
) => {

    try {

        const {
            id,
        } = req.params;


        // =================================================
        // FIND ORGANIZER
        // =================================================

        const organizer =
            await Organizer.findById(id);


        if (!organizer) {

            return res.status(404).json({

                success: false,

                message:
                    "Organizer not found",
            });
        }


        // =================================================
        // SAVE EMAIL BEFORE DELETE
        // =================================================

        const organizerEmail =
            organizer.email;


        // =================================================
        // DELETE ORGANIZER
        // =================================================

        await Organizer.findByIdAndDelete(
            id
        );


        // =================================================
        // DELETE ORGANIZER USER ACCOUNT
        // =================================================

        await User.deleteOne({

            email:
                organizerEmail,

            role:
                "organizer",
        });


        // =================================================
        // SUCCESS
        // =================================================

        return res.status(200).json({

            success: true,

            message:
                "Organizer removed successfully",

            organizerId:
                id,
        });

    } catch (error) {

        console.error(
            "Delete Organizer Error:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid organizer ID",
            });
        }


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to remove organizer",
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    getAdminDashboard,

    addOrganizer,

    getOrganizers,

    getOrganizerById,

    updateOrganizer,

    toggleOrganizerStatus,

    deleteOrganizer,
};