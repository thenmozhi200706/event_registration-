import React, { useEffect, useMemo, useState } from "react";

import {
    getOrganizerAnalytics,
} from "../../services/organizerService";
import "./OrganizerAnalytics.css";

const OrganizerAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getOrganizerAnalytics();

            setAnalytics(
                response?.analytics ||
                response?.data?.analytics ||
                response?.data ||
                null
            );
        } catch (err) {
            console.error(
                "Organizer Analytics Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load organizer analytics."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       FORMAT NUMBER
    ======================================================== */

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            "en-IN"
        );
    };

    /* ========================================================
       FORMAT MONEY
    ======================================================== */

    const formatMoney = (value) => {
        return `₹${Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    /* ========================================================
       FORMAT DATE
    ======================================================== */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    /* ========================================================
       EVENT STATISTICS
    ======================================================== */

    const eventStatistics =
        analytics?.eventStatistics || [];

    const registrationTrend =
        analytics?.registrationTrend || [];

    const revenueTrend =
        analytics?.revenueTrend || [];

    const popularEvents =
        analytics?.popularEvents || [];

    const summary =
        analytics?.summary || {};

    /* ========================================================
       MAX VALUES FOR BARS
    ======================================================== */

    const maxRegistrations = useMemo(() => {
        if (!registrationTrend.length) {
            return 1;
        }

        return Math.max(
            ...registrationTrend.map(
                (item) =>
                    Number(
                        item.registrations || 0
                    )
            ),
            1
        );
    }, [registrationTrend]);

    const maxRevenue = useMemo(() => {
        if (!revenueTrend.length) {
            return 1;
        }

        return Math.max(
            ...revenueTrend.map(
                (item) =>
                    Number(item.revenue || 0)
            ),
            1
        );
    }, [revenueTrend]);

    const maxEventRegistrations = useMemo(() => {
        if (!eventStatistics.length) {
            return 1;
        }

        return Math.max(
            ...eventStatistics.map(
                (event) =>
                    Number(
                        event.totalRegistrations ||
                            0
                    )
            ),
            1
        );
    }, [eventStatistics]);

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="organizer-loading">
                <div>
                    <h3>
                        Loading Analytics...
                    </h3>

                    <p>
                        Please wait while your
                        analytics are loaded.
                    </p>
                </div>
            </div>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {
        return (
            <div className="organizer-analytics">

                <div className="organizer-error">

                    <strong>
                        Unable to load analytics
                    </strong>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="submit-button"
                        onClick={loadAnalytics}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div className="organizer-analytics">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="page-header">

                <div>

                    <span>
                        EVENTSPHERE ANALYTICS
                    </span>

                    <h1>
                        Analytics & Reports
                    </h1>

                    <p>
                        Monitor event performance,
                        registrations and revenue.
                    </p>

                </div>


                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadAnalytics}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================================
                MAIN SUMMARY
            ================================================== */}

            <div className="organizer-stats-grid">

                <div className="organizer-stat-card">

                    <span>
                        Total Events
                    </span>

                    <strong>
                        {formatNumber(
                            summary.totalEvents
                        )}
                    </strong>

                    <small>
                        Events created
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Total Registrations
                    </span>

                    <strong>
                        {formatNumber(
                            summary.totalRegistrations
                        )}
                    </strong>

                    <small>
                        All participants
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Paid Registrations
                    </span>

                    <strong>
                        {formatNumber(
                            summary.paidRegistrations
                        )}
                    </strong>

                    <small>
                        Successful payments
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Total Revenue
                    </span>

                    <strong>
                        {formatMoney(
                            summary.totalRevenue
                        )}
                    </strong>

                    <small>
                        Total paid revenue
                    </small>

                </div>

            </div>


            {/* ==================================================
                SECONDARY SUMMARY
            ================================================== */}

            <div className="analytics-grid">

                <div className="analytics-card">

                    <h2>
                        Registration Rate
                    </h2>

                    <div className="analytics-value">
                        {Number(
                            summary.registrationRate ||
                                0
                        ).toFixed(2)}
                        %
                    </div>

                    <p>
                        Paid registrations compared
                        with total registrations.
                    </p>

                </div>


                <div className="analytics-card">

                    <h2>
                        Average Registrations
                    </h2>

                    <div className="analytics-value">
                        {Number(
                            summary.averageRegistrationsPerEvent ||
                                0
                        ).toFixed(2)}
                    </div>

                    <p>
                        Average registrations
                        per event.
                    </p>

                </div>


                <div className="analytics-card">

                    <h2>
                        Average Revenue
                    </h2>

                    <div className="analytics-value">
                        {formatMoney(
                            summary.averageRevenuePerEvent
                        )}
                    </div>

                    <p>
                        Average revenue generated
                        per event.
                    </p>

                </div>

            </div>


            {/* ==================================================
                TOP EVENTS
            ================================================== */}

            <div className="analytics-grid">

                {/* TOP REGISTRATIONS */}

                <div className="analytics-card">

                    <h2>
                        Top Event
                    </h2>

                    {analytics?.topEvent ? (
                        <>
                            <div
                                style={{
                                    marginTop:
                                        "18px",
                                }}
                            >
                                <strong
                                    style={{
                                        fontSize:
                                            "20px",
                                    }}
                                >
                                    {
                                        analytics
                                            .topEvent
                                            .title
                                    }
                                </strong>

                                <p>
                                    {
                                        analytics
                                            .topEvent
                                            .totalRegistrations
                                    }{" "}
                                    registrations
                                </p>

                                <span
                                    className={`event-status ${
                                        analytics
                                            .topEvent
                                            .status
                                    }`}
                                >
                                    {
                                        analytics
                                            .topEvent
                                            .status
                                    }
                                </span>
                            </div>
                        </>
                    ) : (
                        <p>
                            No event data available.
                        </p>
                    )}

                </div>


                {/* TOP REVENUE */}

                <div className="analytics-card">

                    <h2>
                        Highest Revenue Event
                    </h2>

                    {analytics?.topRevenueEvent ? (
                        <div
                            style={{
                                marginTop:
                                    "18px",
                            }}
                        >

                            <strong
                                style={{
                                    fontSize:
                                        "20px",
                                }}
                            >
                                {
                                    analytics
                                        .topRevenueEvent
                                        .title
                                }
                            </strong>

                            <div
                                className="analytics-value"
                                style={{
                                    marginTop:
                                        "12px",
                                }}
                            >
                                {formatMoney(
                                    analytics
                                        .topRevenueEvent
                                        .revenue
                                )}
                            </div>

                        </div>
                    ) : (
                        <p>
                            No revenue data available.
                        </p>
                    )}

                </div>


                {/* PAYMENT SUMMARY */}

                <div className="analytics-card">

                    <h2>
                        Payment Summary
                    </h2>

                    <div
                        style={{
                            marginTop:
                                "18px",
                            lineHeight:
                                "2",
                        }}
                    >

                        <div>
                            Paid:{" "}
                            <strong>
                                {formatNumber(
                                    summary.paidRegistrations
                                )}
                            </strong>
                        </div>

                        <div>
                            Pending:{" "}
                            <strong>
                                {formatNumber(
                                    summary.pendingRegistrations
                                )}
                            </strong>
                        </div>

                        <div>
                            Failed:{" "}
                            <strong>
                                {formatNumber(
                                    summary.failedRegistrations
                                )}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                REGISTRATION TREND
            ================================================== */}

            <section className="organizer-section">

                <div className="organizer-section-header">

                    <div>

                        <h2>
                            Registration Trend
                        </h2>

                        <p>
                            Daily registration
                            activity.
                        </p>

                    </div>

                </div>


                <div
                    className="analytics-card"
                    style={{
                        overflowX: "auto",
                    }}
                >

                    {registrationTrend.length >
                    0 ? (

                        <div
                            style={{
                                minWidth:
                                    "600px",
                            }}
                        >

                            {registrationTrend.map(
                                (item) => {

                                    const value =
                                        Number(
                                            item.registrations ||
                                                0
                                        );

                                    const percentage =
                                        (value /
                                            maxRegistrations) *
                                        100;

                                    return (
                                        <div
                                            key={
                                                item.date
                                            }
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "110px 1fr 60px",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "12px",
                                                marginBottom:
                                                    "14px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize:
                                                        "13px",
                                                    color:
                                                        "#777b8d",
                                                }}
                                            >
                                                {formatDate(
                                                    item.date
                                                )}
                                            </span>


                                            <div
                                                style={{
                                                    height:
                                                        "12px",
                                                    background:
                                                        "#eef0f5",
                                                    borderRadius:
                                                        "20px",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            `${Math.max(
                                                                percentage,
                                                                value >
                                                                    0
                                                                    ? 4
                                                                    : 0
                                                            )}%`,
                                                        height:
                                                            "100%",
                                                        background:
                                                            "#171927",
                                                        borderRadius:
                                                            "20px",
                                                    }}
                                                />

                                            </div>


                                            <strong
                                                style={{
                                                    textAlign:
                                                        "right",
                                                }}
                                            >
                                                {value}
                                            </strong>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="empty-state">
                            No registration trend
                            data available.
                        </div>

                    )}

                </div>

            </section>


            {/* ==================================================
                REVENUE TREND
            ================================================== */}

            <section className="organizer-section">

                <div className="organizer-section-header">

                    <div>

                        <h2>
                            Revenue Trend
                        </h2>

                        <p>
                            Daily paid revenue.
                        </p>

                    </div>

                </div>


                <div
                    className="analytics-card"
                    style={{
                        overflowX: "auto",
                    }}
                >

                    {revenueTrend.length > 0 ? (

                        <div
                            style={{
                                minWidth:
                                    "600px",
                            }}
                        >

                            {revenueTrend.map(
                                (item) => {

                                    const value =
                                        Number(
                                            item.revenue ||
                                                0
                                        );

                                    const percentage =
                                        (value /
                                            maxRevenue) *
                                        100;

                                    return (
                                        <div
                                            key={
                                                item.date
                                            }
                                            style={{
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                    "110px 1fr 100px",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "12px",
                                                marginBottom:
                                                    "14px",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize:
                                                        "13px",
                                                    color:
                                                        "#777b8d",
                                                }}
                                            >
                                                {formatDate(
                                                    item.date
                                                )}
                                            </span>


                                            <div
                                                style={{
                                                    height:
                                                        "12px",
                                                    background:
                                                        "#eef0f5",
                                                    borderRadius:
                                                        "20px",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width:
                                                            `${Math.max(
                                                                percentage,
                                                                value >
                                                                    0
                                                                    ? 4
                                                                    : 0
                                                            )}%`,
                                                        height:
                                                            "100%",
                                                        background:
                                                            "#171927",
                                                        borderRadius:
                                                            "20px",
                                                    }}
                                                />

                                            </div>


                                            <strong
                                                style={{
                                                    textAlign:
                                                        "right",
                                                }}
                                            >
                                                {formatMoney(
                                                    value
                                                )}
                                            </strong>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="empty-state">
                            No revenue trend
                            data available.
                        </div>

                    )}

                </div>

            </section>


            {/* ==================================================
                EVENT PERFORMANCE
            ================================================== */}

            <section className="organizer-section">

                <div className="organizer-section-header">

                    <div>

                        <h2>
                            Event Performance
                        </h2>

                        <p>
                            Compare registrations
                            across your events.
                        </p>

                    </div>

                </div>


                <div className="events-table-container">

                    <table className="events-table">

                        <thead>

                            <tr>

                                <th>
                                    Event
                                </th>

                                <th>
                                    Registrations
                                </th>

                                <th>
                                    Paid
                                </th>

                                <th>
                                    Pending
                                </th>

                                <th>
                                    Failed
                                </th>

                                <th>
                                    Revenue
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {eventStatistics.length >
                            0 ? (

                                eventStatistics.map(
                                    (event) => {

                                        const registrations =
                                            Number(
                                                event.totalRegistrations ||
                                                    0
                                            );

                                        const barWidth =
                                            (registrations /
                                                maxEventRegistrations) *
                                            100;

                                        return (
                                            <tr
                                                key={
                                                    event.eventId ||
                                                    event._id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            event.title
                                                        }
                                                    </strong>

                                                    <div
                                                        style={{
                                                            width:
                                                                "150px",
                                                            maxWidth:
                                                                "100%",
                                                            height:
                                                                "5px",
                                                            marginTop:
                                                                "8px",
                                                            background:
                                                                "#eef0f5",
                                                            borderRadius:
                                                                "20px",
                                                            overflow:
                                                                "hidden",
                                                        }}
                                                    >

                                                        <div
                                                            style={{
                                                                width:
                                                                    `${barWidth}%`,
                                                                height:
                                                                    "100%",
                                                                background:
                                                                    "#171927",
                                                            }}
                                                        />

                                                    </div>

                                                </td>


                                                <td>
                                                    {formatNumber(
                                                        event.totalRegistrations
                                                    )}
                                                </td>


                                                <td>
                                                    {formatNumber(
                                                        event.paidRegistrations
                                                    )}
                                                </td>


                                                <td>
                                                    {formatNumber(
                                                        event.pendingRegistrations
                                                    )}
                                                </td>


                                                <td>
                                                    {formatNumber(
                                                        event.failedRegistrations
                                                    )}
                                                </td>


                                                <td>
                                                    {formatMoney(
                                                        event.revenue
                                                    )}
                                                </td>


                                                <td>

                                                    <span
                                                        className={`event-status ${
                                                            event.status ||
                                                            "active"
                                                        }`}
                                                    >
                                                        {
                                                            event.status
                                                        }
                                                    </span>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="empty-table"
                                    >
                                        No event performance
                                        data available.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* ==================================================
                POPULAR EVENTS
            ================================================== */}

            <section className="organizer-section">

                <div className="organizer-section-header">

                    <div>

                        <h2>
                            Popular Events
                        </h2>

                        <p>
                            Your top performing
                            events.
                        </p>

                    </div>

                </div>


                <div className="organizer-events-grid">

                    {popularEvents.length > 0 ? (

                        popularEvents.map(
                            (event, index) => (
                                <div
                                    className="organizer-action-card"
                                    key={
                                        event.eventId ||
                                        event._id ||
                                        index
                                    }
                                >

                                    <div
                                        className="action-icon"
                                    >
                                        #{index + 1}
                                    </div>

                                    <h3>
                                        {event.title}
                                    </h3>

                                    <p>
                                        {
                                            event.totalRegistrations ||
                                            0
                                        }{" "}
                                        registrations
                                    </p>

                                    <strong>
                                        {formatMoney(
                                            event.revenue
                                        )}
                                    </strong>

                                </div>
                            )
                        )

                    ) : (

                        <div className="empty-state">
                            No popular event data
                            available.
                        </div>

                    )}

                </div>

            </section>

        </div>
    );
};

export default OrganizerAnalytics;