// =====================================================
// EVENTSPHERE - MANAGE EVENT
// =====================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    Eye,
    IndianRupee,
    MapPin,
    RefreshCw,
    Ticket,
    Users,
    XCircle,
} from "lucide-react";

import eventService from "../../services/eventService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import "./ManageEvent.css";


const ManageEvent = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    // =================================================
    // STATE
    // =================================================

    const [event, setEvent] = useState(null);

    const [statistics, setStatistics] = useState({
        totalRegistrations: 0,
        paidRegistrations: 0,
        pendingPayments: 0,
        totalRevenue: 0,
    });

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [statusLoading, setStatusLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =================================================
    // NORMALIZE API RESPONSE
    // =================================================

    const normalizeEventResponse = (response) => {

        if (!response) {
            return {
                event: null,
                statistics: null,
            };
        }


        /*
         * eventService may return:
         *
         * response
         * response.data
         * response.event
         * response.data.event
         */

        const responseData =
            response?.data || response;


        const eventData =
            response?.event ||
            responseData?.event ||
            responseData;


        const stats =
            response?.statistics ||
            response?.stats ||
            responseData?.statistics ||
            responseData?.stats ||
            eventData?.statistics ||
            eventData?.stats ||
            null;


        return {
            event: eventData,
            statistics: stats,
        };
    };


    // =================================================
    // NORMALIZE STATISTICS
    // =================================================

    const normalizeStatistics = (stats) => {

        if (!stats) {

            return {
                totalRegistrations: 0,
                paidRegistrations: 0,
                pendingPayments: 0,
                totalRevenue: 0,
            };

        }


        return {

            totalRegistrations:
                Number(
                    stats.totalRegistrations ??
                    stats.totalParticipants ??
                    stats.registrations ??
                    stats.registrationCount ??
                    stats.totalCount ??
                    0
                ),

            paidRegistrations:
                Number(
                    stats.paidRegistrations ??
                    stats.paidParticipants ??
                    stats.paidCount ??
                    0
                ),

            pendingPayments:
                Number(
                    stats.pendingPayments ??
                    stats.pendingRegistrations ??
                    stats.pendingCount ??
                    0
                ),

            totalRevenue:
                Number(
                    stats.totalRevenue ??
                    stats.revenue ??
                    stats.totalAmount ??
                    stats.amountPaid ??
                    0
                ),
        };
    };


    // =================================================
    // LOAD EVENT
    // =================================================

    const loadEvent = useCallback(
        async (showRefresh = false) => {

            if (!id) {

                setError(
                    "Event ID is missing."
                );

                setLoading(false);

                return;
            }


            try {

                if (showRefresh) {

                    setRefreshing(true);

                } else {

                    setLoading(true);

                }


                setError("");

                setSuccess("");


                // -------------------------------------------------
                // GET EVENT
                // -------------------------------------------------

                const response =
                    await eventService.getEventById(
                        id
                    );


                // -------------------------------------------------
                // NORMALIZE RESPONSE
                // -------------------------------------------------

                const {
                    event: eventData,
                    statistics: stats,
                } =
                    normalizeEventResponse(
                        response
                    );


                // -------------------------------------------------
                // CHECK EVENT
                // -------------------------------------------------

                if (
                    !eventData ||
                    typeof eventData !== "object" ||
                    !(
                        eventData._id ||
                        eventData.id
                    )
                ) {

                    throw new Error(
                        "Event not found."
                    );

                }


                // -------------------------------------------------
                // SET EVENT
                // -------------------------------------------------

                setEvent(eventData);


                // -------------------------------------------------
                // SET STATISTICS
                // -------------------------------------------------

                if (stats) {

                    setStatistics(
                        normalizeStatistics(
                            stats
                        )
                    );

                } else {

                    /*
                     * Important:
                     *
                     * If backend does not return statistics,
                     * don't keep old statistics from a previous
                     * event/refresh.
                     */

                    setStatistics({
                        totalRegistrations: 0,
                        paidRegistrations: 0,
                        pendingPayments: 0,
                        totalRevenue: 0,
                    });

                }

            } catch (err) {

                console.error(
                    "Manage event load error:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load event."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);

            }

        },
        [id]
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        let mounted = true;


        const load = async () => {

            if (!mounted) {
                return;
            }

            await loadEvent();

        };


        load();


        return () => {

            mounted = false;

        };

    }, [loadEvent]);


    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate = (date) => {

        if (!date) {
            return "Date unavailable";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Date unavailable";

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
    // FORMAT TIME
    // =================================================

    const formatTime = (date) => {

        if (!date) {
            return "Time unavailable";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return "Time unavailable";

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
    // FORMAT CURRENCY
    // =================================================

    const formatCurrency = (amount) => {

        const value =
            Number(amount) || 0;


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
    // EVENT STATUS
    // =================================================

    const isActive =
        event?.status === "active";


    // =================================================
    // REGISTRATION DEADLINE STATUS
    // =================================================

    const deadlineStatus =
        useMemo(() => {

            if (
                !event?.registrationDeadline
            ) {

                return {
                    expired: false,
                    text: "Not available",
                };

            }


            const deadline =
                new Date(
                    event.registrationDeadline
                );


            if (
                Number.isNaN(
                    deadline.getTime()
                )
            ) {

                return {
                    expired: false,
                    text: "Not available",
                };

            }


            const expired =
                deadline.getTime() <
                Date.now();


            return {
                expired,

                text: expired
                    ? "Registration deadline passed"
                    : "Registration is available",
            };

        }, [
            event?.registrationDeadline,
        ]);


    // =================================================
    // VIEW EVENT
    // =================================================

    const handleViewEvent = () => {

        if (!eventId) {
            return;
        }


        navigate(
            `/events/${eventId}`
        );

    };


    // =================================================
    // EDIT EVENT
    // =================================================

    const handleEditEvent = () => {

        if (!eventId) {
            return;
        }


        navigate(
            `/organizer/edit-event/${eventId}`
        );

    };


    // =================================================
    // PARTICIPANTS
    // =================================================

    const handleParticipants = () => {

        if (!eventId) {
            return;
        }


        navigate(
            `/organizer/participants/${eventId}`
        );

    };


    // =================================================
    // TOGGLE EVENT STATUS
    // =================================================

    const handleToggleStatus =
        async () => {

            if (!event) {
                return;
            }


            const nextStatus =
                isActive
                    ? "closed"
                    : "active";


            const confirmed =
                window.confirm(
                    isActive
                        ? "Are you sure you want to close registration for this event?"
                        : "Are you sure you want to reopen registration for this event?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setStatusLoading(true);

                setError("");

                setSuccess("");


                /*
                 * Update event status.
                 */

                const response =
                    await eventService.updateEvent(
                        id,
                        {
                            status:
                                nextStatus,
                        }
                    );


                const responseData =
                    response?.data ||
                    response;


                const updatedEvent =
                    response?.event ||
                    responseData?.event ||
                    (
                        responseData?._id
                            ? responseData
                            : null
                    );


                if (updatedEvent) {

                    setEvent(
                        previous => ({
                            ...previous,
                            ...updatedEvent,
                        })
                    );

                } else {

                    setEvent(
                        previous => ({
                            ...previous,
                            status:
                                nextStatus,
                        })
                    );

                }


                setSuccess(
                    isActive
                        ? "Event registration has been closed."
                        : "Event registration has been reopened."
                );

            } catch (err) {

                console.error(
                    "Toggle event status error:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to update event status."
                );

            } finally {

                setStatusLoading(false);

            }

        };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <main className="manage-event-page">

                <div className="manage-event-state">

                    <Loader />

                    <p>
                        Loading event management...
                    </p>

                </div>

            </main>
        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (error && !event) {

        return (
            <main className="manage-event-page">

                <div className="manage-event-state">

                    <ErrorMessage
                        message={error}
                    />

                    <div className="manage-event-state-actions">

                        <button
                            type="button"
                            className="manage-event-retry"
                            onClick={() =>
                                loadEvent()
                            }
                        >
                            Try Again
                        </button>


                        <button
                            type="button"
                            className="manage-event-back"
                            onClick={() =>
                                navigate(
                                    "/organizer/my-events"
                                )
                            }
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
        event?._id ||
        event?.id ||
        id;


    const banner =
        event?.bannerImageUrl ||
        event?.bannerImage ||
        "";


    // =================================================
    // RENDER
    // =================================================

    return (

        <main className="manage-event-page">

            <div className="manage-event-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="manage-event-header">

                    <div>

                        <button
                            type="button"
                            className="manage-event-back-button"
                            onClick={() =>
                                navigate(
                                    "/organizer/my-events"
                                )
                            }
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Back

                        </button>


                        <span className="manage-event-eyebrow">
                            ORGANIZER
                        </span>


                        <h1>
                            Manage Event
                        </h1>


                        <p>
                            View event information and
                            manage registration.
                        </p>

                    </div>


                    <div className="manage-event-header-actions">

                        <button
                            type="button"
                            className="manage-event-view-button"
                            onClick={
                                handleViewEvent
                            }
                        >

                            <Eye
                                size={15}
                            />

                            View Event

                        </button>


                        <button
                            type="button"
                            className="manage-event-edit-button"
                            onClick={
                                handleEditEvent
                            }
                        >

                            <Edit3
                                size={15}
                            />

                            Edit Event

                        </button>

                    </div>

                </header>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div className="manage-event-message error">

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {success && (

                    <div className="manage-event-message success">

                        <CheckCircle2
                            size={16}
                        />

                        <span>
                            {success}
                        </span>

                    </div>

                )}


                {/* =================================================
                    EVENT HERO
                ================================================= */}

                <section className="manage-event-hero">

                    <div className="manage-event-banner">

                        {banner ? (

                            <img
                                src={banner}
                                alt={
                                    event.title ||
                                    "Event banner"
                                }
                            />

                        ) : (

                            <div className="manage-event-banner-placeholder">
                                EventSphere
                            </div>

                        )}

                    </div>


                    <div className="manage-event-hero-content">

                        <div>

                            <div className="manage-event-status-row">

                                <span
                                    className={
                                        isActive
                                            ? "manage-event-status active"
                                            : "manage-event-status closed"
                                    }
                                >

                                    {isActive
                                        ? "Active"
                                        : "Closed"}

                                </span>


                                {deadlineStatus.expired && (

                                    <span className="manage-event-deadline-expired">

                                        Deadline Passed

                                    </span>

                                )}

                            </div>


                            <h2>
                                {event.title ||
                                    "Untitled Event"}
                            </h2>


                            <p>
                                {event.description ||
                                    "No event description available."}
                            </p>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="manage-event-statistics">

                    <div className="manage-event-stat-card">

                        <div className="manage-event-stat-icon">

                            <Users
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Registrations
                            </span>

                            <strong>
                                {
                                    statistics
                                        .totalRegistrations
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="manage-event-stat-card">

                        <div className="manage-event-stat-icon paid">

                            <CheckCircle2
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Paid
                            </span>

                            <strong>
                                {
                                    statistics
                                        .paidRegistrations
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="manage-event-stat-card">

                        <div className="manage-event-stat-icon pending">

                            <Clock3
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {
                                    statistics
                                        .pendingPayments
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="manage-event-stat-card">

                        <div className="manage-event-stat-icon revenue">

                            <IndianRupee
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Revenue
                            </span>

                            <strong>
                                {formatCurrency(
                                    statistics
                                        .totalRevenue
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="manage-event-grid">

                    {/* =================================================
                        EVENT INFORMATION
                    ================================================= */}

                    <section className="manage-event-card">

                        <div className="manage-event-card-header">

                            <div>

                                <h2>
                                    Event Information
                                </h2>

                                <p>
                                    Important details about
                                    this event.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="manage-event-refresh"
                                onClick={() =>
                                    loadEvent(true)
                                }
                                disabled={
                                    refreshing
                                }
                                title="Refresh"
                            >

                                <RefreshCw
                                    size={15}
                                    className={
                                        refreshing
                                            ? "spinning"
                                            : ""
                                    }
                                />

                            </button>

                        </div>


                        <div className="manage-event-details">

                            <div className="manage-event-detail">

                                <div className="manage-event-detail-icon">

                                    <CalendarDays
                                        size={17}
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

                                    <small>
                                        {formatTime(
                                            event.eventDate
                                        )}
                                    </small>

                                </div>

                            </div>


                            <div className="manage-event-detail">

                                <div className="manage-event-detail-icon">

                                    <MapPin
                                        size={17}
                                    />

                                </div>

                                <div>

                                    <span>
                                        Venue
                                    </span>

                                    <strong>
                                        {event.venue ||
                                            "Venue unavailable"}
                                    </strong>

                                </div>

                            </div>


                            <div className="manage-event-detail">

                                <div className="manage-event-detail-icon">

                                    <Ticket
                                        size={17}
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


                            <div className="manage-event-detail">

                                <div className="manage-event-detail-icon">

                                    <Clock3
                                        size={17}
                                    />

                                </div>

                                <div>

                                    <span>
                                        Registration Deadline
                                    </span>

                                    <strong>
                                        {formatDate(
                                            event.registrationDeadline
                                        )}
                                    </strong>

                                    <small
                                        className={
                                            deadlineStatus.expired
                                                ? "expired"
                                                : "available"
                                        }
                                    >
                                        {
                                            deadlineStatus.text
                                        }
                                    </small>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        MANAGEMENT ACTIONS
                    ================================================= */}

                    <section className="manage-event-card">

                        <div className="manage-event-card-header">

                            <div>

                                <h2>
                                    Event Management
                                </h2>

                                <p>
                                    Manage your event
                                    settings.
                                </p>

                            </div>

                        </div>


                        <div className="manage-event-management-actions">

                            <button
                                type="button"
                                className="manage-event-management-action"
                                onClick={
                                    handleParticipants
                                }
                            >

                                <div className="manage-event-management-icon">

                                    <Users
                                        size={18}
                                    />

                                </div>

                                <div>

                                    <strong>
                                        Participants
                                    </strong>

                                    <span>
                                        View registered
                                        participants
                                    </span>

                                </div>

                            </button>


                            <button
                                type="button"
                                className="manage-event-management-action"
                                onClick={
                                    handleEditEvent
                                }
                            >

                                <div className="manage-event-management-icon">

                                    <Edit3
                                        size={18}
                                    />

                                </div>

                                <div>

                                    <strong>
                                        Edit Event
                                    </strong>

                                    <span>
                                        Update event
                                        information
                                    </span>

                                </div>

                            </button>


                            <button
                                type="button"
                                className={
                                    isActive
                                        ? "manage-event-management-action danger"
                                        : "manage-event-management-action success"
                                }
                                onClick={
                                    handleToggleStatus
                                }
                                disabled={
                                    statusLoading
                                }
                            >

                                <div className="manage-event-management-icon">

                                    {isActive ? (

                                        <XCircle
                                            size={18}
                                        />

                                    ) : (

                                        <CheckCircle2
                                            size={18}
                                        />

                                    )}

                                </div>


                                <div>

                                    <strong>

                                        {statusLoading
                                            ? "Updating..."
                                            : isActive
                                                ? "Close Registration"
                                                : "Reopen Registration"}

                                    </strong>


                                    <span>

                                        {isActive
                                            ? "Stop new registrations"
                                            : "Allow registrations again"}

                                    </span>

                                </div>

                            </button>

                        </div>

                    </section>

                </div>


                {/* =================================================
                    TAGS
                ================================================= */}

                {Array.isArray(
                    event.hashtags
                ) &&
                event.hashtags.length > 0 && (

                    <section className="manage-event-tags-card">

                        <h2>
                            Event Tags
                        </h2>


                        <div>

                            {event.hashtags.map(
                                (tag, index) => (

                                    <span
                                        key={`${tag}-${index}`}
                                    >
                                        #{tag}
                                    </span>

                                )
                            )}

                        </div>

                    </section>

                )}

            </div>

        </main>

    );
};


export default ManageEvent;