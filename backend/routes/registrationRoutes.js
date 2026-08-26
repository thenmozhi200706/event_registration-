// backend/routes/registrationRoutes.js

const express = require("express");

const {
    createRegistration,
    getMyRegistrations,
    getRegistrationById,
    cancelRegistration,
    getEventRegistrations,
    confirmPayment,
} = require("../controllers/registrationController");

const protect =
    require("../middleware/authMiddleware");

const authorizeRoles =
    require("../middleware/roleMiddleware");

const router = express.Router();


// ==========================================
// CONFIRM UPI / QR PAYMENT
// ==========================================
//
// PATCH /api/registrations/:id/confirm-payment
//
// Organizer/Admin only
//

router.patch(
    "/:id/confirm-payment",

    protect,

    authorizeRoles(
        "organizer",
        "admin"
    ),

    confirmPayment
);


// =====================================================
// CREATE REGISTRATION
// =====================================================
//
// POST /api/registrations
//
// Access:
// Authenticated user
//
// Body:
//
// {
//     "eventId": "...",
//     "firstName": "Gowtham",
//     "lastName": "SS",
//     "age": 21,
//     "whatsappNumber": "9876543210",
//     "email": "user@gmail.com",
//     "instituteName": "College Name",
//     "department": "CSE",
//     "year": "3rd Year"
// }
//
// =====================================================

router.post(
    "/",
    protect,
    createRegistration
);


// =====================================================
// GET MY REGISTRATIONS
// =====================================================
//
// GET /api/registrations
//
// Access:
// Authenticated user
//
// This route is used by the Module 3
// MyRegistrations frontend page.
//
// =====================================================

router.get(
    "/",
    protect,
    getMyRegistrations
);


// =====================================================
// GET MY REGISTRATIONS — EXPLICIT ROUTE
// =====================================================
//
// GET /api/registrations/my
//
// Access:
// Authenticated user
//
// This route is also kept for compatibility
// with services/components that use /my.
//
// =====================================================

router.get(
    "/my",
    protect,
    getMyRegistrations
);


// =====================================================
// GET EVENT REGISTRATIONS
// =====================================================
//
// GET /api/registrations/event/:eventId
//
// Access:
// Organizer / Admin
//
// =====================================================

router.get(
    "/event/:eventId",

    protect,

    authorizeRoles(
        "organizer",
        "admin"
    ),

    getEventRegistrations
);


// =====================================================
// GET REGISTRATION BY ID
// =====================================================
//
// GET /api/registrations/:id
//
// Access:
// Registration owner
// Organizer
// Admin
//
// =====================================================

router.get(
    "/:id",

    protect,

    getRegistrationById
);


// =====================================================
// CANCEL REGISTRATION
// =====================================================
//
// DELETE /api/registrations/:id
//
// Access:
// Registration owner
//
// =====================================================

router.delete(
    "/:id",

    protect,

    cancelRegistration
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;