
// backend/routes/adminDashboardRoutes.js

const express = require("express");

const router = express.Router();

// ============================================================
// CONTROLLER
// ============================================================

const {
    getAdminEvents,
    getAdminRegistrations,
    getAdminAnalytics,
} = require("../controllers/adminDashboardController");

// ============================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ============================================================
// ADMIN ROUTES
// Base URL: /api/admin
// ============================================================

// GET /api/admin/events
// View all events
router.get(
    "/events",
    protect,
    authorizeRoles("admin"),
    getAdminEvents
);

// GET /api/admin/registrations
// View all participant registrations
router.get(
    "/registrations",
    protect,
    authorizeRoles("admin"),
    getAdminRegistrations
);

// GET /api/admin/analytics
// Get registration, revenue, and event analytics
router.get(
    "/analytics",
    protect,
    authorizeRoles("admin"),
    getAdminAnalytics
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
