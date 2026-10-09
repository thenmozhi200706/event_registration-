import React, { useMemo, useState } from "react";
import "./RegistrationTable.css";
const RegistrationTable = ({
    registrations = [],
    loading = false,
    onRefresh,
    onView,
}) => {
    const [search, setSearch] = useState("");
    const [paymentFilter, setPaymentFilter] =
        useState("all");

    /* ============================================================
       FORMAT HELPERS
    ============================================================ */

    const formatDate = (date) => {
        if (!date) return "-";

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

    const formatDateTime = (date) => {
        if (!date) return "-";

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

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }
        )}`;
    };

    /* ============================================================
       GET PARTICIPANT NAME
    ============================================================ */

    const getParticipantName = (registration) => {
        const firstName =
            registration.firstName || "";

        const lastName =
            registration.lastName || "";

        const combinedName =
            `${firstName} ${lastName}`.trim();

        if (combinedName) {
            return combinedName;
        }

        if (
            registration.userId &&
            typeof registration.userId === "object"
        ) {
            return (
                registration.userId.name ||
                registration.userId.fullName ||
                registration.userId.email ||
                "Participant"
            );
        }

        return "Participant";
    };

    /* ============================================================
       GET EMAIL
    ============================================================ */

    const getEmail = (registration) => {
        if (registration.email) {
            return registration.email;
        }

        if (
            registration.userId &&
            typeof registration.userId === "object"
        ) {
            return registration.userId.email || "-";
        }

        return "-";
    };

    /* ============================================================
       GET WHATSAPP
    ============================================================ */

    const getWhatsapp = (registration) => {
        if (registration.whatsappNumber) {
            return registration.whatsappNumber;
        }

        if (
            registration.userId &&
            typeof registration.userId === "object"
        ) {
            return (
                registration.userId.whatsappNumber ||
                "-"
            );
        }

        return "-";
    };

    /* ============================================================
       GET PAYMENT STATUS
    ============================================================ */

    const getPaymentStatus = (registration) => {
        return String(
            registration.paymentStatus ||
                registration.payment?.status ||
                "pending"
        ).toLowerCase();
    };

    /* ============================================================
       GET PAYMENT ID
    ============================================================ */

    const getPaymentId = (registration) => {
        return (
            registration.paymentId ||
            registration.payment?.paymentId ||
            registration.payment?.gatewayResponse
                ?.razorpay_payment_id ||
            registration.payment?.gatewayResponse
                ?.payment_id ||
            "-"
        );
    };

    /* ============================================================
       FILTER REGISTRATIONS
    ============================================================ */

    const filteredRegistrations = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return registrations.filter(
            (registration) => {
                const name =
                    getParticipantName(
                        registration
                    ).toLowerCase();

                const email =
                    getEmail(
                        registration
                    ).toLowerCase();

                const institute =
                    String(
                        registration.instituteName ||
                            ""
                    ).toLowerCase();

                const department =
                    String(
                        registration.department ||
                            ""
                    ).toLowerCase();

                const paymentStatus =
                    getPaymentStatus(
                        registration
                    );

                const paymentMatches =
                    paymentFilter === "all" ||
                    paymentStatus ===
                        paymentFilter;

                const searchMatches =
                    !query ||
                    name.includes(query) ||
                    email.includes(query) ||
                    institute.includes(query) ||
                    department.includes(query);

                return (
                    searchMatches &&
                    paymentMatches
                );
            }
        );
    }, [
        registrations,
        search,
        paymentFilter,
    ]);

    /* ============================================================
       SUMMARY
    ============================================================ */

    const totalCount =
        registrations.length;

    const paidCount = registrations.filter(
        (registration) =>
            getPaymentStatus(
                registration
            ) === "paid"
    ).length;

    const pendingCount = registrations.filter(
        (registration) =>
            getPaymentStatus(
                registration
            ) === "pending"
    ).length;

    const failedCount = registrations.filter(
        (registration) =>
            getPaymentStatus(
                registration
            ) === "failed"
    ).length;

    /* ============================================================
       EXPORT CSV
    ============================================================ */

    const exportCSV = () => {
        if (!filteredRegistrations.length) {
            return;
        }

        const headers = [
            "Name",
            "Email",
            "WhatsApp",
            "Institute",
            "Department",
            "Year",
            "Payment Status",
            "Payment ID",
            "Registered At",
        ];

        const rows =
            filteredRegistrations.map(
                (registration) => [
                    getParticipantName(
                        registration
                    ),
                    getEmail(registration),
                    getWhatsapp(
                        registration
                    ),
                    registration.instituteName ||
                        "",
                    registration.department ||
                        "",
                    registration.year || "",
                    getPaymentStatus(
                        registration
                    ),
                    getPaymentId(
                        registration
                    ),
                    formatDateTime(
                        registration.registeredAt
                    ),
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

        link.download = `event-registrations-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    /* ============================================================
       VIEW REGISTRATION
    ============================================================ */

    const handleView = (registration) => {
        if (onView) {
            onView(registration);
        }
    };

    /* ============================================================
       LOADING
    ============================================================ */

    if (loading) {
        return (
            <div className="registration-table-card">

                <div className="registration-table-loading">
                    <div className="registration-loading-spinner"></div>

                    <span>
                        Loading registrations...
                    </span>
                </div>

            </div>
        );
    }

    return (
        <div className="registration-table-card">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="registration-table-header">

                <div>

                    <h2>
                        Event Registrations
                    </h2>

                    <p>
                        View and manage
                        participants registered
                        for this event.
                    </p>

                </div>


                <div className="registration-table-header-actions">

                    {onRefresh && (
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={onRefresh}
                        >
                            ↻ Refresh
                        </button>
                    )}

                    <button
                        type="button"
                        className="submit-button"
                        onClick={exportCSV}
                        disabled={
                            !filteredRegistrations.length
                        }
                    >
                        ↓ Export CSV
                    </button>

                </div>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="registration-summary">

                <div className="registration-summary-item">

                    <span>
                        Total
                    </span>

                    <strong>
                        {totalCount}
                    </strong>

                </div>


                <div className="registration-summary-item registration-summary-paid">

                    <span>
                        Paid
                    </span>

                    <strong>
                        {paidCount}
                    </strong>

                </div>


                <div className="registration-summary-item registration-summary-pending">

                    <span>
                        Pending
                    </span>

                    <strong>
                        {pendingCount}
                    </strong>

                </div>


                <div className="registration-summary-item registration-summary-failed">

                    <span>
                        Failed
                    </span>

                    <strong>
                        {failedCount}
                    </strong>

                </div>

            </div>


            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="registration-table-filters">

                <div className="registration-search">

                    <span>
                        ⌕
                    </span>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search participant, email, institute..."
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}

                </div>


                <select
                    value={paymentFilter}
                    onChange={(event) =>
                        setPaymentFilter(
                            event.target.value
                        )
                    }
                    className="registration-filter-select"
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
                RESULT COUNT
            ================================================== */}

            <div className="registration-result-count">

                Showing{" "}
                <strong>
                    {filteredRegistrations.length}
                </strong>{" "}
                of{" "}
                <strong>
                    {totalCount}
                </strong>{" "}
                registrations

            </div>


            {/* ==================================================
                TABLE
            ================================================== */}

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

                            {onView && (
                                <th>
                                    Action
                                </th>
                            )}

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
                                    const paymentStatus =
                                        getPaymentStatus(
                                            registration
                                        );

                                    const name =
                                        getParticipantName(
                                            registration
                                        );

                                    return (
                                        <tr
                                            key={
                                                registration._id ||
                                                registration.id ||
                                                index
                                            }
                                        >

                                            {/* PARTICIPANT */}

                                            <td>

                                                <div className="registration-participant">

                                                    <div className="registration-avatar">
                                                        {name
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="registration-participant-info">

                                                        <strong>
                                                            {name}
                                                        </strong>

                                                        <span>
                                                            {getEmail(
                                                                registration
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* CONTACT */}

                                            <td>

                                                <div className="registration-contact">

                                                    <span>
                                                        {getWhatsapp(
                                                            registration
                                                        )}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* INSTITUTE */}

                                            <td>

                                                <span
                                                    title={
                                                        registration.instituteName ||
                                                        ""
                                                    }
                                                >
                                                    {registration.instituteName ||
                                                        "-"}
                                                </span>

                                            </td>


                                            {/* DEPARTMENT */}

                                            <td>

                                                {registration.department ||
                                                    "-"}

                                            </td>


                                            {/* YEAR */}

                                            <td>

                                                {registration.year ||
                                                    "-"}

                                            </td>


                                            {/* PAYMENT */}

                                            <td>

                                                <div className="registration-payment-cell">

                                                    <span
                                                        className={`payment-status payment-status-${paymentStatus}`}
                                                    >
                                                        {
                                                            paymentStatus
                                                        }
                                                    </span>

                                                    {getPaymentId(
                                                        registration
                                                    ) !==
                                                        "-" && (
                                                        <small
                                                            title={getPaymentId(
                                                                registration
                                                            )}
                                                        >
                                                            {String(
                                                                getPaymentId(
                                                                    registration
                                                                )
                                                            ).length >
                                                            18
                                                                ? `${String(
                                                                      getPaymentId(
                                                                          registration
                                                                      )
                                                                  ).substring(
                                                                      0,
                                                                      18
                                                                  )}...`
                                                                : getPaymentId(
                                                                      registration
                                                                  )}
                                                        </small>
                                                    )}

                                                </div>

                                            </td>


                                            {/* REGISTERED */}

                                            <td>

                                                <span
                                                    title={formatDateTime(
                                                        registration.registeredAt
                                                    )}
                                                >
                                                    {formatDate(
                                                        registration.registeredAt
                                                    )}
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            {onView && (
                                                <td>

                                                    <button
                                                        type="button"
                                                        className="registration-view-button"
                                                        onClick={() =>
                                                            handleView(
                                                                registration
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>

                                                </td>
                                            )}

                                        </tr>
                                    );
                                }
                            )
                        ) : (
                            <tr>

                                <td
                                    colSpan={
                                        onView
                                            ? 8
                                            : 7
                                    }
                                    className="registration-empty-table"
                                >

                                    <div>

                                        <span>
                                            ♙
                                        </span>

                                        <strong>
                                            No registrations
                                            found
                                        </strong>

                                        <p>
                                            Try changing
                                            your search
                                            or payment
                                            filter.
                                        </p>

                                    </div>

                                </td>

                            </tr>
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default RegistrationTable;