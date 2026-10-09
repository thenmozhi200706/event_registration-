import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrganizerDashboard } from "../../services/organizerService";

import OrganizerSidebar from "../../components/organizer/OrganizerSidebar";
import OrganizerHeader from "../../components/organizer/OrganizerHeader";
import OrganizerStats from "../../components/organizer/OrganizerStats";
import UpcomingEvents from "../../components/organizer/UpcomingEvents";
import RecentRegistrations from "../../components/organizer/RecentRegistrations";
import RegistrationChart from "../../components/organizer/RegistrationChart";
import RevenueChart from "../../components/organizer/RevenueChart";

import "./OrganizerDashboard.css";

const OrganizerDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [sidebarOpen, setSidebarOpen] = useState(false);

    /* ========================================================
       FETCH DASHBOARD
    ======================================================== */

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getOrganizerDashboard();

            console.log(
                "Organizer Dashboard Response:",
                response
            );

            if (response?.success === false) {
                throw new Error(
                    response.message ||
                        "Failed to load dashboard"
                );
            }

            /*
             * Backend response:
             *
             * {
             *   success: true,
             *   message: "...",
             *   dashboard: {...}
             * }
             */

            const dashboardData =
                response?.dashboard || response?.data || response;

            setDashboard(dashboardData || {});
        } catch (err) {
            console.error(
                "Organizer Dashboard Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load organizer dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);


    /* ========================================================
       CLOSE MOBILE SIDEBAR
    ======================================================== */

    const closeSidebar = () => {
        setSidebarOpen(false);
    };


    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="organizer-dashboard">

                <OrganizerSidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                />

                <main className="organizer-main">

                    <OrganizerHeader
                        title="Organizer Dashboard"
                        subtitle="Manage your events and registrations"
                        onMenuClick={() =>
                            setSidebarOpen(true)
                        }
                    />

                    <div className="organizer-loading">
                        Loading organizer dashboard...
                    </div>

                </main>
            </div>
        );
    }


    /* ========================================================
       ERROR
    ======================================================== */

    if (error) {
        return (
            <div className="organizer-dashboard">

                <OrganizerSidebar
                    isOpen={sidebarOpen}
                    onClose={closeSidebar}
                />

                <main className="organizer-main">

                    <OrganizerHeader
                        title="Organizer Dashboard"
                        subtitle="Manage your events and registrations"
                        onMenuClick={() =>
                            setSidebarOpen(true)
                        }
                    />

                    <div className="organizer-dashboard-content">

                        <div className="organizer-error">

                            <strong>
                                Unable to load dashboard
                            </strong>

                            <p>
                                {error}
                            </p>

                            <button
                                type="button"
                                className="organizer-button primary"
                                onClick={loadDashboard}
                            >
                                Try Again
                            </button>

                        </div>

                    </div>

                </main>
            </div>
        );
    }


    /* ========================================================
       SAFE DASHBOARD DATA
    ======================================================== */

    const summary =
        dashboard?.summary || {};

    const upcomingEvents =
        Array.isArray(
            dashboard?.upcomingEvents
        )
            ? dashboard.upcomingEvents
            : [];

    const recentRegistrations =
        Array.isArray(
            dashboard?.recentRegistrations
        )
            ? dashboard.recentRegistrations
            : [];

    const registrationTrend =
        Array.isArray(
            dashboard?.registrationTrend
        )
            ? dashboard.registrationTrend
            : [];

    const revenueTrend =
        Array.isArray(
            dashboard?.revenueTrend
        )
            ? dashboard.revenueTrend
            : [];

    const popularEvents =
        Array.isArray(
            dashboard?.popularEvents
        )
            ? dashboard.popularEvents
            : [];


    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <div className="organizer-dashboard">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <OrganizerSidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />


            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="organizer-main">

                {/* HEADER */}

                <OrganizerHeader
                    title="Organizer Dashboard"
                    subtitle="Manage your events and registrations"
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />


                <div className="organizer-dashboard-content">

                    {/* ==================================================
                        WELCOME
                    ================================================== */}

                    <div className="organizer-dashboard-welcome">

                        <h1>
                            Welcome back, Organizer
                        </h1>

                        <p>
                            Here's an overview of your
                            events, registrations and
                            revenue.
                        </p>

                    </div>


                    {/* ==================================================
                        ERROR MESSAGE
                    ================================================== */}

                    {error && (
                        <div className="organizer-error">
                            {error}
                        </div>
                    )}


                    {/* ==================================================
                        STATISTICS
                    ================================================== */}

                    <OrganizerStats
                        dashboard={dashboard}
                    />


                    {/* ==================================================
                        QUICK ACTIONS
                    ================================================== */}

                    <section className="organizer-section">

                        <div className="organizer-section-header">

                            <div>
                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Manage your event
                                    activities.
                                </p>
                            </div>

                        </div>


                        <div className="organizer-actions-grid">

                            <Link
                                to="/organizer/events/create"
                                className="organizer-action-card"
                            >
                                <span className="organizer-action-icon">
                                    +
                                </span>

                                <strong>
                                    Create Event
                                </strong>

                                <span>
                                    Add a new event
                                </span>
                            </Link>


                            <Link
                                to="/organizer/events"
                                className="organizer-action-card"
                            >
                                <span className="organizer-action-icon">
                                    ◫
                                </span>

                                <strong>
                                    My Events
                                </strong>

                                <span>
                                    Manage existing events
                                </span>
                            </Link>


                            <Link
                                to="/organizer/analytics"
                                className="organizer-action-card"
                            >
                                <span className="organizer-action-icon">
                                    ◒
                                </span>

                                <strong>
                                    Analytics
                                </strong>

                                <span>
                                    View event performance
                                </span>
                            </Link>


                            <Link
    to="/organizer/registrations"
    className="organizer-action-card"
