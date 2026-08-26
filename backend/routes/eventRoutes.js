// backend/routes/eventRoutes.js

const express = require("express");

const {
    createEvent,
    getEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    deleteEvent,
    closeEvent,
} = require("../controllers/eventController");

const protect = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// =====================================================
// PUBLIC EVENT ROUTES
// =====================================================


// ==========================================
// GET ALL EVENTS
// ==========================================
//
// GET /api/events
//
// Optional:
//
// /api/events?hashtag=technology
// /api/events?status=active
//

router.get(
    "/",
    getEvents
);


// =====================================================
// ORGANIZER ROUTES
// =====================================================


// ==========================================
// GET MY EVENTS
// ==========================================
//
// GET /api/events/organizer/my-events
//
// Access:
// Organizer only
//

router.get(
    "/organizer/my-events",
    protect,
    authorizeRoles("organizer"),
    getMyEvents
);


// ==========================================
// GET SINGLE EVENT
// ==========================================
//
// GET /api/events/:id
//
// Public
//

router.get(
    "/:id",
    getEventById
);


// =====================================================
// CREATE EVENT
// =====================================================
//
// POST /api/events
//
// Access:
// Organizer only
//
// Content-Type:
// multipart/form-data
//
// Text fields:
//
// title
// description
// hashtags
// venue
// eventDate
// registrationFee
// registrationDeadline
// paymentMethod
// paymentUpiId
// paymentInstructions
//
// File fields:
//
// banner
// paymentQr
//

router.post(
    "/",

    protect,

    authorizeRoles("organizer"),

    upload.fields([
        {
            name: "banner",
            maxCount: 1,
        },

        {
            name: "paymentQr",
            maxCount: 1,
        },
    ]),

    createEvent
);


// =====================================================
// UPDATE EVENT
// =====================================================
//
// PUT /api/events/:id
//
// Access:
// Organizer only
//
// Optional file replacement:
//
// banner
// paymentQr
//

router.put(
    "/:id",

    protect,

    authorizeRoles("organizer"),

    upload.fields([
        {
            name: "banner",
            maxCount: 1,
        },

        {
            name: "paymentQr",
            maxCount: 1,
        },
    ]),

    updateEvent
);


// =====================================================
// CLOSE EVENT
// =====================================================
//
// PATCH /api/events/:id/close
//
// Access:
// Organizer only
//

router.patch(
    "/:id/close",

    protect,

    authorizeRoles("organizer"),

    closeEvent
);


// =====================================================
// DELETE EVENT
// =====================================================
//
// DELETE /api/events/:id
//
// Access:
// Organizer only
//

router.delete(
    "/:id",

    protect,

    authorizeRoles("organizer"),

    deleteEvent
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;