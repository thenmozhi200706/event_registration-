// backend/services/adminDashboardService.js

const User = require("../models/User");
const Organizer = require("../models/Organizer");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");


/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD SERVICE
|--------------------------------------------------------------------------
|
| Handles:
| - Dashboard summary
| - All events
| - All registrations
| - All organizers
| - Analytics
|
*/


/*
|--------------------------------------------------------------------------
| GET DASHBOARD DATA
|--------------------------------------------------------------------------
*/

const getDashboardData = async () => {
    try {
        // -------------------------------------------------
        // BASIC COUNTS
        // -------------------------------------------------

        const totalEvents = await Event.countDocuments();

        const activeEvents = await Event.countDocuments({
            status: "active",
        });

        const closedEvents = await Event.countDocuments({
            status: "closed",
        });

        const totalRegistrations =
            await Registration.countDocuments();

        const paidRegistrations =
            await Registration.countDocuments({
                paymentStatus: "paid",
            });

        const pendingRegistrations =
            await Registration.countDocuments({
                paymentStatus: "pending",
            });

        const failedRegistrations =
            await Registration.countDocuments({
                paymentStatus: "failed",
            });

        const totalUsers = await User.countDocuments();

        const totalOrganizers =
            await User.countDocuments({
                role: "organizer",
            });

        const totalParticipants =
            await User.countDocuments({
                role: "participant",
            });


        // -------------------------------------------------
        // ORGANIZER COUNT
        // -------------------------------------------------

        const organizerCollectionCount =
            await Organizer.countDocuments();


        // -------------------------------------------------
        // TOTAL REVENUE
        // -------------------------------------------------

        const revenueResult = await Payment.aggregate([
            {
                $match: {
                    status: "paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$amount",
                    },
                },
            },
        ]);

        const totalRevenue =
            revenueResult.length > 0
                ? Number(revenueResult[0].totalRevenue || 0)
                : 0;


        // -------------------------------------------------
        // POPULAR EVENTS
        // -------------------------------------------------

        const popularEvents = await Registration.aggregate([
            {
                $group: {
                    _id: "$eventId",
                    registrations: {
                        $sum: 1,
                    },
                },
            },

            {
                $sort: {
                    registrations: -1,
                },
            },

            {
                $limit: 5,
            },

            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "event",
                },
            },

            {
                $unwind: {
                    path: "$event",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $project: {
                    _id: 0,
                    eventId: "$_id",
                    title: "$event.title",
                    registrations: 1,
                    registrationCount: "$registrations",
                },
            },
        ]);


        // -------------------------------------------------
        // RECENT REGISTRATIONS
        // -------------------------------------------------

        const recentRegistrations =
            await Registration.find()
                .populate(
                    "eventId",
                    "title eventDate venue"
                )
                .populate(
                    "userId",
                    "name email instituteName department year"
                )
                .sort({
                    registeredAt: -1,
                })
                .limit(10)
                .lean();


        // -------------------------------------------------
        // REGISTRATION TREND
        // -------------------------------------------------

        const registrationTrend =
            await Registration.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$registeredAt",
                            },
                            month: {
                                $month: "$registeredAt",
                            },
                        },
                        registrations: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },

                {
                    $project: {
                        _id: 0,
                        year: "$_id.year",
                        month: "$_id.month",
                        registrations: 1,
                    },
                },
            ]);


        // -------------------------------------------------
        // REVENUE TREND
        // -------------------------------------------------

        const revenueTrend =
            await Payment.aggregate([
                {
                    $match: {
                        status: "paid",
                    },
                },

                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$paidAt",
                            },
                            month: {
                                $month: "$paidAt",
                            },
                        },

                        revenue: {
                            $sum: "$amount",
                        },
                    },
                },

                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },

                {
                    $project: {
                        _id: 0,
                        year: "$_id.year",
                        month: "$_id.month",
                        revenue: 1,
                    },
                },
            ]);


        // -------------------------------------------------
        // RETURN DASHBOARD
        // -------------------------------------------------

        return {
            totalEvents,
            activeEvents,
            closedEvents,

            totalRegistrations,
            paidRegistrations,
            pendingRegistrations,
            failedRegistrations,

            totalRevenue,

            totalUsers,
            totalOrganizers:
                Math.max(
                    totalOrganizers,
                    organizerCollectionCount
                ),
            totalParticipants,

            popularEvents,

            recentRegistrations,

            registrationTrend,

            revenueTrend,

            eventAnalytics: {
                totalEvents,
                activeEvents,
                closedEvents,
            },

            registrationAnalytics: {
                totalRegistrations,
                paidRegistrations,
                pendingRegistrations,
                failedRegistrations,
                registrationTrend,
                recentRegistrations,
            },

            paymentAnalytics: {
                totalRevenue,
                revenueTrend,
            },

            userAnalytics: {
                totalUsers,
                totalOrganizers:
                    Math.max(
                        totalOrganizers,
                        organizerCollectionCount
                    ),
                totalParticipants,
            },
        };

    } catch (error) {
        console.error(
            "Admin Dashboard Service Error:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| GET ALL EVENTS
|--------------------------------------------------------------------------
*/

const getAllEvents = async () => {
    try {
        const events = await Event.find()
            .populate(
                "organizerId",
                "name email"
            )
            .sort({
                createdAt: -1,
            })
            .lean();

        return events;

    } catch (error) {
        console.error(
            "Get Admin Events Service Error:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| GET ALL REGISTRATIONS
|--------------------------------------------------------------------------
*/

const getAllRegistrations = async () => {
    try {
        const registrations =
            await Registration.find()
                .populate(
                    "eventId",
                    "title eventDate venue registrationFee"
                )
                .populate(
                    "userId",
                    "name email instituteName department year"
                )
                .sort({
                    registeredAt: -1,
                })
                .lean();

        return registrations;

    } catch (error) {
        console.error(
            "Get Admin Registrations Service Error:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| GET ALL ORGANIZERS
|--------------------------------------------------------------------------
*/

const getAllOrganizers = async () => {
    try {
        const organizers =
            await Organizer.find()
                .select("-otpCode")
                .sort({
                    createdAt: -1,
                })
                .lean();

        return organizers;

    } catch (error) {
        console.error(
            "Get Admin Organizers Service Error:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| GET ADMIN ANALYTICS
|--------------------------------------------------------------------------
*/

const getAnalytics = async () => {
    try {

        // -------------------------------------------------
        // EVENT ANALYTICS
        // -------------------------------------------------

        const totalEvents =
            await Event.countDocuments();

        const activeEvents =
            await Event.countDocuments({
                status: "active",
            });

        const closedEvents =
            await Event.countDocuments({
                status: "closed",
            });


        // -------------------------------------------------
        // REGISTRATION ANALYTICS
        // -------------------------------------------------

        const totalRegistrations =
            await Registration.countDocuments();

        const paidRegistrations =
            await Registration.countDocuments({
                paymentStatus: "paid",
            });

        const pendingRegistrations =
            await Registration.countDocuments({
                paymentStatus: "pending",
            });

        const failedRegistrations =
            await Registration.countDocuments({
                paymentStatus: "failed",
            });


        // -------------------------------------------------
        // REVENUE
        // -------------------------------------------------

        const revenueResult =
            await Payment.aggregate([
                {
                    $match: {
                        status: "paid",
                    },
                },

                {
                    $group: {
                        _id: null,

                        totalRevenue: {
                            $sum: "$amount",
                        },
                    },
                },
            ]);

        const totalRevenue =
            revenueResult.length
                ? Number(
                      revenueResult[0]
                          .totalRevenue || 0
                  )
                : 0;


        // -------------------------------------------------
        // USER ANALYTICS
        // -------------------------------------------------

        const totalUsers =
            await User.countDocuments();

        const totalOrganizers =
            await User.countDocuments({
                role: "organizer",
            });

        const totalParticipants =
            await User.countDocuments({
                role: "participant",
            });


        // -------------------------------------------------
        // POPULAR EVENTS
        // -------------------------------------------------

        const popularEvents =
            await Registration.aggregate([
                {
                    $group: {
                        _id: "$eventId",

                        registrations: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $sort: {
                        registrations: -1,
                    },
                },

                {
                    $limit: 10,
                },

                {
                    $lookup: {
                        from: "events",

                        localField: "_id",

                        foreignField: "_id",

                        as: "event",
                    },
                },

                {
                    $unwind: {
                        path: "$event",

                        preserveNullAndEmptyArrays:
                            true,
                    },
                },

                {
                    $project: {
                        _id: 0,

                        eventId: "$_id",

                        title: "$event.title",

                        registrations: 1,
                    },
                },
            ]);


        // -------------------------------------------------
        // REGISTRATION TREND
        // -------------------------------------------------

        const registrationTrend =
            await Registration.aggregate([
                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$registeredAt",
                            },

                            month: {
                                $month: "$registeredAt",
                            },
                        },

                        registrations: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },

                {
                    $project: {
                        _id: 0,

                        year: "$_id.year",

                        month: "$_id.month",

                        registrations: 1,
                    },
                },
            ]);


        // -------------------------------------------------
        // REVENUE TREND
        // -------------------------------------------------

        const revenueTrend =
            await Payment.aggregate([
                {
                    $match: {
                        status: "paid",
                    },
                },

                {
                    $group: {
                        _id: {
                            year: {
                                $year: "$paidAt",
                            },

                            month: {
                                $month: "$paidAt",
                            },
                        },

                        revenue: {
                            $sum: "$amount",
                        },
                    },
                },

                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },

                {
                    $project: {
                        _id: 0,

                        year: "$_id.year",

                        month: "$_id.month",

                        revenue: 1,
                    },
                },
            ]);


        // -------------------------------------------------
        // RETURN ANALYTICS
        // -------------------------------------------------

        return {
            events: {
                totalEvents,
                activeEvents,
                closedEvents,
            },

            registrations: {
                totalRegistrations,
                paidRegistrations,
                pendingRegistrations,
                failedRegistrations,
            },

            payments: {
                totalRevenue,
            },

            users: {
                totalUsers,
                totalOrganizers,
                totalParticipants,
            },

            popularEvents,

            registrationTrend,

            revenueTrend,
        };

    } catch (error) {
        console.error(
            "Admin Analytics Service Error:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {
    getDashboardData,
    getAllEvents,
    getAllRegistrations,
    getAllOrganizers,
    getAnalytics,
};