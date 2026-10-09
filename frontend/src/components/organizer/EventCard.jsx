import React from "react";
import { Link } from "react-router-dom";
import "./EventCard.css";
const EventCard = ({
    event,
    onDelete,
    onToggleStatus,
}) => {
    if (!event) {
        return null;
    }

    const eventId = event._id || event.id;

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

    const formatDateTime = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    const getStatus = () => {
        return String(event.status || "active").toLowerCase();
    };

    const status = getStatus();

    const isActive = status === "active";

    const registrations =
        event.totalRegistrations ??
        event.registrationCount ??
        event.registrationsCount ??
        event.registrations?.length ??
        0;

    const paidRegistrations =
        event.paidRegistrations ??
        event.paidCount ??
        0;

    const bannerImage =
        event.bannerImageUrl ||
        event.bannerImage ||
        event.imageUrl ||
        "";

    const description =
        event.description ||
        "No event description available.";

    const hashtags = Array.isArray(event.hashtags)
        ? event.hashtags
        : typeof event.hashtags === "string"
        ? event.hashtags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
        : [];

    const handleDelete = () => {
        if (!onDelete) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${event.title}"?`
        );

        if (confirmed) {
            onDelete(eventId);
        }
    };

    const handleToggleStatus = () => {
        if (!onToggleStatus) return;

        onToggleStatus(eventId);
    };

    return (
        <article className="organizer-event-card">

            {/* ==================================================
                EVENT BANNER
            ================================================== */}

            <div className="event-card-image-wrapper">

                {bannerImage ? (
                    <img
                        src={bannerImage}
                        alt={event.title || "Event"}
                        className="event-card-image"
                        onError={(e) => {
                            e.currentTarget.style.display =
                                "none";

                            e.currentTarget.parentElement.classList.add(
                                "event-card-image-fallback"
                            );
                        }}
                    />
                ) : (
                    <div className="event-card-image-fallback">
                        <span>
                            EVENT
                        </span>
                    </div>
                )}

                {/* Status */}

                <span
                    className={`event-status event-status-${status}`}
                >
                    {status}
                </span>

            </div>


            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="event-card-content">

                {/* Title */}

                <h3
                    className="event-card-title"
                    title={event.title}
                >
                    {event.title || "Untitled Event"}
                </h3>


                {/* Description */}

                <p className="event-card-description">
                    {description.length > 120
                        ? `${description.substring(
                              0,
                              120
                          )}...`
                        : description}
                </p>


                {/* Hashtags */}

                {hashtags.length > 0 && (
                    <div className="event-card-tags">

                        {hashtags
                            .slice(0, 4)
                            .map((tag, index) => (
                                <span
                                    key={`${tag}-${index}`}
                                >
                                    #{String(tag).replace(
                                        /^#/,
                                        ""
                                    )}
                                </span>
                            ))}

                        {hashtags.length > 4 && (
                            <span>
                                +{hashtags.length - 4}
                            </span>
                        )}

                    </div>
                )}


                {/* ==================================================
                    EVENT DETAILS
                ================================================== */}

                <div className="event-card-details">

                    {/* Date */}

                    <div className="event-card-detail">

                        <span className="event-detail-icon">
                            ◷
                        </span>

                        <div>
                            <small>
                                Event Date
                            </small>

                            <strong>
                                {formatDateTime(
                                    event.eventDate
                                )}
                            </strong>
                        </div>

                    </div>


                    {/* Venue */}

                    <div className="event-card-detail">

                        <span className="event-detail-icon">
                            ⌖
                        </span>

                        <div>
                            <small>
                                Venue
                            </small>

                            <strong
                                title={event.venue}
                            >
                                {event.venue ||
                                    "Venue not specified"}
                            </strong>
                        </div>

                    </div>


                    {/* Registration Deadline */}

                    <div className="event-card-detail">

                        <span className="event-detail-icon">
                            ◴
                        </span>

                        <div>
                            <small>
                                Registration Deadline
                            </small>

                            <strong>
                                {formatDate(
                                    event.registrationDeadline
                                )}
                            </strong>
                        </div>

                    </div>

                </div>


                {/* ==================================================
                    EVENT STATS
                ================================================== */}

                <div className="event-card-stats">

                    <div>
                        <span>
                            Registrations
                        </span>

                        <strong>
                            {Number(
                                registrations
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Paid
                        </span>

                        <strong>
                            {Number(
                                paidRegistrations
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Fee
                        </span>

                        <strong>
                            {formatCurrency(
                                event.registrationFee
                            )}
                        </strong>
                    </div>

                </div>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div className="event-card-footer">

                    <Link
                        to={`/organizer/events/${eventId}`}
                        className="secondary-button event-view-button"
                    >
                        View
                    </Link>

                    <Link
                        to={`/organizer/events/${eventId}/edit`}
                        className="secondary-button event-edit-button"
                    >
                        Edit
                    </Link>

                    <Link
                        to={`/organizer/events/${eventId}/registrations`}
                        className="submit-button event-registration-button"
                    >
                        Registrations
                    </Link>

                </div>


                {/* ==================================================
                    MANAGEMENT ACTIONS
                ================================================== */}

                <div className="event-card-management">

                    <button
                        type="button"
                        className="event-status-toggle"
                        onClick={
                            handleToggleStatus
                        }
                    >
                        {isActive
                            ? "Close Event"
                            : "Activate Event"}
                    </button>


                    <button
                        type="button"
                        className="event-delete-button"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>

                </div>

            </div>

        </article>
    );
};

export default EventCard;