// =====================================================
// EVENTSPHERE - PUBLIC EVENTS PAGE
// =====================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import EventSearch from "../../components/events/EventSearch";
import EventFilter from "../../components/events/EventFilter";
import EventList from "../../components/events/EventList";

import eventService from "../../services/eventService";

import "./Events.css";


const Events = () => {

    // =================================================
    // STATE
    // =================================================

    const [events, setEvents] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedHashtag, setSelectedHashtag] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =================================================
    // LOAD EVENTS
    // =================================================

    const loadEvents = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");

                /*
                 * Request all events.
                 *
                 * Search/filtering is handled
                 * on the frontend for now.
                 */
                const response =
                    await eventService.getEvents();


                /*
                 * Support different backend
                 * response structures.
                 */

                const data =
                    response?.events ||
                    response?.data?.events ||
                    response?.data ||
                    response;


                if (Array.isArray(data)) {

                    setEvents(data);

                } else {

                    setEvents([]);

                }

            } catch (err) {

                console.error(
                    "Failed to load events:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load events. Please try again."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadEvents();

    }, [loadEvents]);


    // =================================================
    // AVAILABLE HASHTAGS
    // =================================================

    const availableHashtags = useMemo(() => {

        const tags = [];

        events.forEach((event) => {

            if (
                Array.isArray(event.hashtags)
            ) {

                event.hashtags.forEach(
                    (tag) => {

                        if (tag) {
                            tags.push(
                                String(tag)
                                    .trim()
                                    .replace(/^#/, "")
                            );
                        }

                    }
                );

            }

        });


        return [
            ...new Set(tags),
        ].sort();

    }, [events]);


    // =================================================
    // FILTER EVENTS
    // =================================================

    const filteredEvents = useMemo(() => {

        const normalizedSearch =
            search
                .trim()
                .toLowerCase();


        return events.filter(
            (event) => {

                // -----------------------------------------
                // SEARCH
                // -----------------------------------------

                if (normalizedSearch) {

                    const title =
                        String(
                            event.title || ""
                        ).toLowerCase();

                    const description =
                        String(
                            event.description || ""
                        ).toLowerCase();

                    const venue =
                        String(
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
                        title.includes(
                            normalizedSearch
                        ) ||
                        description.includes(
                            normalizedSearch
                        ) ||
                        venue.includes(
                            normalizedSearch
                        ) ||
                        hashtags.includes(
                            normalizedSearch
                        );


                    if (!matchesSearch) {
                        return false;
                    }

                }


                // -----------------------------------------
                // HASHTAG FILTER
                // -----------------------------------------

                if (selectedHashtag) {

                    const eventHashtags =
                        Array.isArray(
                            event.hashtags
                        )
                            ? event.hashtags.map(
                                (tag) =>
                                    String(tag)
                                        .trim()
                                        .replace(
                                            /^#/,
                                            ""
                                        )
                                        .toLowerCase()
                            )
                            : [];


                    if (
                        !eventHashtags.includes(
                            selectedHashtag
                                .toLowerCase()
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );

    }, [
        events,
        search,
        selectedHashtag,
    ]);


    // =================================================
    // CLEAR SEARCH
    // =================================================

    const clearSearch = () => {

        setSearch("");

    };


    // =================================================
    // CLEAR ALL FILTERS
    // =================================================

    const clearFilters = () => {

        setSearch("");

        setSelectedHashtag("");

    };


    // =================================================
    // RENDER
    // =================================================

    return (

        <main className="events-page">

            {/* =================================================
                HERO / HEADER
                ================================================= */}

            <section className="events-page-header">

                <div className="events-page-header-content">

                    <span className="events-page-eyebrow">
                        EVENTSPHERE
                    </span>

                    <h1>
                        Discover Events
                    </h1>

                    <p>
                        Find exciting events,
                        workshops, hackathons,
                        conferences, and more.
                    </p>

                </div>

            </section>


            {/* =================================================
                CONTENT
                ================================================= */}

            <section className="events-page-content">

                {/* =================================================
                    SEARCH
                    ================================================= */}

                <div className="events-search-section">

                    <EventSearch
                        value={search}
                        onChange={setSearch}
                        onClear={clearSearch}
                        placeholder="Search events, venues, hashtags..."
                    />

                </div>


                {/* =================================================
                    MAIN CONTENT
                    ================================================= */}

                <div className="events-layout">

                    {/* =================================================
                        FILTER SIDEBAR
                        ================================================= */}

                    <aside className="events-filter-sidebar">

                        <EventFilter
                            selectedHashtag={
                                selectedHashtag
                            }
                            onHashtagChange={
                                setSelectedHashtag
                            }
                            hashtags={
                                availableHashtags
                            }
                        />

                    </aside>


                    {/* =================================================
                        EVENTS
                        ================================================= */}

                    <div className="events-results">

                        {/* RESULTS HEADER */}

                        <div className="events-results-header">

                            <div>

                                <h2>
                                    All Events
                                </h2>

                                {!loading && (
                                    <p>
                                        {filteredEvents.length}{" "}
                                        {filteredEvents.length === 1
                                            ? "event"
                                            : "events"}{" "}
                                        found
                                    </p>
                                )}

                            </div>


                            {(search ||
                                selectedHashtag) && (

                                <button
                                    type="button"
                                    className="events-clear-filters"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Clear Filters
                                </button>

                            )}

                        </div>


                        {/* EVENT LIST */}

                        <EventList
                            events={
                                filteredEvents
                            }
                            loading={loading}
                            error={error}
                            onRetry={
                                loadEvents
                            }
                        />

                    </div>

                </div>

            </section>

        </main>

    );
};


export default Events;