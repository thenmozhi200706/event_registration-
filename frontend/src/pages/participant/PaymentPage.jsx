import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    IndianRupee,
    Loader2,
    MapPin,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import paymentService from "../../services/paymentService";
import PaymentButton from "../../components/payment/PaymentButton";
import useAuth from "../../hooks/useAuth";

import "./PaymentPage.css";


const PaymentPage = () => {
    const { registrationId } = useParams();

    const location = useLocation();

    const navigate = useNavigate();

    const { user } = useAuth();


    const [registration, setRegistration] =
        useState(
            location.state?.registration || null
        );

    const [event, setEvent] =
        useState(
            location.state?.event || null
        );

    const [loading, setLoading] =
        useState(!registration);

    const [error, setError] =
        useState("");

    const [paymentSuccess, setPaymentSuccess] =
        useState(false);

    const [paymentResult, setPaymentResult] =
        useState(null);


    /*
     * =========================================================
     * LOAD PAYMENT / REGISTRATION
     * =========================================================
     *
     * If RegistrationPage passed the registration
     * through router state, we can use it directly.
     *
     * Otherwise fetch the payment information
     * using the registration ID.
     */

    useEffect(() => {

        const loadPaymentData = async () => {

            if (!registrationId) {

                setError(
                    "Registration ID is missing."
                );

                setLoading(false);

                return;
            }


            /*
             * Already received through navigation.
             */

            if (registration) {

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
                    data?.payment?.registration ||
                    null;


                const loadedEvent =
                    data?.event ||
                    loadedRegistration?.event ||
                    null;


                if (
                    !loadedRegistration &&
                    !data?.payment
                ) {

                    throw new Error(
                        "Registration details could not be found."
                    );
                }


                setRegistration(
                    loadedRegistration
                );

                setEvent(
                    loadedEvent
                );

            } catch (err) {

                console.error(
                    "Failed to load payment details:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load payment details."
                );

            } finally {

                setLoading(false);
            }
        };


        loadPaymentData();

    }, [
        registrationId,
        registration,
    ]);


    /*
     * =========================================================
     * PAYMENT SUCCESS
     * =========================================================
     */

    const handlePaymentSuccess =
        async (result) => {

            setPaymentResult(result);

            setPaymentSuccess(true);

            /*
             * Do not immediately redirect.
             *
             * Show confirmation first.
             */
        };


    /*
     * =========================================================
     * PAYMENT FAILURE
     * =========================================================
     */

    const handlePaymentFailure =
        (paymentError) => {

            console.error(
                "Payment failed:",
                paymentError
            );

            /*
             * PaymentButton already displays
             * its own error state.
             */
        };


    /*
     * =========================================================
     * LOADING STATE
     * =========================================================
     */

    if (loading) {

        return (
            <div className="payment-page">

                <div className="payment-page-loading">

                    <Loader2
                        size={34}
                        className="payment-page-spinner"
                    />

                    <h2>
                        Preparing payment
                    </h2>

                    <p>
                        Please wait while we load
                        your registration details.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * ERROR STATE
     * =========================================================
     */

    if (error) {

        return (
            <div className="payment-page">

                <div className="payment-page-error">

                    <div className="payment-page-error-icon">

                        <AlertCircle
                            size={28}
                        />

                    </div>

                    <h2>
                        Unable to continue
                    </h2>

                    <p>
                        {error}
                    </p>

                    <div className="payment-page-error-actions">

                        <button
                            type="button"
                            className="payment-page-secondary-button"
                            onClick={() =>
                                navigate(-1)
                            }
                        >
                            <ArrowLeft
                                size={16}
                            />

                            Go Back
                        </button>

                        <Link
                            to="/events"
                            className="payment-page-primary-button"
                        >
                            Browse Events
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * PAYMENT SUCCESS STATE
     * =========================================================
     */

    if (paymentSuccess) {

        const verifiedPayment =
            paymentResult?.verification
                ?.payment ||
            paymentResult?.verification
                ?.data?.payment ||
            null;


        const ticketId =
            paymentResult?.verification
                ?.registration?.ticketId ||
            paymentResult?.verification
                ?.data?.registration?.ticketId ||
            registration?.ticketId ||
            "";


        return (
            <div className="payment-page">

                <main className="payment-page-content">

                    <div className="payment-success-card">

                        <div className="payment-success-icon">

                            <CheckCircle2
                                size={38}
                            />

                        </div>


                        <span className="payment-success-eyebrow">
                            PAYMENT SUCCESSFUL
                        </span>


                        <h1>
                            Registration Confirmed
                        </h1>


                        <p>
                            Your payment has been
                            verified successfully and
                            your event registration is
                            confirmed.
                        </p>


                        {ticketId && (

                            <div className="payment-ticket-box">

                                <span>
                                    TICKET ID
                                </span>

                                <strong>
                                    {ticketId}
                                </strong>

                            </div>
                        )}


                        {verifiedPayment && (

                            <div className="payment-success-payment-info">

                                <span>
                                    Payment ID
                                </span>

                                <strong>
                                    {verifiedPayment.paymentGatewayPaymentId ||
                                        verifiedPayment.paymentId ||
                                        "Verified"}
                                </strong>

                            </div>
                        )}


                        <button
                            type="button"
                            className="payment-success-button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                        >
                            Go to Dashboard

                            <ArrowLeft
                                size={16}
                                style={{
                                    transform:
                                        "rotate(180deg)",
                                }}
                            />

                        </button>

                    </div>

                </main>

            </div>
        );
    }


    /*
     * =========================================================
     * EVENT DATA
     * =========================================================
     */

    const eventTitle =
        event?.title ||
        registration?.eventId?.title ||
        "Event Registration";


    const eventVenue =
        event?.venue ||
        registration?.eventId?.venue ||
        "Venue not available";


    const eventDate =
        event?.eventDate ||
        registration?.eventId?.eventDate;


    const formattedDate = eventDate
        ? new Date(
              eventDate
          ).toLocaleDateString(
              "en-IN",
              {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              }
          )
        : "Date not available";


    /*
     * Registration amount.
     */

    const amount = Number(
        registration?.amount ||
        event?.registrationFee ||
        0
    );


    /*
     * =========================================================
     * MAIN PAYMENT PAGE
     * =========================================================
     */

    return (
        <div className="payment-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="payment-page-header">

                <div className="payment-page-header-inner">

                    <Link
                        to="/dashboard"
                        className="payment-page-back-link"
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Back to Dashboard
                    </Link>


                    <span className="payment-page-eyebrow">
                        EVENTSPHERE PAYMENT
                    </span>


                    <h1>
                        Complete Your Payment
                    </h1>


                    <p>
                        Securely complete your event
                        registration payment.
                    </p>

                </div>

            </header>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="payment-page-content">

                <div className="payment-page-grid">


                    {/* =========================================
                        LEFT — EVENT & REGISTRATION
                    ========================================= */}

                    <section className="payment-details-card">

                        <div className="payment-card-heading">

                            <div>

                                <span>
                                    REGISTRATION
                                </span>

                                <h2>
                                    {eventTitle}
                                </h2>

                            </div>


                            <div className="payment-card-check">

                                <CheckCircle2
                                    size={20}
                                />

                            </div>

                        </div>


                        {/* Event information */}

                        <div className="payment-event-details">

                            <div>

                                <CalendarDays
                                    size={17}
                                />

                                <div>

                                    <span>
                                        Event Date
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
                                        {eventVenue}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* Participant */}

                        <div className="payment-participant">

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
                                    user?.name ||
                                    "Participant"}
                            </strong>


                            <p>
                                {registration?.email ||
                                    user?.email ||
                                    ""}
                            </p>

                        </div>


                        {/* Registration ID */}

                        <div className="payment-registration-id">

                            <span>
                                Registration ID
                            </span>

                            <strong>
                                {registration?._id ||
                                    registration?.id ||
                                    registrationId}
                            </strong>

                        </div>

                    </section>


                    {/* =========================================
                        RIGHT — PAYMENT
                    ========================================= */}

                    <section className="payment-checkout-card">

                        <div className="payment-checkout-heading">

                            <span>
                                PAYMENT SUMMARY
                            </span>

                            <h2>
                                Secure Checkout
                            </h2>

                        </div>


                        {/* Amount */}

                        <div className="payment-amount-box">

                            <span>
                                TOTAL AMOUNT
                            </span>


                            <div>

                                <IndianRupee
                                    size={25}
                                />

                                <strong>
                                    {amount.toFixed(
                                        2
                                    )}
                                </strong>

                            </div>

                        </div>


                        {/* Payment method */}

                        <div className="payment-method-box">

                            <div className="payment-method-icon">

                                <ShieldCheck
                                    size={19}
                                />

                            </div>


                            <div>

                                <strong>
                                    Razorpay Secure Payment
                                </strong>

                                <span>
                                    UPI • Cards • Net Banking
                                    • Wallets
                                </span>

                            </div>

                        </div>


                        {/* Payment button */}

                        <PaymentButton
                            registrationId={
                                registration?._id ||
                                registration?.id ||
                                registrationId
                            }

                            eventId={
                                event?._id ||
                                event?.id ||
                                registration?.eventId?._id ||
                                registration?.eventId
                            }

                            amount={amount}

                            event={event}

                            user={
                                user || registration
                            }

                            onSuccess={
                                handlePaymentSuccess
                            }

                            onFailure={
                                handlePaymentFailure
                            }
                        />


                        <p className="payment-secure-note">

                            <ShieldCheck
                                size={14}
                            />

                            Your payment information
                            is securely processed by
                            Razorpay.

                        </p>

                    </section>

                </div>

            </main>

        </div>
    );
};


export default PaymentPage;