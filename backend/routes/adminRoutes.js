// backend/routes/adminRoutes.js

const express = require("express");

const {
    getAdminDashboard,

    addOrganizer,

    getOrganizers,

    getOrganizerById,

    updateOrganizer,

    toggleOrganizerStatus,

    deleteOrganizer,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// =====================================================
// ADMIN — DASHBOARD
// =====================================================
//
// GET /api/admin/dashboard
//
// Access:
// Admin only
//

router.get(
    "/dashboard",

    protect,

    authorizeRoles("admin"),

    getAdminDashboard
);


// =====================================================
// ADMIN — ADD ORGANIZER
// =====================================================
//
// POST /api/admin/organizers
//
// Body:
//
// {
//     "name": "Organizer Name",
//     "email": "organizer@gmail.com"
// }
//

router.post(
    "/organizers",

    protect,

    authorizeRoles("admin"),

    addOrganizer
);


// =====================================================
// ADMIN — GET ALL ORGANIZERS
// =====================================================
//
// GET /api/admin/organizers
//
// Access:
// Admin only
//

router.get(
    "/organizers",

    protect,

    authorizeRoles("admin"),

    getOrganizers
);


// =====================================================
// ADMIN — GET ORGANIZER BY ID
// =====================================================
//
// GET /api/admin/organizers/:id
//
// Access:
// Admin only
//

router.get(
    "/organizers/:id",

    protect,

    authorizeRoles("admin"),

    getOrganizerById
);


// =====================================================
// ADMIN — UPDATE ORGANIZER
// =====================================================
//
// PUT /api/admin/organizers/:id
//
// Body:
//
// {
//     "name": "Updated Name",
//     "email": "updated@gmail.com"
// }
//

router.put(
    "/organizers/:id",

    protect,

    authorizeRoles("admin"),

    updateOrganizer
);


// =====================================================
// ADMIN — ENABLE / DISABLE ORGANIZER
// =====================================================
//
// PATCH /api/admin/organizers/:id/status
//
// IMPORTANT:
// This endpoint toggles the current status.
//
// true  -> false
// false -> true
//

router.patch(
    "/organizers/:id/status",

    protect,

    authorizeRoles("admin"),

    toggleOrganizerStatus
);


// =====================================================
// ADMIN — DELETE ORGANIZER
// =====================================================
//
// DELETE /api/admin/organizers/:id
//
// Access:
// Admin only
//

router.delete(
    "/organizers/:id",

    protect,

    authorizeRoles("admin"),

    deleteOrganizer
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;