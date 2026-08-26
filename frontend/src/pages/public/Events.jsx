import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    MapPin,
    Search,
    ArrowRight,
    RefreshCw,
    Ticket,
} from "lucide-react";

import "./Events.css";

import useApi from "../../hooks/useApi";


const Events = () => {

    const { get, loading, error } = useApi();

    const [events, setEvents] = useState([]);

    const [search, setSearch] = useState("");

    const [filteredEvents, setFilteredEvents] = useState([]);


    // =====================================================
    // LOAD EVENTS
    // =====================================================

    const loadEvents = async () => {

        try {

            const response = await get("/events");

            /*
             * Supports:
             *
             * response = []
             *
             * OR
             *
             * response = {
             *     events: []
             * }
             */

            const data =
                response?.events ||
                response?.data?.events ||
                response?.data ||
                response ||
                [];

            const eventList =
                Array.isArray(data)
                    ? data
                    : [];

            setEvents(eventList);

            setFilteredEvents(eventList);

        } catch (err) {

            console.error(
                "Failed to load events:",
                err
            );

        }

    };


    useEffect(() => {

        loadEvents();

    }, []);


    // =====================================================
    // SEARCH
    // =====================================================

    useEffect(() => {

        const keyword =
            search
                .trim()
                .toLowerCase();

        if (!keyword) {

            setFilteredEvents(events);

            return;
        }

        const result =
            events.filter((event) => {

                const title =
                    event.title ||
                    "";

                const description =
                    event.description ||
                    "";

                const venue =
                    event.venue ||
                    "";

                const hashtags =
                    Array.isArray(event.hashtags)
                        ? event.hashtags.join(" ")
                        : "";

                const text = `
                    ${title}
                    ${description}
                    ${venue}
                    ${hashtags}
                `.toLowerCase();

                return text.includes(keyword);

            });

        setFilteredEvents(result);

    }, [search, events]);


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "Date not available";
        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        ).format(new Date(date));

    };


    // =====================================================
    // CURRENCY
    // =====================================================

    const formatCurrency = (amount) => {

        if (!amount || Number(amount) === 0) {
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


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="events-page">

            <div className="events-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="events-header">

                    <div>

                        <span className="events-eyebrow">
                            EVENTSPHERE
                        </span>

                        <h1>
                            Discover Events
                        </h1>

                        <p>
                            Find exciting events and
                            register for your next experience.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <div className="events-search-box">

                    <Search
                        size={17}
                        className="events-search-icon"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search events, venues, topics..."
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="events-clear-button"
                        >
                            Clear
                        </button>

                    )}

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="events-error">

                        <strong>
                            Unable to load events.
                        </strong>

                        <span>
                            Please check the backend server
                            and try again.
                        </span>

                        <button
                            type="button"
                            onClick={loadEvents}
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>

                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="events-loading">

                        <div className="events-spinner"></div>

                        <p>
                            Loading events...
                        </p>

                    </div>

                ) : (

                    <>

                        {/* =========================================
                            RESULT COUNT
                        ========================================= */}

                        <div className="events-result-header">

                            <div>

                                <strong>
                                    {filteredEvents.length}
                                </strong>

                                <span>
                                    {" "}
                                    {filteredEvents.length === 1
                                        ? "event"
                                        : "events"}{" "}
                                    available
                                </span>

                            </div>

                            <button
                                type="button"
                                onClick={loadEvents}
                                className="events-refresh-button"
                                title="Refresh events"
                            >
                                <RefreshCw size={15} />
                            </button>

                        </div>


                        {/* =========================================
                            EVENTS
                        ========================================= */}

                        {filteredEvents.length === 0 ? (

                            <div className="events-empty">

                                <div className="events-empty-icon">
                                    <CalendarDays size={25} />
                                </div>

                                <h2>
                                    No events found
                                </h2>

                                <p>
                                    {search
                                        ? "Try changing your search."
                                        : "There are no available events right now."
                                    }
                                </p>

                                {search && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        className="events-empty-button"
                                    >
                                        Clear Search
                                    </button>

                                )}

                            </div>

                        ) : (

                            <div className="events-grid">

                                {filteredEvents.map((event) => (

                                    <article
                                        className="public-event-card"
                                        key={
                                            event._id ||
                                            event.id
                                        }
                                    >

                                        {/* Banner */}

                                        <div className="public-event-image">

                                            {event.bannerImageUrl ? (

                                                <img
                                                    src={
                                                        event.bannerImageUrl
                                                    }
                                                    alt={
                                                        event.title ||
                                                        "Event"
                                                    }
                                                />

                                            ) : (

                                                <div className="public-event-placeholder">

                                                    <CalendarDays
                                                        size={35}
                                                    />

                                                </div>

                                            )}

                                            <span className="public-event-status">

                                                {event.status === "closed"
                                                    ? "Closed"
                                                    : "Active"}

                                            </span>

                                        </div>


                                        {/* Content */}

                                        <div className="public-event-content">

                                            <div className="public-event-tags">

                                                {Array.isArray(
                                                    event.hashtags
                                                ) &&
                                                    event.hashtags
                                                        .slice(0, 3)
                                                        .map(
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
                                                                    {tag}
                                                                </span>

                                                            )
                                                        )}

                                            </div>


                                            <h2>
                                                {event.title ||
                                                    "Untitled Event"}
                                            </h2>


                                            <p className="public-event-description">

                                                {event.description ||
                                                    "No description available."}

                                            </p>


                                            {/* Event info */}

                                            <div className="public-event-info">

                                                <div>

                                                    <CalendarDays
                                                        size={14}
                                                    />

                                                    <span>
                                                        {formatDate(
                                                            event.eventDate
                                                        )}
                                                    </span>

                                                </div>


                                                <div>

                                                    <MapPin
                                                        size={14}
                                                    />

                                                    <span>
                                                        {event.venue ||
                                                            "Venue not available"}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* Bottom */}

                                            <div className="public-event-footer">

                                                <div className="public-event-price">

                                                    <Ticket
                                                        size={14}
                                                    />

                                                    <strong>
                                                        {formatCurrency(
                                                            event.registrationFee
                                                        )}
                                                    </strong>

                                                </div>


                                                <Link
                                                    to={`/events/${
                                                        event._id ||
                                                        event.id
                                                    }`}
                                                    className="public-event-button"
                                                >
                                                    View Event

                                                    <ArrowRight
                                                        size={14}
                                                    />

                                                </Link>

                                            </div>

                                        </div>

                                    </article>

                                ))}

                            </div>

                        )}

                    </>

                )}

            </div>

        </div>

    );

};


export default Events;