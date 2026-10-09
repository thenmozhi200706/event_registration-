// frontend/src/hooks/usePayment.js

import {
    useCallback,
    useState,
} from "react";

import paymentService from "../services/paymentService";

import {
    validatePaymentOrderData,
    validateRazorpayResponse,
} from "../utils/paymentValidation";


/*
 * ============================================================
 * EVENTSPHERE — PAYMENT HOOK
 * ============================================================
 *
 * Handles:
 *
 * 1. Creating Razorpay order
 * 2. Opening Razorpay Checkout
 * 3. Receiving Razorpay response
 * 4. Sending payment response to backend
 * 5. Returning payment result to component
 *
 * IMPORTANT:
 *
 * This hook is ONLY for Razorpay gateway payments.
 *
 * UPI / QR payments must use the separate QR
 * payment confirmation flow.
 *
 * The frontend does NOT verify the Razorpay signature.
 *
 * The backend must verify:
 *
 * razorpay_order_id
 * razorpay_payment_id
 * razorpay_signature
 *
 * ============================================================
 */


/*
 * ============================================================
 * RAZORPAY SCRIPT LOADER
 * ============================================================
 */

const RAZORPAY_SCRIPT_URL =
    "https://checkout.razorpay.com/v1/checkout.js";


const loadRazorpayScript = () => {

    return new Promise((resolve) => {

        /*
         * Already loaded
         */

        if (
            typeof window !== "undefined" &&
            window.Razorpay
        ) {
            resolve(true);
            return;
        }


        /*
         * Check whether script is already
         * being loaded.
         */

        const existingScript =
            document.querySelector(
                `script[src="${RAZORPAY_SCRIPT_URL}"]`
            );


        if (existingScript) {

            /*
             * Script has already loaded.
             */

            if (
                typeof window !== "undefined" &&
                window.Razorpay
            ) {
                resolve(true);
                return;
            }


            existingScript.addEventListener(
                "load",
                () => resolve(true),
                {
                    once: true,
                }
            );


            existingScript.addEventListener(
                "error",
                () => resolve(false),
                {
                    once: true,
                }
            );

            return;
        }


        /*
         * Create script.
         */

        const script =
            document.createElement(
                "script"
            );

        script.src =
            RAZORPAY_SCRIPT_URL;

        script.async = true;


        script.onload = () => {

            resolve(
                typeof window !== "undefined" &&
                !!window.Razorpay
            );
        };


        script.onerror = () => {

            resolve(false);
        };


        document.body.appendChild(
            script
        );
    });
};


/*
 * ============================================================
 * NORMALIZE PAYMENT METHOD
 * ============================================================
 *
 * Event model:
 *
 * free
 * razorpay
 * upi
 *
 * Registration model:
 *
 * free
 * gateway
 * qr
 *
 * This hook works with the Event model.
 */

const normalizePaymentMethod = (
    paymentMethod
) => {

    const method =
        String(
            paymentMethod || ""
        )
            .trim()
            .toLowerCase();


    if (
        method === "gateway"
    ) {
        return "razorpay";
    }


    if (
        method === "qr"
    ) {
        return "upi";
    }


    if (
        method === "razorpay"
    ) {
        return "razorpay";
    }


    if (
        method === "upi"
    ) {
        return "upi";
    }


    if (
        method === "free"
    ) {
        return "free";
    }


    return "";
};


/*
 * ============================================================
 * PAYMENT HOOK
 * ============================================================
 */

