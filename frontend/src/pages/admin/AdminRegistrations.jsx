// frontend/src/pages/admin/AdminRegistrations.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

const AdminRegistrations = () => {
    // ============================================================
    // STATE
    // ============================================================

    const [registrations, setRegistrations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [paymentFilter, setPaymentFilter] =
        useState("all");

    const [selectedRegistration, setSelectedRegistration] =
        useState(null);


    // ============================================================
    // GET TOKEN
    // ============================================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("jwt")
        );
    };


    // ============================================================
    // FETCH REGISTRATIONS
    // ============================================================

    const fetchRegistrations = async () => {
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
                `${API_BASE_URL}/api/admin/registrations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setRegistrations(
                    Array.isArray(
                        response.data.registrations
                    )
                        ? response.data.registrations
                        : []
                );
            } else {
                setRegistrations([]);

                setError(
                    response.data?.message ||
                        "Failed to fetch registrations."
                );
            }

        } catch (err) {
            console.error(
                "Admin Registrations Error:",
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
                        "Unable to load registrations."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {
        fetchRegistrations();
    }, []);


    // ============================================================
    // FILTER REGISTRATIONS
    // ============================================================

    const filteredRegistrations = useMemo(() => {
        return registrations.filter(
            (registration) => {

                const user =
                    registration.userId ||
                    registration.user ||
                    {};

                const event =
                    registration.eventId ||
                    registration.event ||
                    {};

                const name =
                    `${registration.firstName || ""} ${
                        registration.lastName || ""
                    }`.trim();

                const userName =
                    user.name || "";

                const email =
                    registration.email ||
                    user.email ||
                    "";

                const eventTitle =
                    event.title ||
                    "";

                const phone =
                    registration.whatsappNumber ||
                    user.whatsappNumber ||
                    "";

                const searchText =
                    `${name} ${userName} ${email} ${eventTitle} ${phone}`
                        .toLowerCase();

                const matchesSearch =
                    searchText.includes(
                        search.toLowerCase()
                    );

                const paymentStatus =
                    String(
                        registration.paymentStatus ||
                            ""
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


    // ============================================================
    // DATE FORMATTER
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
    // TIME FORMATTER
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
    // PAYMENT STATUS CLASS
    // ============================================================

    const getPaymentStatusClass = (
        status
    ) => {

        switch (
            String(status || "")
                .toLowerCase()
        ) {
            case "paid":
            case "success":
            case "completed":
                return "payment-paid";

            case "pending":
                return "payment-pending";

            case "failed":
                return "payment-failed";

            default:
                return "payment-default";
        }
    };


    // ============================================================
    // PAYMENT STATUS LABEL
    // ============================================================

    const getPaymentStatusLabel = (
        status
    ) => {

        switch (
            String(status || "")
                .toLowerCase()
        ) {
            case "paid":
                return "Paid";

            case "pending":
                return "Pending";

            case "failed":
                return "Failed";

            case "success":
                return "Success";

            case "completed":
                return "Completed";

            default:
                return status || "Unknown";
        }
    };


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalRegistrations =
        registrations.length;

    const paidRegistrations =
        registrations.filter(
            (registration) =>
                String(
                    registration.paymentStatus
                ).toLowerCase() === "paid"
        ).length;

    const pendingRegistrations =
        registrations.filter(
            (registration) =>
                String(
                    registration.paymentStatus
                ).toLowerCase() === "pending"
        ).length;

    const failedRegistrations =
        registrations.filter(
            (registration) =>
                String(
                    registration.paymentStatus
                ).toLowerCase() === "failed"
        ).length;


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="admin-registrations-page">

                <div className="admin-registrations-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading registrations...
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="admin-registrations-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-registrations-header">

                <div>
                    <h1>
                        Registration Management
                    </h1>

                    <p>
                        View and monitor all
                        participant registrations.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-btn"
                    onClick={fetchRegistrations}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="admin-registrations-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={fetchRegistrations}
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="registration-stat-cards">

                <div className="registration-stat-card">

                    <div className="stat-icon">
                        👥
                    </div>

                    <div>
                        <span>
                            Total
                        </span>

                        <strong>
                            {totalRegistrations}
                        </strong>
                    </div>

                </div>


                <div className="registration-stat-card">

                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>
                        <span>
                            Paid
                        </span>

                        <strong>
                            {paidRegistrations}
                        </strong>
                    </div>

                </div>


                <div className="registration-stat-card">

                    <div className="stat-icon">
                        ◷
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingRegistrations}
                        </strong>
                    </div>

                </div>


                <div className="registration-stat-card">

                    <div className="stat-icon">
                        !
                    </div>

                    <div>
                        <span>
                            Failed
                        </span>

                        <strong>
                            {failedRegistrations}
                        </strong>
                    </div>

                </div>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="registration-filters">

                <div className="search-box">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search participant, email, event..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                <select
                    value={paymentFilter}
                    onChange={(event) =>
                        setPaymentFilter(
                            event.target.value
                        )
                    }
                >

                    <option value="all">
                        All Payment Status
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
                TABLE
            ================================================== */}

            <div className="registrations-table-container">

                <table className="registrations-table">

                    <thead>

                        <tr>

                            <th>
                                Participant
                            </th>

                            <th>
                                Event
                            </th>

                            <th>
                                Contact
                            </th>

                            <th>
                                Institution
                            </th>

                            <th>
                                Payment
                            </th>

                            <th>
                                Registered
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredRegistrations.length ===
                        0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="empty-registrations"
                                >
                                    No registrations
                                    found.
                                </td>

                            </tr>

                        ) : (

                            filteredRegistrations.map(
                                (registration) => {

                                    const user =
                                        registration.userId ||
                                        registration.user ||
                                        {};

                                    const event =
                                        registration.eventId ||
                                        registration.event ||
                                        {};

                                    const participantName =
                                        `${registration.firstName || ""} ${
                                            registration.lastName || ""
                                        }`.trim() ||
                                        user.name ||
                                        "Unknown Participant";

                                    return (

                                        <tr
                                            key={
                                                registration._id ||
                                                registration.id
                                            }
                                        >

                                            {/* Participant */}

                                            <td>

                                                <div className="participant-info">

                                                    <div className="participant-avatar">

                                                        {participantName
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                participantName
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                registration.email ||
                                                                user.email ||
                                                                "—"
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Event */}

                                            <td>

                                                <strong>
                                                    {
                                                        event.title ||
                                                        "Unknown Event"
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        event.venue ||
                                                        "—"
                                                    }
                                                </small>

                                            </td>


                                            {/* Contact */}

                                            <td>

                                                <span>
                                                    {
                                                        registration.whatsappNumber ||
                                                        user.whatsappNumber ||
                                                        "—"
                                                    }
                                                </span>

                                            </td>


                                            {/* Institution */}

                                            <td>

                                                <div className="institution-info">

                                                    <strong>
                                                        {
                                                            registration.instituteName ||
                                                            user.instituteName ||
                                                            "—"
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            registration.department ||
                                                            user.department ||
                                                            ""
                                                        }

                                                        {
                                                            registration.year ||
                                                            user.year
                                                                ? ` • ${
                                                                      registration.year ||
                                                                      user.year
                                                                  }`
                                                                : ""
                                                        }
                                                    </small>

                                                </div>

                                            </td>


                                            {/* Payment */}

                                            <td>

                                                <span
                                                    className={`payment-status ${getPaymentStatusClass(
                                                        registration.paymentStatus
                                                    )}`}
                                                >
                                                    {
                                                        getPaymentStatusLabel(
                                                            registration.paymentStatus
                                                        )
                                                    }
                                                </span>

                                                {registration.paymentId && (

                                                    <small className="payment-id">

                                                        {
                                                            registration.paymentId
                                                        }

                                                    </small>

                                                )}

                                            </td>


                                            {/* Registered */}

                                            <td>

                                                <strong>
                                                    {formatDate(
                                                        registration.registeredAt
                                                    )}
                                                </strong>

                                                <small>
                                                    {formatTime(
                                                        registration.registeredAt
                                                    )}
                                                </small>

                                            </td>


                                            {/* Action */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-registration-btn"
                                                    onClick={() =>
                                                        setSelectedRegistration(
                                                            registration
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
                RESULTS COUNT
            ================================================== */}

            <div className="registration-results-count">

                Showing{" "}

                <strong>
                    {
                        filteredRegistrations.length
                    }
                </strong>

                {" "}of{" "}

                <strong>
                    {registrations.length}
                </strong>

                {" "}registrations

            </div>


            {/* ==================================================
                REGISTRATION DETAILS MODAL
            ================================================== */}

            {selectedRegistration && (

                <div
                    className="registration-modal-overlay"
                    onClick={() =>
                        setSelectedRegistration(
                            null
                        )
                    }
                >

                    <div
                        className="registration-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="registration-modal-header">

                            <div>

                                <h2>
                                    Registration Details
                                </h2>

                                <p>
                                    Participant
                                    registration
                                    information
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedRegistration(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="registration-modal-body">

                            {/* Participant */}

                            <div className="detail-section">

                                <h3>
                                    Participant
                                </h3>

                                <div className="detail-grid">

                                    <div>
                                        <span>
                                            Name
                                        </span>

                                        <strong>
                                            {`${selectedRegistration.firstName || ""} ${
                                                selectedRegistration.lastName || ""
                                            }`.trim() ||
                                                selectedRegistration.userId
                                                    ?.name ||
                                                "—"}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Email
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration.email ||
                                                selectedRegistration
                                                    .userId
                                                    ?.email ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            WhatsApp
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration
                                                    .whatsappNumber ||
                                                selectedRegistration
                                                    .userId
                                                    ?.whatsappNumber ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Age
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration.age ||
                                                selectedRegistration
                                                    .userId
                                                    ?.age ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* Institution */}

                            <div className="detail-section">

                                <h3>
                                    Institution
                                </h3>

                                <div className="detail-grid">

                                    <div>
                                        <span>
                                            College /
                                            School
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration
                                                    .instituteName ||
                                                selectedRegistration
                                                    .userId
                                                    ?.instituteName ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Department
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration
                                                    .department ||
                                                selectedRegistration
                                                    .userId
                                                    ?.department ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Year
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration
                                                    .year ||
                                                selectedRegistration
                                                    .userId
                                                    ?.year ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* Event */}

                            <div className="detail-section">

                                <h3>
                                    Event
                                </h3>

                                <div className="detail-grid">

                                    <div>
                                        <span>
                                            Event Name
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration
                                                    .eventId
                                                    ?.title ||
                                                selectedRegistration
                                                    .event
                                                    ?.title ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Venue
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration
                                                    .eventId
                                                    ?.venue ||
                                                selectedRegistration
                                                    .event
                                                    ?.venue ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Event Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedRegistration
                                                    .eventId
                                                    ?.eventDate ||
                                                selectedRegistration
                                                    .event
                                                    ?.eventDate
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* Payment */}

                            <div className="detail-section">

                                <h3>
                                    Payment
                                </h3>

                                <div className="detail-grid">

                                    <div>
                                        <span>
                                            Status
                                        </span>

                                        <strong>

                                            <span
                                                className={`payment-status ${getPaymentStatusClass(
                                                    selectedRegistration.paymentStatus
                                                )}`}
                                            >
                                                {
                                                    getPaymentStatusLabel(
                                                        selectedRegistration.paymentStatus
                                                    )
                                                }
                                            </span>

                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Payment ID
                                        </span>

                                        <strong>
                                            {
                                                selectedRegistration.paymentId ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Registration
                                            Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedRegistration.registeredAt
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminRegistrations;