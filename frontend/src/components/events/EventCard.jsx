// =====================================================
// EVENTSPHERE - EVENT CARD
// =====================================================

import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, IndianRupee } from "lucide-react";

import "./EventCard.css";


const EventCard = ({ event }) => {

    /*
     * Prevent rendering problems if
     * event data is missing.
     */
    if (!event) {
        return null;
    }


    /*
     * Event ID
     */
    const eventId =
        event._id || event.id;


    /*
     * Format event date
     */
    const formatDate = (date) => {

        if (!date) {
            return "Date not available";
        }

        const parsedDate =
            new Date(date);

        if (Number.isNaN(
            parsedDate.getTime()
        )) {
            return "Date not available";
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


    /*
     * Format registration fee
     */
    const formatFee = (fee) => {

        const amount =
            Number(fee) || 0;

        if (amount === 0) {
            return "Free";
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(amount);
    };


    /*
     * Event status
     */
    const eventStatus =
        event.status || "active";


    /*
     * Banner image
     */
    const bannerImage =
        event.bannerImageUrl ||
        event.bannerImage ||
        "";


    return (
        <article className="event-card">

            {/* =================================================
                EVENT IMAGE
                ================================================= */}

            <div className="event-card-image">

                {bannerImage ? (

                    <img
                        src={bannerImage}
                        alt={
                            event.title ||
                            "Event banner"
                        }
                        loading="lazy"
                    />

                ) : (

                    <div className="event-card-image-placeholder">

                        <span>
                            EventSphere
                        </span>

                    </div>

                )}


                {/* STATUS */}

                <span
                    className={`event-status event-status-${eventStatus}`}
                >
                    {eventStatus === "active"
                        ? "Active"
                        : "Closed"}
                </span>

            </div>


            {/* =================================================
                CONTENT
                ================================================= */}

            <div className="event-card-content">

                {/* TITLE */}

                <h3 className="event-card-title">

                    {event.title ||
                        "Untitled Event"}

                </h3>


                {/* DESCRIPTION */}

                {event.description && (

                    <p className="event-card-description">

                        {event.description.length > 100
                            ? `${event.description.substring(
                                0,
                                100
                            )}...`
                            : event.description}

                    </p>

                )}


                {/* =================================================
                    EVENT INFORMATION
                    ================================================= */}

                <div className="event-card-info">

                    <div className="event-info-row">

                        <CalendarDays
                            size={16}
                            strokeWidth={2}
                        />

                        <span>
                            {formatDate(
                                event.eventDate
                            )}
                        </span>

                    </div>


                    <div className="event-info-row">

                        <MapPin
                            size={16}
                            strokeWidth={2}
                        />

                        <span>
                            {event.venue ||
                                "Venue not available"}
                        </span>

                    </div>


                    <div className="event-info-row">

                        <IndianRupee
                            size={16}
                            strokeWidth={2}
                        />

                        <span>
                            {formatFee(
                                event.registrationFee
                            )}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    HASHTAGS
                    ================================================= */}

                {Array.isArray(
                    event.hashtags
                ) &&
                event.hashtags.length > 0 && (

                    <div className="event-card-tags">

                        {event.hashtags
                            .slice(0, 3)
                            .map(
                                (tag, index) => (

                                    <span
                                        key={`${tag}-${index}`}
                                        className="event-tag"
                                    >
                                        #{tag}
                                    </span>

                                )
                            )}

                    </div>

                )}


                {/* =================================================
                    FOOTER
                    ================================================= */}

                <div className="event-card-footer">

                    <Link
                        to={`/events/${eventId}`}
                        className="event-view-button"
                    >
                        View Event
                    </Link>

                </div>

            </div>

        </article>
    );
};


export default EventCard;