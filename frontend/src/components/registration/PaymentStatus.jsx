import React from "react";
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    Home,
    RefreshCw,
    Ticket,
    XCircle,
} from "lucide-react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import "./PaymentStatus.css";


/*
 * ============================================================
 * EVENTSPHERE — PAYMENT STATUS
 * ============================================================
 *
 * Displays:
 *
 * 1. Payment success
 * 2. Payment pending
 * 3. Payment failed
 * 4. Registration information
 * 5. Navigation actions
 *
 * ============================================================
 */


const PaymentStatus = ({
    status = "pending",
    registration = null,
    event = null,
    message = "",
    amount = 0,
    paymentId = "",
    orderId = "",
    onRetry,
    onContinue,
}) => {

    const navigate = useNavigate();


    /*
     * ========================================================
     * NORMALIZE STATUS
     * ========================================================
     */

    const normalizedStatus =
        String(status || "pending")
            .trim()
            .toLowerCase();


    const isSuccess =
        [
            "success",
            "successful",
            "paid",
            "completed",
            "confirmed",
        ].includes(
            normalizedStatus
        );


    const isFailed =
        [
            "failed",
            "failure",
            "cancelled",
            "canceled",
            "rejected",
        ].includes(
            normalizedStatus
        );


    const isPending =
        !isSuccess &&
        !isFailed;


    /*
     * ========================================================
     * EVENT DETAILS
     * ========================================================
     */

    const eventName =
        event?.title ||
        event?.name ||
        registration?.event?.title ||
        registration?.event?.name ||
        registration?.eventName ||
        "Event";


    const eventId =
        event?._id ||
        event?.id ||
        registration?.event?._id ||
        registration?.event?.id ||
        registration?.eventId ||
        "";


    const registrationId =
        registration?._id ||
        registration?.id ||
        "";


    /*
     * ========================================================
     * AMOUNT
     * ========================================================
     */

    const numericAmount =
        Number(
            amount ??
            registration?.amount ??
            registration?.totalAmount ??
            0
        );


    const safeAmount =
        Number.isFinite(
            numericAmount
        )
            ? numericAmount
            : 0;


    /*
     * ========================================================
     * TITLE
     * ========================================================
     */

    const getTitle = () => {

        if (isSuccess) {
            return "Payment Successful";
        }

        if (isFailed) {
            return "Payment Failed";
        }

        return "Payment Pending";
    };


    /*
     * ========================================================
     * DESCRIPTION
     * ========================================================
     */

    const getDescription = () => {

        if (message) {
            return message;
        }


        if (isSuccess) {

            return (
                "Your payment has been successfully " +
                "processed and your event registration " +
                "is confirmed."
            );
        }


        if (isFailed) {

            return (
                "We couldn't complete your payment. " +
                "Your registration may not be confirmed."
            );
        }


        return (
            "Your payment is currently being processed. " +
            "Please wait before trying again."
        );
    };


    /*
     * ========================================================
     * STATUS ICON
     * ========================================================
     */

    const StatusIcon = () => {

        if (isSuccess) {

            return (
                <CheckCircle2
                    size={44}
                />
            );
        }


        if (isFailed) {

            return (
                <XCircle
                    size={44}
                />
            );
        }


        return (
            <Clock3
                size={44}
            />
        );
    };


    /*
     * ========================================================
     * GO TO REGISTRATION
     * ========================================================
     */

    const handleRegistrationDetails = () => {

        if (registrationId) {

            navigate(
                `/registrations/${registrationId}`
            );

            return;
        }


        navigate(
            "/my-registrations"
        );
    };


    /*
     * ========================================================
     * CONTINUE
     * ========================================================
     */

    const handleContinue = () => {

        if (onContinue) {

            onContinue();

            return;
        }


        if (isSuccess) {

            handleRegistrationDetails();

            return;
        }


        navigate(
            "/my-registrations"
        );
    };


    /*
     * ========================================================
     * RETRY
     * ========================================================
     */

    const handleRetry = () => {

        if (onRetry) {

            onRetry();

            return;
        }


        if (eventId) {

            navigate(
                `/events/${eventId}/register`
            );

            return;
        }


        navigate(
            "/events"
        );
    };


    /*
     * ========================================================
     * STATUS CLASS
     * ========================================================
     */

    const statusClass =
        isSuccess
            ? "success"
            : isFailed
                ? "failed"
                : "pending";


    return (

        <div className="payment-status-page">

            <main className="payment-status-card">

                {/* =================================================
                    STATUS ICON
                ================================================= */}

                <div
                    className={
                        `payment-status-icon ${statusClass}`
                    }
                >

                    <StatusIcon />

                </div>


                {/* =================================================
                    STATUS TEXT
                ================================================= */}

                <span className="payment-status-eyebrow">
                    EVENTSPHERE PAYMENT
                </span>

                <h1>
                    {getTitle()}
                </h1>

                <p className="payment-status-description">
                    {getDescription()}
                </p>


                {/* =================================================
                    SUCCESS / PAYMENT SUMMARY
                ================================================= */}

                <section className="payment-status-summary">

                    <div className="payment-status-summary-row">

                        <div>

                            <Ticket size={16} />

                            <span>
                                Event
                            </span>

                        </div>

                        <strong>
                            {eventName}
                        </strong>

                    </div>


                    <div className="payment-status-summary-row">

                        <div>

                            <CreditCard size={16} />

                            <span>
                                Amount
                            </span>

                        </div>

                        <strong>
                            ₹
                            {safeAmount.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>

                    </div>


                    {orderId && (

                        <div className="payment-status-summary-row">

                            <div>

                                <CreditCard size={16} />

                                <span>
                                    Order ID
                                </span>

                            </div>

                            <strong>
                                {orderId}
                            </strong>

                        </div>

                    )}


                    {paymentId && (

                        <div className="payment-status-summary-row">

                            <div>

                                <CheckCircle2 size={16} />

                                <span>
                                    Payment ID
                                </span>

                            </div>

                            <strong>
                                {paymentId}
                            </strong>

                        </div>

                    )}


                    {registrationId && (

                        <div className="payment-status-summary-row">

                            <div>

                                <Ticket size={16} />

                                <span>
                                    Registration ID
                                </span>

                            </div>

                            <strong>
                                {registrationId}
                            </strong>

                        </div>

                    )}

                </section>


                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {isSuccess && (

                    <div className="payment-status-notice success">

                        <CheckCircle2
                            size={17}
                        />

                        <div>

                            <strong>
                                Registration confirmed
                            </strong>

                            <span>
                                Your event registration has
                                been successfully recorded.
                            </span>

                        </div>

                    </div>

                )}


                {/* =================================================
                    PENDING MESSAGE
                ================================================= */}

                {isPending && (

                    <div className="payment-status-notice pending">

                        <Clock3
                            size={17}
                        />

                        <div>

                            <strong>
                                Payment processing
                            </strong>

                            <span>
                                Do not make another payment
                                until the current transaction
                                has been completed.
                            </span>

                        </div>

                    </div>

                )}


                {/* =================================================
                    FAILED MESSAGE
                ================================================= */}

                {isFailed && (

                    <div className="payment-status-notice failed">

                        <AlertCircle
                            size={17}
                        />

                        <div>

                            <strong>
                                Payment was not completed
                            </strong>

                            <span>
                                You can try the payment again
                                or return to your registrations.
                            </span>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="payment-status-actions">

                    {isFailed && (

                        <button
                            type="button"
                            className="payment-status-primary"
                            onClick={handleRetry}
                        >

                            <RefreshCw
                                size={16}
                            />

                            Try Again

                        </button>

                    )}


                    {isSuccess && (

                        <button
                            type="button"
                            className="payment-status-primary"
                            onClick={handleContinue}
                        >

                            <Ticket
                                size={16}
                            />

                            View Registration

                        </button>

                    )}


                    {isPending && (

                        <button
                            type="button"
                            className="payment-status-primary"
                            onClick={handleContinue}
                        >

                            <Clock3
                                size={16}
                            />

                            View Registration

                        </button>

                    )}


                    <Link
                        to="/my-registrations"
                        className="payment-status-secondary"
                    >

                        <ArrowLeft
                            size={16}
                        />

                        My Registrations

                    </Link>


                    <Link
                        to="/"
                        className="payment-status-home"
                    >

                        <Home
                            size={15}
                        />

                        Home

                    </Link>

                </div>

            </main>

        </div>
    );
};


export default PaymentStatus;