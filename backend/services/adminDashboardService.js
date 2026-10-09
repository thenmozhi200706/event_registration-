// backend/services/adminDashboardService.js

const User = require("../models/User");
const Organizer = require("../models/Organizer");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");


// ============================================================
// EVENTSPHERE - ADMIN DASHBOARD SERVICE
// ============================================================
//
// Handles database operations and analytics for the Admin
// Dashboard.
//
// Functions:
//  1. getDashboardData()
//  2. getAllEvents()
//  3. getAllRegistrations()
//  4. getAllOrganizers()
//  5. getAnalytics()
//
// ============================================================


// ============================================================
// GET COMPLETE ADMIN DASHBOARD DATA
// ============================================================

const getDashboardData = async () => {

    // --------------------------------------------------------
    // BASIC COUNTS
    // --------------------------------------------------------

    const [
        totalUsers,
        totalOrganizers,
        totalEvents,
        totalRegistrations,
        paidRegistrations,
        pendingRegistrations,
        failedRegistrations,
        activeEvents,
        closedEvents
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
        }),

        Event.countDocuments({
            status: "active"
        }),

        Event.countDocuments({
            status: "closed"
        })
    ]);


    // --------------------------------------------------------
    // TOTAL REVENUE
    // --------------------------------------------------------

    const revenueResult = await Payment.aggregate([
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


    // --------------------------------------------------------
    // POPULAR EVENTS
    // --------------------------------------------------------

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

                registrationFee:
                    "$event.registrationFee",

                eventDate:
                    "$event.eventDate",

                status:
                    "$event.status"
            }
        }
    ]);


    // --------------------------------------------------------
    // EVENT-WISE REGISTRATION STATISTICS
    // --------------------------------------------------------

    const eventStatistics =
        await Registration.aggregate([

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
                    },

                    failedRegistrations: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$paymentStatus",
                                        "failed"
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

                    eventTitle:
                        "$event.title",

                    totalRegistrations: 1,

                    paidRegistrations: 1,

                    pendingRegistrations: 1,

                    failedRegistrations: 1,

                    eventDate:
                        "$event.eventDate",

                    status:
                        "$event.status"
                }
            },

            {
                $sort: {
                    totalRegistrations: -1
                }
            }
        ]);


    // --------------------------------------------------------
    // RECENT REGISTRATIONS
    // --------------------------------------------------------

    const recentRegistrations =
        await Registration.find()

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


    // --------------------------------------------------------
    // REGISTRATION TREND
    // --------------------------------------------------------

    const registrationTrend =
        await Registration.aggregate([

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


    // --------------------------------------------------------
    // RETURN DASHBOARD DATA
    // --------------------------------------------------------

    return {

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
    };
};


// ============================================================
// GET ALL EVENTS
// ============================================================

const getAllEvents = async () => {

    const events = await Event.find()

        .sort({
            createdAt: -1
        })

        .populate(
            "organizerId",
            "name email"
        )

        .lean();

    return events;
};


// ============================================================
// GET ALL REGISTRATIONS
// ============================================================

const getAllRegistrations = async () => {

    const registrations =
        await Registration.find()

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

    return registrations;
};


// ============================================================
// GET ALL ORGANIZERS
// ============================================================

const getAllOrganizers = async () => {

    const organizers =
        await Organizer.find()

            .sort({
                createdAt: -1
            })

            // Never expose OTP to admin dashboard
            .select("-otpCode")

            .lean();

    return organizers;
};


// ============================================================
// GET ADMIN ANALYTICS
// ============================================================

const getAnalytics = async () => {

    // --------------------------------------------------------
    // REGISTRATION STATUS
    // --------------------------------------------------------

    const registrationStatus =
        await Registration.aggregate([

            {
                $group: {

                    _id: "$paymentStatus",

                    count: {
                        $sum: 1
                    }
                }
            }
        ]);


    // --------------------------------------------------------
    // REVENUE TREND
    // --------------------------------------------------------

    const revenueTrend =
        await Payment.aggregate([

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


    // --------------------------------------------------------
    // EVENT STATUS
    // --------------------------------------------------------

    const eventStatus =
        await Event.aggregate([

            {
                $group: {

                    _id: "$status",

                    count: {
                        $sum: 1
                    }
                }
            }
        ]);


    // --------------------------------------------------------
    // RETURN ANALYTICS
    // --------------------------------------------------------

    return {

        registrationStatus,

        revenueTrend,

        eventStatus
    };
};


// ============================================================
// EXPORT SERVICE
// ============================================================

module.exports = {

    getDashboardData,

    getAllEvents,

    getAllRegistrations,

    getAllOrganizers,

    getAnalytics
};