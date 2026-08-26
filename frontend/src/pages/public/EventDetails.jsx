// =====================================================
// EVENTSPHERE - PUBLIC EVENT DETAILS
// =====================================================

import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    MapPin,
    IndianRupee,
    Tag,
    UserRound,
} from "lucide-react";

import eventService from "../../services/eventService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import "./EventDetails.css";


const EventDetails = () => {

    // =================================================
    // ROUTER
    // =================================================

    const { id } = useParams();

    const navigate = useNavigate();


    // =================================================
    // STATE
    // =================================================

    const [event, setEvent] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =================================================
    // LOAD EVENT
    // =================================================

    const loadEvent = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");

                const response =
                    await eventService.getEventById(
                        id
                    );


                /*
                 * Support different backend
                 * response structures.
                 */
                const data =
                    response?.event ||
                    response?.data?.event ||
                    response?.data ||
                    response;


                setEvent(data);

            } catch (err) {

                console.error(
                    "Failed to load event:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load event details."
                );

            } finally {

                setLoading(false);

            }

        },
        [id]
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        if (id) {
            loadEvent();
        }

    }, [id, loadEvent]);


    // =================================================
    // DATE FORMATTER
    // =================================================

    const formatDate = (date) => {

        if (!date) {
            return "Date not available";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Date not available";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };


    // =================================================
    // TIME FORMATTER
    // =================================================

    const formatTime = (date) => {

        if (!date) {
            return "Time not available";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Time not available";
        }

        return parsedDate.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };


    // =================================================
    // CURRENCY FORMATTER
    // =================================================

    const formatCurrency = (amount) => {

        const value =
            Number(amount) || 0;

        if (value === 0) {
            return "Free";
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value);
    };


    // =================================================
    // BACK
    // =================================================

    const handleBack = () => {

        navigate(-1);

    };


    // =================================================
    // REGISTER
    // =================================================

    const handleRegister = () => {

        /*
         * Registration module will use this route.
         */
        navigate(
            `/participant/register/${id}`
        );

    };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <main className="event-details-page">

                <div className="event-details-state">

                    <Loader />

                    <p>
                        Loading event details...
                    </p>

                </div>

            </main>
        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (error || !event) {

        return (
            <main className="event-details-page">

                <div className="event-details-state">

                    <ErrorMessage
                        message={
                            error ||
                            "Event not found."
                        }
                    />

                    <div className="event-details-state-actions">

                        <button
                            type="button"
                            onClick={loadEvent}
                            className="event-details-retry"
                        >
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="event-details-back"
                        >
                            Go Back
                        </button>

                    </div>

                </div>

            </main>
        );

    }


    // =================================================
    // EVENT DATA
    // =================================================

    const eventId =
        event._id || event.id;

    const bannerImage =
        event.bannerImageUrl ||
        event.bannerImage ||
        "";

    const eventStatus =
        event.status || "active";


    // =================================================
    // RENDER
    // =================================================

    return (

        <main className="event-details-page">

            {/* =================================================
                BACK BUTTON
                ================================================= */}

            <div className="event-details-container">

                <button
                    type="button"
                    className="event-details-back-button"
                    onClick={handleBack}
                >
                    <ArrowLeft
                        size={17}
                    />

                    Back to Events
                </button>


                {/* =================================================
                    HERO IMAGE
                    ================================================= */}

                <section className="event-details-hero">

                    {bannerImage ? (

                        <img
                            src={bannerImage}
                            alt={
                                event.title ||
                                "Event banner"
                            }
                            className="event-details-banner"
                        />

                    ) : (

                        <div className="event-details-banner-placeholder">

                            <span>
                                EventSphere
                            </span>

                        </div>

                    )}


                    <div className="event-details-hero-overlay" />

                    <span
                        className={
                            eventStatus === "active"
                                ? "event-details-status active"
                                : "event-details-status closed"
                        }
                    >
                        {eventStatus === "active"
                            ? "Registration Open"
                            : "Registration Closed"}
                    </span>

                </section>


                {/* =================================================
                    MAIN CONTENT
                    ================================================= */}

                <section className="event-details-content">

                    <div className="event-details-main">

                        {/* TITLE */}

                        <div className="event-details-title-block">

                            <span className="event-details-eyebrow">
                                EVENTSPHERE EVENT
                            </span>

                            <h1>
                                {event.title ||
                                    "Untitled Event"}
                            </h1>

                            {event.description && (

                                <p className="event-details-description">
                                    {event.description}
                                </p>

                            )}

                        </div>


                        {/* =================================================
                            EVENT INFORMATION
                            ================================================= */}

                        <div className="event-details-info-grid">

                            <div className="event-details-info-card">

                                <div className="event-details-info-icon">
                                    <CalendarDays
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <span>
                                        Event Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            event.eventDate
                                        )}
                                    </strong>
                                </div>

                            </div>


                            <div className="event-details-info-card">

                                <div className="event-details-info-icon">
                                    <Clock3
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <span>
                                        Time
                                    </span>

                                    <strong>
                                        {formatTime(
                                            event.eventDate
                                        )}
                                    </strong>
                                </div>

                            </div>


                            <div className="event-details-info-card">

                                <div className="event-details-info-icon">
                                    <MapPin
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <span>
                                        Venue
                                    </span>

                                    <strong>
                                        {event.venue ||
                                            "Venue not available"}
                                    </strong>
                                </div>

                            </div>


                            <div className="event-details-info-card">

                                <div className="event-details-info-icon">
                                    <IndianRupee
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <span>
                                        Registration Fee
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            event.registrationFee
                                        )}
                                    </strong>
                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            HASHTAGS
                            ================================================= */}

                        {Array.isArray(
                            event.hashtags
                        ) &&
                        event.hashtags.length > 0 && (

                            <div className="event-details-section">

                                <div className="event-details-section-title">

                                    <Tag
                                        size={18}
                                    />

                                    <h2>
                                        Event Tags
                                    </h2>

                                </div>


                                <div className="event-details-tags">

                                    {event.hashtags.map(
                                        (tag, index) => (

                                            <span
                                                key={`${tag}-${index}`}
                                                className="event-details-tag"
                                            >
                                                #{tag}
                                            </span>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            ORGANIZER
                            ================================================= */}

                        {event.organizerId && (

                            <div className="event-details-section">

                                <div className="event-details-section-title">

                                    <UserRound
                                        size={18}
                                    />

                                    <h2>
                                        Organizer
                                    </h2>

                                </div>


                                <div className="event-details-organizer">

                                    <div className="event-details-organizer-avatar">
                                        <UserRound
                                            size={21}
                                        />
                                    </div>

                                    <div>

                                        <strong>
                                            {event.organizerId.name ||
                                                "Event Organizer"}
                                        </strong>

                                        {event.organizerId.email && (
                                            <span>
                                                {
                                                    event
                                                        .organizerId
                                                        .email
                                                }
                                            </span>
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        REGISTRATION SIDEBAR
                        ================================================= */}

                    <aside className="event-details-sidebar">

                        <div className="event-details-registration-card">

                            <span className="event-details-price-label">
                                Registration Fee
                            </span>

                            <strong className="event-details-price">
                                {formatCurrency(
                                    event.registrationFee
                                )}
                            </strong>


                            <div className="event-details-deadline">

                                <span>
                                    Registration Deadline
                                </span>

                                <strong>
                                    {formatDate(
                                        event.registrationDeadline
                                    )}
                                </strong>

                            </div>


                            {eventStatus === "active" ? (

                                <button
                                    type="button"
                                    className="event-details-register-button"
                                    onClick={
                                        handleRegister
                                    }
                                >
                                    Register for Event
                                </button>

                            ) : (

                                <button
                                    type="button"
                                    className="event-details-register-button disabled"
                                    disabled
                                >
                                    Registration Closed
                                </button>

                            )}


                            <p className="event-details-registration-note">
                                Complete your registration
                                details to reserve your
                                place.
                            </p>

                        </div>

                    </aside>

                </section>

            </div>

        </main>

    );
};


export default EventDetails;