import React from "react";
import { Link } from "react-router-dom";
import "./UpcomingEvents.css";
const UpcomingEvents = ({ events = [], loading = false }) => {
    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        if (!date) return "";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRegistrationCount = (event) => {
        return (
            event.totalRegistrations ??
            event.registrationCount ??
            event.registrationsCount ??
            event.registrations?.length ??
            0
        );
    };

    const getStatus = (event) => {
        return String(
            event.status || "active"
        ).toLowerCase();
    };

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <section className="organizer-section">

                <div className="organizer-section-header">
                    <div>
                        <h2>
                            Upcoming Events
                        </h2>

                        <p>
                            Your next scheduled events.
                        </p>
                    </div>
                </div>

                <div className="upcoming-events-loading">

                    <div className="upcoming-loading-spinner"></div>

                    <span>
                        Loading upcoming events...
                    </span>

                </div>

            </section>
        );
    }

    /* ============================================================
       EMPTY
    ============================================================ */

    if (!events.length) {
        return (
            <section className="organizer-section">

                <div className="organizer-section-header">

                    <div>
                        <h2>
                            Upcoming Events
                        </h2>

                        <p>
                            Your next scheduled events.
                        </p>
                    </div>

                    <Link
                        to="/organizer/events/create"
                        className="section-link"
                    >
                        + Create Event
                    </Link>

                </div>


                <div className="upcoming-events-empty">

                    <div className="upcoming-empty-icon">
                        +
                    </div>

                    <h3>
                        No Upcoming Events
                    </h3>

                    <p>
                        You don't have any upcoming
                        events scheduled yet.
                    </p>

                    <Link
                        to="/organizer/events/create"
                        className="submit-button"
                    >
                        Create Your First Event
                    </Link>

                </div>

            </section>
        );
    }

    return (
        <section className="organizer-section">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="organizer-section-header">

                <div>

                    <h2>
                        Upcoming Events
                    </h2>

                    <p>
                        Your next scheduled events.
                    </p>

                </div>

                <Link
                    to="/organizer/events"
                    className="section-link"
                >
                    View All →
                </Link>

            </div>


            {/* ==================================================
                EVENTS
            ================================================== */}

            <div className="upcoming-events-list">

                {events.map((event, index) => {

                    const eventId =
                        event._id || event.id;

                    const status =
                        getStatus(event);

                    const registrationCount =
                        getRegistrationCount(event);

                    const banner =
                        event.bannerImageUrl ||
                        event.bannerImage ||
                        event.imageUrl ||
                        "";

                    return (
                        <article
                            className="upcoming-event-item"
                            key={
                                eventId || index
                            }
                        >

                            {/* IMAGE */}

                            <div className="upcoming-event-image">

                                {banner ? (
                                    <img
                                        src={banner}
                                        alt={
                                            event.title ||
                                            "Event"
                                        }
                                        onError={(
                                            e
                                        ) => {
                                            e.currentTarget.style.display =
                                                "none";

                                            e.currentTarget.parentElement.classList.add(
                                                "upcoming-event-image-fallback"
                                            );
                                        }}
                                    />
                                ) : (
                                    <div className="upcoming-event-image-fallback">
                                        <span>
                                            ES
                                        </span>
                                    </div>
                                )}

                            </div>


                            {/* DATE */}

                            <div className="upcoming-event-date">

                                <span>
                                    {new Date(
                                        event.eventDate
                                    ).toLocaleDateString(
                                        "en-IN",
                                        {
                                            month: "short",
                                        }
                                    )}
                                </span>

                                <strong>
                                    {new Date(
                                        event.eventDate
                                    ).getDate()}
                                </strong>

                            </div>


                            {/* CONTENT */}

                            <div className="upcoming-event-content">

                                <div className="upcoming-event-title-row">

                                    <h3
                                        title={
                                            event.title
                                        }
                                    >
                                        {event.title ||
                                            "Untitled Event"}
                                    </h3>

                                    <span
                                        className={`event-status event-status-${status}`}
                                    >
                                        {status}
                                    </span>

                                </div>


                                <div className="upcoming-event-meta">

                                    <span>
                                        ◷{" "}
                                        {formatTime(
                                            event.eventDate
                                        )}
                                    </span>

                                    <span>
                                        ⌖{" "}
                                        {event.venue ||
                                            "Venue not specified"}
                                    </span>

                                    <span>
                                        ♙{" "}
                                        {
                                            registrationCount
                                        }{" "}
                                        registrations
                                    </span>

                                </div>


                                <div className="upcoming-event-deadline">

                                    <span>
                                        Registration
                                        deadline:
                                    </span>

                                    <strong>
                                        {formatDate(
                                            event.registrationDeadline
                                        )}
                                    </strong>

                                </div>

                            </div>


                            {/* ACTION */}

                            <div className="upcoming-event-action">

                                <Link
                                    to={`/organizer/events/${eventId}`}
                                    className="upcoming-view-button"
                                >
                                    View
                                </Link>

                            </div>

                        </article>
                    );
                })}

            </div>

        </section>
    );
};

export default UpcomingEvents;