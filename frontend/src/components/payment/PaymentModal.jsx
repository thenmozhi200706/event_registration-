import React, { useEffect } from "react";
import {
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    CreditCard,
    IndianRupee,
} from "lucide-react";

import "./PaymentModal.css";


const PaymentModal = ({
    isOpen,
    onClose,
    onConfirm,
    loading = false,
    error = "",
    eventName = "Event",
    amount = 0,
}) => {

    /*
     * ---------------------------------------------------------
     * PREVENT BODY SCROLL WHEN MODAL IS OPEN
     * ---------------------------------------------------------
     */

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                originalOverflow;
        };

    }, [isOpen]);


    /*
     * ---------------------------------------------------------
     * ESC KEY
     * ---------------------------------------------------------
     */

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event) => {

            if (
                event.key === "Escape" &&
                !loading
            ) {
                onClose?.();
            }

        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };

    }, [
        isOpen,
        loading,
        onClose,
    ]);


    /*
     * ---------------------------------------------------------
     * DON'T RENDER WHEN CLOSED
     * ---------------------------------------------------------
     */

    if (!isOpen) {
        return null;
    }


    /*
     * ---------------------------------------------------------
     * NORMALIZE AMOUNT
     * ---------------------------------------------------------
     */

    const numericAmount =
        Number(amount);

    const safeAmount =
        Number.isFinite(numericAmount)
            ? numericAmount
            : 0;


    /*
     * ---------------------------------------------------------
     * BACKDROP CLICK
     * ---------------------------------------------------------
     */

    const handleBackdropClick = (
        event
    ) => {

        if (
            event.target === event.currentTarget &&
            !loading
        ) {
            onClose?.();
        }

    };


    /*
     * ---------------------------------------------------------
     * CONFIRM PAYMENT
     * ---------------------------------------------------------
     */

    const handleConfirm = () => {

        if (loading) {
            return;
        }

        onConfirm?.();

    };


    return (
        <div
            className="payment-modal-overlay"
            onMouseDown={handleBackdropClick}
            role="presentation"
        >

            <div
                className="payment-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-modal-title"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="payment-modal-header">

                    <div className="payment-modal-title-wrap">

                        <div className="payment-modal-icon">
                            <CreditCard size={20} />
                        </div>

                        <div>

                            <span className="payment-modal-eyebrow">
                                SECURE PAYMENT
                            </span>

                            <h2 id="payment-modal-title">
                                Complete Payment
                            </h2>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="payment-modal-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close payment modal"
                    >
                        <X size={18} />
                    </button>

                </div>


                {/* =================================================
                    EVENT
                ================================================= */}

                <div className="payment-modal-event">

                    <span>
                        EVENT REGISTRATION
                    </span>

                    <strong>
                        {eventName}
                    </strong>

                </div>


                {/* =================================================
                    AMOUNT
                ================================================= */}

                <div className="payment-modal-amount">

                    <span>
                        Total Amount
                    </span>

                    <strong>
                        <IndianRupee size={20} />

                        {safeAmount.toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }
                        )}
                    </strong>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="payment-modal-error">

                        <AlertCircle size={17} />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    SECURITY INFORMATION
                ================================================= */}

                <div className="payment-modal-security">

                    <CheckCircle2 size={17} />

                    <div>

                        <strong>
                            Secure checkout
                        </strong>

                        <p>
                            Your payment will be processed
                            through the secure EventSphere
                            payment gateway.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="payment-modal-actions">

                    <button
                        type="button"
                        className="payment-modal-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        className="payment-modal-confirm"
                        onClick={handleConfirm}
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <Loader2
                                    size={17}
                                    className="payment-modal-spinner"
                                />

                                Processing...
                            </>

                        ) : (

                            <>
                                <CreditCard size={17} />

                                Pay ₹
                                {safeAmount.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </>

                        )}

                    </button>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <p className="payment-modal-footer">
                    By continuing, you agree to the
                    EventSphere payment and registration
                    terms.
                </p>

            </div>

        </div>
    );
};


export default PaymentModal;