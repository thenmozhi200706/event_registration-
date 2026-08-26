// frontend/src/services/paymentService.js

import api from "../api/api";


/*
 * ============================================================
 * EVENTSPHERE — PAYMENT SERVICE
 * ============================================================
 *
 * Handles all participant payment API requests.
 *
 * Expected backend flow:
 *
 * 1. Create registration
 * 2. Create payment order
 * 3. Open Razorpay Checkout
 * 4. Verify payment
 * 5. Fetch payment status
 *
 * ============================================================
 */


/*
 * ============================================================
 * CREATE PAYMENT ORDER
 * ============================================================
 *
 * Backend:
 *
 * POST /api/payments/create-order
 *
 * Expected payload can contain:
 *
 * {
 *     registrationId,
 *     eventId,
 *     amount
 * }
 *
 * The backend should calculate/validate the
 * final amount instead of trusting the frontend.
 */

const createPaymentOrder = async ({
    registrationId,
    eventId,
    amount,
}) => {
    try {

        if (!registrationId) {
            throw new Error(
                "Registration ID is required."
            );
        }

        if (!eventId) {
            throw new Error(
                "Event ID is required."
            );
        }

        const response = await api.post(
            "/payments/create-order",
            {
                registrationId,
                eventId,
                amount,
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "Create payment order error:",
            error.response?.data ||
            error.message
        );

        throw (
            error.response?.data || {
                success: false,
                message:
                    "Failed to create payment order.",
            }
        );
    }
};


/*
 * ============================================================
 * VERIFY PAYMENT
 * ============================================================
 *
 * Backend:
 *
 * POST /api/payments/verify
 *
 * Razorpay normally returns:
 *
 * razorpay_order_id
 * razorpay_payment_id
 * razorpay_signature
 *
 * The backend verifies the signature.
 *
 * IMPORTANT:
 * Never verify the Razorpay signature
 * only on the frontend.
 */

const verifyPayment = async ({
    registrationId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    try {

        if (!registrationId) {
            throw new Error(
                "Registration ID is required."
            );
        }

        if (!razorpayOrderId) {
            throw new Error(
                "Razorpay order ID is required."
            );
        }

        if (!razorpayPaymentId) {
            throw new Error(
                "Razorpay payment ID is required."
            );
        }

        if (!razorpaySignature) {
            throw new Error(
                "Razorpay signature is required."
            );
        }


        const response = await api.post(
            "/payments/verify",
            {
                registrationId,

                razorpayOrderId,

                razorpayPaymentId,

                razorpaySignature,
            }
        );


        return response.data;

    } catch (error) {

        console.error(
            "Verify payment error:",
            error.response?.data ||
            error.message
        );

        throw (
            error.response?.data || {
                success: false,
                message:
                    "Payment verification failed.",
            }
        );
    }
};


/*
 * ============================================================
 * GET PAYMENT BY REGISTRATION
 * ============================================================
 *
 * Backend:
 *
 * GET /api/payments/registration/:registrationId
 *
 * Useful for:
 *
 * - Registration details
 * - Payment status
 * - Retry payment
 * - Confirmation page
 */

const getPaymentByRegistration =
    async (registrationId) => {

        try {

            if (!registrationId) {
                throw new Error(
                    "Registration ID is required."
                );
            }


            const response = await api.get(
                `/payments/registration/${registrationId}`
            );


            return response.data;

        } catch (error) {

            console.error(
                "Get payment error:",
                error.response?.data ||
                error.message
            );

            throw (
                error.response?.data || {
                    success: false,
                    message:
                        "Failed to fetch payment details.",
                }
            );
        }
    };


/*
 * ============================================================
 * GET PAYMENT BY ID
 * ============================================================
 *
 * Backend:
 *
 * GET /api/payments/:id
 *
 * Optional helper for payment details.
 */

const getPaymentById = async (
    paymentId
) => {

    try {

        if (!paymentId) {
            throw new Error(
                "Payment ID is required."
            );
        }


        const response = await api.get(
            `/payments/${paymentId}`
        );


        return response.data;

    } catch (error) {

        console.error(
            "Get payment by ID error:",
            error.response?.data ||
            error.message
        );

        throw (
            error.response?.data || {
                success: false,
                message:
                    "Failed to fetch payment.",
            }
        );
    }
};


/*
 * ============================================================
 * EXPORT SERVICE
 * ============================================================
 */

const paymentService = {

    createPaymentOrder,

    verifyPayment,

    getPaymentByRegistration,

    getPaymentById,
};


export default paymentService;