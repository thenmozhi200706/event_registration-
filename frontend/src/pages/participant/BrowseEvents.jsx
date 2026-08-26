import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    Clock3,
    MapPin,
    Search,
    RefreshCw,
    ArrowRight,
    Ticket,
    AlertCircle,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

import eventService from "../../services/eventService";

import "./BrowseEvents.css";


/*
 * ============================================================
 * EVENTSPHERE — BROWSE EVENTS
 * ============================================================
 *
 * Participant can:
 *
 * 1. View available events
 * 2. Search events
 * 3. Filter events
 * 4. View event details
 * 5. Refresh events
 *
 * ============================================================
 */


const BrowseEvents = () => {

    /*
     * ========================================================
     * STATE
     * ========================================================
     */

    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("all");


    /*
     * ========================================================
     * LOAD EVENTS
     * ========================================================
     */

    const loadEvents = useCallback(
        async (isRefresh = false) => {

            try {

                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");


                /*
                 * Use the existing event service.
                 */

                const response =
                    await eventService.getEvents();


                /*
                 * Support different backend
                 * response structures.
                 */

                const data =
                    response?.data ?? response;


                let eventData = [];


                if (Array.isArray(data)) {

                    eventData = data;

                } else if (
                    Array.isArray(data?.events)
                ) {

                    eventData = data.events;

                } else if (
                    Array.isArray(data?.data)
                ) {

                    eventData = data.data;

                } else if (
                    Array.isArray(data?.results)
                ) {

                    eventData = data.results;

                }


                setEvents(eventData);

            } catch (err) {

                console.error(
                    "Failed to load events:",
                    err
                );

                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load events.";

                setError(message);

            } finally {

                setLoading(false);

                setRefreshing(false);
            }

        },
        []
    );


    /*
     * ========================================================
     * INITIAL LOAD
     * ========================================================
     */

    useEffect(() => {

        loadEvents();

    }, [loadEvents]);


    /*
     * ========================================================
     * EVENT HELPERS
     * ========================================================
     */

    const getEventName = (event) => {

        return (
            event?.title ||
            event?.name ||
            "Untitled Event"
        );
    };


    const getEventId = (event) => {

        return (
            event?._id ||
            event?.id
        );
    };


    const getEventImage = (event) => {

        return (
            event?.image ||
            event?.imageUrl ||
            event?.bannerImage ||
            event?.coverImage ||
            ""
        );
    };


    const getEventLocation = (event) => {

        return (
            event?.venue ||
            event?.location ||
            event?.place ||
            "Location not available"
        );
    };


    const getEventDate = (event) => {

        return (
            event?.date ||
            event?.eventDate ||
            event?.startDate ||
            null
        );
    };


    const getEventTime = (event) => {

        return (
            event?.time ||
            event?.eventTime ||
            ""
        );
    };


    const getEventPrice = (event) => {

        const price =
            event?.price ??
            event?.registrationFee ??
            event?.fee ??
            0;


        const numericPrice =
            Number(price);


        if (
            Number.isNaN(numericPrice) ||
            numericPrice <= 0
        ) {
            return "Free";
        }


        return `₹${numericPrice.toLocaleString(
            "en-IN"
        )}`;
    };


    const getEventStatus = (event) => {

        const status =
            String(
                event?.status ||
                "active"
            ).toLowerCase();


        if (
            [
                "closed",
                "cancelled",
                "canceled",
                "inactive",
            ].includes(status)
        ) {
            return "closed";
        }


        return "active";
    };


    /*
     * ========================================================
     * FORMAT DATE
     * ========================================================
     */

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
            return String(date);
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
     * ========================================================
     * FILTER EVENTS
     * ========================================================
     */

    const filteredEvents =
        useMemo(() => {

            const search =
                searchTerm
                    .trim()
                    .toLowerCase();


            return events.filter(
                (event) => {

                    const name =
                        getEventName(
                            event
                        ).toLowerCase();

                    const location =
                        getEventLocation(
                            event
                        ).toLowerCase();


                    const matchesSearch =
                        !search ||
                        name.includes(search) ||
                        location.includes(search);


                    const status =
                        getEventStatus(
                            event
                        );


                    const matchesFilter =
                        activeFilter === "all" ||
                        status === activeFilter;


                    return (
                        matchesSearch &&
                        matchesFilter
                    );
                }
            );

        }, [
            events,
            searchTerm,
            activeFilter,
        ]);


    /*
     * ========================================================
     * STATISTICS
     * ========================================================
     */

    const totalEvents =
        events.length;


    const activeEvents =
        events.filter(
            (event) =>
                getEventStatus(event) ===
                "active"
        ).length;


    const closedEvents =
        events.filter(
            (event) =>
                getEventStatus(event) ===
                "closed"
        ).length;


    /*
     * ========================================================
     * LOADING STATE
     * ========================================================
     */

    if (loading) {

        return (

            <div className="browse-events-page">

                <div className="browse-events-state">

                    <RefreshCw
                        size={30}
                        className="browse-events-spinner"
                    />

                    <h2>
                        Loading events
                    </h2>

                    <p>
                        Finding the latest
                        EventSphere events for you.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * ========================================================
     * MAIN PAGE
     * ========================================================
     */

    return (

        <div className="browse-events-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="browse-events-header">

                <div>

                    <span className="browse-events-eyebrow">
                        EVENTSPHERE
                    </span>

                    <h1>
                        Browse Events
                    </h1>

                    <p>
                        Discover events, register easily,
                        and create memorable experiences.
                    </p>

                </div>


                <button
                    type="button"
                    className="browse-events-refresh"
                    onClick={() =>
                        loadEvents(true)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={14}
                        className={
                            refreshing
                                ? "refreshing"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"
                    }

                </button>

            </header>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="browse-events-error">

                    <AlertCircle
                        size={19}
                    />

                    <div>

                        <strong>
                            Unable to load events
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadEvents()
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="browse-events-stats">

                <div className="browse-stat-card">

                    <div className="browse-stat-icon purple">

                        <Ticket size={18} />

                    </div>

                    <div>

                        <span>
                            Total Events
                        </span>

                        <strong>
                            {totalEvents}
                        </strong>

                    </div>

                </div>


                <div className="browse-stat-card">

                    <div className="browse-stat-icon green">

                        <CalendarDays size={18} />

                    </div>

                    <div>

                        <span>
                            Active Events
                        </span>

                        <strong>
                            {activeEvents}
                        </strong>

                    </div>

                </div>


                <div className="browse-stat-card">

                    <div className="browse-stat-icon red">

                        <Clock3 size={18} />

                    </div>

                    <div>

                        <span>
                            Closed Events
                        </span>

                        <strong>
                            {closedEvents}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ==================================================
                SEARCH + FILTER
            ================================================== */}

            <section className="browse-events-toolbar">

                <div className="browse-events-search">

                    <Search size={16} />

                    <input
                        type="text"
                        placeholder="Search events or locations..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="browse-events-filters">

                    <button
                        type="button"
                        className={
                            activeFilter === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("all")
                        }
                    >
                        All
                    </button>


                    <button
                        type="button"
                        className={
                            activeFilter === "active"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("active")
                        }
                    >
                        Active
                    </button>


                    <button
                        type="button"
                        className={
                            activeFilter === "closed"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveFilter("closed")
                        }
                    >
                        Closed
                    </button>

                </div>

            </section>


            {/* ==================================================
                EVENTS
            ================================================== */}

            {filteredEvents.length > 0 ? (

                <section className="browse-events-grid">

                    {filteredEvents.map(
                        (
                            event,
                            index
                        ) => {

                            const eventId =
                                getEventId(event);

                            const eventName =
                                getEventName(event);

                            const image =
                                getEventImage(event);

                            const location =
                                getEventLocation(event);

                            const date =
                                getEventDate(event);

                            const time =
                                getEventTime(event);

                            const price =
                                getEventPrice(event);

                            const status =
                                getEventStatus(event);


                            return (

                                <article
                                    className="browse-event-card"
                                    key={
                                        eventId ||
                                        index
                                    }
                                >

                                    {/* IMAGE */}

                                    <div className="browse-event-image">

                                        {image ? (

                                            <img
                                                src={image}
                                                alt={eventName}
                                                loading="lazy"
                                            />

                                        ) : (

                                            <div className="browse-event-placeholder">

                                                <CalendarDays
                                                    size={32}
                                                />

                                            </div>

                                        )}


                                        <span
                                            className={
                                                `browse-event-status ${status}`
                                            }
                                        >
                                            {status === "active"
                                                ? "Active"
                                                : "Closed"
                                            }
                                        </span>

                                    </div>


                                    {/* CONTENT */}

                                    <div className="browse-event-content">

                                        <span className="browse-event-label">
                                            EVENT
                                        </span>

                                        <h2>
                                            {eventName}
                                        </h2>


                                        <div className="browse-event-info">

                                            <div>

                                                <CalendarDays
                                                    size={13}
                                                />

                                                <span>
                                                    {formatDate(
                                                        date
                                                    )}
                                                </span>

                                            </div>


                                            {time && (

                                                <div>

                                                    <Clock3
                                                        size={13}
                                                    />

                                                    <span>
                                                        {time}
                                                    </span>

                                                </div>

                                            )}


                                            <div>

                                                <MapPin
                                                    size={13}
                                                />

                                                <span>
                                                    {location}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="browse-event-footer">

                                            <strong>
                                                {price}
                                            </strong>


                                            {eventId ? (

                                                <Link
                                                    to={
                                                        `/events/${eventId}`
                                                    }
                                                    className="browse-event-button"
                                                >

                                                    View Event

                                                    <ArrowRight
                                                        size={14}
                                                    />

                                                </Link>

                                            ) : (

                                                <span className="browse-event-button disabled">
                                                    View Event
                                                </span>

                                            )}

                                        </div>

                                    </div>

                                </article>

                            );
                        }
                    )}

                </section>

            ) : (

                /* ==================================================
                   EMPTY STATE
                   ================================================== */

                <section className="browse-events-empty">

                    <div className="browse-events-empty-icon">

                        <Search size={27} />

                    </div>


                    <h2>
                        No events found
                    </h2>

                    <p>
                        {events.length === 0
                            ? "There are no events available right now."
                            : "Try changing your search or filter."
                        }
                    </p>


                    {events.length > 0 && (

                        <button
                            type="button"
                            className="browse-events-clear"
                            onClick={() => {

                                setSearchTerm("");

                                setActiveFilter(
                                    "all"
                                );

                            }}
                        >
                            Clear Filters
                        </button>

                    )}

                </section>

            )}

        </div>
    );
};


export default BrowseEvents;