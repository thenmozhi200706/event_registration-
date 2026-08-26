// backend/routes/organizerRoutes.js

const express = require("express");


// =====================================================
// ORGANIZER CONTROLLERS
// =====================================================

const {
    verifyOrganizerOTP,
    resendOrganizerOTP,
    getOrganizerProfile,
    getOrganizerEvents,
} = require("../controllers/organizerController");


// =====================================================
// EVENT CONTROLLER
// =====================================================

const {
    createEvent,
} = require("../controllers/eventController");


// =====================================================
// MIDDLEWARE
// =====================================================

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");


// =====================================================
// ROUTER
// =====================================================

const router = express.Router();


// =====================================================
// ORGANIZER — GET MY EVENTS
// =====================================================
//
// GET /api/organizer/events
//
// Access:
// Organizer
//
// Returns all events created by the
// currently logged-in organizer.
// =====================================================

router.get(
    "/events",

    protect,

    authorizeRoles("organizer"),

    getOrganizerEvents
);


// =====================================================
// ORGANIZER — CREATE EVENT
// =====================================================
//
// POST /api/organizer/events
//
// Access:
// Organizer
//
// This route uses the existing
// createEvent controller.
//
// IMPORTANT:
// Your createEvent controller supports
// banner upload through req.file.
// =====================================================

router.post(
    "/events",

    protect,

    authorizeRoles("organizer"),

    createEvent
);


// =====================================================
// ORGANIZER — VERIFY OTP
// =====================================================
//
// POST /api/organizer/verify-otp
//
// Access:
// Public
// =====================================================

router.post(
    "/verify-otp",

    verifyOrganizerOTP
);


// =====================================================
// ORGANIZER — RESEND OTP
// =====================================================
//
// POST /api/organizer/resend-otp
//
// Access:
// Public
// =====================================================

router.post(
    "/resend-otp",

    resendOrganizerOTP
);


// =====================================================
// ORGANIZER — GET PROFILE
// =====================================================
//
// GET /api/organizer/profile
//
// Access:
// Organizer
// =====================================================

router.get(
    "/profile",

    protect,

    authorizeRoles("organizer"),

    getOrganizerProfile
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;