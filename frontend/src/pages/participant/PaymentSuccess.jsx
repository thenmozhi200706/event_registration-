import React, { useEffect, useState } from "react";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Copy,
    Download,
    Home,
    IndianRupee,
    Loader2,
    MapPin,
    Ticket,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import paymentService from "../../services/paymentService";

import "./PaymentSuccess.css";


const PaymentSuccess = () => {
    const { registrationId } = useParams();

    const location = useLocation();

    const navigate = useNavigate();


    const [registration, setRegistration] =
        useState(
            location.state?.registration || null
        );

    const [event, setEvent] =
        useState(
            location.state?.event || null
        );

    const [payment, setPayment] =
        useState(
            location.state?.payment || null
        );

    const [loading, setLoading] =
        useState(!registration);

    const [error, setError] =
        useState("");

    const [copied, setCopied] =
        useState(false);


    /*
     * =========================================================
     * LOAD CONFIRMATION DATA
     * =========================================================
     */

    useEffect(() => {

        const loadConfirmation = async () => {

            if (!registrationId) {

                setError(
                    "Registration ID is missing."
                );

                setLoading(false);

                return;
            }


            /*
             * Data already passed through
             * navigation state.
             */

            if (
                registration &&
                (payment || event)
            ) {

                setLoading(false);

                return;
            }


            try {

                setLoading(true);

                setError("");


                const response =
                    await paymentService
                        .getPaymentByRegistration(
                            registrationId
                        );


                const data =
                    response?.data ||
                    response;


                const loadedRegistration =
                    data?.registration ||
                    null;


                const loadedPayment =
                    data?.payment ||
                    null;


                const loadedEvent =
                    data?.event ||
                    loadedRegistration?.eventId ||
                    null;


                if (
                    !loadedRegistration &&
                    !loadedPayment
                ) {

                    throw new Error(
                        "Confirmation details could not be found."
                    );
                }


                setRegistration(
                    loadedRegistration
                );

                setPayment(
                    loadedPayment
                );

                setEvent(
                    loadedEvent
                );

            } catch (err) {

                console.error(
                    "Failed to load confirmation:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load confirmation details."
                );

            } finally {

                setLoading(false);
            }
        };


        loadConfirmation();

    }, [
        registrationId,
        registration,
        payment,
        event,
    ]);


    /*
     * =========================================================
     * COPY TICKET ID
     * =========================================================
     */

    const ticketId =
        registration?.ticketId ||
        location.state?.ticketId ||
        "";


    const copyTicketId = async () => {

        if (!ticketId) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                ticketId
            );

            setCopied(true);


            setTimeout(() => {
                setCopied(false);
            }, 1800);

        } catch (err) {

            console.error(
                "Unable to copy ticket ID:",
                err
            );
        }
    };


    /*
     * =========================================================
     * DATE
     * =========================================================
     */

    const eventDate =
        event?.eventDate ||
        registration?.eventId?.eventDate;


    const formattedDate = eventDate
        ? new Date(
              eventDate
          ).toLocaleDateString(
              "en-IN",
              {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
              }
          )
        : "Date not available";


    /*
     * =========================================================
     * AMOUNT
     * =========================================================
     */

    const amount = Number(
        payment?.amount ||
        registration?.amount ||
        event?.registrationFee ||
        0
    );


    /*
     * =========================================================
     * PAYMENT ID
     * =========================================================
     */

    const paymentId =
        payment?.paymentGatewayPaymentId ||
        payment?.paymentId ||
        location.state?.paymentId ||
        "";


    /*
     * =========================================================
     * PAYMENT DATE
     * =========================================================
     */

    const paidAt =
        payment?.paidAt ||
        payment?.verifiedAt ||
        registration?.paymentVerifiedAt;


    const formattedPaidAt = paidAt
        ? new Date(
              paidAt
          ).toLocaleString(
              "en-IN",
              {
                  dateStyle: "medium",
                  timeStyle: "short",
              }
          )
        : "Just now";


    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (loading) {

        return (
            <div className="payment-success-page">

                <div className="payment-success-loading">

                    <Loader2
                        size={34}
                        className="payment-success-spinner"
                    />

                    <h2>
                        Loading confirmation
                    </h2>

                    <p>
                        Please wait while we retrieve
                        your registration details.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * ERROR
     * =========================================================
     */

    if (error) {

        return (
            <div className="payment-success-page">

                <div className="payment-success-error">

                    <div className="payment-success-error-icon">

                        <CheckCircle2
                            size={28}
                        />

                    </div>

                    <h2>
                        Payment completed
                    </h2>

                    <p>
                        Your payment appears to have
                        completed, but we could not load
                        the full confirmation details.
                    </p>

                    <span>
                        {error}
                    </span>


                    <div className="payment-success-error-actions">

                        <Link
                            to="/dashboard"
                            className="payment-success-primary-button"
                        >
                            Go to Dashboard

                            <ArrowRight
                                size={16}
                            />

                        </Link>

                        <button
                            type="button"
                            className="payment-success-secondary-button"
                            onClick={() =>
                                navigate(-1)
                            }
                        >
                            Go Back
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * MAIN PAGE
     * =========================================================
     */

    return (
        <div className="payment-success-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="payment-success-header">

                <div className="payment-success-header-inner">

                    <Link
                        to="/dashboard"
                        className="payment-success-home-link"
                    >
                        <Home
                            size={16}
                        />

                        Dashboard
                    </Link>

                </div>

            </header>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="payment-success-content">

                {/* =============================================
                    SUCCESS HERO
                ============================================= */}

                <section className="payment-success-hero">

                    <div className="payment-success-hero-icon">

                        <CheckCircle2
                            size={42}
                        />

                    </div>


                    <span>
                        PAYMENT SUCCESSFUL
                    </span>


                    <h1>
                        Registration Confirmed!
                    </h1>


                    <p>
                        Your payment has been verified
                        successfully. Your place at the
                        event is now confirmed.
                    </p>

                </section>


                {/* =============================================
                    TICKET CARD
                ============================================= */}

                <section className="payment-success-ticket-card">

                    <div className="payment-success-ticket-top">

                        <div>

                            <span>
                                YOUR DIGITAL TICKET
                            </span>

                            <h2>
                                EventSphere Ticket
                            </h2>

                        </div>


                        <div className="payment-success-ticket-icon">

                            <Ticket
                                size={22}
                            />

                        </div>

                    </div>


                    {/* Ticket ID */}

                    <div className="payment-success-ticket-id">

                        <div>

                            <span>
                                TICKET ID
                            </span>

                            <strong>
                                {ticketId ||
                                    "Ticket will be available shortly"}
                            </strong>

                        </div>


                        {ticketId && (

                            <button
                                type="button"
                                onClick={
                                    copyTicketId
                                }
                                className="payment-success-copy-button"
                                title="Copy ticket ID"
                            >

                                {copied ? (
                                    <CheckCircle2
                                        size={16}
                                    />
                                ) : (
                                    <Copy
                                        size={16}
                                    />
                                )}

                                <span>
                                    {copied
                                        ? "Copied"
                                        : "Copy"}
                                </span>

                            </button>
                        )}

                    </div>


                    {/* Event details */}

                    <div className="payment-success-event">

                        <div>

                            <CalendarDays
                                size={17}
                            />

                            <div>

                                <span>
                                    Event
                                </span>

                                <strong>
                                    {event?.title ||
                                        registration?.eventId?.title ||
                                        "Event"}
                                </strong>

                            </div>

                        </div>


                        <div>

                            <CalendarDays
                                size={17}
                            />

                            <div>

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {formattedDate}
                                </strong>

                            </div>

                        </div>


                        <div>

                            <MapPin
                                size={17}
                            />

                            <div>

                                <span>
                                    Venue
                                </span>

                                <strong>
                                    {event?.venue ||
                                        registration?.eventId?.venue ||
                                        "Venue not available"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* Participant */}

                    <div className="payment-success-participant">

                        <span>
                            PARTICIPANT
                        </span>

                        <strong>
                            {[
                                registration?.firstName,
                                registration?.lastName,
                            ]
                                .filter(Boolean)
                                .join(" ") ||
                                "Participant"}
                        </strong>

                        <p>
                            {registration?.email ||
                                ""}
                        </p>

                    </div>

                </section>


                {/* =============================================
                    PAYMENT DETAILS
                ============================================= */}

                <section className="payment-success-payment-card">

                    <div className="payment-success-payment-header">

                        <div>

                            <span>
                                PAYMENT DETAILS
                            </span>

                            <h2>
                                Transaction Summary
                            </h2>

                        </div>


                        <div className="payment-success-paid-badge">

                            <CheckCircle2
                                size={14}
                            />

                            Paid

                        </div>

                    </div>


                    <div className="payment-success-payment-grid">

                        <div>

                            <span>
                                Amount Paid
                            </span>

                            <strong className="payment-success-amount">

                                <IndianRupee
                                    size={17}
                                />

                                {amount.toFixed(
                                    2
                                )}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Payment Date
                            </span>

                            <strong>
                                {formattedPaidAt}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Payment Method
                            </span>

                            <strong>
                                {payment?.paymentMethod ||
                                    "Gateway"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Payment ID
                            </span>

                            <strong
                                title={paymentId}
                            >
                                {paymentId ||
                                    "Verified"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =============================================
                    ACTIONS
                ============================================= */}

                <div className="payment-success-actions">

                    <button
                        type="button"
                        className="payment-success-dashboard-button"
                        onClick={() =>
                            navigate(
                                "/dashboard"
                            )
                        }
                    >

                        <Home
                            size={17}
                        />

                        Go to Dashboard

                    </button>


                    <button
                        type="button"
                        className="payment-success-secondary-action"
                        onClick={() =>
                            window.print()
                        }
                    >

                        <Download
                            size={16}
                        />

                        Print / Save Ticket

                    </button>

                </div>


                {/* =============================================
                    FOOTER NOTE
                ============================================= */}

                <div className="payment-success-footer-note">

                    <CheckCircle2
                        size={16}
                    />

                    <p>
                        Keep your ticket ID safe. You may
                        need it when attending the event.
                    </p>

                </div>

            </main>

        </div>
    );
};


export default PaymentSuccess;