import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getOrganizerEvent,
    getEventRegistrations,
} from "../../services/organizerService";

import "./EventRegistrations.css";

const EventRegistrations = () => {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] =
        useState("all");

    /* ========================================================
       LOAD EVENT + REGISTRATIONS
    ======================================================== */

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [eventResponse, registrationResponse] =
                await Promise.all([
                    getOrganizerEvent(id),
                    getEventRegistrations(id),
                ]);

            const eventData =
                eventResponse?.event ||
                eventResponse?.data?.event ||
                eventResponse?.data ||
                null;

            const registrationData =
                registrationResponse?.registrations ||
                registrationResponse?.data?.registrations ||
                registrationResponse?.data ||
                [];

            setEvent(eventData);
            setRegistrations(
                Array.isArray(registrationData)
                    ? registrationData
                    : []
            );
        } catch (err) {
            console.error(
                "Event Registrations Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load event registrations."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ========================================================
       FORMAT DATE
    ======================================================== */

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
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

    /* ========================================================
       FORMAT DATE + TIME
    ======================================================== */

    const formatDateTime = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    /* ========================================================
       FILTER REGISTRATIONS
    ======================================================== */

    const filteredRegistrations = useMemo(() => {
        const searchValue =
            search.trim().toLowerCase();

        return registrations.filter(
            (registration) => {
                const firstName =
                    registration.firstName || "";

                const lastName =
                    registration.lastName || "";

                const email =
                    registration.email ||
                    registration.userId?.email ||
                    "";

                const institute =
                    registration.instituteName ||
                    registration.userId?.instituteName ||
                    "";

                const department =
                    registration.department ||
                    registration.userId?.department ||
                    "";

                const fullName =
                    `${firstName} ${lastName}`
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    !searchValue ||
                    fullName.includes(
                        searchValue
                    ) ||
                    email
                        .toLowerCase()
                        .includes(searchValue) ||
                    institute
                        .toLowerCase()
                        .includes(searchValue) ||
                    department
                        .toLowerCase()
                        .includes(searchValue);

                const paymentStatus =
                    (
                        registration.paymentStatus ||
                        "pending"
                    ).toLowerCase();

                const matchesPayment =
                    paymentFilter === "all" ||
                    paymentStatus ===
                        paymentFilter;

                return (
                    matchesSearch &&
                    matchesPayment
                );
            }
        );
    }, [
        registrations,
        search,
        paymentFilter,
    ]);

    /* ========================================================
       STATISTICS
    ======================================================== */

    const totalRegistrations =
        registrations.length;

    const paidRegistrations =
        registrations.filter(
            (registration) =>
                registration.paymentStatus ===
                "paid"
        ).length;

    const pendingRegistrations =
        registrations.filter(
            (registration) =>
                registration.paymentStatus ===
                "pending"
        ).length;

    const failedRegistrations =
        registrations.filter(
            (registration) =>
                registration.paymentStatus ===
                "failed"
        ).length;

    /* ========================================================
       CSV EXPORT
    ======================================================== */

    const exportCSV = () => {
        if (!registrations.length) {
            return;
        }

        const headers = [
            "First Name",
            "Last Name",
            "Email",
            "WhatsApp Number",
            "Age",
            "Institute",
            "Department",
            "Year",
            "Payment Status",
            "Payment ID",
            "Registered At",
        ];

        const rows = registrations.map(
            (registration) => [
                registration.firstName || "",
                registration.lastName || "",
                registration.email ||
                    registration.userId?.email ||
                    "",
                registration.whatsappNumber || "",
                registration.age || "",
                registration.instituteName ||
                    registration.userId?.instituteName ||
                    "",
                registration.department ||
                    registration.userId?.department ||
                    "",
                registration.year ||
                    registration.userId?.year ||
                    "",
                registration.paymentStatus || "",
                registration.paymentId || "",
                registration.registeredAt
                    ? formatDateTime(
                          registration.registeredAt
                      )
                    : "",
            ]
        );

        const escapeCSV = (value) => {
            const text = String(
                value ?? ""
            );

            return `"${text.replace(
                /"/g,
                '""'
            )}"`;
        };

        const csvContent = [
            headers.map(escapeCSV).join(","),
            ...rows.map((row) =>
                row.map(escapeCSV).join(",")
            ),
        ].join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `${(event?.title || "event")
                .replace(
                    /[^a-z0-9]/gi,
                    "_"
                )
                .toLowerCase()}_registrations.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    /* ========================================================
       LOADING
    ======================================================== */

    if (loading) {
        return (
            <div className="organizer-loading">
                <div>
                    <h3>
                        Loading Registrations...
                    </h3>

                    <p>
                        Please wait while the
                        participant list is loaded.
                    </p>
                </div>
            </div>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (error && !event) {
        return (
            <div className="organizer-form-page">

                <div className="form-error">
                    {error}
                </div>

                <Link
                    to="/organizer/events"
                    className="secondary-button"
                >
                    ← Back to Events
                </Link>

            </div>
        );
    }

    /* ========================================================
       PAGE
    ======================================================== */

    return (
        <div className="organizer-registrations-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="page-header">

                <div>

                    <span>
                        EVENT REGISTRATIONS
                    </span>

                    <h1>
                        {event?.title ||
                            "Event Participants"}
                    </h1>

                    <p>
                        View and manage
                        participants registered
                        for this event.
                    </p>

                </div>


                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >

                    <Link
                        to={`/organizer/events/${id}`}
                        className="secondary-button"
                    >
                        ← Event Details
                    </Link>

                    <button
                        type="button"
                        className="create-event-button"
                        onClick={exportCSV}
                        disabled={
                            registrations.length ===
                            0
                        }
                    >
                        Export CSV
                    </button>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}


            {/* ==================================================
                EVENT INFORMATION
            ================================================== */}

            {event && (
                <div
                    style={{
                        marginBottom: "24px",
                        padding: "20px 24px",
                        background: "#fff",
                        border:
                            "1px solid #e8e9f0",
                        borderRadius: "16px",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            gap: "20px",
                            flexWrap: "wrap",
                        }}
                    >

                        <div>
                            <strong>
                                Event Date
                            </strong>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color:
                                        "#777b8d",
                                }}
                            >
                                {formatDateTime(
                                    event.eventDate
                                )}
                            </p>
                        </div>


                        <div>
                            <strong>
                                Venue
                            </strong>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color:
                                        "#777b8d",
                                }}
                            >
                                {event.venue ||
                                    "Not specified"}
                            </p>
                        </div>


                        <div>
                            <strong>
                                Registration Fee
                            </strong>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color:
                                        "#777b8d",
                                }}
                            >
                                {Number(
                                    event.registrationFee ||
                                        0
                                ) === 0
                                    ? "Free"
                                    : `₹${Number(
                                          event.registrationFee
                                      ).toLocaleString(
                                          "en-IN"
                                      )}`}
                            </p>
                        </div>


                        <div>
                            <strong>
                                Deadline
                            </strong>

                            <p
                                style={{
                                    margin:
                                        "5px 0 0",
                                    color:
                                        "#777b8d",
                                }}
                            >
                                {formatDate(
                                    event.registrationDeadline
                                )}
                            </p>
                        </div>

                    </div>

                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="organizer-stats-grid">

                <div className="organizer-stat-card">

                    <span>
                        Total Registrations
                    </span>

                    <strong>
                        {totalRegistrations}
                    </strong>

                    <small>
                        All participants
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Paid
                    </span>

                    <strong>
                        {paidRegistrations}
                    </strong>

                    <small>
                        Successful payments
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Pending
                    </span>

                    <strong>
                        {pendingRegistrations}
                    </strong>

                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div className="organizer-stat-card">

                    <span>
                        Failed
                    </span>

                    <strong>
                        {failedRegistrations}
                    </strong>

                    <small>
                        Failed payments
                    </small>

                </div>

            </div>


            {/* ==================================================
                SEARCH + FILTER
            ================================================== */}

            <section className="organizer-section">

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: "18px",
                    }}
                >

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Search participant, email, institute..."
                        style={{
                            flex: "1",
                            minWidth:
                                "250px",
                            padding:
                                "12px 14px",
                            border:
                                "1px solid #dfe1e9",
                            borderRadius:
                                "9px",
                            outline: "none",
                            font: "inherit",
                        }}
                    />


                    <select
                        value={paymentFilter}
                        onChange={(e) =>
                            setPaymentFilter(
                                e.target.value
                            )
                        }
                        style={{
                            padding:
                                "12px 14px",
                            border:
                                "1px solid #dfe1e9",
                            borderRadius:
                                "9px",
                            background:
                                "#fff",
                            font: "inherit",
                        }}
                    >

                        <option value="all">
                            All Payments
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

                </div>


                {/* ==================================================
                    REGISTRATION TABLE
                ================================================== */}

                <div className="events-table-container">

                    <table className="events-table">

                        <thead>
                            <tr>
                                <th>
                                    #
                                </th>

                                <th>
                                    Participant
                                </th>

                                <th>
                                    Contact
                                </th>

                                <th>
                                    Institute
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Year
                                </th>

                                <th>
                                    Payment
                                </th>

                                <th>
                                    Registered
                                </th>
                            </tr>
                        </thead>


                        <tbody>

                            {filteredRegistrations.length >
                            0 ? (

                                filteredRegistrations.map(
                                    (
                                        registration,
                                        index
                                    ) => {

                                        const firstName =
                                            registration.firstName ||
                                            registration.userId
                                                ?.name ||
                                            "";

                                        const lastName =
                                            registration.lastName ||
                                            "";

                                        const email =
                                            registration.email ||
                                            registration
                                                .userId
                                                ?.email ||
                                            "";

                                        const institute =
                                            registration.instituteName ||
                                            registration
                                                .userId
                                                ?.instituteName ||
                                            "-";

                                        const department =
                                            registration.department ||
                                            registration
                                                .userId
                                                ?.department ||
                                            "-";

                                        const year =
                                            registration.year ||
                                            registration
                                                .userId
                                                ?.year ||
                                            "-";

                                        const paymentStatus =
                                            (
                                                registration.paymentStatus ||
                                                "pending"
                                            ).toLowerCase();

                                        return (
                                            <tr
                                                key={
                                                    registration._id ||
                                                    registration.registrationId ||
                                                    index
                                                }
                                            >

                                                {/* NUMBER */}

                                                <td>
                                                    {index +
                                                        1}
                                                </td>


                                                {/* PARTICIPANT */}

                                                <td>
                                                    <strong>
                                                        {
                                                            firstName
                                                        }{" "}
                                                        {
                                                            lastName
                                                        }
                                                    </strong>

                                                    {registration.age && (
                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "4px",
                                                                color:
                                                                    "#858896",
                                                            }}
                                                        >
                                                            Age:{" "}
                                                            {
                                                                registration.age
                                                            }
                                                        </small>
                                                    )}
                                                </td>


                                                {/* CONTACT */}

                                                <td>
                                                    <span
                                                        style={{
                                                            display:
                                                                "block",
                                                        }}
                                                    >
                                                        {
                                                            email
                                                        }
                                                    </span>

                                                    {registration.whatsappNumber && (
                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "5px",
                                                                color:
                                                                    "#777b8d",
                                                            }}
                                                        >
                                                            {
                                                                registration.whatsappNumber
                                                            }
                                                        </small>
                                                    )}
                                                </td>


                                                {/* INSTITUTE */}

                                                <td>
                                                    {
                                                        institute
                                                    }
                                                </td>


                                                {/* DEPARTMENT */}

                                                <td>
                                                    {
                                                        department
                                                    }
                                                </td>


                                                {/* YEAR */}

                                                <td>
                                                    {year}
                                                </td>


                                                {/* PAYMENT */}

                                                <td>

                                                    <span
                                                        className={`payment-status ${paymentStatus}`}
                                                    >
                                                        {
                                                            paymentStatus
                                                        }
                                                    </span>

                                                    {registration.paymentId && (
                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "5px",
                                                                color:
                                                                    "#858896",
                                                                maxWidth:
                                                                    "120px",
                                                                overflow:
                                                                    "hidden",
                                                                textOverflow:
                                                                    "ellipsis",
                                                                whiteSpace:
                                                                    "nowrap",
                                                            }}
                                                            title={
                                                                registration.paymentId
                                                            }
                                                        >
                                                            {
                                                                registration.paymentId
                                                            }
                                                        </small>
                                                    )}

                                                </td>


                                                {/* REGISTERED */}

                                                <td>
                                                    {
                                                        formatDateTime(
                                                            registration.registeredAt
                                                        )
                                                    }
                                                </td>

                                            </tr>
                                        );
                                    }
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="empty-table"
                                    >

                                        {registrations.length ===
                                        0
                                            ? "No participants have registered for this event yet."
                                            : "No registrations match your search or payment filter."}

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
};

export default EventRegistrations;