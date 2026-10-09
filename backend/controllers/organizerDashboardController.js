// backend/controllers/organizerDashboardController.js

const organizerDashboardService = require("../services/organizerDashboardService");


/*
|--------------------------------------------------------------------------
| GET ORGANIZER DASHBOARD
|--------------------------------------------------------------------------
| GET /api/organizer/dashboard
|
| Access:
| Organizer only
|--------------------------------------------------------------------------
*/

const getOrganizerDashboard = async (req, res) => {
    try {
        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const dashboard =
            await organizerDashboardService.getDashboardData(
                organizerId
            );

        return res.status(200).json({
            success: true,
            message: "Organizer dashboard fetched successfully",
            dashboard,
        });

    } catch (error) {
        console.error(
            "Get Organizer Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch organizer dashboard",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET ORGANIZER ANALYTICS
|--------------------------------------------------------------------------
| GET /api/organizer/analytics
|
| Access:
| Organizer only
|--------------------------------------------------------------------------
*/

const getOrganizerAnalytics = async (req, res) => {
    try {
        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const analytics =
            await organizerDashboardService.getAnalytics(
                organizerId
            );

        return res.status(200).json({
            success: true,
            message: "Organizer analytics fetched successfully",
            analytics,
        });

    } catch (error) {
        console.error(
            "Get Organizer Analytics Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch organizer analytics",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET ORGANIZER EVENTS
|--------------------------------------------------------------------------
| GET /api/organizer/dashboard/events
|
| Access:
| Organizer only
|--------------------------------------------------------------------------
*/

const getOrganizerDashboardEvents = async (
    req,
    res
) => {
    try {
        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const events =
            await organizerDashboardService.getOrganizerEvents(
                organizerId
            );

        return res.status(200).json({
            success: true,
            count: events.length,
            events,
        });

    } catch (error) {
        console.error(
            "Get Organizer Dashboard Events Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch organizer events",
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET ORGANIZER REGISTRATIONS
|--------------------------------------------------------------------------
| GET /api/organizer/dashboard/registrations
|
| Access:
| Organizer only
|--------------------------------------------------------------------------
*/

const getOrganizerDashboardRegistrations = async (
    req,
    res
) => {
    try {
        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const registrations =
            await organizerDashboardService.getRegistrations(
                organizerId
            );

        return res.status(200).json({
            success: true,
            count: registrations.length,
            registrations,
        });

    } catch (error) {
        console.error(
            "Get Organizer Dashboard Registrations Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch organizer registrations",
        });
    }
};


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
    getOrganizerDashboard,
    getOrganizerAnalytics,
    getOrganizerDashboardEvents,
    getOrganizerDashboardRegistrations,
};