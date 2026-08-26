// frontend/src/utils/paymentValidation.js

/*
 * ============================================================
 * EVENTSPHERE — PAYMENT VALIDATION
 * ============================================================
 *
 * Frontend-side validation for payment data.
 *
 * IMPORTANT:
 * Frontend validation is only for user experience.
 * The backend MUST independently validate:
 *
 * - registration
 * - event
 * - amount
 * - Razorpay order
 * - payment signature
 *
 * ============================================================
 */


/*
 * ============================================================
 * VALIDATE REGISTRATION ID
 * ============================================================
 */

const isValidRegistrationId = (
    registrationId
) => {
    if (!registrationId) {
        return false;
    }

    return (
        typeof registrationId === "string" &&
        registrationId.trim().length > 0
    );
};


/*
 * ============================================================
 * VALIDATE EVENT ID
 * ============================================================
 */

const isValidEventId = (
    eventId
) => {
    if (!eventId) {
        return false;
    }

    return (
        typeof eventId === "string" &&
        eventId.trim().length > 0
    );
};


/*
 * ============================================================
 * VALIDATE PAYMENT AMOUNT
 * ============================================================
 */

const isValidPaymentAmount = (
    amount
) => {
    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {
        return false;
    }

    const numericAmount =
        Number(amount);

    return (
        Number.isFinite(numericAmount) &&
        numericAmount >= 0
    );
};


/*
 * ============================================================
 * VALIDATE PAID AMOUNT
 * ============================================================
 *
 * Paid events must normally have an amount greater than zero.
 */

const isValidPaidAmount = (
    amount
) => {
    if (!isValidPaymentAmount(amount)) {
        return false;
    }

    return Number(amount) > 0;
};


/*
 * ============================================================
 * VALIDATE RAZORPAY ORDER
 * ============================================================
 */

const isValidRazorpayOrder = (
    order
) => {
    if (!order || typeof order !== "object") {
        return false;
    }

    const orderId =
        order.id ||
        order.orderId;

    const amount =
        order.amount;

    const currency =
        order.currency;

    return (
        Boolean(orderId) &&
        isValidPaymentAmount(amount) &&
        Boolean(currency)
    );
};


/*
 * ============================================================
 * VALIDATE RAZORPAY PAYMENT RESPONSE
 * ============================================================
 *
 * Razorpay Checkout normally returns:
 *
 * razorpay_order_id
 * razorpay_payment_id
 * razorpay_signature
 * ============================================================
 */

const validateRazorpayResponse = (
    paymentResponse
) => {

    const errors = {};


    if (
        !paymentResponse ||
        typeof paymentResponse !== "object"
    ) {
        return {
            isValid: false,

            errors: {
                payment:
                    "Payment response was not received.",
            },
        };
    }


    if (
        !paymentResponse.razorpay_order_id
    ) {
        errors.razorpayOrderId =
            "Razorpay order ID is missing.";
    }


    if (
        !paymentResponse.razorpay_payment_id
    ) {
        errors.razorpayPaymentId =
            "Razorpay payment ID is missing.";
    }


    if (
        !paymentResponse.razorpay_signature
    ) {
        errors.razorpaySignature =
            "Payment signature is missing.";
    }


    return {
        isValid:
            Object.keys(errors).length === 0,

        errors,
    };
};


/*
 * ============================================================
 * VALIDATE PAYMENT ORDER DATA
 * ============================================================
 */

const validatePaymentOrderData = ({
    registrationId,
    eventId,
    amount,
}) => {

    const errors = {};


    if (
        !isValidRegistrationId(
            registrationId
        )
    ) {
        errors.registrationId =
            "Registration ID is required.";
    }


    if (
        !isValidEventId(eventId)
    ) {
        errors.eventId =
            "Event ID is required.";
    }


    if (
        !isValidPaidAmount(amount)
    ) {
        errors.amount =
            "A valid payment amount is required.";
    }


    return {
        isValid:
            Object.keys(errors).length === 0,

        errors,
    };
};


/*
 * ============================================================
 * VALIDATE CURRENCY
 * ============================================================
 */

const isValidCurrency = (
    currency
) => {

    if (!currency) {
        return false;
    }

    return (
        typeof currency === "string" &&
        /^[A-Z]{3}$/.test(
            currency.trim().toUpperCase()
        )
    );
};


/*
 * ============================================================
 * FORMAT PAYMENT AMOUNT
 * ============================================================
 */

const formatPaymentAmount = (
    amount,
    currency = "INR"
) => {

    const numericAmount =
        Number(amount);

    if (
        !Number.isFinite(
            numericAmount
        )
    ) {
        return "₹0.00";
    }


    try {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency:
                    currency.toUpperCase(),

                minimumFractionDigits: 2,

                maximumFractionDigits: 2,
            }
        ).format(
            numericAmount
        );

    } catch {
        return `₹${numericAmount.toFixed(2)}`;
    }
};


/*
 * ============================================================
 * GET FIRST PAYMENT ERROR
 * ============================================================
 */

const getFirstPaymentError = (
    errors = {}
) => {

    const firstKey =
        Object.keys(errors)[0];

    if (!firstKey) {
        return "";
    }

    return errors[firstKey];
};


/*
 * ============================================================
 * EXPORT
 * ============================================================
 */

export {
    isValidRegistrationId,
    isValidEventId,
    isValidPaymentAmount,
    isValidPaidAmount,
    isValidRazorpayOrder,
    validateRazorpayResponse,
    validatePaymentOrderData,
    isValidCurrency,
    formatPaymentAmount,
    getFirstPaymentError,
};