// frontend/src/pages/participant/MyRegistrations.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    Ticket,
    XCircle,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import api from "../../api/api";

import "./MyRegistrations.css";


const MyRegistrations = () => {

    const navigate = useNavigate();


    const [registrations, setRegistrations] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");


    /*
     * =========================================================
     * FETCH MY REGISTRATIONS
     * =========================================================
     *
     * Backend endpoint from the EventSphere
     * registration workflow:
     *
     * GET /api/registrations
     */

    const fetchRegistrations = useCallback(
        async (showLoader = true) => {

            try {

                if (showLoader) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
                }

                setError("");


                const response =
                    await api.get(
                        "/registrations"
                    );


                const data =
                    response?.data;


                const list =
                    data?.registrations ||
                    data?.data ||
                    data?.results ||
                    [];


                setRegistrations(
                    Array.isArray(list)
                        ? list
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to load registrations:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    "Unable to load your registrations."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);
            }

        },
        []
    );


    /*
     * =========================================================
     * INITIAL LOAD
     * =========================================================
     */

    useEffect(() => {

        fetchRegistrations(true);

    }, [
        fetchRegistrations,
    ]);


    /*
     * =========================================================
     * HELPERS
     * =========================================================
     */

    const getEvent =
        (registration) => {

            return (
                registration?.eventId ||
                registration?.event ||
                {}
            );
        };


    const getEventTitle =
        (registration) => {

            const event =
                getEvent(
                    registration
                );


            return (
                event?.title ||
                event?.name ||
                registration?.eventTitle ||
                "Event"
            );
        };


    const getEventId =
        (registration) => {

            const event =
                getEvent(
                    registration
                );


            return (
                event?._id ||
                event?.id ||
                registration?.eventId ||
                ""
            );
        };


    const getPaymentStatus =
        (registration) => {

            const status =
                registration?.paymentStatus ||
                registration?.payment?.status ||
                "pending";


            return status
                .toString()
                .toLowerCase();
        };


    const getRegistrationStatus =
        (registration) => {

            const status =
                registration?.status ||
                getPaymentStatus(
                    registration
                );


            return status
                .toString()
                .toLowerCase();
        };


    const formatDate =
        (value) => {

            if (!value) {
                return "Date not available";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return value;
            }


            return date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
        };


    const formatTime =
        (value) => {

            if (!value) {
                return "";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return "";
            }


            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );
        };


    const getEventDate =
        (registration) => {

            const event =
                getEvent(
                    registration
                );


            return (
                event?.eventDate ||
                event?.startDate ||
                event?.date ||
                registration?.eventDate
            );
        };


    const getVenue =
        (registration) => {

            const event =
                getEvent(
                    registration
                );


            return (
                event?.venue ||
                event?.location ||
                event?.address ||
                registration?.venue ||
                "Venue to be announced"
            );
        };


    const getImage =
        (registration) => {

            const event =
                getEvent(
                    registration
                );


            return (
                event?.bannerImageUrl ||
                event?.imageUrl ||
                event?.image ||
                ""
            );
        };


    /*
     * =========================================================
     * STATUS NORMALIZATION
     * =========================================================
     */

    const getDisplayStatus =
        (registration) => {

            const paymentStatus =
                getPaymentStatus(
                    registration
                );


            const registrationStatus =
                getRegistrationStatus(
                    registration
                );


            if (
                registrationStatus ===
                    "cancelled" ||
                registrationStatus ===
                    "canceled"
            ) {
                return "cancelled";
            }


            if (
                paymentStatus ===
                    "paid" ||
                paymentStatus ===
                    "success" ||
                paymentStatus ===
                    "successful"
            ) {
                return "paid";
            }


            if (
                paymentStatus ===
                    "failed"
            ) {
                return "failed";
            }


            return "pending";
        };


    /*
     * =========================================================
     * FILTER REGISTRATIONS
     * =========================================================
     */

    const filteredRegistrations =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return registrations.filter(
                (registration) => {

                    const title =
                        getEventTitle(
                            registration
                        )
                            .toLowerCase();


                    const venue =
                        getVenue(
                            registration
                        )
                            .toLowerCase();


                    const status =
                        getDisplayStatus(
                            registration
                        );


                    const matchesSearch =
                        !query ||
                        title.includes(query) ||
                        venue.includes(query);


                    const matchesStatus =
                        statusFilter === "all" ||
                        status === statusFilter;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );

        }, [
            registrations,
            search,
            statusFilter,
        ]);


    /*
     * =========================================================
     * COUNTS
     * =========================================================
     */

    const totalCount =
        registrations.length;


    const paidCount =
        registrations.filter(
            (registration) =>
                getDisplayStatus(
                    registration
                ) === "paid"
        ).length;


    const pendingCount =
        registrations.filter(
            (registration) =>
                getDisplayStatus(
                    registration
                ) === "pending"
        ).length;


    const failedCount =
        registrations.filter(
            (registration) =>
                getDisplayStatus(
                    registration
                ) === "failed"
        ).length;


    /*
     * =========================================================
     * STATUS BADGE
     * =========================================================
     */

    const StatusBadge =
        ({ registration }) => {

            const status =
                getDisplayStatus(
                    registration
                );


            if (status === "paid") {

                return (
                    <span className="registration-status paid">

                        <CheckCircle2
                            size={13}
                        />

                        Paid

                    </span>
                );
            }


            if (status === "failed") {

                return (
                    <span className="registration-status failed">

                        <XCircle
                            size={13}
                        />

                        Payment Failed

                    </span>
                );
            }


            if (status === "cancelled") {

                return (
                    <span className="registration-status cancelled">

                        <XCircle
                            size={13}
                        />

                        Cancelled

                    </span>
                );
            }


            return (
                <span className="registration-status pending">

                    <Clock3
                        size={13}
                    />

                    Pending

                </span>
            );
        };


    /*
     * =========================================================
     * VIEW REGISTRATION
     * =========================================================
     */

    const handleView =
        (registration) => {

            const registrationId =
                registration?._id ||
                registration?.id;


            if (!registrationId) {
                return;
            }


            navigate(
                `/registrations/${registrationId}`,
                {
                    state: {
                        registration,
                    },
                }
            );
        };


    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (loading) {

        return (
            <div className="my-registrations-page">

                <div className="my-registrations-state">

                    <Loader2
                        size={34}
                        className="my-registrations-spinner"
                    />

                    <h2>
                        Loading your registrations...
                    </h2>

                    <p>
                        Please wait while we fetch
                        your event registrations.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * PAGE
     * =========================================================
     */

    return (
        <div className="my-registrations-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="my-registrations-header">

                <div>

                    <span className="my-registrations-eyebrow">
                        PARTICIPANT
                    </span>

                    <h1>
                        My Registrations
                    </h1>

                    <p>
                        View your registered events
                        and payment status.
                    </p>

                </div>


                <button
                    type="button"
                    className="my-registrations-refresh"
                    onClick={() =>
                        fetchRegistrations(false)
                    }
                    disabled={refreshing}
                >

                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "refreshing"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="my-registrations-error">

                    <XCircle
                        size={18}
                    />

                    <div>

                        <strong>
                            Unable to load registrations
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchRegistrations(true)
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="my-registrations-stats">

                <div className="registration-stat-card">

                    <div className="registration-stat-icon purple">
                        <Ticket size={19} />
                    </div>

                    <div>
                        <span>
                            Total Registrations
                        </span>

                        <strong>
                            {totalCount}
                        </strong>
                    </div>

                </div>


                <div className="registration-stat-card">

                    <div className="registration-stat-icon green">
                        <CheckCircle2 size={19} />
                    </div>

                    <div>
                        <span>
                            Paid
                        </span>

                        <strong>
                            {paidCount}
                        </strong>
                    </div>

                </div>


                <div className="registration-stat-card">

                    <div className="registration-stat-icon orange">
                        <Clock3 size={19} />
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingCount}
                        </strong>
                    </div>

                </div>


                <div className="registration-stat-card">

                    <div className="registration-stat-icon red">
                        <XCircle size={19} />
                    </div>

                    <div>
                        <span>
                            Failed
                        </span>

                        <strong>
                            {failedCount}
                        </strong>
                    </div>

                </div>

            </section>


            {/* =================================================
                SEARCH / FILTER
            ================================================= */}

            <section className="my-registrations-toolbar">

                <div className="registration-search">

                    <Search
                        size={17}
                    />

                    <input
                        type="search"
                        placeholder="Search your registrations..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="registration-filters">

                    <button
                        type="button"
                        className={
                            statusFilter === "all"
                                ? "active"
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
                            statusFilter === "paid"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setStatusFilter(
                                "paid"
                            )
                        }
                    >
                        Paid
                    </button>


                    <button
                        type="button"
                        className={
                            statusFilter === "pending"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setStatusFilter(
                                "pending"
                            )
                        }
                    >
                        Pending
                    </button>


                    <button
                        type="button"
                        className={
                            statusFilter === "failed"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setStatusFilter(
                                "failed"
                            )
                        }
                    >
                        Failed
                    </button>

                </div>

            </section>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {registrations.length === 0 ? (

                <section className="my-registrations-empty">

                    <div className="my-registrations-empty-icon">

                        <Ticket
                            size={28}
                        />

                    </div>

                    <h2>
                        No registrations yet
                    </h2>

                    <p>
                        You haven't registered for
                        any EventSphere events yet.
                    </p>

                    <Link
                        to="/events"
                        className="my-registrations-primary-button"
                    >
                        Explore Events

                        <ArrowRight
                            size={16}
                        />
                    </Link>

                </section>

            ) : filteredRegistrations.length === 0 ? (

                <section className="my-registrations-empty">

                    <div className="my-registrations-empty-icon">

                        <Search
                            size={27}
                        />

                    </div>

                    <h2>
                        No matching registrations
                    </h2>

                    <p>
                        Try another search term or
                        change the status filter.
                    </p>

                    <button
                        type="button"
                        className="my-registrations-secondary-button"
                        onClick={() => {

                            setSearch("");

                            setStatusFilter(
                                "all"
                            );

                        }}
                    >
                        Clear Filters
                    </button>

                </section>

            ) : (

                /* =================================================
                   REGISTRATION LIST
                ================================================= */

                <section className="my-registrations-list">

                    {filteredRegistrations.map(
                        (registration) => {

                            const eventId =
                                getEventId(
                                    registration
                                );

                            const image =
                                getImage(
                                    registration
                                );

                            const eventDate =
                                getEventDate(
                                    registration
                                );

                            const registrationId =
                                registration?._id ||
                                registration?.id;


                            return (

                                <article
                                    className="my-registration-card"
                                    key={
                                        registrationId ||
                                        `${eventId}-${eventDate}`
                                    }
                                >

                                    {/* IMAGE */}

                                    <div className="my-registration-image">

                                        {image ? (

                                            <img
                                                src={image}
                                                alt={
                                                    getEventTitle(
                                                        registration
                                                    )
                                                }
                                            />

                                        ) : (

                                            <div className="my-registration-image-placeholder">

                                                <Ticket
                                                    size={29}
                                                />

                                            </div>
                                        )}

                                    </div>


                                    {/* CONTENT */}

                                    <div className="my-registration-content">

                                        <div className="my-registration-top">

                                            <div>

                                                <span className="my-registration-label">
                                                    REGISTERED EVENT
                                                </span>

                                                <h2>
                                                    {
                                                        getEventTitle(
                                                            registration
                                                        )
                                                    }
                                                </h2>

                                            </div>


                                            <StatusBadge
                                                registration={
                                                    registration
                                                }
                                            />

                                        </div>


                                        <div className="my-registration-details">

                                            <div>

                                                <CalendarDays
                                                    size={14}
                                                />

                                                <span>
                                                    {
                                                        formatDate(
                                                            eventDate
                                                        )
                                                    }

                                                    {formatTime(
                                                        eventDate
                                                    ) &&
                                                        ` • ${formatTime(
                                                            eventDate
                                                        )}`}
                                                </span>

                                            </div>


                                            <div>

                                                <MapPin
                                                    size={14}
                                                />

                                                <span>
                                                    {
                                                        getVenue(
                                                            registration
                                                        )
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        <div className="my-registration-footer">

                                            <span>

                                                Registration ID:{" "}

                                                <strong>
                                                    {registrationId ||
                                                        "N/A"}
                                                </strong>

                                            </span>


                                            {eventId ? (

                                                <Link
                                                    to={`/events/${eventId}`}
                                                    className="my-registration-view-event"
                                                >
                                                    View Event

                                                    <ArrowRight
                                                        size={14}
                                                    />
                                                </Link>

                                            ) : null}

                                        </div>

                                    </div>


                                    {/* ACTION */}

                                    <button
                                        type="button"
                                        className="my-registration-view-button"
                                        onClick={() =>
                                            handleView(
                                                registration
                                            )
                                        }
                                        title="View registration"
                                    >

                                        <Eye
                                            size={16}
                                        />

                                        <span>
                                            View
                                        </span>

                                    </button>

                                </article>

                            );
                        }
                    )}

                </section>

            )}


            {/* =================================================
                FOOTER NOTE
            ================================================= */}

            <div className="my-registrations-footer-note">

                <CheckCircle2
                    size={15}
                />

                <span>
                    Your registration and payment
                    information is securely stored
                    by EventSphere.
                </span>

            </div>

        </div>
    );
};


export default MyRegistrations;