// backend/utils/paymentStatus.js

// ==========================================
// PAYMENT STATUS CONSTANTS
// ==========================================

const PAYMENT_STATUS = Object.freeze({
    PENDING: "pending",
    PAYMENT_SUBMITTED: "payment_submitted",
    PAID: "paid",
    FAILED: "failed",
    REJECTED: "rejected",
    REFUNDED: "refunded",
});

// ==========================================
// PAYMENT METHODS
// ==========================================

const PAYMENT_METHOD = Object.freeze({
    GATEWAY: "gateway",
    QR: "qr",
    FREE: "free",
});

// ==========================================
// CHECK VALID PAYMENT STATUS
// ==========================================

const isValidPaymentStatus = (status) => {
    return Object.values(
        PAYMENT_STATUS
    ).includes(status);
};

// ==========================================
// CHECK VALID PAYMENT METHOD
// ==========================================

const isValidPaymentMethod = (method) => {
    return Object.values(
        PAYMENT_METHOD
    ).includes(method);
};

// ==========================================
// CHECK PAYMENT COMPLETED
// ==========================================

const isPaymentCompleted = (status) => {
    return status === PAYMENT_STATUS.PAID;
};

// ==========================================
// CHECK PAYMENT PENDING
// ==========================================

const isPaymentPending = (status) => {
    return (
        status === PAYMENT_STATUS.PENDING ||
        status === PAYMENT_STATUS.PAYMENT_SUBMITTED
    );
};

// ==========================================
// CHECK PAYMENT FAILED
// ==========================================

const isPaymentFailed = (status) => {
    return (
        status === PAYMENT_STATUS.FAILED ||
        status === PAYMENT_STATUS.REJECTED
    );
};

// ==========================================
// CHECK REFUNDED
// ==========================================

const isPaymentRefunded = (status) => {
    return status === PAYMENT_STATUS.REFUNDED;
};

// ==========================================
// GATEWAY PAYMENT TRANSITIONS
// ==========================================

const canMarkAsPaid = (currentStatus) => {
    return [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.PAYMENT_SUBMITTED,
    ].includes(currentStatus);
};

// ==========================================
// QR PAYMENT TRANSITIONS
// ==========================================

const canSubmitPaymentProof = (currentStatus) => {
    return [
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.REJECTED,
    ].includes(currentStatus);
};

// ==========================================
// QR PAYMENT VERIFICATION
// ==========================================

const canVerifyQRPayment = (currentStatus) => {
    return (
        currentStatus ===
        PAYMENT_STATUS.PAYMENT_SUBMITTED
    );
};

// ==========================================
// REJECTION
// ==========================================

const canRejectPayment = (currentStatus) => {
    return (
        currentStatus ===
        PAYMENT_STATUS.PAYMENT_SUBMITTED
    );
};

// ==========================================
// REFUND
// ==========================================

const canRefundPayment = (currentStatus) => {
    return (
        currentStatus ===
        PAYMENT_STATUS.PAID
    );
};

// ==========================================
// PAYMENT STATUS DESCRIPTION
// ==========================================

const getPaymentStatusDescription = (
    status
) => {
    const descriptions = {
        [PAYMENT_STATUS.PENDING]:
            "Payment is pending",

        [PAYMENT_STATUS.PAYMENT_SUBMITTED]:
            "Payment proof has been submitted and is waiting for verification",

        [PAYMENT_STATUS.PAID]:
            "Payment has been successfully completed",

        [PAYMENT_STATUS.FAILED]:
            "Payment failed",

        [PAYMENT_STATUS.REJECTED]:
            "Payment proof was rejected",

        [PAYMENT_STATUS.REFUNDED]:
            "Payment has been refunded",
    };

    return (
        descriptions[status] ||
        "Unknown payment status"
    );
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    PAYMENT_STATUS,
    PAYMENT_METHOD,

    isValidPaymentStatus,
    isValidPaymentMethod,

    isPaymentCompleted,
    isPaymentPending,
    isPaymentFailed,
    isPaymentRefunded,

    canMarkAsPaid,
    canSubmitPaymentProof,
    canVerifyQRPayment,
    canRejectPayment,
    canRefundPayment,

    getPaymentStatusDescription,
};