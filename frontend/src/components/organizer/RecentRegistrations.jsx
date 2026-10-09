import React from "react";
import { Link } from "react-router-dom";
import "./RecentRegistrations.css";
const RecentRegistrations = ({
    registrations = [],
    loading = false,
}) => {
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

    const getParticipantName = (registration) => {
        const firstName =
            registration.firstName || "";

        const lastName =
            registration.lastName || "";

        const name =
            `${firstName} ${lastName}`.trim();

        if (name) {
            return name;
        }

        if (
            registration.userId &&
            typeof registration.userId === "object"
        ) {
            return (
                registration.userId.name ||
                registration.userId.fullName ||
                registration.userId.email ||
                "Participant"
            );
        }

        return "Participant";
    };

    const getParticipantEmail = (registration) => {
        if (registration.email) {
            return registration.email;
        }

        if (
            registration.userId &&
            typeof registration.userId === "object"
        ) {
            return (
                registration.userId.email || "-"
            );
        }

        return "-";
    };

    const getPaymentStatus = (registration) => {
        return String(
            registration.paymentStatus ||
                registration.payment?.status ||
                "pending"
        ).toLowerCase();
    };

    const getEventName = (registration) => {
        if (registration.eventName) {
            return registration.eventName;
        }

        if (
            registration.eventId &&
            typeof registration.eventId === "object"
        ) {
            return (
                registration.eventId.title ||
                "Event"
            );
        }

        return "Event";
    };

    const getEventId = (registration) => {
        if (
            registration.eventId &&
            typeof registration.eventId === "object"
        ) {
            return (
                registration.eventId._id ||
                registration.eventId.id
            );
        }

        return registration.eventId;
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
                            Recent Registrations
                        </h2>

                        <p>
                            Latest participant
                            registrations.
                        </p>
                    </div>
                </div>

                <div className="recent-registrations-loading">

                    <div className="recent-registration-spinner"></div>

                    <span>
                        Loading registrations...
                    </span>

                </div>

            </section>
        );
    }

    /* ============================================================
       EMPTY
    ============================================================ */

    if (!registrations.length) {
        return (
            <section className="organizer-section">

                <div className="organizer-section-header">

                    <div>
                        <h2>
                            Recent Registrations
                        </h2>

                        <p>
                            Latest participant
                            registrations.
                        </p>
                    </div>

                </div>

                <div className="recent-registrations-empty">

                    <div className="recent-registration-empty-icon">
                        ♙
                    </div>

                    <h3>
                        No Recent Registrations
                    </h3>

                    <p>
                        New participant
                        registrations will appear
                        here.
                    </p>

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
                        Recent Registrations
                    </h2>

                    <p>
                        Latest participant
                        registrations.
                    </p>

                </div>

                <Link
                    to="/organizer/events"
                    className="section-link"
                >
                    View Events →
                </Link>

            </div>


            {/* ==================================================
                REGISTRATION LIST
            ================================================== */}

            <div className="recent-registrations-list">

                {registrations
                    .slice(0, 8)
                    .map((registration, index) => {

                        const status =
                            getPaymentStatus(
                                registration
                            );

                        const participantName =
                            getParticipantName(
                                registration
                            );

                        const email =
                            getParticipantEmail(
                                registration
                            );

                        const eventName =
                            getEventName(
                                registration
                            );

                        const eventId =
                            getEventId(
                                registration
                            );

                        return (
                            <div
                                className="recent-registration-item"
                                key={
                                    registration._id ||
                                    registration.id ||
                                    index
                                }
                            >

                                {/* AVATAR */}

                                <div className="recent-registration-avatar">
                                    {participantName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>


                                {/* PARTICIPANT */}

                                <div className="recent-registration-participant">

                                    <strong
                                        title={
                                            participantName
                                        }
                                    >
                                        {
                                            participantName
                                        }
                                    </strong>

                                    <span
                                        title={email}
                                    >
                                        {email}
                                    </span>

                                </div>


                                {/* EVENT */}

                                <div className="recent-registration-event">

                                    <span>
                                        Event
                                    </span>

                                    {eventId ? (
                                        <Link
                                            to={`/organizer/events/${eventId}`}
                                            title={
                                                eventName
                                            }
                                        >
                                            {eventName}
                                        </Link>
                                    ) : (
                                        <strong
                                            title={
                                                eventName
                                            }
                                        >
                                            {eventName}
                                        </strong>
                                    )}

                                </div>


                                {/* DATE */}

                                <div className="recent-registration-date">

                                    <strong>
                                        {formatDate(
                                            registration.registeredAt
                                        )}
                                    </strong>

                                    <span>
                                        {formatTime(
                                            registration.registeredAt
                                        )}
                                    </span>

                                </div>


                                {/* PAYMENT */}

                                <div className="recent-registration-status">

                                    <span
                                        className={`payment-status payment-status-${status}`}
                                    >
                                        {status}
                                    </span>

                                </div>

                            </div>
                        );
                    })}

            </div>

        </section>
    );
};

export default RecentRegistrations;