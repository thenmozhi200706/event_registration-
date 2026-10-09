import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getOrganizerEvents,
    deleteEvent,
    toggleEventStatus,
} from "../../services/organizerService";

import "./organizerDashboard.css";

const OrganizerEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ========================================================
       LOAD EVENTS
    ======================================================== */

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getOrganizerEvents();

            setEvents(
                response?.events ||
                response?.data ||
                []
            );
        } catch (err) {
            console.error(
                "Get Organizer Events Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load events."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       DELETE EVENT
    ======================================================== */

    const handleDelete = async (eventId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this event?\n\n" +
            "This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(`delete-${eventId}`);
            setError("");
            setSuccess("");

            await deleteEvent(eventId);

            setEvents((previousEvents) =>
                previousEvents.filter(
                    (event) =>
                        event._id !== eventId
                )
            );

            setSuccess(
                "Event deleted successfully."
            );
        } catch (err) {
            console.error(
                "Delete Event Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to delete event."
            );
        } finally {
            setActionLoading("");
        }
    };

    /* ========================================================
       TOGGLE EVENT STATUS
    ======================================================== */

    const handleStatusToggle = async (event) => {
        const eventId = event._id;

        try {
            setActionLoading(`status-${eventId}`);
            setError("");
            setSuccess("");

            const response =
                await toggleEventStatus(eventId);

            /*
             * If backend returns the updated event,
             * use it directly.
             */
            const updatedEvent =
                response?.event ||
                response?.data;

            if (
                updatedEvent &&
                updatedEvent._id
            ) {
                setEvents((previousEvents) =>
                    previousEvents.map(
                        (item) =>
                            item._id === eventId
                                ? updatedEvent
                                : item
                    )
                );
            } else {
                /*
                 * Otherwise reload the list.
                 */
                await loadEvents();
            }

            setSuccess(
                event.status === "active"
                    ? "Event closed successfully."
                    : "Event activated successfully."
            );
        } catch (err) {
            console.error(
                "Toggle Event Status Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to change event status."
            );
        } finally {
            setActionLoading("");
        }
    };

    /* ========================================================
       FORMAT DATE
    ======================================================== */

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
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
       FORMAT DATE + TIME
    ======================================================== */

    const formatDateTime = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    /* ========================================================
       FORMAT MONEY
    ======================================================== */

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        );
    };

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="organizer-loading">
                <div>
                    <h3>
                        Loading Events...
                    </h3>

                    <p>
                        Please wait while your
                        events are loaded.
                    </p>
                </div>
            </div>
        );
    }

    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div className="organizer-events-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="page-header">

                <div>
                    <span>
                        EVENT MANAGEMENT
                    </span>

                    <h1>
                        My Events
                    </h1>

                    <p>
                        Create, manage and monitor
                        all your events.
                    </p>
                </div>


                <Link
                    to="/organizer/events/create"
                    className="create-event-button"
                >
                    + Create Event
                </Link>

            </div>


            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                SUCCESS MESSAGE
            ================================================== */}

            {success && (
                <div
                    style={{
                        marginBottom: "20px",
                        padding: "14px 16px",
                        borderRadius: "10px",
                        background: "#e7f8ee",
                        color: "#168447",
                    }}
                >
                    {success}
                </div>
            )}


            {/* ==================================================
                EVENT SUMMARY
            ================================================== */}

            <div className="organizer-stats-grid">

                <div className="organizer-stat-card">

                    <span>
                        Total Events
                    </span>

                    <strong>
                        {events.length}
                    </strong>

                    <small>
                        Your created events
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Active
                    </span>

                    <strong>
                        {
                            events.filter(
                                (event) =>
                                    event.status ===
                                    "active"
                            ).length
                        }
                    </strong>

                    <small>
                        Currently available
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Closed
                    </span>

                    <strong>
                        {
                            events.filter(
                                (event) =>
                                    event.status ===
                                    "closed"
                            ).length
                        }
                    </strong>

                    <small>
                        Closed events
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Paid Events
                    </span>

                    <strong>
                        {
                            events.filter(
                                (event) =>
                                    Number(
                                        event.registrationFee ||
                                            0
                                    ) > 0
                            ).length
                        }
                    </strong>

                    <small>
                        Events with registration fee
                    </small>

                </div>

            </div>


            {/* ==================================================
                EVENTS
            ================================================== */}

            {events.length === 0 ? (

                <div className="empty-state">

                    <h2>
                        No Events Yet
                    </h2>

                    <p>
                        You have not created any
                        events yet.
                    </p>

                    <Link
                        to="/organizer/events/create"
                        className="create-event-button"
                    >
                        + Create Your First Event
                    </Link>

                </div>

            ) : (

                <div className="organizer-events-grid">

                    {events.map((event) => (

                        <div
                            className="organizer-event-card"
                            key={event._id}
                        >

                            {/* ==================================================
                                EVENT IMAGE
                            ================================================== */}

                            {event.bannerImageUrl ? (

                                <img
                                    src={
                                        event.bannerImageUrl
                                    }
                                    alt={
                                        event.title
                                    }
                                />

                            ) : (

                                <div
                                    className="event-card-placeholder"
                                >
                                    <span>
                                        EVENTSPHERE
                                    </span>
                                </div>

                            )}


                            {/* ==================================================
                                EVENT CONTENT
                            ================================================== */}

                            <div className="event-card-content">

                                {/* STATUS */}

                                <span
                                    className={`event-status ${
                                        event.status ||
                                        "active"
                                    }`}
                                >
                                    {event.status ||
                                        "active"}
                                </span>


                                {/* TITLE */}

                                <h3>
                                    {event.title}
                                </h3>


                                {/* DESCRIPTION */}

                                {event.description && (
                                    <p>
                                        {
                                            event.description
                                                .length >
                                            110
                                                ? `${event.description.substring(
                                                      0,
                                                      110
                                                  )}...`
                                                : event.description
                                        }
                                    </p>
                                )}


                                {/* DATE */}

                                <div
                                    style={{
                                        marginTop:
                                            "12px",
                                    }}
                                >
                                    <strong>
                                        Event Date
                                    </strong>

                                    <p>
                                        {formatDateTime(
                                            event.eventDate
                                        )}
                                    </p>
                                </div>


                                {/* VENUE */}

                                <div>
                                    <strong>
                                        Venue
                                    </strong>

                                    <p>
                                        {event.venue ||
                                            "Not specified"}
                                    </p>
                                </div>


                                {/* FEE */}

                                <div>
                                    <strong>
                                        Registration Fee
                                    </strong>

                                    <p>
                                        {Number(
                                            event.registrationFee ||
                                                0
                                        ) === 0
                                            ? "Free"
                                            : `₹${formatAmount(
                                                  event.registrationFee
                                              )}`}
                                    </p>
                                </div>


                                {/* DEADLINE */}

                                {event.registrationDeadline && (
                                    <div>
                                        <strong>
                                            Registration
                                            Deadline
                                        </strong>

                                        <p>
                                            {formatDate(
                                                event.registrationDeadline
                                            )}
                                        </p>
                                    </div>
                                )}


                                {/* HASHTAGS */}

                                {Array.isArray(
                                    event.hashtags
                                ) &&
                                    event.hashtags
                                        .length >
                                        0 && (
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexWrap:
                                                    "wrap",
                                                gap: "6px",
                                                marginTop:
                                                    "10px",
                                            }}
                                        >
                                            {event.hashtags.map(
                                                (
                                                    hashtag,
                                                    index
                                                ) => (
                                                    <span
                                                        key={`${hashtag}-${index}`}
                                                        style={{
                                                            padding:
                                                                "4px 8px",
                                                            borderRadius:
                                                                "20px",
                                                            background:
                                                                "#f0f1f7",
                                                            fontSize:
                                                                "12px",
                                                        }}
                                                    >
                                                        {hashtag}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    )}


                                {/* ==================================================
                                    ACTIONS
                                ================================================== */}

                                <div
                                    className="event-actions"
                                    style={{
                                        marginTop:
                                            "18px",
                                    }}
                                >

                                    {/* VIEW */}

                                    <Link
                                        to={`/organizer/events/${event._id}`}
                                    >
                                        View
                                    </Link>


                                    {/* EDIT */}

                                    <Link
                                        to={`/organizer/events/${event._id}/edit`}
                                    >
                                        Edit
                                    </Link>


                                    {/* REGISTRATIONS */}

                                    <Link
                                        to={`/organizer/events/${event._id}/registrations`}
                                    >
                                        Registrations
                                    </Link>


                                    {/* STATUS */}

                                    <button
                                        type="button"
                                        disabled={
                                            actionLoading ===
                                            `status-${event._id}`
                                        }
                                        onClick={() =>
                                            handleStatusToggle(
                                                event
                                            )
                                        }
                                    >
                                        {actionLoading ===
                                        `status-${event._id}`
                                            ? "Updating..."
                                            : event.status ===
                                              "active"
                                            ? "Close"
                                            : "Activate"}
                                    </button>


                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        className="delete-action"
                                        disabled={
                                            actionLoading ===
                                            `delete-${event._id}`
                                        }
                                        onClick={() =>
                                            handleDelete(
                                                event._id
                                            )
                                        }
                                    >
                                        {actionLoading ===
                                        `delete-${event._id}`
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default OrganizerEvents;