>
    <span className="organizer-action-icon">
        ◎
    </span>

    <strong>
        Registrations
    </strong>

    <span>
        View participant data
    </span>
</Link>

                        </div>

                    </section>


                    {/* ==================================================
                        REGISTRATION + REVENUE CHARTS
                    ================================================== */}

                    <section className="organizer-section">

                        <div className="organizer-dashboard-grid">

                            <RegistrationChart
                                registrationTrend={
                                    registrationTrend
                                }
                                loading={false}
                            />

                            <RevenueChart
                                revenueTrend={
                                    revenueTrend
                                }
                                loading={false}
                            />

                        </div>

                    </section>


                    {/* ==================================================
                        UPCOMING EVENTS
                    ================================================== */}

                    <UpcomingEvents
                        events={upcomingEvents}
                        loading={false}
                    />


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
                                    Your best performing
                                    events.
                                </p>
                            </div>

                            <Link
                                to="/organizer/events"
                                className="organizer-section-link"
                            >
                                View All
                            </Link>

                        </div>


                        {popularEvents.length > 0 ? (

                            <div className="popular-events-card">

                                {popularEvents
                                    .slice(0, 8)
                                    .map(
                                        (
                                            event,
                                            index
                                        ) => (

                                            <div
                                                className="popular-event-row"
                                                key={
                                                    event?._id ||
                                                    event?.eventId ||
                                                    index
                                                }
                                            >

                                                <span className="popular-event-name">
                                                    {event?.title ||
                                                        event?.eventName ||
                                                        "Untitled Event"}
                                                </span>


                                                <span className="popular-event-value">
                                                    {Number(
                                                        event?.registrations ??
                                                            event?.totalRegistrations ??
                                                            event?.registrationCount ??
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    registrations
                                                </span>


                                                <span className="popular-event-value">
                                                    {Number(
                                                        event?.paidRegistrations ??
                                                            event?.paidCount ??
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    paid
                                                </span>


                                                <span className="popular-event-value">
                                                    ₹
                                                    {Number(
                                                        event?.revenue ??
                                                            event?.totalRevenue ??
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                            </div>
                                        )
                                    )}

                            </div>

                        ) : (

                            <div className="organizer-empty">

                                <div className="organizer-empty-icon">
                                    ◫
                                </div>

                                <strong>
                                    No event statistics yet
                                </strong>

                                <p>
                                    Create events and receive
                                    registrations to see
                                    performance statistics.
                                </p>

                            </div>

                        )}

                    </section>


                    {/* ==================================================
                        RECENT REGISTRATIONS
                    ================================================== */}

                    <RecentRegistrations
                        registrations={
                            recentRegistrations
                        }
                        loading={false}
                    />


                    {/* ==================================================
                        DASHBOARD FOOTER ACTIONS
                    ================================================== */}

                    <section className="organizer-section">

                        <div className="organizer-section-header">

                            <div>
                                <h2>
                                    Event Management
                                </h2>

                                <p>
                                    Quickly access your
                                    organizer tools.
                                </p>
                            </div>

                        </div>


                        <div className="organizer-actions-grid">

                            <Link
                                to="/organizer/events/create"
                                className="organizer-header-button primary"
                            >
                                + Create New Event
                            </Link>

                            <Link
                                to="/organizer/events"
                                className="organizer-header-button"
                            >
                                Manage Events
                            </Link>

                            <Link
                                to="/organizer/analytics"
                                className="organizer-header-button"
                            >
                                View Analytics
                            </Link>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
};

export default OrganizerDashboard;