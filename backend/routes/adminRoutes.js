
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
// ADMIN DASHBOARD
// GET /api/admin/dashboard
// =====================================================

router.get(
    "/dashboard",
    protect,
    authorizeRoles("admin"),
    getAdminDashboard
);

// =====================================================
// ORGANIZER MANAGEMENT
// =====================================================

// POST /api/admin/organizers
router.post(
    "/organizers",
    protect,
    authorizeRoles("admin"),
    addOrganizer
);

// GET /api/admin/organizers
router.get(
    "/organizers",
    protect,
    authorizeRoles("admin"),
    getOrganizers
);

// GET /api/admin/organizers/:id
router.get(
    "/organizers/:id",
    protect,
    authorizeRoles("admin"),
    getOrganizerById
);

// PUT /api/admin/organizers/:id
router.put(
    "/organizers/:id",
    protect,
    authorizeRoles("admin"),
    updateOrganizer
);

// PATCH /api/admin/organizers/:id/status
router.patch(
    "/organizers/:id/status",
    protect,
    authorizeRoles("admin"),
    toggleOrganizerStatus
);

// DELETE /api/admin/organizers/:id
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
