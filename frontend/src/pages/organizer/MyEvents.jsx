// =====================================================
// EVENTSPHERE - ORGANIZER MY EVENTS
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
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    ChevronRight,
    Edit3,
    Eye,
    MapPin,
    Plus,
    RefreshCw,
    Search,
} from "lucide-react";

import eventService from "../../services/eventService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import "./MyEvents.css";

const MyEvents = () => {
    const navigate = useNavigate();

    // =================================================
    // STATE
    // =================================================

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // =================================================
    // LOAD ORGANIZER EVENTS
    // =================================================

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await eventService.getMyEvents();

            /*
             * Support common response formats:
             *
             * { events: [] }
             * { data: { events: [] } }
             * []
             */

            const data =
                response?.events ||
                response?.data?.events ||
                response?.data ||
                response;

            setEvents(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load organizer events:",
                err?.response?.data ||
                    err?.message ||
                    err
            );

            setError(
                err?.response?.data?.message ||
                    "Unable to load your events."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }

        const parsedDate = new Date(date);

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
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =================================================
    // FORMAT TIME
    // =================================================

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
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
    // FILTER EVENTS
    // =================================================

    const filteredEvents = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return events.filter((event) => {
            const title = String(
                event.title || ""
            ).toLowerCase();

            const venue = String(
                event.venue || ""
            ).toLowerCase();

            const hashtags =
                Array.isArray(
                    event.hashtags
                )
                    ? event.hashtags
                          .join(" ")
                          .toLowerCase()
                    : "";

            const matchesSearch =
                !query ||
                title.includes(query) ||
                venue.includes(query) ||
                hashtags.includes(query);

            const status =
                event.status || "active";

            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        events,
        search,
        statusFilter,
    ]);

    // =================================================
    // STATS
    // =================================================

    const statistics = useMemo(() => {
        const total = events.length;

        const active = events.filter(
            (event) =>
                event.status === "active"
        ).length;

        const closed = events.filter(
            (event) =>
                event.status === "closed"
        ).length;

        return {
            total,
            active,
            closed,
        };
    }, [events]);

    // =================================================
    // BACK TO ORGANIZER DASHBOARD
    // =================================================

    const handleBackToDashboard = () => {
        navigate("/organizer/dashboard");
    };

    // =================================================
    // VIEW EVENT / PARTICIPANTS
    // =================================================

    const handleView = (id) => {
        if (!id) {
            console.error(
                "Cannot open participants page: Event ID is missing."
            );
            return;
        }

        /*
         * View opens the organizer participant page.
         *
         * IMPORTANT:
         * /events/:id = public participant event page
         *
         * /organizer/participants/:eventId
         * = organizer participant page
         */

        navigate(
            `/organizer/participants/${id}`
        );
    };

    // =================================================
    // MANAGE EVENT
    // =================================================

    const handleManage = (id) => {
        if (!id) {
            console.error(
                "Cannot manage event: Event ID is missing."
            );
            return;
        }

        navigate(
            `/organizer/manage-event/${id}`
        );
    };

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <main className="my-events-page">
                <div className="my-events-state">
                    <Loader />

                    <p>
                        Loading your events...
                    </p>
                </div>
            </main>
        );
    }

    // =================================================
    // RENDER
    // =================================================

    return (
        <main className="my-events-page">
            <div className="my-events-container">

                {/* =================================================
                    HEADER
                    ================================================= */}

                <header className="my-events-header">

                    <div className="my-events-header-left">

                        {/* BACK BUTTON */}

                        <button
                            type="button"
                            className="my-events-back-button"
                            onClick={
                                handleBackToDashboard
                            }
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Back to Dashboard
                        </button>

                        <span className="my-events-eyebrow">
                            ORGANIZER
                        </span>

                        <h1>
                            My Events
                        </h1>

                        <p>
                            Create, manage and monitor
                            your EventSphere events.
                        </p>

                    </div>

                    {/* CREATE EVENT */}

                    <Link
                        to="/organizer/create-event"
                        className="my-events-create-button"
                    >
                        <Plus size={17} />

                        Create Event
                    </Link>

                </header>

                {/* =================================================
                    ERROR
                    ================================================= */}

                {error && (
                    <div className="my-events-error">

                        <ErrorMessage
                            message={error}
                        />

                        <button
                            type="button"
                            onClick={loadEvents}
                            className="my-events-retry"
                        >
                            <RefreshCw
                                size={14}
                            />

                            Retry
                        </button>

                    </div>
                )}

                {/* =================================================
                    STATISTICS
                    ================================================= */}

                <div className="my-events-stats">

                    {/* TOTAL */}

                    <div className="my-events-stat-card">

                        <div className="my-events-stat-icon">
                            <CalendarDays
                                size={18}
                            />
                        </div>

                        <div>
                            <span>
                                Total Events
                            </span>

                            <strong>
                                {statistics.total}
                            </strong>
                        </div>

                    </div>

                    {/* ACTIVE */}

                    <div className="my-events-stat-card">

                        <div className="my-events-stat-icon active">
                            <Eye size={18} />
                        </div>

                        <div>
                            <span>
                                Active Events
                            </span>

                            <strong>
                                {statistics.active}
                            </strong>
                        </div>

                    </div>

                    {/* CLOSED */}

                    <div className="my-events-stat-card">

                        <div className="my-events-stat-icon closed">
                            <CalendarDays
                                size={18}
                            />
                        </div>

                        <div>
                            <span>
                                Closed Events
                            </span>

                            <strong>
                                {statistics.closed}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* =================================================
                    FILTER BAR
                    ================================================= */}

                <div className="my-events-toolbar">

                    <div className="my-events-search">

                        <Search size={16} />

                        <input
                            type="search"
                            placeholder="Search your events..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <div className="my-events-filters">

                        <button
                            type="button"
                            className={
                                statusFilter === "all"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "all"
                                )
                            }
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={
                                statusFilter === "active"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "active"
                                )
                            }
                        >
                            Active
                        </button>

                        <button
                            type="button"
                            className={
                                statusFilter === "closed"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "closed"
                                )
                            }
                        >
                            Closed
                        </button>

                    </div>

                    <button
                        type="button"
                        className="my-events-refresh"
                        onClick={loadEvents}
                        title="Refresh events"
                    >
                        <RefreshCw
                            size={16}
                        />
                    </button>

                </div>

                {/* =================================================
                    EVENTS
                    ================================================= */}

                {filteredEvents.length === 0 ? (

                    <section className="my-events-empty">

                        <div className="my-events-empty-icon">
                            <CalendarDays
                                size={25}
                            />
                        </div>

                        <h2>
                            {events.length === 0
                                ? "No events yet"
                                : "No matching events"}
                        </h2>

                        <p>
                            {events.length === 0
                                ? "Create your first event and start accepting registrations."
                                : "Try changing your search or status filter."}
                        </p>

                        {events.length === 0 && (
                            <Link
                                to="/organizer/create-event"
                                className="my-events-empty-button"
                            >
                                <Plus size={16} />

                                Create Your First Event
                            </Link>
                        )}

                    </section>

                ) : (

                    <div className="my-events-grid">

                        {filteredEvents.map(
                            (event) => {

                                const eventId =
                                    event._id ||
                                    event.id;

                                const status =
                                    event.status ||
                                    "active";

                                const banner =
                                    event.bannerImageUrl ||
                                    event.bannerImage ||
                                    "";

                                return (
                                    <article
                                        key={eventId}
                                        className="my-event-card"
                                    >

                                        {/* IMAGE */}

                                        <div className="my-event-image">

                                            {banner ? (

                                                <img
                                                    src={banner}
                                                    alt={
                                                        event.title ||
                                                        "Event"
                                                    }
                                                />

                                            ) : (

                                                <div className="my-event-image-placeholder">
                                                    EventSphere
                                                </div>

                                            )}

                                            <span
                                                className={
                                                    status ===
                                                    "active"
                                                        ? "my-event-status active"
                                                        : "my-event-status closed"
                                                }
                                            >
                                                {status ===
                                                "active"
                                                    ? "Active"
                                                    : "Closed"}
                                            </span>

                                        </div>

                                        {/* CONTENT */}

                                        <div className="my-event-content">

                                            <div className="my-event-title-row">

                                                <h2>
                                                    {event.title ||
                                                        "Untitled Event"}
                                                </h2>

                                            </div>

                                            <div className="my-event-meta">

                                                <span>
                                                    <CalendarDays
                                                        size={14}
                                                    />

                                                    {formatDate(
                                                        event.eventDate
                                                    )}

                                                    {event.eventDate &&
                                                        ` · ${formatTime(
                                                            event.eventDate
                                                        )}`}
                                                </span>

                                                <span>
                                                    <MapPin
                                                        size={14}
                                                    />

                                                    {event.venue ||
                                                        "Venue unavailable"}
                                                </span>

                                            </div>

                                            <div className="my-event-bottom">

                                                <strong>
                                                    {formatCurrency(
                                                        event.registrationFee
                                                    )}
                                                </strong>

                                                <div className="my-event-actions">

                                                    {/* VIEW / PARTICIPANTS */}

                                                    <button
                                                        type="button"
                                                        className="my-event-view"
                                                        onClick={() =>
                                                            handleView(
                                                                eventId
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={14}
                                                        />

                                                        View
                                                    </button>

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        className="my-event-edit"
                                                        onClick={() =>
                                                            navigate(
                                                                `/organizer/edit-event/${eventId}`
                                                            )
                                                        }
                                                    >
                                                        <Edit3
                                                            size={14}
                                                        />

                                                        Edit
                                                    </button>

                                                    {/* MANAGE */}

                                                    <button
                                                        type="button"
                                                        className="my-event-manage"
                                                        onClick={() =>
                                                            handleManage(
                                                                eventId
                                                            )
                                                        }
                                                    >
                                                        Manage

                                                        <ChevronRight
                                                            size={14}
                                                        />
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

            </div>
        </main>
    );
};

export default MyEvents;