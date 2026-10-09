// =====================================================
// EVENTSPHERE - ORGANIZER REGISTRATIONS
// =====================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Download,
    Mail,
    Phone,
    RefreshCw,
    Search,
    Users,
    XCircle,
} from "lucide-react";

import eventService from "../../services/eventService";

import {
    getOrganizerDashboard,
} from "../../services/organizerService";

import OrganizerSidebar from "../../components/organizer/OrganizerSidebar";

import OrganizerHeader from "../../components/organizer/OrganizerHeader";

import "./OrganizerRegistrations.css";


// =====================================================
// COMPONENT
// =====================================================

const OrganizerRegistrations = () => {

    // =================================================
    // STATE
    // =================================================

    const [events, setEvents] = useState([]);

    const [selectedEventId, setSelectedEventId] =
        useState("");

    const [registrations, setRegistrations] =
        useState([]);

    const [loadingEvents, setLoadingEvents] =
        useState(true);

    const [loadingRegistrations, setLoadingRegistrations] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);


    // =================================================
    // LOAD ORGANIZER EVENTS
    // =================================================

    const loadEvents = useCallback(
        async () => {

            try {

                setLoadingEvents(true);

                setError("");


                const response =
                    await eventService.getMyEvents();


                console.log(
                    "Organizer events response:",
                    response
                );


                const data =
                    response?.events ||
                    response?.data?.events ||
                    response?.data ||
                    response;


                const eventList =
                    Array.isArray(data)
                        ? data
                        : [];


                setEvents(eventList);


                // -----------------------------------------
                // SELECT FIRST EVENT AUTOMATICALLY
                // -----------------------------------------

                if (
                    eventList.length > 0
                ) {

                    const firstEvent =
                        eventList[0];


                    const firstEventId =
                        firstEvent?._id ||
                        firstEvent?.id ||
                        firstEvent?.eventId;


                    if (firstEventId) {

                        setSelectedEventId(
                            String(firstEventId)
                        );

                    }

                } else {

                    setSelectedEventId("");

                }


            } catch (err) {

                console.error(
                    "Failed to load organizer events:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load your events."
                );

            } finally {

                setLoadingEvents(false);

            }

        },
        []
    );


    // =================================================
    // GET SELECTED EVENT
    // =================================================

    const selectedEvent = useMemo(() => {

        if (!selectedEventId) {

            return null;

        }


        return events.find(
            (event) => {

                const id =
                    event?._id ||
                    event?.id ||
                    event?.eventId;


                return (
                    String(id) ===
                    String(selectedEventId)
                );

            }
        ) || null;

    }, [
        events,
        selectedEventId,
    ]);


    // =================================================
    // LOAD REGISTRATIONS FOR SELECTED EVENT
    // =================================================

    const loadRegistrations =
        useCallback(
            async (
                eventId
            ) => {

                if (!eventId) {

                    setRegistrations([]);

                    return;

                }


                try {

                    setLoadingRegistrations(
                        true
                    );

                    setError("");


                    /*
                     * Your EventSphere backend specification
                     * uses:
                     *
                     * GET
                     * /api/organizer/events/:id/registrations
                     *
                     * We first try eventService if the method
                     * exists.
                     */

                    let response;


                    if (
                        typeof eventService
                            .getEventRegistrations ===
                        "function"
                    ) {

                        response =
                            await eventService
                                .getEventRegistrations(
                                    eventId
                                );

                    } else if (
                        typeof eventService
                            .getRegistrations ===
                        "function"
                    ) {

                        response =
                            await eventService
                                .getRegistrations(
                                    eventId
                                );

                    } else {

                        /*
                         * Fallback:
                         *
                         * If your eventService does not yet
                         * contain the registration method,
                         * use the existing dashboard data.
                         */

                        const dashboardResponse =
                            await getOrganizerDashboard();


                        const dashboard =
                            dashboardResponse
                                ?.dashboard ||
                            dashboardResponse
                                ?.data ||
                            dashboardResponse ||
                            {};


                        const allRegistrations =
                            Array.isArray(
                                dashboard
                                    ?.recentRegistrations
                            )
                                ? dashboard
                                    .recentRegistrations
                                : [];


                        response = {

                            registrations:
                                allRegistrations.filter(
                                    (registration) => {

                                        const registrationEventId =
                                            registration
                                                ?.eventId ||
                                            registration
                                                ?.event?._id ||
                                            registration
                                                ?.event?.id;


                                        return (
                                            String(
                                                registrationEventId
                                            ) ===
                                            String(eventId)
                                        );

                                    }
                                ),

                        };

                    }


                    console.log(
                        "Selected event registrations:",
                        response
                    );


                    const data =
                        response?.registrations ||
                        response?.data?.registrations ||
                        response?.data ||
                        response;


                    setRegistrations(
                        Array.isArray(data)
                            ? data
                            : []
                    );


                } catch (err) {

                    console.error(
                        "Failed to load event registrations:",
                        err?.response?.data ||
                        err
                    );


                    setRegistrations([]);

                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Unable to load registrations for this event."
                    );

                } finally {

                    setLoadingRegistrations(
                        false
                    );

                }

            },
            []
        );


    // =================================================
    // INITIAL EVENTS LOAD
    // =================================================

    useEffect(() => {

        loadEvents();

    }, [
        loadEvents,
    ]);


    // =================================================
    // LOAD REGISTRATIONS WHEN EVENT CHANGES
    // =================================================

    useEffect(() => {

        if (
            selectedEventId
        ) {

            loadRegistrations(
                selectedEventId
            );

        } else {

            setRegistrations([]);

        }

    }, [
        selectedEventId,
        loadRegistrations,
    ]);


    // =================================================
    // EVENT CHANGE
    // =================================================

    const handleEventChange = (
        event
    ) => {

        setSelectedEventId(
            event.target.value
        );

        setSearch("");

        setStatusFilter("all");

    };


    // =================================================
    // CLOSE SIDEBAR
    // =================================================

    const closeSidebar = () => {

        setSidebarOpen(false);

    };


    // =================================================
    // NORMALIZE REGISTRATIONS
    // =================================================

    const normalizedRegistrations =
        useMemo(() => {

            return registrations.map(
                (
                    registration,
                    index
                ) => {

                    const participant =
                        registration?.user ||
                        registration?.participant ||
                        {};


                    const event =
                        registration?.event ||
                        {};


                    const firstName =
                        registration?.firstName ||
                        participant?.firstName ||
                        participant?.name ||
                        "";


                    const lastName =
                        registration?.lastName ||
                        participant?.lastName ||
                        "";


                    const fullName =
                        `${firstName} ${lastName}`
                            .trim() ||
                        registration?.name ||
                        participant?.name ||
                        "Unknown Participant";


                    const email =
                        registration?.email ||
                        participant?.email ||
                        "No email";


                    const phone =
                        registration?.whatsappNumber ||
                        registration?.phone ||
                        participant?.whatsappNumber ||
                        participant?.phone ||
                        "Not provided";


                    const eventName =
                        registration?.eventName ||
                        event?.title ||
                        registration?.title ||
                        selectedEvent?.title ||
                        "Unknown Event";


                    const paymentStatus =
                        String(
                            registration
                                ?.paymentStatus ||
                            registration
                                ?.payment?.status ||
                            registration?.status ||
                            "pending"
                        ).toLowerCase();


                    const registeredAt =
                        registration?.registeredAt ||
                        registration?.createdAt ||
                        registration?.registrationDate;


                    return {

                        ...registration,

                        _rowId:
                            registration?._id ||
                            registration?.id ||
                            index,

                        fullName,

                        email,

                        phone,

                        eventName,

                        paymentStatus,

                        registeredAt,

                    };

                }
            );

        }, [
            registrations,
            selectedEvent,
        ]);


    // =================================================
    // FILTER
    // =================================================

    const filteredRegistrations =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return normalizedRegistrations
                .filter(
                    (
                        registration
                    ) => {

                        const matchesSearch =
                            !query ||
                            registration
                                .fullName
                                .toLowerCase()
                                .includes(query) ||
                            registration
                                .email
                                .toLowerCase()
                                .includes(query) ||
                            registration
                                .phone
                                .toLowerCase()
                                .includes(query) ||
                            registration
                                .eventName
                                .toLowerCase()
                                .includes(query);


                        const matchesStatus =
                            statusFilter ===
                                "all" ||
                            registration
                                .paymentStatus ===
                                statusFilter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );

        }, [
            normalizedRegistrations,
            search,
            statusFilter,
        ]);


    // =================================================
    // STATISTICS
    // =================================================

    const statistics =
        useMemo(() => {

            const total =
                normalizedRegistrations.length;


            const paid =
                normalizedRegistrations
                    .filter(
                        (item) =>
                            item.paymentStatus ===
                                "paid" ||
                            item.paymentStatus ===
                                "success" ||
                            item.paymentStatus ===
                                "completed"
                    )
                    .length;


            const pending =
                normalizedRegistrations
                    .filter(
                        (item) =>
                            item.paymentStatus ===
                            "pending"
                    )
                    .length;


            const failed =
                normalizedRegistrations
                    .filter(
                        (item) =>
                            item.paymentStatus ===
                            "failed"
                    )
                    .length;


            return {
                total,
                paid,
                pending,
                failed,
            };

        }, [
            normalizedRegistrations,
        ]);


    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "—";

        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "—";

        }


        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    // =================================================
    // STATUS LABEL
    // =================================================

    const getStatusLabel = (
        status
    ) => {

        if (
            status === "paid" ||
            status === "success" ||
            status === "completed"
        ) {

            return "Paid";

        }


        if (
            status === "failed"
        ) {

            return "Failed";

        }


        if (
            status === "cancelled"
        ) {

            return "Cancelled";

        }


        return "Pending";

    };


    // =================================================
    // STATUS CLASS
    // =================================================

    const getStatusClass = (
        status
    ) => {

        if (
            status === "paid" ||
            status === "success" ||
            status === "completed"
        ) {

            return "registration-status paid";

        }


        if (
            status === "failed"
        ) {

            return "registration-status failed";

        }


        return "registration-status pending";

    };


    // =================================================
    // CSV EXPORT
    // =================================================

    const exportCSV = () => {

        if (
            filteredRegistrations.length === 0
        ) {

            return;

        }


        const headers = [
            "Participant Name",
            "Email",
            "Phone",
            "Event",
            "Payment Status",
            "Registration Date",
        ];


        const rows =
            filteredRegistrations.map(
                (
                    registration
                ) => [

                    registration.fullName,

                    registration.email,

                    registration.phone,

                    registration.eventName,

                    getStatusLabel(
                        registration
                            .paymentStatus
                    ),

                    formatDate(
                        registration
                            .registeredAt
                    ),

                ]
            );


        const csv = [
            headers,
            ...rows,
        ]
            .map(
                (row) =>
                    row
                        .map(
                            (value) =>
                                `"${String(
                                    value ?? ""
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;",
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;


        const selectedTitle =
            selectedEvent?.title ||
            "event";


        const safeTitle =
            selectedTitle
                .replace(
                    /[^a-z0-9]/gi,
                    "-"
                )
                .toLowerCase();


        link.download =
            `${safeTitle}-registrations.csv`;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    };


    // =================================================
    // REFRESH
    // =================================================

    const handleRefresh = async () => {

        if (
            selectedEventId
        ) {

            await loadRegistrations(
                selectedEventId
            );

        } else {

            await loadEvents();

        }

    };


    // =================================================
    // LOADING
    // =================================================

    if (
        loadingEvents
    ) {

        return (

            <div className="organizer-registrations">

                <OrganizerSidebar
                    isOpen={
                        sidebarOpen
                    }
                    onClose={
                        closeSidebar
                    }
                />


                <main className="organizer-main">

                    <OrganizerHeader
                        title="Registrations"
                        subtitle="View participant registrations"
                        onMenuClick={() =>
                            setSidebarOpen(
                                true
                            )
                        }
                    />


                    <div className="organizer-registrations-loading">

                        <RefreshCw
                            size={28}
                            className="registration-spinner"
                        />

                        <p>
                            Loading your events...
                        </p>

                    </div>

                </main>

            </div>

        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (
        error &&
        events.length === 0
    ) {

        return (

            <div className="organizer-registrations">

                <OrganizerSidebar
                    isOpen={
                        sidebarOpen
                    }
                    onClose={
                        closeSidebar
                    }
                />


                <main className="organizer-main">

                    <OrganizerHeader
                        title="Registrations"
                        subtitle="View participant registrations"
                        onMenuClick={() =>
                            setSidebarOpen(
                                true
                            )
                        }
                    />


                    <div className="organizer-registrations-content">

                        <div className="registration-error">

                            <XCircle
                                size={42}
                            />

                            <h2>
                                Unable to load events
                            </h2>

                            <p>
                                {error}
                            </p>


                            <button
                                type="button"
                                className="registration-retry-button"
                                onClick={
                                    loadEvents
                                }
                            >

                                <RefreshCw
                                    size={16}
                                />

                                Try Again

                            </button>

                        </div>

                    </div>

                </main>

            </div>

        );

    }


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="organizer-registrations">

            <OrganizerSidebar
                isOpen={
                    sidebarOpen
                }
                onClose={
                    closeSidebar
                }
            />


            <main className="organizer-main">

                <OrganizerHeader
                    title="Registrations"
                    subtitle="View and manage participant registrations"
                    onMenuClick={() =>
                        setSidebarOpen(
                            true
                        )
                    }
                />


                <div className="organizer-registrations-content">

                    {/* =================================
                        PAGE HEADER
                    ================================= */}

                    <div className="registration-page-header">

                        <div>

                            <div className="registration-eyebrow">
                                ORGANIZER
                            </div>

                            <h1>
                                Event Registrations
                            </h1>

                            <p>
                                View participants
                                registered for
                                your events.
                            </p>

                        </div>


                        <div className="registration-header-actions">

                            <Link
                                to="/organizer/events"
                                className="registration-back-button"
                            >

                                <ArrowLeft
                                    size={17}
                                />

                                My Events

                            </Link>


                            <button
                                type="button"
                                className="registration-export-button"
                                onClick={
                                    exportCSV
                                }
                                disabled={
                                    filteredRegistrations
                                        .length === 0
                                }
                            >

                                <Download
                                    size={17}
                                />

                                Export CSV

                            </button>

                        </div>

                    </div>


                    {/* =================================
                        EVENT SELECTOR
                    ================================= */}

                    <div className="registration-event-selector-card">

                        <div className="registration-event-selector-info">

                            <div className="registration-event-selector-icon">

                                <CalendarDays
                                    size={21}
                                />

                            </div>


                            <div>

                                <span>
                                    SELECT EVENT
                                </span>

                                <strong>
                                    Choose an event
                                    to view its
                                    registrations
                                </strong>

                            </div>

                        </div>


                        <div className="registration-event-select-wrapper">

                            <select
                                value={
                                    selectedEventId
                                }
                                onChange={
                                    handleEventChange
                                }
                                className="registration-event-select"
                            >

                                <option value="">
                                    Select an event
                                </option>


                                {events.map(
                                    (
                                        event
                                    ) => {

                                        const eventId =
                                            event?._id ||
                                            event?.id ||
                                            event?.eventId;


                                        return (

                                            <option
                                                key={
                                                    eventId
                                                }
                                                value={
                                                    eventId
                                                }
                                            >

                                                {
                                                    event?.title ||
                                                    event?.eventName ||
                                                    "Untitled Event"
                                                }

                                            </option>

                                        );

                                    }
                                )}

                            </select>


                            <ChevronDown
                                size={18}
                                className="registration-event-select-icon"
                            />

                        </div>

                    </div>


                    {/* =================================
                        SELECTED EVENT INFO
                    ================================= */}

                    {selectedEvent && (

                        <div className="selected-event-banner">

                            <div>

                                <span>
                                    SELECTED EVENT
                                </span>

                                <h2>
                                    {
                                        selectedEvent?.title ||
                                        selectedEvent?.eventName ||
                                        "Untitled Event"
                                    }
                                </h2>

                            </div>


                            <div className="selected-event-meta">

                                {selectedEvent?.eventDate && (

                                    <span>

                                        <CalendarDays
                                            size={15}
                                        />

                                        {
                                            formatDate(
                                                selectedEvent.eventDate
                                            )
                                        }

                                    </span>

                                )}

                                {selectedEvent?.venue && (

                                    <span>

                                        {
                                            selectedEvent.venue
                                        }

                                    </span>

                                )}

                            </div>

                        </div>

                    )}


                    {/* =================================
                        STATISTICS
                    ================================= */}

                    <div className="registration-stat-grid">

                        <div className="registration-stat-card">

                            <div className="registration-stat-icon">

                                <Users
                                    size={21}
                                />

                            </div>

                            <div>

                                <span>
                                    Total Registrations
                                </span>

                                <strong>
                                    {
                                        statistics.total
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="registration-stat-card">

                            <div className="registration-stat-icon success">

                                <CheckCircle2
                                    size={21}
                                />

                            </div>

                            <div>

                                <span>
                                    Paid
                                </span>

                                <strong>
                                    {
                                        statistics.paid
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="registration-stat-card">

                            <div className="registration-stat-icon warning">

                                <Clock3
                                    size={21}
                                />

                            </div>

                            <div>

                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {
                                        statistics.pending
                                    }
                                </strong>

                            </div>

                        </div>


                        <div className="registration-stat-card">

                            <div className="registration-stat-icon danger">

                                <XCircle
                                    size={21}
                                />

                            </div>

                            <div>

                                <span>
                                    Failed
                                </span>

                                <strong>
                                    {
                                        statistics.failed
                                    }
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        FILTERS
                    ================================= */}

                    <div className="registration-toolbar">

                        <div className="registration-search">

                            <Search
                                size={18}
                            />

                            <input
                                type="text"
                                placeholder="Search participant, email or phone..."
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            value={
                                statusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="registration-status-filter"
                        >

                            <option value="all">
                                All Status
                            </option>

                            <option value="paid">
                                Paid
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="failed">
                                Failed
                            </option>

                        </select>


                        <button
                            type="button"
                            className="registration-refresh-button"
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                loadingRegistrations
                            }
                        >

                            <RefreshCw
                                size={17}
                                className={
                                    loadingRegistrations
                                        ? "registration-refresh-spin"
                                        : ""
                                }
                            />

                            Refresh

                        </button>

                    </div>


                    {/* =================================
                        EVENT-SPECIFIC ERROR
                    ================================= */}

                    {error && selectedEvent && (

                        <div className="registration-inline-error">

                            <XCircle
                                size={17}
                            />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}


                    {/* =================================
                        TABLE
                    ================================= */}

                    <div className="registration-table-card">

                        <div className="registration-table-header">

                            <div>

                                <h2>
                                    Participants
                                </h2>

                                <p>

                                    {selectedEvent
                                        ? `Registrations for ${
                                            selectedEvent?.title ||
                                            "selected event"
                                        }`
                                        : "Select an event to view registrations"}

                                </p>

                            </div>

                        </div>


                        {loadingRegistrations ? (

                            <div className="registration-empty">

                                <RefreshCw
                                    size={38}
                                    className="registration-spinner"
                                />

                                <h3>
                                    Loading registrations...
                                </h3>

                                <p>
                                    Getting participants
                                    for the selected event.
                                </p>

                            </div>

                        ) : !selectedEvent ? (

                            <div className="registration-empty">

                                <CalendarDays
                                    size={42}
                                />

                                <h3>
                                    Select an event
                                </h3>

                                <p>
                                    Choose an event
                                    from the dropdown
                                    above to view
                                    its participants.
                                </p>

                            </div>

                        ) : filteredRegistrations.length === 0 ? (

                            <div className="registration-empty">

                                <Users
                                    size={42}
                                />

                                <h3>
                                    No registrations found
                                </h3>

                                <p>
                                    This event does not
                                    have registrations
                                    matching your
                                    current filters.
                                </p>

                            </div>

                        ) : (

                            <div className="registration-table-wrapper">

                                <table className="registration-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Participant
                                            </th>

                                            <th>
                                                Contact
                                            </th>

                                            <th>
                                                Registered
                                            </th>

                                            <th>
                                                Payment
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {filteredRegistrations.map(
                                            (
                                                registration
                                            ) => (

                                                <tr
                                                    key={
                                                        registration._rowId
                                                    }
                                                >

                                                    <td>

                                                        <div className="participant-cell">

                                                            <div className="participant-avatar">

                                                                {
                                                                    registration
                                                                        .fullName
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()
                                                                }

                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        registration
                                                                            .fullName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        registration
                                                                            .email
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="contact-cell">

                                                            <span>

                                                                <Mail
                                                                    size={14}
                                                                />

                                                                {
                                                                    registration
                                                                        .email
                                                                }

                                                            </span>


                                                            <span>

                                                                <Phone
                                                                    size={14}
                                                                />

                                                                {
                                                                    registration
                                                                        .phone
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        {
                                                            formatDate(
                                                                registration
                                                                    .registeredAt
                                                            )
                                                        }

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                getStatusClass(
                                                                    registration
                                                                        .paymentStatus
                                                                )
                                                            }
                                                        >

                                                            {
                                                                getStatusLabel(
                                                                    registration
                                                                        .paymentStatus
                                                                )
                                                            }

                                                        </span>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>

            </main>

        </div>

    );

};


export default OrganizerRegistrations;