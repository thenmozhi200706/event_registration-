const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");

/*
 * ============================================================
 * EVENTSPHERE — ORGANIZER DASHBOARD SERVICE
 * ============================================================
 *
 * Handles:
 * 1. Organizer dashboard statistics
 * 2. Organizer analytics
 * 3. Organizer events
 * 4. Organizer registrations
 *
 * Existing models used:
 * - Event
 * - Registration
 * - Payment
 *
 * ============================================================
 */


/*
 * ============================================================
 * GET ORGANIZER EVENTS
 * ============================================================
 */
const getOrganizerEvents = async (organizerId) => {
    const events = await Event.find({
        organizerId,
    })
        .sort({ createdAt: -1 })
        .lean();

    return events;
};


/*
 * ============================================================
 * GET ORGANIZER REGISTRATIONS
 * ============================================================
 */
const getRegistrations = async (organizerId) => {
    // First get organizer's events
    const events = await Event.find({
        organizerId,
    })
        .select("_id title eventDate registrationFee status")
        .sort({ eventDate: 1 })
        .lean();

    if (!events.length) {
        return [];
    }

    const eventIds = events.map((event) => event._id);

    // Get registrations for those events
    const registrations = await Registration.find({
        eventId: { $in: eventIds },
    })
        .populate(
            "userId",
            "name email profileImage instituteName department year"
        )
        .sort({ registeredAt: -1 })
        .lean();

    // Create event lookup
    const eventMap = new Map();

    events.forEach((event) => {
        eventMap.set(String(event._id), event);
    });

    // Attach event information
    return registrations.map((registration) => {
        const event = eventMap.get(String(registration.eventId));

        return {
            ...registration,

            event: event
                ? {
                      _id: event._id,
                      title: event.title,
                      eventDate: event.eventDate,
                      registrationFee: event.registrationFee,
                      status: event.status,
                  }
                : null,
        };
    });
};


/*
 * ============================================================
 * GET ORGANIZER DASHBOARD DATA
 * ============================================================
 */
