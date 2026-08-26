// =====================================================
// EVENTSPHERE - EVENT PARTICIPANTS
// =====================================================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Mail,
    Phone,
    RefreshCw,
    Search,
    User,
    XCircle,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import api from "../../api/api";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import "./Participants.css";


const Participants = () => {
    const navigate = useNavigate();

    const { eventId } = useParams();

    // =================================================
    // STATE
    // =================================================

    const [event, setEvent] = useState(null);

    const [registrations, setRegistrations] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    // =================================================
    // CONFIRM PAYMENT STATE
    // =================================================

    const [
        confirmingPaymentId,
        setConfirmingPaymentId,
    ] = useState(null);


    // =================================================
    // LOAD PARTICIPANTS
    // =================================================

    const loadParticipants = useCallback(
        async (isRefresh = false) => {
            if (!eventId) {
                setError(
                    "Event ID is missing."
                );

                setLoading(false);

                return;
            }

            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response =
                    await api.get(
                        `/registrations/event/${eventId}`
                    );

                const data =
                    response?.data ||
                    response;

                if (
                    data?.success === false
                ) {
                    throw new Error(
                        data?.message ||
                        "Unable to load participants."
                    );
                }

                setEvent(
                    data?.event || null
                );

                setRegistrations(
                    Array.isArray(
                        data?.registrations
                    )
                        ? data.registrations
                        : []
                );
            } catch (err) {
                console.error(
                    "Load participants error:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load registered participants."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [eventId]
    );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {
        loadParticipants();
    }, [loadParticipants]);


    // =================================================
    // FORMAT DATE
    // =================================================

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const value =
            new Date(date);

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return "Not available";
        }

        return value.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =================================================
    // FORMAT CURRENCY
    // =================================================

    const formatCurrency = (
        amount
    ) => {
        return Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
            }
        );
    };


    // =================================================
    // GET PARTICIPANT NAME
    // =================================================

    const getParticipantName = (
        registration
    ) => {
        const firstName =
            registration?.firstName ||
            "";

        const lastName =
            registration?.lastName ||
            "";

        const registrationName =
            `${firstName} ${lastName}`
                .trim();

        if (registrationName) {
            return registrationName;
        }

        if (
            registration?.userId?.name
        ) {
            return registration.userId.name;
        }

        return "Participant";
    };


    // =================================================
    // GET PARTICIPANT EMAIL
    // =================================================

    const getParticipantEmail = (
        registration
    ) => {
        return (
            registration?.email ||
            registration?.userId?.email ||
            "Email not available"
        );
    };


    // =================================================
    // GET PROFILE IMAGE
    // =================================================

    const getProfileImage = (
        registration
    ) => {
        return (
            registration?.userId
                ?.profileImage ||
            ""
        );
    };


    // =================================================
    // GET PAYMENT METHOD
    // =================================================

    const getEventPaymentMethod = () => {
        return String(
            event?.paymentMethod ||
            ""
        )
            .trim()
            .toLowerCase();
    };


    // =================================================
    // CHECK MANUAL PAYMENT EVENT
    // =================================================
    //
    // Event model uses:
    //
    // free
    // razorpay
    // upi
    //
    // "qr" is also supported here so the
    // frontend remains compatible if an older
    // event contains qr as payment method.
    // =================================================

    const isManualPaymentEvent =
        getEventPaymentMethod() ===
            "upi" ||
        getEventPaymentMethod() ===
            "qr";


    // =================================================
    // PAYMENT STATUS CLASS
    // =================================================

    const getPaymentStatusClass = (
        status
    ) => {
        switch (status) {
            case "paid":
                return "paid";

            case "pending":
                return "pending";

            case "payment_submitted":
                return "submitted";

            case "failed":
                return "failed";

            case "rejected":
                return "rejected";

            case "refunded":
                return "refunded";

            default:
                return "unknown";
        }
    };


    // =================================================
    // PAYMENT STATUS TEXT
    // =================================================

    const getPaymentStatusText = (
        status
    ) => {
        switch (status) {
            case "paid":
                return "Paid";

            case "pending":
                return "Pending";

            case "payment_submitted":
                return "Submitted";

            case "failed":
                return "Failed";

            case "rejected":
                return "Rejected";

            case "refunded":
                return "Refunded";

            default:
                return "Unknown";
        }
    };


    // =================================================
    // CONFIRM UPI / QR PAYMENT
    // =================================================

    const handleConfirmPayment = async (
        registration
    ) => {
        if (
            !registration?._id ||
            confirmingPaymentId
        ) {
            return;
        }

        const paymentStatus =
            String(
                registration?.paymentStatus ||
                "pending"
            )
                .trim()
                .toLowerCase();

        // ---------------------------------------------
        // Already paid
        // ---------------------------------------------

        if (
            paymentStatus ===
            "paid"
        ) {
            return;
        }

        // ---------------------------------------------
        // Failed / rejected / refunded
        // ---------------------------------------------

        if (
            paymentStatus ===
                "failed" ||
            paymentStatus ===
                "rejected" ||
            paymentStatus ===
                "refunded"
        ) {
            return;
        }

        // ---------------------------------------------
        // Check payment method
        // ---------------------------------------------

        if (!isManualPaymentEvent) {
            setError(
                "Manual payment confirmation is only available for UPI or QR payment events."
            );

            return;
        }

        // ---------------------------------------------
        // Confirm dialog
        // ---------------------------------------------

        const participantName =
            getParticipantName(
                registration
            );

        const confirmed =
            window.confirm(
                `Confirm the payment received from ${participantName}?\n\nAfter confirmation, the participant registration will be marked as Paid.`
            );

        if (!confirmed) {
            return;
        }

        try {
            setConfirmingPaymentId(
                registration._id
            );

            setError("");

            // -----------------------------------------
            // Confirm payment on backend
            // -----------------------------------------

            const response =
                await api.patch(
                    `/registrations/${registration._id}/confirm-payment`
                );

            const data =
                response?.data ||
                response;

            if (
                data?.success === false
            ) {
                throw new Error(
                    data?.message ||
                    "Failed to confirm payment."
                );
            }

            // -----------------------------------------
            // Refresh participant data
            // -----------------------------------------

            await loadParticipants(
                true
            );

        } catch (err) {
            console.error(
                "Confirm payment error:",
                err?.response?.data ||
                err?.message ||
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to confirm payment."
            );
        } finally {
            setConfirmingPaymentId(
                null
            );
        }
    };


    // =================================================
    // FILTER PARTICIPANTS
    // =================================================

    const filteredRegistrations =
        useMemo(() => {
            const search =
                searchTerm
                    .trim()
                    .toLowerCase();

            return registrations.filter(
                (registration) => {
                    const name =
                        getParticipantName(
                            registration
                        ).toLowerCase();

                    const email =
                        getParticipantEmail(
                            registration
                        ).toLowerCase();

                    const institute =
                        String(
                            registration
                                ?.instituteName ||
                            ""
                        ).toLowerCase();

                    const department =
                        String(
                            registration
                                ?.department ||
                            ""
                        ).toLowerCase();

                    const whatsapp =
                        String(
                            registration
                                ?.whatsappNumber ||
                            ""
                        ).toLowerCase();

                    const status =
                        String(
                            registration
                                ?.paymentStatus ||
                            ""
                        ).toLowerCase();

                    const matchesSearch =
                        !search ||
                        name.includes(search) ||
                        email.includes(search) ||
                        institute.includes(search) ||
                        department.includes(search) ||
                        whatsapp.includes(search);

                    const matchesStatus =
                        statusFilter ===
                            "all" ||
                        status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            registrations,
            searchTerm,
            statusFilter,
        ]);


    // =================================================
    // STATISTICS
    // =================================================

    const totalParticipants =
        registrations.length;

    const paidParticipants =
        registrations.filter(
            (item) =>
                item.paymentStatus ===
                "paid"
        ).length;

    const pendingParticipants =
        registrations.filter(
            (item) =>
                item.paymentStatus ===
                    "pending" ||
                item.paymentStatus ===
                    "payment_submitted"
        ).length;

    const failedParticipants =
        registrations.filter(
            (item) =>
                item.paymentStatus ===
                    "failed" ||
                item.paymentStatus ===
                    "rejected"
        ).length;


    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <main className="participants-page">
                <div className="participants-state">
                    <Loader />

                    <p>
                        Loading registered participants...
                    </p>
                </div>
            </main>
        );
    }


    // =================================================
    // ERROR
    // =================================================

    if (error && !event) {
        return (
            <main className="participants-page">
                <div className="participants-state">

                    <ErrorMessage
                        message={error}
                    />

                    <div className="participants-state-actions">

                        <button
                            type="button"
                            onClick={() =>
                                loadParticipants()
                            }
                            className="participants-retry-button"
                        >
                            Try Again
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/organizer/manage-event/${eventId}`
                                )
                            }
                            className="participants-back-button"
                        >
                            Back to Event
                        </button>

                    </div>

                </div>
            </main>
        );
    }


    // =================================================
    // PAGE
    // =================================================

    return (
        <main className="participants-page">

            <div className="participants-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="participants-header">

                    <div>

                        <button
                            type="button"
                            className="participants-back-link"
                            onClick={() =>
                                navigate(
                                    `/organizer/manage-event/${eventId}`
                                )
                            }
                        >

                            <ArrowLeft
                                size={17}
                            />

                            Back to Manage Event

                        </button>


                        <span className="participants-eyebrow">
                            ORGANIZER
                        </span>


                        <h1>
                            Registered Participants
                        </h1>


                        <p>
                            View and manage participants
                            registered for this event.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="participants-refresh-button"
                        onClick={() =>
                            loadParticipants(true)
                        }
                        disabled={
                            refreshing
                        }
                    >

                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "participants-spinning"
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

                    <div className="participants-error">

                        <XCircle
                            size={17}
                        />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    EVENT SUMMARY
                ================================================= */}

                <section className="participants-event-card">

                    <div>

                        <span>
                            EVENT
                        </span>

                        <h2>
                            {event?.title ||
                                "Event"}
                        </h2>

                    </div>


                    <div className="participants-event-meta">

                        <div>

                            <CalendarDays
                                size={16}
                            />

                            <span>
                                Event registration
                            </span>

                        </div>


                        <div>

                            <span>
                                Registration Fee
                            </span>

                            <strong>
                                {formatCurrency(
                                    event?.registrationFee
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="participants-statistics">

                    <div className="participants-stat-card">

                        <div className="participants-stat-icon">

                            <User
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Total
                            </span>

                            <strong>
                                {
                                    totalParticipants
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="participants-stat-card">

                        <div className="participants-stat-icon paid">

                            <CheckCircle2
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Paid
                            </span>

                            <strong>
                                {
                                    paidParticipants
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="participants-stat-card">

                        <div className="participants-stat-icon pending">

                            <Clock3
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {
                                    pendingParticipants
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="participants-stat-card">

                        <div className="participants-stat-icon failed">

                            <XCircle
                                size={19}
                            />

                        </div>

                        <div>

                            <span>
                                Failed
                            </span>

                            <strong>
                                {
                                    failedParticipants
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SEARCH + FILTER
                ================================================= */}

                <section className="participants-controls">

                    <div className="participants-search">

                        <Search
                            size={18}
                        />

                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search by name, email, college..."
                        />

                    </div>


                    <select
                        value={
                            statusFilter
                        }
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="participants-status-filter"
                    >

                        <option value="all">
                            All
                        </option>

                        <option value="paid">
                            Paid
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="payment_submitted">
                            Submitted
                        </option>

                        <option value="failed">
                            Failed
                        </option>

                        <option value="rejected">
                            Rejected
                        </option>

                    </select>

                </section>


                {/* =================================================
                    PARTICIPANTS TABLE
                ================================================= */}

                <section className="participants-table-card">

                    <div className="participants-table-header">

                        <div>

                            <h2>
                                Participants
                            </h2>

                            <p>
                                Showing{" "}
                                {
                                    filteredRegistrations.length
                                }{" "}
                                of{" "}
                                {
                                    registrations.length
                                }{" "}
                                registrations
                            </p>

                        </div>

                    </div>


                    {filteredRegistrations.length ===
                    0 ? (

                        <div className="participants-empty">

                            <User
                                size={36}
                            />

                            <h3>
                                No participants found
                            </h3>

                            <p>
                                No registered participant
                                matches your search or
                                filter.
                            </p>

                        </div>

                    ) : (

                        <div className="participants-table-wrapper">

                            <table className="participants-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Participant
                                        </th>

                                        <th>
                                            Contact
                                        </th>

                                        <th>
                                            Institution
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
                                            Action
                                        </th>

                                        <th>
                                            Registered
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredRegistrations.map(
                                        (
                                            registration
                                        ) => {

                                            const name =
                                                getParticipantName(
                                                    registration
                                                );

                                            const email =
                                                getParticipantEmail(
                                                    registration
                                                );

                                            const profileImage =
                                                getProfileImage(
                                                    registration
                                                );

                                            const paymentStatus =
                                                registration
                                                    ?.paymentStatus ||
                                                "pending";

                                            const isPaid =
                                                paymentStatus ===
                                                "paid";

                                            const isFailed =
                                                paymentStatus ===
                                                    "failed" ||
                                                paymentStatus ===
                                                    "rejected" ||
                                                paymentStatus ===
                                                    "refunded";

                                            const isConfirming =
                                                confirmingPaymentId ===
                                                registration?._id;

                                            return (

                                                <tr
                                                    key={
                                                        registration
                                                            ?._id
                                                    }
                                                >

                                                    {/* PARTICIPANT */}

                                                    <td>

                                                        <div className="participant-name-cell">

                                                            {profileImage ? (

                                                                <img
                                                                    src={
                                                                        profileImage
                                                                    }
                                                                    alt={
                                                                        name
                                                                    }
                                                                    className="participant-avatar"
                                                                />

                                                            ) : (

                                                                <div className="participant-avatar participant-avatar-placeholder">

                                                                    {name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}

                                                                </div>

                                                            )}


                                                            <div>

                                                                <strong>
                                                                    {name}
                                                                </strong>

                                                                <span>
                                                                    Age:{" "}
                                                                    {
                                                                        registration
                                                                            ?.age ??
                                                                        "N/A"
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* CONTACT */}

                                                    <td>

                                                        <div className="participant-contact-cell">

                                                            <a
                                                                href={`mailto:${email}`}
                                                            >

                                                                <Mail
                                                                    size={14}
                                                                />

                                                                {
                                                                    email
                                                                }

                                                            </a>


                                                            {registration
                                                                ?.whatsappNumber && (

                                                                <a
                                                                    href={`tel:${registration.whatsappNumber}`}
                                                                >

                                                                    <Phone
                                                                        size={14}
                                                                    />

                                                                    {
                                                                        registration.whatsappNumber
                                                                    }

                                                                </a>

                                                            )}

                                                        </div>

                                                    </td>


                                                    {/* INSTITUTION */}

                                                    <td>

                                                        <span>
                                                            {
                                                                registration
                                                                    ?.instituteName ||
                                                                "Not provided"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* DEPARTMENT */}

                                                    <td>

                                                        <span>
                                                            {
                                                                registration
                                                                    ?.department ||
                                                                "Not provided"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* YEAR */}

                                                    <td>

                                                        <span>
                                                            {
                                                                registration
                                                                    ?.year ||
                                                                "N/A"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* PAYMENT */}

                                                    <td>

                                                        <div className="participant-payment-cell">

                                                            <span
                                                                className={`participant-payment-status ${getPaymentStatusClass(
                                                                    paymentStatus
                                                                )}`}
                                                            >

                                                                {isPaid ? (

                                                                    <CheckCircle2
                                                                        size={13}
                                                                    />

                                                                ) : isFailed ? (

                                                                    <XCircle
                                                                        size={13}
                                                                    />

                                                                ) : (

                                                                    <Clock3
                                                                        size={13}
                                                                    />

                                                                )}

                                                                {
                                                                    getPaymentStatusText(
                                                                        paymentStatus
                                                                    )
                                                                }

                                                            </span>


                                                            <strong>
                                                                {formatCurrency(
                                                                    isPaid &&
                                                                    Number(
                                                                        registration?.amount ||
                                                                        0
                                                                    ) ===
                                                                    0
                                                                        ? event?.registrationFee
                                                                        : registration?.amount
                                                                )}
                                                            </strong>

                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        {isManualPaymentEvent &&
                                                        !isPaid &&
                                                        !isFailed ? (

                                                            <button
                                                                type="button"
                                                                className="confirm-payment-button"
                                                                onClick={() =>
                                                                    handleConfirmPayment(
                                                                        registration
                                                                    )
                                                                }
                                                                disabled={
                                                                    isConfirming ||
                                                                    confirmingPaymentId !==
                                                                        null
                                                                }
                                                            >

                                                                {isConfirming ? (

                                                                    <>

                                                                        <RefreshCw
                                                                            size={14}
                                                                            className="participants-spinning"
                                                                        />

                                                                        Confirming...

                                                                    </>

                                                                ) : (

                                                                    <>

                                                                        <BadgeCheck
                                                                            size={15}
                                                                        />

                                                                        Confirm Payment

                                                                    </>

                                                                )}

                                                            </button>

                                                        ) : isPaid ? (

                                                            <span className="payment-confirmed-label">

                                                                <CheckCircle2
                                                                    size={14}
                                                                />

                                                                Confirmed

                                                            </span>

                                                        ) : (

                                                            <span className="payment-not-required">

                                                                —

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* REGISTERED */}

                                                    <td>

                                                        <span>
                                                            {formatDate(
                                                                registration?.registeredAt ||
                                                                registration?.createdAt
                                                            )}
                                                        </span>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>

        </main>
    );
};


export default Participants;