// backend/routes/organizerRoutes.js

const express = require("express");

// =====================================================
// ORGANIZER CONTROLLERS
// =====================================================

const {
    verifyOrganizerOTP,
    resendOrganizerOTP,

    getOrganizerEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    getEventRegistrations,
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

const upload =
    require("../middleware/upload");

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
// =====================================================

router.get(
    "/events",
    protect,
    authorizeRoles("organizer"),
    getOrganizerEvents
);


// =====================================================
// ORGANIZER — GET SINGLE EVENT
// =====================================================
//
// GET /api/organizer/events/:id
//
// Access:
// Organizer
//
// Used by:
// EditEvent.jsx
// EventDetails.jsx
// =====================================================

router.get(
    "/events/:id",
    protect,
    authorizeRoles("organizer"),
    getEventById
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
// Supports banner image upload.
// =====================================================

router.post(
    "/events",
    protect,
    authorizeRoles("organizer"),
    upload.single("bannerImage"),
    createEvent
);


// =====================================================
// ORGANIZER — UPDATE EVENT
// =====================================================
//
// PUT /api/organizer/events/:id
//
// Access:
// Organizer
//
// Supports replacing banner image.
// =====================================================

router.put(
    "/events/:id",
    protect,
    authorizeRoles("organizer"),
    upload.single("bannerImage"),
    updateEvent
);


// =====================================================
// ORGANIZER — DELETE EVENT
// =====================================================
//
// DELETE /api/organizer/events/:id
//
// Access:
// Organizer
// =====================================================

router.delete(
    "/events/:id",
    protect,
    authorizeRoles("organizer"),
    deleteEvent
);


// =====================================================
// ORGANIZER — TOGGLE EVENT STATUS
// =====================================================
//
// PATCH /api/organizer/events/:id/status
//
// Access:
// Organizer
//
// active <-> closed
// =====================================================

router.patch(
    "/events/:id/status",
    protect,
    authorizeRoles("organizer"),
    toggleEventStatus
);


// =====================================================
// ORGANIZER — GET EVENT REGISTRATIONS
// =====================================================
//
// GET /api/organizer/events/:id/registrations
//
// Access:
// Organizer
// =====================================================

router.get(
    "/events/:id/registrations",
    protect,
    authorizeRoles("organizer"),
    getEventRegistrations
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
// EXPORT ROUTER
// =====================================================

module.exports = router;