const getDashboardData = async (organizerId) => {
    /*
     * --------------------------------------------------------
     * 1. GET ORGANIZER EVENTS
     * --------------------------------------------------------
     */
    const events = await Event.find({
        organizerId,
    })
        .sort({ createdAt: -1 })
        .lean();

    const eventIds = events.map((event) => event._id);


    /*
     * --------------------------------------------------------
     * 2. BASIC EVENT COUNTS
     * --------------------------------------------------------
     */
    const totalEvents = events.length;

    const activeEvents = events.filter(
        (event) => event.status === "active"
    ).length;

    const closedEvents = events.filter(
        (event) => event.status === "closed"
    ).length;


    /*
     * --------------------------------------------------------
     * 3. REGISTRATIONS
     * --------------------------------------------------------
     */
    let registrations = [];

    if (eventIds.length > 0) {
        registrations = await Registration.find({
            eventId: { $in: eventIds },
        })
            .populate(
                "userId",
                "name email profileImage instituteName department year"
            )
            .sort({ registeredAt: -1 })
            .lean();
    }


    const totalRegistrations = registrations.length;

    const paidRegistrations = registrations.filter(
        (registration) =>
            registration.paymentStatus === "paid"
    ).length;

    const pendingRegistrations = registrations.filter(
        (registration) =>
            registration.paymentStatus === "pending"
    ).length;

    const failedRegistrations = registrations.filter(
        (registration) =>
            registration.paymentStatus === "failed"
    ).length;


    /*
     * --------------------------------------------------------
     * 4. PAYMENTS / REVENUE
     * --------------------------------------------------------
     */
    let payments = [];

    if (registrations.length > 0) {
        const registrationIds = registrations.map(
            (registration) => registration._id
        );

        payments = await Payment.find({
            registrationId: { $in: registrationIds },
            status: "paid",
        })
            .sort({ paidAt: -1 })
            .lean();
    }


    const totalRevenue = payments.reduce(
        (total, payment) => {
            return total + Number(payment.amount || 0);
        },
        0
    );


    /*
     * --------------------------------------------------------
     * 5. EVENT-WISE STATISTICS
     * --------------------------------------------------------
     */
    const eventStatistics = events.map((event) => {
        const eventRegistrations = registrations.filter(
            (registration) =>
                String(registration.eventId) === String(event._id)
        );

        const eventPaidRegistrations =
            eventRegistrations.filter(
                (registration) =>
                    registration.paymentStatus === "paid"
            );

        const eventRevenue = payments
            .filter((payment) =>
                eventPaidRegistrations.some(
                    (registration) =>
                        String(payment.registrationId) ===
                        String(registration._id)
                )
            )
            .reduce(
                (total, payment) =>
                    total + Number(payment.amount || 0),
                0
            );

        return {
            eventId: event._id,
            title: event.title,

            eventDate: event.eventDate,

            status: event.status,

            registrationFee: Number(
                event.registrationFee || 0
            ),

            totalRegistrations:
                eventRegistrations.length,

            paidRegistrations:
                eventPaidRegistrations.length,

            pendingRegistrations:
                eventRegistrations.filter(
                    (registration) =>
                        registration.paymentStatus ===
                        "pending"
                ).length,

            failedRegistrations:
                eventRegistrations.filter(
                    (registration) =>
                        registration.paymentStatus ===
                        "failed"
                ).length,

            revenue: eventRevenue,
        };
    });


    /*
     * --------------------------------------------------------
     * 6. POPULAR EVENTS
     * --------------------------------------------------------
     */
    const popularEvents = [...eventStatistics]
        .sort(
            (a, b) =>
                b.totalRegistrations -
                a.totalRegistrations
        )
        .slice(0, 5);


    /*
     * --------------------------------------------------------
     * 7. RECENT REGISTRATIONS
     * --------------------------------------------------------
     */
    const recentRegistrations = registrations
        .slice(0, 10)
        .map((registration) => {
            const event = events.find(
                (item) =>
                    String(item._id) ===
                    String(registration.eventId)
            );

            return {
                registrationId: registration._id,

                eventId: registration.eventId,

                eventTitle: event
                    ? event.title
                    : "Unknown Event",

                participant:
                    registration.userId || null,

                firstName:
                    registration.firstName || "",

                lastName:
                    registration.lastName || "",

                email:
                    registration.email ||
                    registration.userId?.email ||
                    "",

                paymentStatus:
                    registration.paymentStatus,

                registeredAt:
                    registration.registeredAt,
            };
        });


    /*
     * --------------------------------------------------------
     * 8. REGISTRATION TREND
     * --------------------------------------------------------
     *
     * Groups registrations by date.
     * --------------------------------------------------------
     */
    const registrationTrendMap = {};

    registrations.forEach((registration) => {
        if (!registration.registeredAt) {
            return;
        }

        const date = new Date(
            registration.registeredAt
        )
            .toISOString()
            .split("T")[0];

        if (!registrationTrendMap[date]) {
            registrationTrendMap[date] = 0;
        }

        registrationTrendMap[date]++;
    });


    const registrationTrend = Object.entries(
        registrationTrendMap
    )
        .sort(([dateA], [dateB]) =>
            dateA.localeCompare(dateB)
        )
        .map(([date, count]) => ({
            date,
            registrations: count,
        }));


    /*
     * --------------------------------------------------------
     * 9. REVENUE TREND
     * --------------------------------------------------------
     */
    const revenueTrendMap = {};

    payments.forEach((payment) => {
        if (!payment.paidAt) {
            return;
        }

        const date = new Date(payment.paidAt)
            .toISOString()
            .split("T")[0];

        if (!revenueTrendMap[date]) {
            revenueTrendMap[date] = 0;
        }

        revenueTrendMap[date] += Number(
            payment.amount || 0
        );
    });


    const revenueTrend = Object.entries(
        revenueTrendMap
    )
        .sort(([dateA], [dateB]) =>
            dateA.localeCompare(dateB)
        )
        .map(([date, revenue]) => ({
            date,
            revenue,
        }));


    /*
     * --------------------------------------------------------
     * 10. UPCOMING EVENTS
     * --------------------------------------------------------
     */
    const now = new Date();

    const upcomingEvents = events
        .filter(
            (event) =>
                event.eventDate &&
                new Date(event.eventDate) >= now
        )
        .sort(
            (a, b) =>
                new Date(a.eventDate) -
                new Date(b.eventDate)
        )
        .slice(0, 5)
        .map((event) => {
            const statistics =
                eventStatistics.find(
                    (item) =>
                        String(item.eventId) ===
                        String(event._id)
                );

            return {
                ...event,
                totalRegistrations:
                    statistics?.totalRegistrations || 0,
                paidRegistrations:
                    statistics?.paidRegistrations || 0,
                revenue:
                    statistics?.revenue || 0,
            };
        });


    /*
     * --------------------------------------------------------
     * 11. RETURN DASHBOARD
     * --------------------------------------------------------
     */
    return {
        summary: {
            totalEvents,
            activeEvents,
            closedEvents,

            totalRegistrations,
            paidRegistrations,
            pendingRegistrations,
            failedRegistrations,

            totalRevenue,
        },

        events: eventStatistics,

        popularEvents,

        upcomingEvents,

        recentRegistrations,

        registrationTrend,

        revenueTrend,
    };
};


