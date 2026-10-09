const express = require("express");

const {
    getOrganizerDashboard,
    getOrganizerAnalytics,
    getOrganizerDashboardEvents,
    getOrganizerDashboardRegistrations,
} = require("../controllers/organizerDashboardController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

/*
 * ============================================================
 * EVENTSPHERE — ORGANIZER DASHBOARD ROUTES
 * ============================================================
 *
 * Base URL:
 * /api/organizer
 *
 * All routes require:
 * 1. Authentication
 * 2. Organizer role
 *
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * ORGANIZER DASHBOARD
 * GET /api/organizer/dashboard
 * ------------------------------------------------------------
 */
router.get(
    "/dashboard",
    protect,
    authorizeRoles("organizer"),
    getOrganizerDashboard
);


/*
 * ------------------------------------------------------------
 * ORGANIZER ANALYTICS
 * GET /api/organizer/analytics
 * ------------------------------------------------------------
 */
router.get(
    "/analytics",
    protect,
    authorizeRoles("organizer"),
    getOrganizerAnalytics
);


/*
 * ------------------------------------------------------------
 * ORGANIZER DASHBOARD EVENTS
 * GET /api/organizer/dashboard/events
 * ------------------------------------------------------------
 */
router.get(
    "/dashboard/events",
    protect,
    authorizeRoles("organizer"),
    getOrganizerDashboardEvents
);


/*
 * ------------------------------------------------------------
 * ORGANIZER DASHBOARD REGISTRATIONS
 * GET /api/organizer/dashboard/registrations
 * ------------------------------------------------------------
 */
router.get(
    "/dashboard/registrations",
    protect,
    authorizeRoles("organizer"),
    getOrganizerDashboardRegistrations
);


module.exports = router;