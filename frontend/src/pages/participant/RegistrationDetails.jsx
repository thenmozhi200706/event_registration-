import React, { useCallback, useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Download,
    IndianRupee,
    Loader2,
    MapPin,
    Ticket,
    User,
    XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import registrationService from "../../services/registrationService";
import "./RegistrationDetails.css";


const RegistrationDetails = () => {
    const { registrationId } = useParams();
    const navigate = useNavigate();

    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);


    /*
     * ============================================================
     * LOAD REGISTRATION
     * ============================================================
     */

    const loadRegistration = useCallback(async () => {
        if (!registrationId) {
            setError("Registration ID is missing.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                await registrationService.getRegistrationById(
                    registrationId
                );

            /*
             * Support common API response formats.
             */
            const data =
                response?.data?.registration ||
                response?.data?.data ||
                response?.registration ||
                response?.data ||
                response;

            if (!data) {
                throw new Error(
                    "Registration details were not found."
                );
            }

            setRegistration(data);
        } catch (err) {
            console.error(
                "Failed to load registration:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load registration details."
            );
        } finally {
            setLoading(false);
        }
    }, [registrationId]);


    useEffect(() => {
        loadRegistration();
    }, [loadRegistration]);


    /*
     * ============================================================
     * HELPER FUNCTIONS
     * ============================================================
     */

    const getEvent = () => {
        return (
            registration?.event ||
            registration?.eventId ||
            {}
        );
    };

    const getParticipant = () => {
        return (
            registration?.participant ||
            registration?.user ||
            {}
        );
    };

    const event = getEvent();
    const participant = getParticipant();


    const getEventName = () => {
        return (
            event?.title ||
            event?.name ||
            registration?.eventName ||
            "Event"
        );
    };


    const getEventImage = () => {
        return (
            event?.image ||
            event?.imageUrl ||
            event?.bannerImage ||
            event?.coverImage ||
            ""
        );
    };


    const getEventDate = () => {
        return (
            event?.date ||
            event?.eventDate ||
            registration?.eventDate ||
            null
        );
    };


    const getEventTime = () => {
        return (
            event?.time ||
            event?.eventTime ||
            registration?.eventTime ||
            ""
        );
    };


    const getEventLocation = () => {
        return (
            event?.venue ||
            event?.location ||
            event?.address ||
            registration?.venue ||
            registration?.location ||
            "Location not available"
        );
    };


    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "Date not available";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "Not available";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };


    const getAmount = () => {
        const amount =
            registration?.amount ??
            registration?.totalAmount ??
            registration?.price ??
            event?.price ??
            0;

        const numericAmount = Number(amount);

        return Number.isFinite(numericAmount)
            ? numericAmount
            : 0;
    };


    const getRegistrationStatus = () => {
        return (
            registration?.status ||
            registration?.registrationStatus ||
            "confirmed"
        );
    };


    const getPaymentStatus = () => {
        return (
            registration?.paymentStatus ||
            registration?.payment?.status ||
            (getAmount() === 0
                ? "free"
                : "pending")
        );
    };


    const normalizeStatus = (value) => {
        return String(value || "")
            .trim()
            .toLowerCase();
    };


    const registrationStatus =
        normalizeStatus(getRegistrationStatus());

    const paymentStatus =
        normalizeStatus(getPaymentStatus());


    const isCancelled =
        registrationStatus === "cancelled" ||
        registrationStatus === "canceled" ||
        registrationStatus === "rejected";


    const isConfirmed =
        registrationStatus === "confirmed" ||
        registrationStatus === "approved" ||
        registrationStatus === "registered" ||
        registrationStatus === "active";


    const getStatusLabel = () => {
        if (isCancelled) {
            return "Cancelled";
        }

        if (isConfirmed) {
            return "Confirmed";
        }

        return (
            registration?.status ||
            "Pending"
        );
    };


    const getPaymentLabel = () => {
        if (
            paymentStatus === "paid" ||
            paymentStatus === "success" ||
            paymentStatus === "successful" ||
            paymentStatus === "completed"
        ) {
            return "Paid";
        }

        if (
            paymentStatus === "free" ||
            getAmount() === 0
        ) {
            return "Free";
        }

        if (
            paymentStatus === "failed" ||
            paymentStatus === "failure"
        ) {
            return "Failed";
        }

        return (
            registration?.paymentStatus ||
            "Pending"
        );
    };


    /*
     * ============================================================
     * DOWNLOAD TICKET
     * ============================================================
     */

    const handleDownloadTicket = async () => {
        try {
            setDownloading(true);

            /*
             * If the backend later provides a ticket/PDF endpoint,
             * this section can be connected directly.
             *
             * For now, create a printable ticket using the browser.
             */

            const ticketNumber =
                registration?.ticketNumber ||
                registration?.ticketId ||
                registration?.registrationNumber ||
                registration?._id ||
                registrationId;

            const printWindow =
                window.open(
                    "",
                    "_blank",
                    "width=800,height=900"
                );

            if (!printWindow) {
                throw new Error(
                    "Please allow pop-ups to download your ticket."
                );
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>EventSphere Ticket</title>

                        <style>
                            * {
                                box-sizing: border-box;
                            }

                            body {
                                margin: 0;
                                padding: 40px;
                                background: #f5f5fa;
                                font-family: Arial, sans-serif;
                                color: #111827;
                            }

                            .ticket {
                                max-width: 650px;
                                margin: 0 auto;
                                background: white;
                                border-radius: 20px;
                                overflow: hidden;
                                border: 1px solid #e5e7eb;
                                box-shadow:
                                    0 15px 45px
                                    rgba(15, 23, 42, 0.08);
                            }

                            .ticket-header {
                                padding: 25px;
                                background: #6845dc;
                                color: white;
                            }

                            .brand {
                                font-size: 13px;
                                font-weight: bold;
                                letter-spacing: 2px;
                            }

                            .ticket-body {
                                padding: 30px;
                            }

                            h1 {
                                margin: 0 0 20px;
                                font-size: 28px;
                            }

                            .row {
                                padding: 12px 0;
                                border-bottom: 1px solid #eeeeee;
                            }

                            .label {
                                display: block;
                                margin-bottom: 5px;
                                color: #64748b;
                                font-size: 12px;
                            }

                            .value {
                                font-size: 15px;
                                font-weight: bold;
                            }

                            .ticket-number {
                                margin-top: 25px;
                                padding: 18px;
                                border-radius: 12px;
                                background: #f4f1ff;
                                text-align: center;
                            }

                            .ticket-number span {
                                display: block;
                                margin-bottom: 7px;
                                color: #64748b;
                                font-size: 11px;
                            }

                            .ticket-number strong {
                                color: #6845dc;
                                font-size: 20px;
                            }
                        </style>
                    </head>

                    <body>
                        <div class="ticket">

                            <div class="ticket-header">
                                <div class="brand">
                                    EVENTSPHERE
                                </div>
                            </div>

                            <div class="ticket-body">

                                <h1>
                                    ${getEventName()}
                                </h1>

                                <div class="row">
                                    <span class="label">
                                        PARTICIPANT
                                    </span>

                                    <span class="value">
                                        ${
                                            participant?.name ||
                                            registration?.name ||
                                            "Participant"
                                        }
                                    </span>
                                </div>

                                <div class="row">
                                    <span class="label">
                                        EMAIL
                                    </span>

                                    <span class="value">
                                        ${
                                            participant?.email ||
                                            registration?.email ||
                                            "-"
                                        }
                                    </span>
                                </div>

                                <div class="row">
                                    <span class="label">
                                        DATE
                                    </span>

                                    <span class="value">
                                        ${formatDate(getEventDate())}
                                    </span>
                                </div>

                                <div class="row">
                                    <span class="label">
                                        TIME
                                    </span>

                                    <span class="value">
                                        ${getEventTime() || "-"}
                                    </span>
                                </div>

                                <div class="row">
                                    <span class="label">
                                        VENUE
                                    </span>

                                    <span class="value">
                                        ${getEventLocation()}
                                    </span>
                                </div>

                                <div class="row">
                                    <span class="label">
                                        AMOUNT
                                    </span>

                                    <span class="value">
                                        ₹${getAmount().toFixed(2)}
                                    </span>
                                </div>

                                <div class="ticket-number">
                                    <span>
                                        REGISTRATION / TICKET NUMBER
                                    </span>

                                    <strong>
                                        ${ticketNumber}
                                    </strong>
                                </div>

                            </div>
                        </div>

                        <script>
                            window.onload = function () {
                                window.print();
                            };
                        </script>
                    </body>
                </html>
            `);

            printWindow.document.close();
        } catch (err) {
            console.error(
                "Ticket download failed:",
                err
            );

            setError(
                err?.message ||
                "Unable to generate ticket."
            );
        } finally {
            setDownloading(false);
        }
    };


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {
        return (
            <div className="registration-details-state">

                <Loader2
                    size={38}
                    className="registration-details-spinner"
                />

                <h2>
                    Loading registration...
                </h2>

                <p>
                    Please wait while we fetch your
                    registration details.
                </p>

            </div>
        );
    }


    /*
     * ============================================================
     * ERROR
     * ============================================================
     */

    if (error || !registration) {
        return (
            <div className="registration-details-state">

                <div className="registration-details-state-icon error">
                    <XCircle size={30} />
                </div>

                <h2>
                    Registration not found
                </h2>

                <p>
                    {error ||
                        "We could not find this registration."}
                </p>

                <button
                    type="button"
                    className="registration-details-back-button"
                    onClick={() =>
                        navigate("/my-registrations")
                    }
                >
                    <ArrowLeft size={16} />
                    Back to My Registrations
                </button>

            </div>
        );
    }


    /*
     * ============================================================
     * MAIN PAGE
     * ============================================================
     */

    return (
        <div className="registration-details-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="registration-details-header">

                <Link
                    to="/my-registrations"
                    className="registration-details-back"
                >
                    <ArrowLeft size={16} />
                    My Registrations
                </Link>

                <span className="registration-details-eyebrow">
                    REGISTRATION DETAILS
                </span>

                <h1>
                    Your Event Registration
                </h1>

                <p>
                    View your registration,
                    payment and event information.
                </p>

            </header>


            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
                <div className="registration-details-alert">

                    <XCircle size={17} />

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <main className="registration-details-container">

                {/* =================================================
                    EVENT CARD
                ================================================= */}

                <section className="registration-details-event-card">

                    <div className="registration-details-event-image">

                        {getEventImage() ? (
                            <img
                                src={getEventImage()}
                                alt={getEventName()}
                            />
                        ) : (
                            <CalendarDays size={45} />
                        )}

                        <span
                            className={
                                `registration-details-status ${
                                    isCancelled
                                        ? "cancelled"
                                        : isConfirmed
                                            ? "confirmed"
                                            : "pending"
                                }`
                            }
                        >
                            {isCancelled ? (
                                <XCircle size={14} />
                            ) : (
                                <CheckCircle2 size={14} />
                            )}

                            {getStatusLabel()}
                        </span>

                    </div>


                    <div className="registration-details-event-content">

                        <span className="registration-details-label">
                            EVENT
                        </span>

                        <h2>
                            {getEventName()}
                        </h2>


                        <div className="registration-details-event-info">

                            <div>
                                <CalendarDays size={17} />

                                <span>
                                    {formatDate(
                                        getEventDate()
                                    )}
                                </span>
                            </div>


                            {getEventTime() && (
                                <div>
                                    <Clock3 size={17} />

                                    <span>
                                        {getEventTime()}
                                    </span>
                                </div>
                            )}


                            <div>
                                <MapPin size={17} />

                                <span>
                                    {getEventLocation()}
                                </span>
                            </div>

                        </div>


                        <div className="registration-details-price">

                            <span>
                                Registration Amount
                            </span>

                            <strong>
                                <IndianRupee size={17} />

                                {getAmount().toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    DETAILS CARD
                ================================================= */}

                <section className="registration-details-card">

                    <div className="registration-details-card-header">

                        <div className="registration-details-card-icon">
                            <Ticket size={21} />
                        </div>

                        <div>
                            <h2>
                                Registration Information
                            </h2>

                            <p>
                                Your registration details
                            </p>
                        </div>

                    </div>


                    <div className="registration-details-grid">

                        {/* Registration ID */}

                        <div className="registration-details-item">

                            <span>
                                Registration ID
                            </span>

                            <strong>
                                {registration?._id ||
                                    registration?.id ||
                                    registrationId}
                            </strong>

                        </div>


                        {/* Ticket */}

                        <div className="registration-details-item">

                            <span>
                                Ticket Number
                            </span>

                            <strong>
                                {registration?.ticketNumber ||
                                    registration?.ticketId ||
                                    registration?.registrationNumber ||
                                    "Not assigned"}
                            </strong>

                        </div>


                        {/* Registration Date */}

                        <div className="registration-details-item">

                            <span>
                                Registered On
                            </span>

                            <strong>
                                {formatDateTime(
                                    registration?.createdAt ||
                                    registration?.registeredAt ||
                                    registration?.registrationDate
                                )}
                            </strong>

                        </div>


                        {/* Status */}

                        <div className="registration-details-item">

                            <span>
                                Registration Status
                            </span>

                            <strong
                                className={
                                    `registration-details-value-status ${
                                        isCancelled
                                            ? "cancelled"
                                            : isConfirmed
                                                ? "confirmed"
                                                : "pending"
                                    }`
                                }
                            >
                                {getStatusLabel()}
                            </strong>

                        </div>


                        {/* Payment */}

                        <div className="registration-details-item">

                            <span>
                                Payment Status
                            </span>

                            <strong
                                className={
                                    `registration-details-value-status ${
                                        paymentStatus === "paid" ||
                                        paymentStatus === "success" ||
                                        paymentStatus === "successful" ||
                                        paymentStatus === "completed" ||
                                        paymentStatus === "free"
                                            ? "confirmed"
                                            : paymentStatus === "failed" ||
                                                paymentStatus === "failure"
                                                ? "cancelled"
                                                : "pending"
                                    }`
                                }
                            >
                                {getPaymentLabel()}
                            </strong>

                        </div>


                        {/* Amount */}

                        <div className="registration-details-item">

                            <span>
                                Amount Paid
                            </span>

                            <strong>
                                ₹{getAmount().toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    PARTICIPANT CARD
                ================================================= */}

                <section className="registration-details-card">

                    <div className="registration-details-card-header">

                        <div className="registration-details-card-icon">
                            <User size={21} />
                        </div>

                        <div>
                            <h2>
                                Participant Information
                            </h2>

                            <p>
                                Information used for registration
                            </p>
                        </div>

                    </div>


                    <div className="registration-details-grid">

                        <div className="registration-details-item">

                            <span>
                                Name
                            </span>

                            <strong>
                                {participant?.name ||
                                    registration?.name ||
                                    "Not available"}
                            </strong>

                        </div>


                        <div className="registration-details-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                {participant?.email ||
                                    registration?.email ||
                                    "Not available"}
                            </strong>

                        </div>


                        {(participant?.phone ||
                            registration?.phone ||
                            registration?.mobile) && (
                            <div className="registration-details-item">

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {participant?.phone ||
                                        registration?.phone ||
                                        registration?.mobile}
                                </strong>

                            </div>
                        )}


                        {registration?.college && (
                            <div className="registration-details-item">

                                <span>
                                    College / Organization
                                </span>

                                <strong>
                                    {registration.college}
                                </strong>

                            </div>
                        )}

                    </div>

                </section>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <section className="registration-details-actions">

                    <Link
                        to="/my-registrations"
                        className="registration-details-secondary-button"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>


                    {!isCancelled && (
                        <button
                            type="button"
                            className="registration-details-primary-button"
                            onClick={handleDownloadTicket}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <Loader2
                                    size={17}
                                    className="registration-details-spinner"
                                />
                            ) : (
                                <Download size={17} />
                            )}

                            {downloading
                                ? "Preparing..."
                                : "Download Ticket"}
                        </button>
                    )}

                </section>

            </main>

        </div>
    );
};


export default RegistrationDetails;