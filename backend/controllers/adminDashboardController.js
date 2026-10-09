// backend/controllers/adminDashboardController.js

const User = require("../models/User");
const Organizer = require("../models/Organizer");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");

/**
 * ============================================================
 * EVENTSPHERE - ADMIN DASHBOARD CONTROLLER
 * ============================================================
 *
 * Provides:
 *  - Total users
 *  - Total organizers
 *  - Total events
 *  - Total registrations
 *  - Paid registrations
 *  - Pending registrations
 *  - Failed registrations
 *  - Total revenue
 *  - Popular events
 *  - Recent registrations
 *  - Event-wise registration statistics
 *
 * Endpoint:
 * GET /api/admin/dashboard
 *
 * ============================================================
 */

// ============================================================
// GET ADMIN DASHBOARD
// ============================================================

const getAdminDashboard = async (req, res) => {
    try {
        // ----------------------------------------------------
        // BASIC COUNTS
        // ----------------------------------------------------

        const [
            totalUsers,
            totalOrganizers,
            totalEvents,
            totalRegistrations,
            paidRegistrations,
            pendingRegistrations,
            failedRegistrations
        ] = await Promise.all([
            User.countDocuments(),

            Organizer.countDocuments(),

            Event.countDocuments(),

            Registration.countDocuments(),

            Registration.countDocuments({
                paymentStatus: "paid"
            }),

            Registration.countDocuments({
                paymentStatus: "pending"
            }),

            Registration.countDocuments({
                paymentStatus: "failed"
            })
        ]);

        // ----------------------------------------------------
        // TOTAL REVENUE
        // ----------------------------------------------------

        const revenueResult = await Payment.aggregate([
            {
                $match: {
                    status: {
                        $in: ["paid", "success", "completed"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? revenueResult[0].totalRevenue
                : 0;

        // ----------------------------------------------------
        // ACTIVE EVENTS
        // ----------------------------------------------------

        const activeEvents = await Event.countDocuments({
            status: "active"
        });

        // ----------------------------------------------------
        // CLOSED EVENTS
        // ----------------------------------------------------

        const closedEvents = await Event.countDocuments({
            status: "closed"
        });

        // ----------------------------------------------------
        // POPULAR EVENTS
        // ----------------------------------------------------

        const popularEvents = await Registration.aggregate([
            {
                $group: {
                    _id: "$eventId",
                    registrationCount: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    registrationCount: -1
                }
            },

            {
                $limit: 5
            },

            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "event"
                }
            },

            {
                $unwind: {
                    path: "$event",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $project: {
                    _id: 0,
                    eventId: "$_id",
                    title: "$event.title",
                    registrationCount: 1,
                    registrationFee: "$event.registrationFee",
                    eventDate: "$event.eventDate",
                    status: "$event.status"
                }
            }
        ]);

        // ----------------------------------------------------
        // EVENT-WISE REGISTRATION STATISTICS
        // ----------------------------------------------------

        const eventStatistics = await Registration.aggregate([
            {
                $group: {
                    _id: "$eventId",
                    totalRegistrations: {
                        $sum: 1
                    },

                    paidRegistrations: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "paid"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    pendingRegistrations: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "pending"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },

            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "event"
                }
            },

            {
                $unwind: {
                    path: "$event",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $project: {
                    _id: 0,
                    eventId: "$_id",
                    eventTitle: "$event.title",
                    totalRegistrations: 1,
                    paidRegistrations: 1,
                    pendingRegistrations: 1,
                    eventDate: "$event.eventDate",
                    status: "$event.status"
                }
            },

            {
                $sort: {
                    totalRegistrations: -1
                }
            }
        ]);

        // ----------------------------------------------------
        // RECENT REGISTRATIONS
        // ----------------------------------------------------

        const recentRegistrations = await Registration.find()
            .sort({
                registeredAt: -1
            })
            .limit(10)
            .populate(
                "eventId",
                "title eventDate venue"
            )
            .populate(
                "userId",
                "name email"
            )
            .lean();

        // ----------------------------------------------------
        // REGISTRATIONS BY DATE
        // ----------------------------------------------------

        const registrationTrend = await Registration.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$registeredAt"
                        }
                    },
                    registrations: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id": 1
                }
            },

            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    registrations: 1
                }
            }
        ]);

        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(200).json({
            success: true,

            message: "Admin dashboard data fetched successfully",

            dashboard: {
                overview: {
                    totalUsers,
                    totalOrganizers,
                    totalEvents,
                    activeEvents,
                    closedEvents,
                    totalRegistrations,
                    paidRegistrations,
                    pendingRegistrations,
                    failedRegistrations,
                    totalRevenue
                },

                popularEvents,

                eventStatistics,

                recentRegistrations,

                registrationTrend
            }
        });

    } catch (error) {
        console.error(
            "Admin Dashboard Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin dashboard data",
            error: error.message
        });
    }
};


// ============================================================
// GET ALL EVENTS - ADMIN
// ============================================================

const getAdminEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .sort({
                createdAt: -1
            })
            .populate(
                "organizerId",
                "name email"
            )
            .lean();

        return res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        console.error(
            "Admin Events Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch events",
            error: error.message
        });
    }
};


// ============================================================
// GET ALL REGISTRATIONS - ADMIN
// ============================================================

const getAdminRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find()
            .sort({
                registeredAt: -1
            })
            .populate(
                "eventId",
                "title eventDate venue"
            )
            .populate(
                "userId",
                "name email"
            )
            .lean();

        return res.status(200).json({
            success: true,
            count: registrations.length,
            registrations
        });

    } catch (error) {
        console.error(
            "Admin Registrations Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch registrations",
            error: error.message
        });
    }
};


// ============================================================
// GET ALL ORGANIZERS - ADMIN
// ============================================================

const getAdminOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.find()
            .sort({
                createdAt: -1
            })
            .select(
                "-otpCode"
            )
            .lean();

        return res.status(200).json({
            success: true,
            count: organizers.length,
            organizers
        });

    } catch (error) {
        console.error(
            "Admin Organizers Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch organizers",
            error: error.message
        });
    }
};


// ============================================================
// GET ADMIN ANALYTICS
// ============================================================

const getAdminAnalytics = async (req, res) => {
    try {
        // ----------------------------------------------------
        // REGISTRATION BY PAYMENT STATUS
        // ----------------------------------------------------

        const registrationStatus = await Registration.aggregate([
            {
                $group: {
                    _id: "$paymentStatus",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        // ----------------------------------------------------
        // REVENUE BY DATE
        // ----------------------------------------------------

        const revenueTrend = await Payment.aggregate([
            {
                $match: {
                    status: {
                        $in: [
                            "paid",
                            "success",
                            "completed"
                        ]
                    }
                }
            },

            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$paidAt"
                        }
                    },

                    revenue: {
                        $sum: "$amount"
                    }
                }
            },

            {
                $sort: {
                    "_id": 1
                }
            },

            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    revenue: 1
                }
            }
        ]);

        // ----------------------------------------------------
        // EVENTS BY STATUS
        // ----------------------------------------------------

        const eventStatus = await Event.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        return res.status(200).json({
            success: true,

            analytics: {
                registrationStatus,
                revenueTrend,
                eventStatus
            }
        });

    } catch (error) {
        console.error(
            "Admin Analytics Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch analytics",
            error: error.message
        });
    }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
    getAdminDashboard,
    getAdminEvents,
    getAdminRegistrations,
    getAdminOrganizers,
    getAdminAnalytics
};