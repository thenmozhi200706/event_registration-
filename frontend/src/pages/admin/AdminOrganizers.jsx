// frontend/src/pages/admin/AdminOrganizers.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";

const AdminOrganizers = () => {
    // ============================================================
    // STATE
    // ============================================================

    const [organizers, setOrganizers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedOrganizer, setSelectedOrganizer] =
        useState(null);


    // ============================================================
    // GET ADMIN TOKEN
    // ============================================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            localStorage.getItem("jwt")
        );
    };


    // ============================================================
    // FETCH ORGANIZERS
    // ============================================================

    const fetchOrganizers = async () => {
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
                `${API_BASE_URL}/api/admin/organizers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data?.success) {
                setOrganizers(
                    Array.isArray(
                        response.data.organizers
                    )
                        ? response.data.organizers
                        : []
                );
            } else {
                setOrganizers([]);

                setError(
                    response.data?.message ||
                        "Failed to fetch organizers."
                );
            }

        } catch (err) {
            console.error(
                "Admin Organizers Error:",
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
                        "Unable to load organizers."
                );
            }

        } finally {
            setLoading(false);
        }
    };


    // ============================================================
    // LOAD ORGANIZERS
    // ============================================================

    useEffect(() => {
        fetchOrganizers();
    }, []);


    // ============================================================
    // FILTER ORGANIZERS
    // ============================================================

    const filteredOrganizers = useMemo(() => {
        return organizers.filter(
            (organizer) => {

                const name =
                    organizer.name || "";

                const email =
                    organizer.email || "";

                const searchText =
                    `${name} ${email}`
                        .toLowerCase();

                const matchesSearch =
                    searchText.includes(
                        search.toLowerCase()
                    );

                const isActive =
                    organizer.isActive === true;

                const matchesStatus =
                    statusFilter === "all" ||
                    (
                        statusFilter === "active" &&
                        isActive
                    ) ||
                    (
                        statusFilter === "inactive" &&
                        !isActive
                    );

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        organizers,
        search,
        statusFilter,
    ]);


    // ============================================================
    // STATISTICS
    // ============================================================

    const totalOrganizers =
        organizers.length;

    const activeOrganizers =
        organizers.filter(
            (organizer) =>
                organizer.isActive === true
        ).length;

    const inactiveOrganizers =
        organizers.filter(
            (organizer) =>
                organizer.isActive !== true
        ).length;

    const verifiedOrganizers =
        organizers.filter(
            (organizer) =>
                organizer.otpVerified === true
        ).length;


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
    // STATUS CLASS
    // ============================================================

    const getStatusClass = (isActive) => {
        return isActive
            ? "organizer-active"
            : "organizer-inactive";
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="admin-organizers-page">

                <div className="admin-organizers-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading organizers...
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="admin-organizers-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-organizers-header">

                <div>
                    <h1>
                        Organizer Management
                    </h1>

                    <p>
                        View and monitor all
                        EventSphere organizers.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-btn"
                    onClick={fetchOrganizers}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="admin-organizers-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={fetchOrganizers}
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="organizer-stat-cards">

                <div className="organizer-stat-card">

                    <div className="stat-icon">
                        👥
                    </div>

                    <div>
                        <span>
                            Total Organizers
                        </span>

                        <strong>
                            {totalOrganizers}
                        </strong>
                    </div>

                </div>


                <div className="organizer-stat-card">

                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>
                        <span>
                            Active
                        </span>

                        <strong>
                            {activeOrganizers}
                        </strong>
                    </div>

                </div>


                <div className="organizer-stat-card">

                    <div className="stat-icon">
                        !
                    </div>

                    <div>
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {inactiveOrganizers}
                        </strong>
                    </div>

                </div>


                <div className="organizer-stat-card">

                    <div className="stat-icon">
                        ✓
                    </div>

                    <div>
                        <span>
                            OTP Verified
                        </span>

                        <strong>
                            {verifiedOrganizers}
                        </strong>
                    </div>

                </div>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="organizer-filters">

                <div className="search-box">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search organizer by name or email..."
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

                    <option value="inactive">
                        Inactive
                    </option>

                </select>

            </div>


            {/* ==================================================
                ORGANIZERS TABLE
            ================================================== */}

            <div className="organizers-table-container">

                <table className="organizers-table">

                    <thead>

                        <tr>

                            <th>
                                Organizer
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                OTP Verification
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Added By
                            </th>

                            <th>
                                Created
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredOrganizers.length ===
                        0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="empty-organizers"
                                >
                                    No organizers
                                    found.
                                </td>

                            </tr>

                        ) : (

                            filteredOrganizers.map(
                                (organizer) => {

                                    const organizerName =
                                        organizer.name ||
                                        "Unknown Organizer";

                                    return (

                                        <tr
                                            key={
                                                organizer._id ||
                                                organizer.id
                                            }
                                        >

                                            {/* Organizer */}

                                            <td>

                                                <div className="organizer-profile">

                                                    <div className="organizer-avatar">

                                                        {organizerName
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                organizerName
                                                            }
                                                        </strong>

                                                        <small>
                                                            Organizer
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Email */}

                                            <td>

                                                <span>
                                                    {
                                                        organizer.email ||
                                                        "—"
                                                    }
                                                </span>

                                            </td>


                                            {/* OTP */}

                                            <td>

                                                {organizer.otpVerified ===
                                                true ? (

                                                    <span className="verification-badge verified">

                                                        ✓ Verified

                                                    </span>

                                                ) : (

                                                    <span className="verification-badge not-verified">

                                                        Pending

                                                    </span>

                                                )}

                                            </td>


                                            {/* Status */}

                                            <td>

                                                <span
                                                    className={`organizer-status ${getStatusClass(
                                                        organizer.isActive
                                                    )}`}
                                                >
                                                    {organizer.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>


                                            {/* Added By */}

                                            <td>

                                                <span>
                                                    {
                                                        organizer.addedByAdminId ||
                                                        "Admin"
                                                    }
                                                </span>

                                            </td>


                                            {/* Created */}

                                            <td>

                                                {formatDate(
                                                    organizer.createdAt
                                                )}

                                            </td>


                                            {/* Action */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="view-organizer-btn"
                                                    onClick={() =>
                                                        setSelectedOrganizer(
                                                            organizer
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

            <div className="organizer-results-count">

                Showing{" "}

                <strong>
                    {
                        filteredOrganizers.length
                    }
                </strong>

                {" "}of{" "}

                <strong>
                    {organizers.length}
                </strong>

                {" "}organizers

            </div>


            {/* ==================================================
                ORGANIZER DETAILS MODAL
            ================================================== */}

            {selectedOrganizer && (

                <div
                    className="organizer-modal-overlay"
                    onClick={() =>
                        setSelectedOrganizer(
                            null
                        )
                    }
                >

                    <div
                        className="organizer-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="organizer-modal-header">

                            <div>

                                <h2>
                                    Organizer Details
                                </h2>

                                <p>
                                    EventSphere
                                    organizer
                                    information
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedOrganizer(
                                        null
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="organizer-modal-body">

                            {/* Profile */}

                            <div className="organizer-modal-profile">

                                <div className="large-organizer-avatar">

                                    {(
                                        selectedOrganizer.name ||
                                        "O"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <h3>
                                        {
                                            selectedOrganizer.name ||
                                            "Unknown Organizer"
                                        }
                                    </h3>

                                    <p>
                                        {
                                            selectedOrganizer.email ||
                                            "—"
                                        }
                                    </p>

                                </div>

                            </div>


                            {/* Details */}

                            <div className="organizer-detail-grid">

                                <div className="organizer-detail">

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {
                                            selectedOrganizer.name ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div className="organizer-detail">

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {
                                            selectedOrganizer.email ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div className="organizer-detail">

                                    <span>
                                        OTP Verification
                                    </span>

                                    <strong>

                                        {selectedOrganizer.otpVerified
                                            ? "Verified"
                                            : "Pending"}

                                    </strong>

                                </div>


                                <div className="organizer-detail">

                                    <span>
                                        Account Status
                                    </span>

                                    <strong>

                                        {selectedOrganizer.isActive
                                            ? "Active"
                                            : "Inactive"}

                                    </strong>

                                </div>


                                <div className="organizer-detail">

                                    <span>
                                        Added By Admin
                                    </span>

                                    <strong>
                                        {
                                            selectedOrganizer.addedByAdminId ||
                                            "Admin"
                                        }
                                    </strong>

                                </div>


                                <div className="organizer-detail">

                                    <span>
                                        Created At
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedOrganizer.createdAt
                                        )}
                                    </strong>

                                </div>


                                <div className="organizer-detail">

                                    <span>
                                        Updated At
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedOrganizer.updatedAt
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminOrganizers;