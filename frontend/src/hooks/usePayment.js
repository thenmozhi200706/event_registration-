// frontend/src/hooks/usePayment.js

import { useCallback, useState } from "react";

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

            existingScript.addEventListener(
                "load",
                () => resolve(true)
            );

            existingScript.addEventListener(
                "error",
                () => resolve(false)
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
            resolve(true);
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
 * PAYMENT HOOK
 * ============================================================
 */

const usePayment = () => {

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [paymentResult, setPaymentResult] =
        useState(null);


    /*
     * ========================================================
     * RESET PAYMENT STATE
     * ========================================================
     */

    const resetPayment = useCallback(() => {

        setLoading(false);

        setError("");

        setPaymentResult(null);

    }, []);


    /*
     * ========================================================
     * START PAYMENT
     * ========================================================
     *
     * Usage:
     *
     * const {
     *     startPayment,
     *     loading,
     *     error
     * } = usePayment();
     *
     *
     * await startPayment({
     *
     *     registrationId,
     *     eventId,
     *     amount,
     *
     *     event,
     *
     *     user,
     *
     *     onSuccess,
     *     onFailure
     *
     * });
     *
     * ========================================================
     */

    const startPayment = useCallback(
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
                 * Validate payment data
                 * ------------------------------------------------
                 */

                const validation =
                    validatePaymentOrderData({
                        registrationId,
                        eventId,
                        amount,
                    });


                if (!validation.isValid) {

                    const message =
                        Object.values(
                            validation.errors
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


                if (!razorpayLoaded) {

                    throw new Error(
                        "Unable to load Razorpay Checkout. Please check your internet connection and try again."
                    );
                }


                /*
                 * ------------------------------------------------
                 * Create order on backend
                 * ------------------------------------------------
                 *
                 * IMPORTANT:
                 *
                 * Backend should calculate/verify the
                 * final event amount.
                 *
                 * Do not trust frontend amount.
                 */

                const orderResponse =
                    await paymentService.createPaymentOrder({
                        registrationId,
                        eventId,
                        amount,
                    });


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
                 * Razorpay configuration
                 * ------------------------------------------------
                 *
                 * VITE_RAZORPAY_KEY_ID must be placed
                 * in frontend .env:
                 *
                 * VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
                 *
                 */

                const razorpayKey =
                    import.meta.env
                        .VITE_RAZORPAY_KEY_ID;


                if (!razorpayKey) {

                    throw new Error(
                        "Razorpay key is not configured. Add VITE_RAZORPAY_KEY_ID to the frontend .env file."
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
                                                response.razorpay_order_id,

                                            razorpayPaymentId:
                                                response.razorpay_payment_id,

                                            razorpaySignature:
                                                response.razorpay_signature,
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

                                    success: true,

                                    order,

                                    razorpayResponse:
                                        response,

                                    verification:
                                        verifyData,
                                };


                                setPaymentResult(
                                    finalResult
                                );


                                setLoading(false);


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
                                    verificationError?.response?.data?.message ||
                                    verificationError?.message ||
                                    "Payment verification failed.";


                                setError(
                                    message
                                );

                                setLoading(false);


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
                    (response) => {

                        console.error(
                            "Razorpay payment failed:",
                            response
                        );


                        const message =
                            response?.error?.description ||
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
                    success: true,

                    order,
                };

            } catch (paymentError) {

                console.error(
                    "Start payment error:",
                    paymentError
                );


                const message =
                    paymentError?.response?.data?.message ||
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
                    success: false,

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