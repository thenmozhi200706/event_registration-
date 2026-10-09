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
    QrCode,
    Copy,
    Check,
} from "lucide-react";

import {
    Link,
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

import paymentService from "../../services/paymentService";

import PaymentButton from
    "../../components/payment/PaymentButton";

import useAuth from "../../hooks/useAuth";

import "./PaymentPage.css";


const PaymentPage = () => {

    const {
        registrationId,
    } = useParams();


    const location =
        useLocation();


    const navigate =
        useNavigate();


    const {
        user,
    } = useAuth();


    // =========================================================
    // STATE
    // =========================================================

    const [
        registration,
        setRegistration,
    ] = useState(
        location.state?.registration ||
        null
    );


    const [
        event,
        setEvent,
    ] = useState(
        location.state?.event ||
        null
    );


    const [
        loading,
        setLoading,
    ] = useState(
        !registration
    );


    const [
        error,
        setError,
    ] = useState("");


    const [
        paymentSuccess,
        setPaymentSuccess,
    ] = useState(false);


    const [
        paymentResult,
        setPaymentResult,
    ] = useState(null);


    const [
        copiedUpi,
        setCopiedUpi,
    ] = useState(false);


    // =========================================================
    // LOAD PAYMENT / REGISTRATION DATA
    // =========================================================

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
             * If registration and event were
             * already passed through router state,
             * use them.
             */

            if (
                registration &&
                (
                    event ||
                    registration.eventId
                )
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
                    response ||
                    {};


                const loadedRegistration =
                    data?.registration ||
                    data?.payment?.registration ||
                    null;


                const loadedEvent =
                    data?.event ||
                    loadedRegistration?.event ||
                    loadedRegistration?.eventId ||
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
        event,
    ]);


    // =========================================================
    // FIND EVENT ID
    // =========================================================

    const eventId =
        event?._id ||
        event?.id ||
        registration?.eventId?._id ||
        (
            typeof registration?.eventId ===
            "string"
                ? registration.eventId
                : ""
        );


    // =========================================================
    // DETERMINE PAYMENT METHOD
    // =========================================================

    /*
     * IMPORTANT:
     *
     * Event.paymentMethod is the primary source.
     *
     * Event:
     *
     * razorpay = Razorpay gateway
     * upi      = QR payment
     * free     = no payment
     *
     * Registration:
     *
     * gateway  = Razorpay
     * qr       = UPI QR
     * free     = free
     */

    const rawEventPaymentMethod =
        event?.paymentMethod;


    const rawRegistrationPaymentMethod =
        registration?.paymentMethod;


    let paymentMethod =
        rawEventPaymentMethod ||
        rawRegistrationPaymentMethod ||
        "free";


    paymentMethod =
        String(
            paymentMethod
        )
            .trim()
            .toLowerCase();


    /*
     * Normalize old registration
     * payment method values.
     */

    if (
        paymentMethod === "gateway"
    ) {

        paymentMethod =
            "razorpay";

    }


    if (
        paymentMethod === "qr"
    ) {

        paymentMethod =
            "upi";

    }


    /*
     * If amount is zero, always treat
     * it as free.
     */

    const amount = Number(
        registration?.amount ??
        event?.registrationFee ??
        0
    );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        paymentMethod =
            "free";

    }


    // =========================================================
    // EVENT DATA
    // =========================================================

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


    const formattedDate =
        eventDate
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


    // =========================================================
    // UPI INFORMATION
    // =========================================================

    const paymentUpiId =
        event?.paymentUpiId ||
        registration?.paymentUpiId ||
        "";


    const paymentQrImageUrl =
        event?.paymentQrImageUrl ||
        registration?.paymentQrImageUrl ||
        "";


    const paymentInstructions =
        event?.paymentInstructions ||
        registration?.paymentInstructions ||
        "Scan the QR code and complete the payment.";


    // =========================================================
    // COPY UPI ID
    // =========================================================

    const handleCopyUpi = async () => {

        if (!paymentUpiId) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                paymentUpiId
            );


            setCopiedUpi(true);


            setTimeout(() => {

                setCopiedUpi(false);

            }, 2000);

        } catch (copyError) {

            console.error(
                "Unable to copy UPI ID:",
                copyError
            );

        }

    };


    // =========================================================
    // RAZORPAY SUCCESS
    // =========================================================

    const handlePaymentSuccess =
        async (result) => {

            console.log(
                "Razorpay payment successful:",
                result
            );


            setPaymentResult(
                result
            );


            setPaymentSuccess(
                true
            );

        };


    // =========================================================
    // RAZORPAY FAILURE
    // =========================================================

    const handlePaymentFailure =
        (paymentError) => {

            console.error(
                "Payment failed:",
                paymentError
            );

        };


    // =========================================================
    // FREE EVENT
    // =========================================================

    const handleFreeRegistration = () => {

        navigate(
            `/registrations/${
                registration?._id ||
                registration?.id ||
                registrationId
            }`,
            {
                replace: true,
            }
        );

    };


    // =========================================================
    // LOADING
    // =========================================================

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


    // =========================================================
    // ERROR
    // =========================================================

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


    // =========================================================
    // PAYMENT SUCCESS
    // =========================================================

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
                                    {
                                        verifiedPayment.paymentGatewayPaymentId ||
                                        verifiedPayment.paymentId ||
                                        "Verified"
                                    }
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


    // =========================================================
    // MAIN PAYMENT PAGE
    // =========================================================

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

                        {paymentMethod ===
                        "upi"
                            ? "Complete Your UPI Payment"
                            : paymentMethod ===
                              "free"
                            ? "Registration Complete"
                            : "Complete Your Payment"}

                    </h1>


                    <p>

                        {paymentMethod ===
                        "upi"
                            ? "Complete the payment using the organizer's UPI QR code."
                            : paymentMethod ===
                              "free"
                            ? "Your event registration does not require payment."
                            : "Securely complete your event registration payment."}

                    </p>

                </div>

            </header>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="payment-page-content">

                <div className="payment-page-grid">


                    {/* =========================================
                        LEFT
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


                        {/* EVENT INFORMATION */}

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


                        {/* PARTICIPANT */}

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


                        {/* REGISTRATION ID */}

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
                        RIGHT PAYMENT
                    ========================================= */}

                    <section className="payment-checkout-card">

                        <div className="payment-checkout-heading">

                            <span>
                                PAYMENT SUMMARY
                            </span>


                            <h2>

                                {paymentMethod ===
                                "upi"
                                    ? "UPI Payment"
                                    : paymentMethod ===
                                      "free"
                                    ? "Free Registration"
                                    : "Secure Checkout"}

                            </h2>

                        </div>


                        {/* AMOUNT */}

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


                        {/* =================================================
                            RAZORPAY
                        ================================================= */}

                        {paymentMethod ===
                            "razorpay" && (

                            <>

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
                                            UPI • Cards • Net Banking • Wallets
                                        </span>

                                    </div>

                                </div>


                                <PaymentButton
                                    registrationId={
                                        registration?._id ||
                                        registration?.id ||
                                        registrationId
                                    }

                                    eventId={
                                        eventId
                                    }

                                    amount={
                                        amount
                                    }

                                    event={
                                        event
                                    }

                                    user={
                                        user ||
                                        registration
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

                            </>

                        )}


                        {/* =================================================
                            UPI / QR PAYMENT
                        ================================================= */}

                        {paymentMethod ===
                            "upi" && (

                            <div className="upi-payment-section">

                                <div className="upi-payment-header">

                                    <div className="upi-payment-icon">

                                        <QrCode
                                            size={25}
                                        />

                                    </div>


                                    <div>

                                        <strong>
                                            Pay using UPI
                                        </strong>

                                        <span>
                                            Scan the QR code using any UPI app
                                        </span>

                                    </div>

                                </div>


                                {/* QR IMAGE */}

                                {paymentQrImageUrl ? (

                                    <div className="upi-qr-container">

                                        <img
                                            src={
                                                paymentQrImageUrl
                                            }
                                            alt="Event UPI QR Code"
                                            className="upi-qr-image"
                                        />

                                    </div>

                                ) : (

                                    <div className="upi-qr-missing">

                                        <AlertCircle
                                            size={24}
                                        />

                                        <strong>
                                            UPI QR code is not available
                                        </strong>

                                        <p>
                                            Please contact the event organizer
                                            for payment details.
                                        </p>

                                    </div>

                                )}


                                {/* UPI ID */}

                                {paymentUpiId && (

                                    <div className="upi-id-box">

                                        <div>

                                            <span>
                                                UPI ID
                                            </span>

                                            <strong>
                                                {paymentUpiId}
                                            </strong>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                handleCopyUpi
                                            }
                                        >

                                            {copiedUpi ? (

                                                <>

                                                    <Check
                                                        size={16}
                                                    />

                                                    Copied

                                                </>

                                            ) : (

                                                <>

                                                    <Copy
                                                        size={16}
                                                    />

                                                    Copy

                                                </>

                                            )}

                                        </button>

                                    </div>

                                )}


                                {/* INSTRUCTIONS */}

                                <div className="upi-instructions">

                                    <strong>
                                        Payment Instructions
                                    </strong>


                                    <p>
                                        {paymentInstructions}
                                    </p>

                                </div>


                                {/* PAYMENT STATUS */}

                                <div className="upi-pending-box">

                                    <AlertCircle
                                        size={18}
                                    />

                                    <div>

                                        <strong>
                                            Payment verification pending
                                        </strong>

                                        <span>
                                            After completing the UPI payment,
                                            the organizer must confirm your
                                            payment before the registration
                                            becomes fully confirmed.
                                        </span>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* =================================================
                            FREE EVENT
                        ================================================= */}

                        {paymentMethod ===
                            "free" && (

                            <div className="free-payment-section">

                                <div className="free-payment-icon">

                                    <CheckCircle2
                                        size={28}
                                    />

                                </div>


                                <h3>
                                    No Payment Required
                                </h3>


                                <p>
                                    This is a free event.
                                    Your registration has been
                                    completed without payment.
                                </p>


                                <button
                                    type="button"
                                    className="payment-success-button"
                                    onClick={
                                        handleFreeRegistration
                                    }
                                >

                                    View Registration

                                    <ArrowLeft
                                        size={16}
                                        style={{
                                            transform:
                                                "rotate(180deg)",
                                        }}
                                    />

                                </button>

                            </div>

                        )}


                        {/* =================================================
                            UNKNOWN PAYMENT METHOD
                        ================================================= */}

                        {paymentMethod !==
                            "razorpay" &&
                            paymentMethod !==
                                "upi" &&
                            paymentMethod !==
                                "free" && (

                            <div className="payment-page-error">

                                <div className="payment-page-error-icon">

                                    <AlertCircle
                                        size={25}
                                    />

                                </div>


                                <h3>
                                    Unsupported payment method
                                </h3>


                                <p>
                                    This event has an unsupported
                                    payment configuration.
                                </p>

                            </div>

                        )}

                    </section>

                </div>

            </main>

        </div>

    );

};


export default PaymentPage;