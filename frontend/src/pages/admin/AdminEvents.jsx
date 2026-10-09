// frontend/src/pages/admin/AdminEvents.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

const AdminEvents = () => {
    // ============================================================
    // STATE
    // ============================================================

    const [events, setEvents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedEvent, setSelectedEvent] =
        useState(null);


    // ============================================================
    // GET AUTH TOKEN
    // ============================================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("jwt")
        );
    };


    // ============================================================
    // FETCH EVENTS
    // ============================================================

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError(
                    "Admin authentication token not found. Please login again."
                );

                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/events`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setEvents(
                    Array.isArray(response.data.events)
                        ? response.data.events
                        : []
                );
            } else {
                setEvents([]);

                setError(
                    response.data?.message ||
                        "Failed to fetch events."
                );
            }

        } catch (err) {
            console.error(
                "Admin Events Error:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Authentication failed. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "Access denied. Admin privileges are required."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        "Unable to load events."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // LOAD EVENTS
    // ============================================================

    useEffect(() => {
        fetchEvents();
    }, []);


    // ============================================================
    // FILTER EVENTS
    // ============================================================

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {

            const title =
                event.title ||
                event.name ||
                "";

            const venue =
                event.venue ||
                "";

            const organizerName =
                event.organizerId?.name ||
                event.organizer?.name ||
                "";

            const searchText =
                `${title} ${venue} ${organizerName}`
                    .toLowerCase();

            const matchesSearch =
                searchText.includes(
                    search.toLowerCase()
                );

            const eventStatus =
                String(
                    event.status || ""
                ).toLowerCase();

            const matchesStatus =
                statusFilter === "all" ||
                eventStatus === statusFilter;

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


    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
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


    // ============================================================
    // FORMAT TIME
    // ============================================================

    const formatTime = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

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


    // ============================================================
    // FORMAT CURRENCY
    // ============================================================

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


    // ============================================================
    // GET STATUS CLASS
    // ============================================================

    const getStatusClass = (status) => {
        switch (
            String(status || "")
                .toLowerCase()
        ) {
            case "active":
                return "status-active";

            case "closed":
                return "status-closed";

            case "cancelled":
            case "canceled":
                return "status-cancelled";

            default:
                return "status-default";
        }
    };


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalEvents =
        events.length;

    const activeEvents =
        events.filter(
            (event) =>
                String(event.status)
                    .toLowerCase() ===
                "active"
        ).length;

    const closedEvents =
        events.filter(
            (event) =>
                String(event.status)
                    .toLowerCase() ===
                "closed"
        ).length;


    // ============================================================
    // LOADING STATE
    // ============================================================

    if (loading) {
        return (
            <div className="admin-events-page">

                <div className="admin-events-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading events...
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="admin-events-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-events-header">

                <div>
                    <h1>
                        Event Management
                    </h1>

                    <p>
                        View and monitor all
                        EventSphere events.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-btn"
                    onClick={fetchEvents}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="admin-events-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={fetchEvents}
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="event-stat-cards">

                <div className="event-stat-card">

                    <div className="stat-icon">
                        📅
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


                <div className="event-stat-card">

                    <div className="stat-icon">
                        ✓
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


                <div className="event-stat-card">

                    <div className="stat-icon">
                        ◷
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

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="event-filters">

                <div className="search-box">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search events, venue or organizer..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(
                            event.target.value
                        )
                    }
                >
                    <option value="all">
                        All Status
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="closed">
                        Closed
                    </option>

                    <option value="cancelled">
                        Cancelled
                    </option>
                </select>

            </div>


            {/* ==================================================
                EVENTS TABLE
            ================================================== */}

            <div className="events-table-container">

                <table className="events-table">

                    <thead>

                        <tr>

                            <th>
                                Event
                            </th>

                            <th>
                                Organizer
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Venue
                            </th>

                            <th>
                                Fee
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredEvents.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="empty-events"
                                >
                                    No events found.
                                </td>

                            </tr>

                        ) : (

                            filteredEvents.map(
                                (event) => {

                                    const organizer =
                                        event.organizerId ||
                                        event.organizer ||
                                        {};

                                    return (

                                        <tr
                                            key={
                                                event._id ||
                                                event.id
                                            }
                                        >

                                            {/* Event */}

                                            <td>

                                                <div className="event-name">

                                                    {event.bannerImageUrl && (
                                                        <img
                                                            src={
                                                                event.bannerImageUrl
                                                            }
                                                            alt={
                                                                event.title ||
                                                                "Event"
                                                            }
                                                            className="event-image"
                                                        />
                                                    )}

                                                    <div>

                                                        <strong>
                                                            {
                                                                event.title ||
                                                                "Untitled Event"
                                                            }
                                                        </strong>

                                                        {event.hashtags?.length >
                                                            0 && (

                                                            <small>
                                                                {event.hashtags
                                                                    .map(
                                                                        (
                                                                            tag
                                                                        ) =>
                                                                            `#${String(
                                                                                tag
                                                                            ).replace(
                                                                                /^#/,
                                                                                ""
                                                                            )}`
                                                                    )
                                                                    .join(
                                                                        " "
                                                                    )}
                                                            </small>

                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Organizer */}

                                            <td>

                                                <div className="organizer-info">

                                                    <strong>
                                                        {
                                                            organizer.name ||
                                                            "Unknown"
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            organizer.email ||
                                                            "—"
                                                        }
                                                    </small>

                                                </div>

                                            </td>


                                            {/* Date */}

                                            <td>

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

                                            </td>


                                            {/* Venue */}

                                            <td>
                                                {
                                                    event.venue ||
                                                    "—"
                                                }
                                            </td>


                                            {/* Fee */}

                                            <td>

                                                {formatCurrency(
                                                    event.registrationFee
                                                )}

                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={`event-status ${getStatusClass(
                                                        event.status
                                                    )}`}
                                                >
                                                    {
                                                        event.status ||
                                                        "Unknown"
                                                    }
                                                </span>

                                            </td>


                                            {/* Action */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-event-btn"
                                                    onClick={() =>
                                                        setSelectedEvent(
                                                            event
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>

                                        </tr>

                                    );
                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* ==================================================
                RESULTS
            ================================================== */}

            <div className="event-results-count">

                Showing{" "}

                <strong>
                    {filteredEvents.length}
                </strong>

                {" "}of{" "}

                <strong>
                    {events.length}
                </strong>

                {" "}events

            </div>


            {/* ==================================================
                EVENT DETAILS MODAL
            ================================================== */}

            {selectedEvent && (

                <div
                    className="event-modal-overlay"
                    onClick={() =>
                        setSelectedEvent(null)
                    }
                >

                    <div
                        className="event-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="event-modal-header">

                            <h2>
                                {
                                    selectedEvent.title ||
                                    "Event Details"
                                }
                            </h2>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedEvent(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="event-modal-body">

                            {selectedEvent.bannerImageUrl && (

                                <img
                                    src={
                                        selectedEvent.bannerImageUrl
                                    }
                                    alt={
                                        selectedEvent.title
                                    }
                                    className="modal-event-image"
                                />

                            )}


                            <div className="event-detail">

                                <strong>
                                    Description
                                </strong>

                                <p>
                                    {
                                        selectedEvent.description ||
                                        "No description available."
                                    }
                                </p>

                            </div>


                            <div className="event-detail-grid">

                                <div className="event-detail">

                                    <strong>
                                        Organizer
                                    </strong>

                                    <p>
                                        {
                                            selectedEvent
                                                .organizerId
                                                ?.name ||
                                            selectedEvent
                                                .organizer
                                                ?.name ||
                                            "Unknown"
                                        }
                                    </p>

                                </div>


                                <div className="event-detail">

                                    <strong>
                                        Email
                                    </strong>

                                    <p>
                                        {
                                            selectedEvent
                                                .organizerId
                                                ?.email ||
                                            selectedEvent
                                                .organizer
                                                ?.email ||
                                            "—"
                                        }
                                    </p>

                                </div>


                                <div className="event-detail">

                                    <strong>
                                        Date
                                    </strong>

                                    <p>
                                        {
                                            formatDate(
                                                selectedEvent.eventDate
                                            )
                                        }
                                    </p>

                                </div>


                                <div className="event-detail">

                                    <strong>
                                        Venue
                                    </strong>

                                    <p>
                                        {
                                            selectedEvent.venue ||
                                            "—"
                                        }
                                    </p>

                                </div>


                                <div className="event-detail">

                                    <strong>
                                        Registration Fee
                                    </strong>

                                    <p>
                                        {
                                            formatCurrency(
                                                selectedEvent.registrationFee
                                            )
                                        }
                                    </p>

                                </div>


                                <div className="event-detail">

                                    <strong>
                                        Status
                                    </strong>

                                    <p>
                                        {
                                            selectedEvent.status ||
                                            "—"
                                        }
                                    </p>

                                </div>

                            </div>


                            {selectedEvent.hashtags?.length >
                                0 && (

                                <div className="event-detail">

                                    <strong>
                                        Hashtags
                                    </strong>

                                    <div className="event-tags">

                                        {selectedEvent.hashtags.map(
                                            (
                                                tag,
                                                index
                                            ) => (

                                                <span
                                                    key={
                                                        index
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

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminEvents;