import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    getOrganizerEvent,
    deleteEvent,
    toggleEventStatus,
} from "../../services/organizerService";

import "./EventDetails.css";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] =
        useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* ========================================================
       LOAD EVENT
    ======================================================== */

    useEffect(() => {
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getOrganizerEvent(id);

            const eventData =
                response?.event ||
                response?.data?.event ||
                response?.data;

            if (!eventData) {
                setError(
                    "Event details could not be found."
                );
                return;
            }

            setEvent(eventData);
        } catch (err) {
            console.error(
                "Get Event Details Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load event details."
            );
        } finally {
            setLoading(false);
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
                month: "long",
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
                month: "long",
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
        const value = Number(amount || 0);

        if (value === 0) {
            return "Free";
        }

        return `₹${value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    /* ========================================================
       TOGGLE STATUS
    ======================================================== */

    const handleStatusToggle = async () => {
        if (!event) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            const response =
                await toggleEventStatus(
                    event._id
                );

            const updatedEvent =
                response?.event ||
                response?.data?.event ||
                response?.data;

            if (
                updatedEvent &&
                updatedEvent._id
            ) {
                setEvent(updatedEvent);
            } else {
                await loadEvent();
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
                "Failed to update event status."
            );
        } finally {
            setActionLoading(false);
        }
    };

    /* ========================================================
       DELETE EVENT
    ======================================================== */

    const handleDelete = async () => {
        if (!event) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this event?\n\n" +
            "This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setSuccess("");

            await deleteEvent(event._id);

            navigate("/organizer/events");
        } catch (err) {
            console.error(
                "Delete Event Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to delete event."
            );

            setActionLoading(false);
        }
    };

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="organizer-loading">
                <div>
                    <h3>
                        Loading Event...
                    </h3>

                    <p>
                        Please wait while the
                        event details are loaded.
                    </p>
                </div>
            </div>
        );
    }

    /* ========================================================
       ERROR / EVENT NOT FOUND
    ======================================================== */

    if (!event) {
        return (
            <div className="organizer-form-page">

                <div className="form-error">
                    {error ||
                        "Event not found."}
                </div>

                <Link
                    to="/organizer/events"
                    className="secondary-button"
                >
                    ← Back to Events
                </Link>

            </div>
        );
    }

    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div className="organizer-form-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="page-header">

                <div>
                    <span>
                        EVENT DETAILS
                    </span>

                    <h1>
                        {event.title}
                    </h1>

                    <p>
                        View and manage your
                        event.
                    </p>
                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >

                    <Link
                        to="/organizer/events"
                        className="secondary-button"
                    >
                        ← Back
                    </Link>

                    <Link
                        to={`/organizer/events/${event._id}/edit`}
                        className="create-event-button"
                    >
                        Edit Event
                    </Link>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                SUCCESS
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
                EVENT HERO
            ================================================== */}

            <div
                style={{
                    overflow: "hidden",
                    marginBottom: "24px",
                    background: "#fff",
                    border: "1px solid #e8e9f0",
                    borderRadius: "18px",
                }}
            >

                {event.bannerImageUrl ? (

                    <img
                        src={event.bannerImageUrl}
                        alt={event.title}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "360px",
                            objectFit: "cover",
                        }}
                    />

                ) : (

                    <div
                        className="event-card-placeholder"
                        style={{
                            height: "360px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            fontWeight: "700",
                        }}
                    >
                        EVENTSPHERE
                    </div>

                )}

            </div>


            {/* ==================================================
                EVENT INFORMATION
            ================================================== */}

            <div className="organizer-stats-grid">

                {/* STATUS */}

                <div className="organizer-stat-card">

                    <span>
                        Status
                    </span>

                    <strong>
                        <span
                            className={`event-status ${
                                event.status ||
                                "active"
                            }`}
                        >
                            {event.status ||
                                "active"}
                        </span>
                    </strong>

                    <small>
                        Event availability
                    </small>

                </div>


                {/* REGISTRATION FEE */}

                <div className="organizer-stat-card">

                    <span>
                        Registration Fee
                    </span>

                    <strong>
                        {formatAmount(
                            event.registrationFee
                        )}
                    </strong>

                    <small>
                        Participant registration
                    </small>

                </div>


                {/* EVENT DATE */}

                <div className="organizer-stat-card">

                    <span>
                        Event Date
                    </span>

                    <strong
                        style={{
                            fontSize: "20px",
                        }}
                    >
                        {formatDate(
                            event.eventDate
                        )}
                    </strong>

                    <small>
                        {formatDateTime(
                            event.eventDate
                        )}
                    </small>

                </div>


                {/* DEADLINE */}

                <div className="organizer-stat-card">

                    <span>
                        Registration Deadline
                    </span>

                    <strong
                        style={{
                            fontSize: "20px",
                        }}
                    >
                        {formatDate(
                            event.registrationDeadline
                        )}
                    </strong>

                    <small>
                        {formatDateTime(
                            event.registrationDeadline
                        )}
                    </small>

                </div>

            </div>


            {/* ==================================================
                DESCRIPTION + EVENT INFORMATION
            ================================================== */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(0, 2fr) minmax(280px, 1fr)",
                    gap: "24px",
                    marginBottom: "32px",
                }}
            >

                {/* DESCRIPTION */}

                <section className="organizer-section">

                    <div
                        style={{
                            padding: "28px",
                            background: "#fff",
                            border:
                                "1px solid #e8e9f0",
                            borderRadius: "16px",
                        }}
                    >

                        <h2>
                            About This Event
                        </h2>

                        <p
                            style={{
                                color:
                                    "#666a7b",
                                lineHeight:
                                    "1.8",
                                whiteSpace:
                                    "pre-wrap",
                            }}
                        >
                            {event.description ||
                                "No description available."}
                        </p>

                    </div>

                </section>


                {/* EVENT INFORMATION */}

                <section className="organizer-section">

                    <div
                        style={{
                            padding: "28px",
                            background: "#fff",
                            border:
                                "1px solid #e8e9f0",
                            borderRadius: "16px",
                        }}
                    >

                        <h2>
                            Event Information
                        </h2>


                        <div
                            style={{
                                marginTop:
                                    "20px",
                            }}
                        >

                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                }}
                            >
                                <small
                                    style={{
                                        color:
                                            "#858896",
                                    }}
                                >
                                    Venue
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                    }}
                                >
                                    {event.venue ||
                                        "Not specified"}
                                </strong>
                            </div>


                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                }}
                            >
                                <small
                                    style={{
                                        color:
                                            "#858896",
                                    }}
                                >
                                    Event Date
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                    }}
                                >
                                    {formatDateTime(
                                        event.eventDate
                                    )}
                                </strong>
                            </div>


                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                }}
                            >
                                <small
                                    style={{
                                        color:
                                            "#858896",
                                    }}
                                >
                                    Registration
                                    Deadline
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                    }}
                                >
                                    {formatDateTime(
                                        event.registrationDeadline
                                    )}
                                </strong>
                            </div>


                            <div>
                                <small
                                    style={{
                                        color:
                                            "#858896",
                                    }}
                                >
                                    Created
                                </small>

                                <strong
                                    style={{
                                        display:
                                            "block",
                                        marginTop:
                                            "5px",
                                    }}
                                >
                                    {formatDate(
                                        event.createdAt
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>

            </div>


            {/* ==================================================
                HASHTAGS
            ================================================== */}

            {Array.isArray(event.hashtags) &&
                event.hashtags.length > 0 && (

                    <section
                        className="organizer-section"
                    >

                        <div
                            style={{
                                padding: "24px",
                                background: "#fff",
                                border:
                                    "1px solid #e8e9f0",
                                borderRadius: "16px",
                            }}
                        >

                            <h2>
                                Hashtags
                            </h2>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexWrap:
                                        "wrap",
                                    gap: "8px",
                                    marginTop:
                                        "15px",
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
                                                    "7px 12px",
                                                borderRadius:
                                                    "20px",
                                                background:
                                                    "#f0f1f7",
                                                color:
                                                    "#55596a",
                                                fontSize:
                                                    "13px",
                                                fontWeight:
                                                    "600",
                                            }}
                                        >
                                            {hashtag}
                                        </span>

                                    )
                                )}

                            </div>

                        </div>

                    </section>

                )}


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <section
                className="organizer-section"
            >

                <div
                    style={{
                        padding: "24px",
                        background: "#fff",
                        border:
                            "1px solid #e8e9f0",
                        borderRadius: "16px",
                    }}
                >

                    <h2>
                        Event Management
                    </h2>

                    <p
                        style={{
                            color:
                                "#777b8d",
                        }}
                    >
                        Manage your event,
                        registrations and status.
                    </p>


                    <div
                        style={{
                            display:
                                "flex",
                            flexWrap:
                                "wrap",
                            gap: "10px",
                            marginTop:
                                "20px",
                        }}
                    >

                        {/* REGISTRATIONS */}

                        <Link
                            to={`/organizer/events/${event._id}/registrations`}
                            className="create-event-button"
                        >
                            View Registrations
                        </Link>


                        {/* EDIT */}

                        <Link
                            to={`/organizer/events/${event._id}/edit`}
                            className="secondary-button"
                        >
                            Edit Event
                        </Link>


                        {/* STATUS */}

                        <button
                            type="button"
                            className="secondary-button"
                            disabled={
                                actionLoading
                            }
                            onClick={
                                handleStatusToggle
                            }
                        >
                            {actionLoading
                                ? "Updating..."
                                : event.status ===
                                  "active"
                                ? "Close Event"
                                : "Activate Event"}
                        </button>


                        {/* DELETE */}

                        <button
                            type="button"
                            className="cancel-button"
                            disabled={
                                actionLoading
                            }
                            onClick={
                                handleDelete
                            }
                            style={{
                                color:
                                    "#c63838",
                            }}
                        >
                            {actionLoading
                                ? "Processing..."
                                : "Delete Event"}
                        </button>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default EventDetails;