// backend/utils/paymentValidation.js

// ==========================================
// VALIDATE PAYMENT METHOD
// ==========================================

const validatePaymentMethod = (paymentMethod) => {
    const allowedMethods = [
        "gateway",
        "qr",
        "free",
    ];

    if (!paymentMethod) {
        return {
            valid: false,
            message: "Payment method is required",
        };
    }

    if (!allowedMethods.includes(paymentMethod)) {
        return {
            valid: false,
            message:
                "Invalid payment method. Allowed methods: gateway, qr, free",
        };
    }

    return {
        valid: true,
        message: "Payment method is valid",
    };
};

// ==========================================
// VALIDATE PAYMENT AMOUNT
// ==========================================

const validatePaymentAmount = (amount) => {
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        return {
            valid: false,
            message: "Payment amount is required",
        };
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
        return {
            valid: false,
            message: "Payment amount must be a valid number",
        };
    }

    if (numericAmount < 0) {
        return {
            valid: false,
            message: "Payment amount cannot be negative",
        };
    }

    return {
        valid: true,
        amount: numericAmount,
    };
};

// ==========================================
// VALIDATE CURRENCY
// ==========================================

const validateCurrency = (currency) => {
    if (!currency) {
        return {
            valid: true,
            currency: "INR",
        };
    }

    const normalizedCurrency =
        String(currency)
            .trim()
            .toUpperCase();

    const allowedCurrencies = [
        "INR",
    ];

    if (
        !allowedCurrencies.includes(
            normalizedCurrency
        )
    ) {
        return {
            valid: false,
            message:
                "Unsupported currency. Currently only INR is supported",
        };
    }

    return {
        valid: true,
        currency: normalizedCurrency,
    };
};

// ==========================================
// VALIDATE REGISTRATION ID
// ==========================================

const validateRegistrationId = (
    registrationId
) => {
    if (!registrationId) {
        return {
            valid: false,
            message:
                "Registration ID is required",
        };
    }

    return {
        valid: true,
    };
};

// ==========================================
// VALIDATE GATEWAY PAYMENT DATA
// ==========================================

const validateGatewayPayment = ({
    registrationId,
    amount,
    currency,
}) => {
    const registrationResult =
        validateRegistrationId(
            registrationId
        );

    if (!registrationResult.valid) {
        return registrationResult;
    }

    const amountResult =
        validatePaymentAmount(
            amount
        );

    if (!amountResult.valid) {
        return amountResult;
    }

    const currencyResult =
        validateCurrency(
            currency
        );

    if (!currencyResult.valid) {
        return currencyResult;
    }

    return {
        valid: true,

        registrationId,

        amount:
            amountResult.amount,

        currency:
            currencyResult.currency,
    };
};

// ==========================================
// VALIDATE QR PAYMENT SUBMISSION
// ==========================================

const validateQRPayment = ({
    registrationId,
    paymentProofUrl,
}) => {
    const registrationResult =
        validateRegistrationId(
            registrationId
        );

    if (!registrationResult.valid) {
        return registrationResult;
    }

    if (
        !paymentProofUrl ||
        !String(paymentProofUrl).trim()
    ) {
        return {
            valid: false,
            message:
                "Payment proof is required for QR payment",
        };
    }

    return {
        valid: true,
        registrationId,
        paymentProofUrl:
            String(
                paymentProofUrl
            ).trim(),
    };
};

// ==========================================
// VALIDATE RAZORPAY ORDER DATA
// ==========================================

const validateRazorpayOrder = ({
    amount,
    currency = "INR",
    receipt,
}) => {
    const amountResult =
        validatePaymentAmount(
            amount
        );

    if (!amountResult.valid) {
        return amountResult;
    }

    if (
        amountResult.amount <= 0
    ) {
        return {
            valid: false,
            message:
                "Razorpay order amount must be greater than zero",
        };
    }

    const currencyResult =
        validateCurrency(
            currency
        );

    if (!currencyResult.valid) {
        return currencyResult;
    }

    if (!receipt) {
        return {
            valid: false,
            message:
                "Payment receipt is required",
        };
    }

    return {
        valid: true,

        amount:
            amountResult.amount,

        currency:
            currencyResult.currency,

        receipt:
            String(receipt).trim(),
    };
};

// ==========================================
// VALIDATE RAZORPAY PAYMENT RESPONSE
// ==========================================

const validateRazorpayResponse = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    if (!razorpayOrderId) {
        return {
            valid: false,
            message:
                "Razorpay order ID is required",
        };
    }

    if (!razorpayPaymentId) {
        return {
            valid: false,
            message:
                "Razorpay payment ID is required",
        };
    }

    if (!razorpaySignature) {
        return {
            valid: false,
            message:
                "Razorpay payment signature is required",
        };
    }

    return {
        valid: true,
    };
};

// ==========================================
// VALIDATE REFUND AMOUNT
// ==========================================

const validateRefundAmount = (
    amount
) => {
    if (
        amount === undefined ||
        amount === null ||
        amount === ""
    ) {
        return {
            valid: false,
            message:
                "Refund amount is required",
        };
    }

    const refundAmount =
        Number(amount);

    if (
        !Number.isFinite(
            refundAmount
        )
    ) {
        return {
            valid: false,
            message:
                "Refund amount must be a valid number",
        };
    }

    if (
        refundAmount <= 0
    ) {
        return {
            valid: false,
            message:
                "Refund amount must be greater than zero",
        };
    }

    return {
        valid: true,
        amount: refundAmount,
    };
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    validatePaymentMethod,
    validatePaymentAmount,
    validateCurrency,
    validateRegistrationId,
    validateGatewayPayment,
    validateQRPayment,
    validateRazorpayOrder,
    validateRazorpayResponse,
    validateRefundAmount,
};