const usePayment = () => {

    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState("");


    const [
        paymentResult,
        setPaymentResult,
    ] = useState(null);


    /*
     * ========================================================
     * RESET PAYMENT STATE
     * ========================================================
     */

    const resetPayment =
        useCallback(() => {

            setLoading(false);

            setError("");

            setPaymentResult(null);

        }, []);


    /*
     * ========================================================
     * START PAYMENT
     * ========================================================
     */

    const startPayment =
        useCallback(
            async ({
                registrationId,
                eventId,
                amount,
                event = {},
                user = {},
                onSuccess,
                onFailure,
            }) => {

                setLoading(true);

                setError("");

                setPaymentResult(null);


                try {

                    /*
                     * ------------------------------------------------
                     * Validate required IDs
                     * ------------------------------------------------
                     */

                    if (!registrationId) {

                        throw new Error(
                            "Registration ID is missing."
                        );
                    }


                    if (!eventId) {

                        throw new Error(
                            "Event ID is missing."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Validate amount
                     * ------------------------------------------------
                     */

                    const numericAmount =
                        Number(amount);


                    if (
                        !Number.isFinite(
                            numericAmount
                        ) ||
                        numericAmount <= 0
                    ) {

                        throw new Error(
                            "Invalid payment amount."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Check event payment method
                     * ------------------------------------------------
                     */

                    const paymentMethod =
                        normalizePaymentMethod(
                            event?.paymentMethod
                        );


                    /*
                     * ------------------------------------------------
                     * FREE EVENT
                     * ------------------------------------------------
                     */

                    if (
                        paymentMethod ===
                        "free"
                    ) {

                        throw new Error(
                            "This is a free event. No payment is required."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * UPI / QR EVENT
                     * ------------------------------------------------
                     *
                     * Razorpay must NOT be opened for a QR event.
                     */

                    if (
                        paymentMethod ===
                        "upi"
                    ) {

                        throw new Error(
                            "This event uses UPI / QR payment. Please use the QR payment option instead of Razorpay."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Unknown payment method
                     * ------------------------------------------------
                     */

                    if (
                        paymentMethod !==
                        "razorpay"
                    ) {

                        throw new Error(
                            "Payment method is not configured correctly for this event."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Validate Razorpay payment data
                     * ------------------------------------------------
                     */

                    const validation =
                        validatePaymentOrderData({
                            registrationId,
                            eventId,
                            amount:
                                numericAmount,
                        });


                    if (
                        !validation.isValid
                    ) {

                        const message =
                            Object.values(
                                validation.errors ||
                                {}
                            )[0] ||
                            "Invalid payment information.";

                        throw new Error(
                            message
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Load Razorpay
                     * ------------------------------------------------
                     */

                    const razorpayLoaded =
                        await loadRazorpayScript();


                    if (
                        !razorpayLoaded
                    ) {

                        throw new Error(
                            "Unable to load Razorpay Checkout. Please check your internet connection and try again."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Razorpay key
                     * ------------------------------------------------
                     *
                     * frontend/.env
                     *
                     * VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
                     */

                    const razorpayKey =
                        import.meta.env
                            .VITE_RAZORPAY_KEY_ID;


                    if (
                        !razorpayKey
                    ) {

                        throw new Error(
                            "Razorpay key is not configured. Add VITE_RAZORPAY_KEY_ID to the frontend .env file."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Create order on backend
                     * ------------------------------------------------
                     */

                    const orderResponse =
                        await paymentService.createPaymentOrder(
                            {
                                registrationId,

                                eventId,

                                amount:
                                    numericAmount,
                            }
                        );


                    const orderData =
                        orderResponse?.data ||
                        orderResponse;


                    /*
                     * Some APIs return:
                     *
                     * {
                     *     success: true,
                     *     order: {...}
                     * }
                     *
                     * Others return the order directly.
                     */

                    const order =
                        orderData?.order ||
                        orderData?.paymentOrder ||
                        orderData;


                    if (
                        !order ||
                        !order.id
                    ) {

                        throw new Error(
                            orderData?.message ||
                            "Payment order was not created."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Validate order amount
                     * ------------------------------------------------
                     *
                     * Razorpay uses paise.
                     *
                     * Example:
                     *
                     * ₹1 = 100 paise
                     */

                    if (
                        order.amount &&
                        Number(order.amount) <= 0
                    ) {

                        throw new Error(
                            "Invalid Razorpay order amount."
                        );
                    }


                    /*
                     * ------------------------------------------------
                     * Razorpay options
                     * ------------------------------------------------
                     */

                    const options = {

                        key:
                            razorpayKey,

                        amount:
                            order.amount,

                        currency:
                            order.currency ||
                            "INR",

                        name:
                            "EventSphere",

                        description:
                            event?.title ||
                            "Event Registration",

                        order_id:
                            order.id,


                        /*
                         * Participant information
                         */

                        prefill: {

                            name:
                                user?.name ||
                                [
                                    user?.firstName,
                                    user?.lastName,
                                ]
                                    .filter(Boolean)
                                    .join(" "),

                            email:
                                user?.email ||
                                "",

                            contact:
                                user?.whatsappNumber ||
                                user?.phone ||
                                "",
                        },


                        /*
                         * Theme
                         */

                        theme: {
                            color:
                                "#6246d8",
                        },


                        /*
                         * Handler executes after
                         * successful Razorpay payment.
                         */

                        handler:
                            async (
                                response
                            ) => {

                                try {

                                    /*
                                     * Validate Razorpay response.
                                     */

                                    const result =
                                        validateRazorpayResponse(
                                            response
                                        );


                                    if (
                                        !result.isValid
                                    ) {

                                        throw new Error(
                                            "Razorpay returned an incomplete payment response."
                                        );
                                    }


                                    /*
                                     * ------------------------------------------------
                                     * Send response to backend.
                                     * ------------------------------------------------
                                     *
                                     * Backend verifies the
                                     * Razorpay signature.
                                     */

                                    const verifyResponse =
                                        await paymentService.verifyPayment(
                                            {
                                                registrationId,

                                                razorpayOrderId:
                                                    response
                                                        .razorpay_order_id,

                                                razorpayPaymentId:
                                                    response
                                                        .razorpay_payment_id,

                                                razorpaySignature:
                                                    response
                                                        .razorpay_signature,
                                            }
                                        );


                                    const verifyData =
                                        verifyResponse?.data ||
                                        verifyResponse;


                                    /*
                                     * Backend can return:
                                     *
                                     * {
                                     *   success: true,
                                     *   payment: {...},
                                     *   registration: {...}
                                     * }
                                     */

                                    if (
                                        verifyData?.success ===
                                        false
                                    ) {

                                        throw new Error(
                                            verifyData?.message ||
                                            "Payment verification failed."
                                        );
                                    }


                                    const finalResult = {

                                        success:
                                            true,

                                        order,

                                        razorpayResponse:
                                            response,

                                        verification:
                                            verifyData,
                                    };


                                    setPaymentResult(
                                        finalResult
                                    );


                                    setLoading(
                                        false
                                    );


                                    /*
                                     * Notify parent.
                                     */

                                    if (
                                        typeof onSuccess ===
                                        "function"
                                    ) {

                                        await onSuccess(
                                            finalResult
                                        );
                                    }

                                } catch (
                                    verificationError
                                ) {

                                    console.error(
                                        "Payment verification error:",
                                        verificationError
                                    );


                                    const message =
                                        verificationError
                                            ?.response
                                            ?.data
                                            ?.message ||
                                        verificationError
                                            ?.message ||
                                        "Payment verification failed.";


                                    setError(
                                        message
                                    );


                                    setLoading(
                                        false
                                    );


                                    if (
                                        typeof onFailure ===
                                        "function"
                                    ) {

                                        onFailure(
                                            verificationError
                                        );
                                    }
                                }
                            },


                        /*
                         * Checkout dismissed.
                         */

                        modal: {

                            ondismiss: () => {

                                setLoading(
                                    false
                                );

                                setError(
                                    "Payment was cancelled."
                                );


                                if (
                                    typeof onFailure ===
                                    "function"
                                ) {

                                    onFailure(
                                        new Error(
                                            "Payment was cancelled."
                                        )
                                    );
                                }
                            },
                        },
                    };


                    /*
                     * ------------------------------------------------
                     * Create Razorpay instance
                     * ------------------------------------------------
                     */

                    const razorpay =
                        new window.Razorpay(
                            options
                        );


                    /*
                     * Razorpay payment failure.
                     */

                    razorpay.on(
                        "payment.failed",
                        (
                            response
                        ) => {

                            console.error(
                                "Razorpay payment failed:",
                                response
                            );


                            const message =
                                response
                                    ?.error
                                    ?.description ||
                                "Payment failed. Please try again.";


                            setError(
                                message
                            );


                            setLoading(
                                false
                            );


                            if (
                                typeof onFailure ===
                                "function"
                            ) {

                                onFailure(
                                    response
                                );
                            }
                        }
                    );


                    /*
                     * ------------------------------------------------
                     * Open Checkout
                     * ------------------------------------------------
                     */

                    razorpay.open();


                    /*
                     * Return order information
                     * immediately.
                     *
                     * Actual payment result will
                     * arrive through handler().
                     */

                    return {

                        success:
                            true,

                        order,
                    };

                } catch (
                    paymentError
                ) {

                    console.error(
                        "Start payment error:",
                        paymentError
                    );


                    const message =
                        paymentError
                            ?.response
                            ?.data
                            ?.message ||
                        paymentError?.message ||
                        "Unable to start payment.";


                    setError(
                        message
                    );


                    setLoading(
                        false
                    );


                    if (
                        typeof onFailure ===
                        "function"
                    ) {

                        onFailure(
                            paymentError
                        );
                    }


                    return {

                        success:
                            false,

                        message,
                    };
                }

            },
            []
        );


    /*
     * ========================================================
     * RETURN HOOK API
     * ========================================================
     */

    return {

        startPayment,

        loading,

        error,

        paymentResult,

        resetPayment,

    };
};


export default usePayment;