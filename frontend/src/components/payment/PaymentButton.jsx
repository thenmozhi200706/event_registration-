// frontend/src/components/payment/PaymentButton.jsx

import React from "react";

import {
    CreditCard,
    Loader2,
    ArrowRight,
    ShieldCheck,
    QrCode,
    Smartphone,
} from "lucide-react";

import usePayment from "../../hooks/usePayment";

import "./PaymentButton.css";


const PaymentButton = ({
    registrationId,
    eventId,
    amount,
    event,
    user,

    onSuccess,
    onFailure,

    disabled = false,

    children,
}) => {

    const {
        startPayment,
        loading,
        error,
    } = usePayment();


    /*
     * =========================================================
     * PAYMENT METHOD
     * =========================================================
     */

    const paymentMethod =
        String(
            event?.paymentMethod ||
            "razorpay"
        )
            .trim()
            .toLowerCase();


    const isUPI =
        paymentMethod === "upi";


    const isRazorpay =
        paymentMethod === "razorpay";


    const isFree =
        paymentMethod === "free";


    /*
     * =========================================================
     * FORMAT AMOUNT
     * =========================================================
     */

    const formattedAmount =
        Number(amount || 0).toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
            }
        );


    /*
     * =========================================================
     * HANDLE RAZORPAY PAYMENT
     * =========================================================
     */

    const handleRazorpayPayment = async () => {

        if (
            loading ||
            disabled ||
            !registrationId ||
            !eventId ||
            !amount ||
            Number(amount) <= 0
        ) {
            return;
        }


        await startPayment({

            registrationId,

            eventId,

            amount,

            event,

            user,


            /*
             * Payment successful and backend
             * verification completed.
             */

            onSuccess: async (
                result
            ) => {

                if (
                    typeof onSuccess ===
                    "function"
                ) {

                    await onSuccess(
                        result
                    );
                }
            },


            /*
             * Payment failed/cancelled.
             */

            onFailure: (
                paymentError
            ) => {

                if (
                    typeof onFailure ===
                    "function"
                ) {

                    onFailure(
                        paymentError
                    );
                }
            },

        });
    };


    /*
     * =========================================================
     * HANDLE UPI PAYMENT
     * =========================================================
     *
     * IMPORTANT:
     *
     * UPI payment must NOT call:
     *
     * POST /api/payments/create-order
     *
     * because that endpoint is for Razorpay gateway
     * payments.
     *
     * The UPI QR/payment-proof flow should be handled
     * by the PaymentPage.
     */

    const handleUPIPayment = () => {

        if (
            disabled ||
            loading
        ) {
            return;
        }


        if (
            typeof onSuccess ===
            "function"
        ) {

            onSuccess({
                paymentMethod: "upi",

                registrationId,

                eventId,

                amount,

                event,

                user,
            });
        }
    };


    /*
     * =========================================================
     * FREE EVENT
     * =========================================================
     */

    if (isFree) {

        return (
            <div className="payment-button-container">

                <button
                    type="button"
                    className="payment-button"
                    onClick={() => {

                        if (
                            typeof onSuccess ===
                            "function"
                        ) {

                            onSuccess({
                                paymentMethod:
                                    "free",

                                registrationId,

                                eventId,

                                amount: 0,

                                event,

                                user,
                            });
                        }

                    }}
                    disabled={
                        disabled ||
                        loading ||
                        !registrationId ||
                        !eventId
                    }
                >

                    {loading ? (

                        <>

                            <Loader2
                                size={18}
                                className="payment-button-spinner"
                            />

                            <span>
                                Processing...
                            </span>

                        </>

                    ) : (

                        <>

                            <CreditCard
                                size={18}
                            />

                            <span>
                                Complete Registration
                            </span>

                            <ArrowRight
                                size={16}
                            />

                        </>
                    )}

                </button>


                <div className="payment-button-security">

                    <ShieldCheck
                        size={14}
                    />

                    <span>
                        No payment required
                    </span>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * UPI PAYMENT
     * =========================================================
     */

    if (isUPI) {

        const qrImage =
            event?.paymentQrImageUrl ||
            event?.paymentQrUrl ||
            event?.paymentQR ||
            "";

        const upiId =
            event?.paymentUpiId ||
            "";


        return (
            <div className="payment-button-container">

                <div className="upi-payment-method">

                    <div className="upi-payment-icon">

                        <QrCode
                            size={22}
                        />

                    </div>


                    <div className="upi-payment-content">

                        <h3>
                            UPI Payment
                        </h3>

                        <p>
                            Pay using the organizer's
                            UPI QR code or UPI ID.
                        </p>

                    </div>

                </div>


                {qrImage && (

                    <div className="upi-payment-qr">

                        <img
                            src={qrImage}
                            alt="Organizer UPI QR Code"
                        />

                    </div>

                )}


                {upiId && (

                    <div className="upi-payment-id">

                        <Smartphone
                            size={16}
                        />

                        <span>
                            UPI ID:
                        </span>

                        <strong>
                            {upiId}
                        </strong>

                    </div>

                )}


                {event?.paymentInstructions && (

                    <div className="upi-payment-instructions">

                        <strong>
                            Payment Instructions
                        </strong>

                        <p>
                            {
                                event.paymentInstructions
                            }
                        </p>

                    </div>

                )}


                <button
                    type="button"
                    className="payment-button upi-payment-button"
                    onClick={
                        handleUPIPayment
                    }
                    disabled={
                        disabled ||
                        loading ||
                        !registrationId ||
                        !eventId
                    }
                >

                    {loading ? (

                        <>

                            <Loader2
                                size={18}
                                className="payment-button-spinner"
                            />

                            <span>
                                Processing...
                            </span>

                        </>

                    ) : (

                        <>

                            <QrCode
                                size={18}
                            />

                            <span>
                                I Have Completed UPI Payment
                            </span>

                            <ArrowRight
                                size={16}
                            />

                        </>
                    )}

                </button>


                <div className="payment-button-security">

                    <ShieldCheck
                        size={14}
                    />

                    <span>
                        UPI payment handled securely
                    </span>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * RAZORPAY PAYMENT
     * =========================================================
     */

    if (isRazorpay) {

        return (
            <div className="payment-button-container">


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="payment-button-error"
                        role="alert"
                    >

                        <span>
                            {error}
                        </span>

                    </div>
                )}


                {/* =================================================
                    PAYMENT BUTTON
                ================================================= */}

                <button
                    type="button"
                    className="payment-button"
                    onClick={
                        handleRazorpayPayment
                    }
                    disabled={
                        disabled ||
                        loading ||
                        !registrationId ||
                        !eventId ||
                        !amount ||
                        Number(amount) <= 0
                    }
                >

                    {loading ? (

                        <>

                            <Loader2
                                size={18}
                                className="payment-button-spinner"
                            />

                            <span>
                                Processing Payment...
                            </span>

                        </>

                    ) : (

                        <>

                            <CreditCard
                                size={18}
                            />

                            <span>
                                {children ||
                                    `Pay ${formattedAmount}`}
                            </span>

                            <ArrowRight
                                size={16}
                            />

                        </>
                    )}

                </button>


                {/* =================================================
                    SECURITY INFORMATION
                ================================================= */}

                <div className="payment-button-security">

                    <ShieldCheck
                        size={14}
                    />

                    <span>
                        Secure payment powered by Razorpay
                    </span>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * UNKNOWN PAYMENT METHOD
     * =========================================================
     */

    return (
        <div className="payment-button-container">

            <div
                className="payment-button-error"
                role="alert"
            >

                <span>
                    Unsupported payment method:
                    {" "}
                    {paymentMethod}
                </span>

            </div>

        </div>
    );
};


export default PaymentButton;