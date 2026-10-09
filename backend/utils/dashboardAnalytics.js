// server/utils/dashboardAnalytics.js

const Registration = require("../models/Registration");
const Payment = require("../models/Payment");

/*
============================================================
EVENTSPHERE - DASHBOARD ANALYTICS
============================================================
*/


/**
 * Registration count by payment status
 */
const getRegistrationStatusAnalytics = async () => {
    return await Registration.aggregate([
        {
            $group: {
                _id: "$paymentStatus",

                count: {
                    $sum: 1,
                },
            },
        },
    ]);
};


/**
 * Registration count by event
 */
const getRegistrationsByEvent = async () => {
    return await Registration.aggregate([
        {
            $group: {
                _id: "$eventId",

                registrations: {
                    $sum: 1,
                },
            },
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

                eventTitle:
                    "$event.title",

                registrations: 1,
            },
        },

        {
            $sort: {
                registrations: -1,
            },
        },
    ]);
};


/**
 * Monthly registration statistics
 */
const getMonthlyRegistrations = async () => {
    return await Registration.aggregate([
        {
            $match: {
                registeredAt: {
                    $exists: true,
                },
            },
        },

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
    ]);
};


/**
 * Monthly revenue statistics
 */
const getMonthlyRevenue = async () => {
    return await Payment.aggregate([
        {
            $match: {
                status: {
                    $in: [
                        "paid",
                        "success",
                        "successful",
                    ],
                },

                paidAt: {
                    $exists: true,
                },
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
    ]);
};


/**
 * Complete analytics object
 */
const getDashboardAnalytics = async () => {
    const [
        registrationStatus,
        registrationsByEvent,
        monthlyRegistrations,
        monthlyRevenue,
    ] = await Promise.all([
        getRegistrationStatusAnalytics(),

        getRegistrationsByEvent(),

        getMonthlyRegistrations(),

        getMonthlyRevenue(),
    ]);

    return {
        registrationStatus,
        registrationsByEvent,
        monthlyRegistrations,
        monthlyRevenue,
    };
};


module.exports = {
    getRegistrationStatusAnalytics,
    getRegistrationsByEvent,
    getMonthlyRegistrations,
    getMonthlyRevenue,
    getDashboardAnalytics,
};