/*
 * ============================================================
 * GET ORGANIZER ANALYTICS
 * ============================================================
 */
const getAnalytics = async (organizerId) => {
    const dashboard =
        await getDashboardData(organizerId);

    const {
        summary,
        events,
        popularEvents,
        registrationTrend,
        revenueTrend,
    } = dashboard;


    /*
     * --------------------------------------------------------
     * REGISTRATION RATE
     * --------------------------------------------------------
     */
    const registrationRate =
        summary.totalRegistrations > 0
            ? (
                  (summary.paidRegistrations /
                      summary.totalRegistrations) *
                  100
              ).toFixed(2)
            : "0.00";


    /*
     * --------------------------------------------------------
     * AVERAGE REGISTRATIONS PER EVENT
     * --------------------------------------------------------
     */
    const averageRegistrationsPerEvent =
        summary.totalEvents > 0
            ? (
                  summary.totalRegistrations /
                  summary.totalEvents
              ).toFixed(2)
            : "0.00";


    /*
     * --------------------------------------------------------
     * AVERAGE REVENUE PER EVENT
     * --------------------------------------------------------
     */
    const averageRevenuePerEvent =
        summary.totalEvents > 0
            ? (
                  summary.totalRevenue /
                  summary.totalEvents
              ).toFixed(2)
            : "0.00";


    /*
     * --------------------------------------------------------
     * TOP EVENT
     * --------------------------------------------------------
     */
    const topEvent =
        events.length > 0
            ? [...events].sort(
                  (a, b) =>
                      b.totalRegistrations -
                      a.totalRegistrations
              )[0]
            : null;


    /*
     * --------------------------------------------------------
     * TOP REVENUE EVENT
     * --------------------------------------------------------
     */
    const topRevenueEvent =
        events.length > 0
            ? [...events].sort(
                  (a, b) =>
                      b.revenue - a.revenue
              )[0]
            : null;


    return {
        summary: {
            ...summary,

            registrationRate:
                Number(registrationRate),

            averageRegistrationsPerEvent:
                Number(
                    averageRegistrationsPerEvent
                ),

            averageRevenuePerEvent:
                Number(averageRevenuePerEvent),
        },

        topEvent,

        topRevenueEvent,

        popularEvents,

        eventStatistics: events,

        registrationTrend,

        revenueTrend,
    };
};


/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */
module.exports = {
    getDashboardData,
    getAnalytics,
    getOrganizerEvents,
    getRegistrations,
};
