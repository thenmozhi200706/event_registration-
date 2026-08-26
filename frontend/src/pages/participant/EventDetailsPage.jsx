import React, { useEffect, useMemo, useState } from "react";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    IndianRupee,
    Loader2,
    MapPin,
    Search,
    ShieldCheck,
    Ticket,
    Users,
} from "lucide-react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../api/api";

import useAuth from "../../hooks/useAuth";

import "./EventDetailsPage.css";


const EventDetailsPage = () => {
    /*
     * =========================================================
     * ROUTER
     * =========================================================
     */

    const { eventId } = useParams();

    const navigate = useNavigate();

    const { user } = useAuth();


    /*
     * =========================================================
     * STATE
     * =========================================================
     */

    const [event, setEvent] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [registering, setRegistering] = useState(false);


    /*
     * =========================================================
     * LOAD EVENT
     * =========================================================
     *
     * GET /api/events/:id
     *
     * Your api.js should already have:
     *
     * baseURL = http://localhost:5000/api
     *
     * Therefore:
     *
     * api.get(`/events/${eventId}`)
     *
     * becomes:
     *
     * GET http://localhost:5000/api/events/:eventId
     */

    useEffect(() => {
        let mounted = true;

        const loadEvent = async () => {
            if (!eventId) {
                if (mounted) {
                    setError("Event ID is missing.");
                    setLoading(false);
                }

                return;
            }

            try {
                if (mounted) {
                    setLoading(true);
                    setError("");
                }

                const response = await api.get(
                    `/events/${eventId}`
                );

                const responseData = response?.data;

                /*
                 * Support different backend response formats:
                 *
                 * {
                 *     success: true,
                 *     event: {...}
                 * }
                 *
                 * OR
                 *
                 * {
                 *     success: true,
                 *     data: {...}
                 * }
                 *
                 * OR
                 *
                 * {
                 *     _id: "...",
                 *     title: "..."
                 * }
                 */

                const loadedEvent =
                    responseData?.event ||
                    responseData?.data ||
                    responseData;

                if (
                    !loadedEvent ||
                    !loadedEvent._id
                ) {
                    throw new Error(
                        "Event details were not found."
                    );
                }

                if (mounted) {
                    setEvent(loadedEvent);
                }
            } catch (err) {
                console.error(
                    "Failed to load event:",
                    err
                );

                const backendMessage =
                    err?.response?.data?.message;

                if (mounted) {
                    setError(
                        backendMessage ||
                        err?.message ||
                        "Unable to load event details."
                    );
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadEvent();

        return () => {
            mounted = false;
        };
    }, [eventId]);


    /*
     * =========================================================
     * EVENT DATE
     * =========================================================
     */

    const formattedEventDate = useMemo(() => {
        if (!event?.eventDate) {
            return "Date not available";
        }

        const date = new Date(event.eventDate);

        if (Number.isNaN(date.getTime())) {
            return "Date not available";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    }, [event?.eventDate]);


    /*
     * =========================================================
     * EVENT TIME
     * =========================================================
     */

    const formattedEventTime = useMemo(() => {
        if (!event?.eventDate) {
            return "";
        }

        const date = new Date(event.eventDate);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }, [event?.eventDate]);


    /*
     * =========================================================
     * REGISTRATION DEADLINE
     * =========================================================
     */

    const registrationDeadline = useMemo(() => {
        if (!event?.registrationDeadline) {
            return null;
        }

        const date = new Date(
            event.registrationDeadline
        );

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    }, [event?.registrationDeadline]);


    const formattedDeadline = useMemo(() => {
        if (!registrationDeadline) {
            return "Not available";
        }

        return registrationDeadline.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }, [registrationDeadline]);


    /*
     * =========================================================
     * REGISTRATION STATUS
     * =========================================================
     */

    const isRegistrationClosed =
        event?.status === "closed" ||
        event?.status === "completed" ||
        (
            registrationDeadline &&
            registrationDeadline.getTime() <
                Date.now()
        );


    /*
     * =========================================================
     * EVENT FEE
     * =========================================================
     */

    const registrationFee = Number(
        event?.registrationFee || 0
    );

    const isFree = registrationFee <= 0;


    /*
     * =========================================================
     * ORGANIZER
     * =========================================================
     */

    const organizer = event?.organizerId;

    const organizerName =
        typeof organizer === "object"
            ? organizer?.name ||
              organizer?.email ||
              "Event Organizer"
            : event?.organizerName ||
              "Event Organizer";


    /*
     * =========================================================
     * EVENT IMAGE
     * =========================================================
     */

    const bannerImage =
        event?.bannerImageUrl ||
        event?.bannerImage ||
        "";


    /*
     * =========================================================
     * EVENT CAPACITY
     * =========================================================
     */

    const capacity =
        Number(
            event?.capacity ||
            event?.maxParticipants ||
            0
        );

    const registeredCount =
        Number(
            event?.registeredCount ||
            event?.registrationCount ||
            0
        );

    const seatsAvailable =
        capacity > 0
            ? Math.max(
                  capacity - registeredCount,
                  0
              )
            : null;


    /*
     * =========================================================
     * REGISTER BUTTON
     * =========================================================
     *
     * FLOW:
     *
     * Not logged in
     *      ↓
     * /login
     *
     * Logged in
     *      ↓
     * /events/:eventId/register
     *
     * Registration page
     *      ↓
     * Payment page for paid event
     *
     * Registration page
     *      ↓
     * Success page for free event
     */

    const handleRegister = () => {
        if (registering) {
            return;
        }

        /*
         * Event ID check
         */

        if (!eventId) {
            setError(
                "Unable to continue because the event ID is missing."
            );

            return;
        }


        /*
         * Registration closed
         */

        if (isRegistrationClosed) {
            return;
        }


        /*
         * Capacity check
         */

        if (
            seatsAvailable !== null &&
            seatsAvailable <= 0
        ) {
            return;
        }


        /*
         * User is not logged in.
         *
         * Send the user to login.
         *
         * After login, your login page can
         * use location.state.from to return
         * here.
         */

        if (!user) {
            navigate(
                "/login",
                {
                    state: {
                        from:
                            `/events/${eventId}/register`,
                    },
                }
            );

            return;
        }


        /*
         * User is authenticated.
         *
         * IMPORTANT:
         *
         * This is the registration route.
         *
         * Do NOT navigate directly to
         * /payment here.
         *
         * RegistrationPage is responsible
         * for creating the registration and
         * then opening PaymentPage when
         * payment is required.
         */

        setRegistering(true);

        navigate(
            `/events/${eventId}/register`,
            {
                state: {
                    event,
                },
            }
        );
    };


    /*
     * =========================================================
     * TRY AGAIN
     * =========================================================
     */

    const handleRetry = () => {
        window.location.reload();
    };


    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (loading) {
        return (
            <div className="event-details-page">

                <div className="event-details-loading">

                    <Loader2
                        size={35}
                        className="event-details-spinner"
                    />

                    <h2>
                        Loading event
                    </h2>

                    <p>
                        Please wait while we
                        fetch the event details.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * ERROR
     * =========================================================
     */

    if (error || !event) {
        return (
            <div className="event-details-page">

                <div className="event-details-error">

                    <div className="event-details-error-icon">

                        <Search
                            size={27}
                        />

                    </div>


                    <h2>
                        Unable to load event
                    </h2>


                    <p>
                        {error ||
                            "Event details are not available."}
                    </p>


                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent:
                                "center",
                            flexWrap: "wrap",
                        }}
                    >

                        <button
                            type="button"
                            className="event-details-back-button"
                            onClick={
                                handleRetry
                            }
                        >
                            Try Again
                        </button>


                        <Link
                            to="/events"
                            className="event-details-back-button"
                        >

                            <ArrowLeft
                                size={16}
                            />

                            Back to Events

                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * MAIN PAGE
     * =========================================================
     */

    return (
        <div className="event-details-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="event-details-header">

                <div className="event-details-header-inner">

                    <Link
                        to="/events"
                        className="event-details-back-link"
                    >

                        <ArrowLeft
                            size={17}
                        />

                        Back to Events

                    </Link>

                </div>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="event-details-content">

                <div className="event-details-grid">


                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <section className="event-details-main">


                        {/* =================================================
                            BANNER
                        ================================================= */}

                        <div className="event-details-banner">

                            {bannerImage ? (

                                <img
                                    src={bannerImage}
                                    alt={
                                        event.title ||
                                        "Event banner"
                                    }
                                    onError={(e) => {
                                        e.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                            ) : (

                                <div className="event-details-banner-placeholder">

                                    <CalendarDays
                                        size={55}
                                    />

                                    <span>
                                        EventSphere
                                    </span>

                                </div>

                            )}


                            <div className="event-details-banner-overlay">

                                <span className="event-details-featured-badge">

                                    <Ticket
                                        size={13}
                                    />

                                    EVENT

                                </span>

                            </div>

                        </div>


                        {/* =================================================
                            TITLE
                        ================================================= */}

                        <div className="event-details-title-section">

                            <div className="event-details-status-row">

                                <span
                                    className={
                                        isRegistrationClosed
                                            ? "event-status closed"
                                            : "event-status active"
                                    }
                                >

                                    {isRegistrationClosed
                                        ? "Registration Closed"
                                        : "Registration Open"}

                                </span>


                                {isFree && (

                                    <span className="event-free-badge">

                                        Free Event

                                    </span>

                                )}

                            </div>


                            <h1>
                                {event.title ||
                                    "Untitled Event"}
                            </h1>


                            <div className="event-details-organizer">

                                <Users
                                    size={15}
                                />

                                <span>
                                    Organized by
                                </span>

                                <strong>
                                    {organizerName}
                                </strong>

                            </div>

                        </div>


                        {/* =================================================
                            HASHTAGS
                        ================================================= */}

                        {Array.isArray(
                            event.hashtags
                        ) &&
                            event.hashtags.length >
                                0 && (

                            <div className="event-details-tags">

                                {event.hashtags.map(
                                    (
                                        tag,
                                        index
                                    ) => (

                                        <span
                                            key={
                                                `${tag}-${index}`
                                            }
                                        >
                                            #
                                            {String(
                                                tag
                                            ).replace(
                                                /^#/,
                                                ""
                                            )}
                                        </span>

                                    )
                                )}

                            </div>

                        )}


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <section className="event-details-section">

                            <h2>
                                About this event
                            </h2>


                            <p className="event-details-description">

                                {event.description ||
                                    "No event description is available."}

                            </p>

                        </section>


                        {/* =================================================
                            EVENT INFORMATION
                        ================================================= */}

                        <section className="event-details-section">

                            <h2>
                                Event Information
                            </h2>


                            <div className="event-info-grid">


                                {/* DATE */}

                                <div className="event-info-item">

                                    <div className="event-info-icon">

                                        <CalendarDays
                                            size={18}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Event Date
                                        </span>

                                        <strong>
                                            {
                                                formattedEventDate
                                            }
                                        </strong>

                                        {formattedEventTime && (

                                            <small>
                                                {
                                                    formattedEventTime
                                                }
                                            </small>

                                        )}

                                    </div>

                                </div>


                                {/* VENUE */}

                                <div className="event-info-item">

                                    <div className="event-info-icon">

                                        <MapPin
                                            size={18}
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


                                {/* DEADLINE */}

                                <div className="event-info-item">

                                    <div className="event-info-icon">

                                        <Clock3
                                            size={18}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Registration Deadline
                                        </span>

                                        <strong>
                                            {
                                                formattedDeadline
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* PRICE */}

                                <div className="event-info-item">

                                    <div className="event-info-icon">

                                        <IndianRupee
                                            size={18}
                                        />

                                    </div>

                                    <div>

                                        <span>
                                            Registration Fee
                                        </span>

                                        <strong>
                                            {isFree
                                                ? "Free"
                                                : `₹${registrationFee.toLocaleString(
                                                      "en-IN",
                                                      {
                                                          minimumFractionDigits:
                                                              2,
                                                      }
                                                  )}`}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            SECURITY
                        ================================================= */}

                        <div className="event-details-security">

                            <ShieldCheck
                                size={18}
                            />

                            <div>

                                <strong>
                                    Secure Event Registration
                                </strong>

                                <span>
                                    Your registration
                                    details are
                                    protected and
                                    paid
                                    registrations
                                    are processed
                                    securely.
                                </span>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <aside className="event-details-sidebar">


                        {/* =================================================
                            REGISTRATION CARD
                        ================================================= */}

                        <div className="event-register-card">

                            <span className="event-register-label">
                                REGISTRATION
                            </span>


                            <h2>

                                {isFree
                                    ? "Join this event"
                                    : "Reserve your place"}

                            </h2>


                            <p>
                                Complete your
                                registration to
                                participate in this
                                event.
                            </p>


                            {/* PRICE */}

                            <div className="event-register-price">

                                <span>
                                    Registration Fee
                                </span>


                                <strong>

                                    {isFree
                                        ? "FREE"
                                        : `₹${registrationFee.toLocaleString(
                                              "en-IN",
                                              {
                                                  minimumFractionDigits:
                                                      2,
                                              }
                                          )}`}

                                </strong>

                            </div>


                            {/* DEADLINE */}

                            <div className="event-register-deadline">

                                <Clock3
                                    size={15}
                                />

                                <span>

                                    Registration
                                    closes{" "}

                                    <strong>
                                        {
                                            formattedDeadline
                                        }
                                    </strong>

                                </span>

                            </div>


                            {/* SEATS */}

                            {seatsAvailable !==
                                null && (

                                <div
                                    className="event-register-deadline"
                                >

                                    <Users
                                        size={15}
                                    />

                                    <span>

                                        <strong>
                                            {
                                                seatsAvailable
                                            }
                                        </strong>{" "}
                                        seats available

                                    </span>

                                </div>

                            )}


                            {/* =================================================
                                REGISTER BUTTON
                            ================================================= */}

                            <button
                                type="button"
                                className="event-register-button"
                                onClick={
                                    handleRegister
                                }
                                disabled={
                                    isRegistrationClosed ||
                                    registering ||
                                    (
                                        seatsAvailable !==
                                            null &&
                                        seatsAvailable <=
                                            0
                                    )
                                }
                            >

                                {registering ? (

                                    <>
                                        <Loader2
                                            size={16}
                                            className="event-details-spinner"
                                        />

                                        Opening...

                                    </>

                                ) : isRegistrationClosed ? (

                                    <>
                                        Registration Closed
                                    </>

                                ) : (
                                    seatsAvailable !==
                                        null &&
                                    seatsAvailable <=
                                        0
                                ) ? (

                                    <>
                                        Event Full
                                    </>

                                ) : (

                                    <>

                                        {user
                                            ? "Register Now"
                                            : "Login to Register"}

                                        <ArrowRight
                                            size={16}
                                        />

                                    </>

                                )}

                            </button>


                            {/* LOGIN MESSAGE */}

                            {!user &&
                                !isRegistrationClosed && (

                                <p className="event-login-note">

                                    You need to login
                                    before
                                    registering for
                                    an event.

                                </p>

                            )}


                            {/* PAYMENT MESSAGE */}

                            {user &&
                                !isFree &&
                                !isRegistrationClosed && (

                                <p className="event-login-note">

                                    After registration,
                                    you will continue
                                    to secure payment.

                                </p>

                            )}


                            {/* TRUST */}

                            <div className="event-register-trust">

                                <div>

                                    <CheckCircle2
                                        size={14}
                                    />

                                    Easy registration

                                </div>


                                <div>

                                    <ShieldCheck
                                        size={14}
                                    />

                                    Secure checkout

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            QUICK DETAILS
                        ================================================= */}

                        <div className="event-quick-details">

                            <h3>
                                Quick Details
                            </h3>


                            <div>

                                <CalendarDays
                                    size={15}
                                />

                                <span>
                                    {
                                        formattedEventDate
                                    }
                                </span>

                            </div>


                            <div>

                                <MapPin
                                    size={15}
                                />

                                <span>
                                    {event.venue ||
                                        "Venue not available"}
                                </span>

                            </div>


                            <div>

                                <IndianRupee
                                    size={15}
                                />

                                <span>

                                    {isFree
                                        ? "Free registration"
                                        : `₹${registrationFee.toLocaleString(
                                              "en-IN"
                                          )} registration fee`}

                                </span>

                            </div>

                        </div>

                    </aside>

                </div>

            </main>

        </div>
    );
};


export default EventDetailsPage;