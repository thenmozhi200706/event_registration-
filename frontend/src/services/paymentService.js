// frontend/src/services/paymentService.js

import api from "../api/api";

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

        const response = await api.post(
            "/payments/create-order",
            {
                registrationId,
                eventId,
                amount: numericAmount,
            }
        );

        return response.data;

    } catch (error) {
        console.error(
            "Create payment order error:",
            error?.response?.data ||
            error?.message
        );

        throw (
            error?.response?.data || {
                success: false,
                message:
                    "Failed to create payment order.",
            }
        );
    }
};

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
            error?.response?.data ||
            error?.message
        );

        throw (
            error?.response?.data || {
                success: false,
                message:
                    "Payment verification failed.",
            }
        );
    }
};

const getPaymentByRegistration =
    async (registrationId) => {
        try {
            if (!registrationId) {
                throw new Error(
                    "Registration ID is required."
                );
            }

            const response =
                await api.get(
                    `/payments/registration/${registrationId}`
                );

            return response.data;

        } catch (error) {
            console.error(
                "Get payment error:",
                error?.response?.data ||
                error?.message
            );

            throw (
                error?.response?.data || {
                    success: false,
                    message:
                        "Failed to fetch payment details.",
                }
            );
        }
    };

const getPaymentById =
    async (paymentId) => {
        try {
            if (!paymentId) {
                throw new Error(
                    "Payment ID is required."
                );
            }

            const response =
                await api.get(
                    `/payments/${paymentId}`
                );

            return response.data;

        } catch (error) {
            console.error(
                "Get payment by ID error:",
                error?.response?.data ||
                error?.message
            );

            throw (
                error?.response?.data || {
                    success: false,
                    message:
                        "Failed to fetch payment.",
                }
            );
        }
    };

const paymentService = {
    createPaymentOrder,
    verifyPayment,
    getPaymentByRegistration,
    getPaymentById,
};

export default paymentService;