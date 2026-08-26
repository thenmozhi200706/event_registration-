// backend/utils/ticketGenerator.js

const crypto = require("crypto");

// ==========================================
// GENERATE UNIQUE TICKET ID
// ==========================================

const generateTicketId = () => {
    const timestamp = Date.now()
        .toString(36)
        .toUpperCase();

    const randomPart = crypto
        .randomBytes(5)
        .toString("hex")
        .toUpperCase();

    return `EVS-${timestamp}-${randomPart}`;
};

// ==========================================
// GENERATE PAYMENT RECEIPT ID
// ==========================================

const generateReceiptId = () => {
    const timestamp = Date.now()
        .toString(36)
        .toUpperCase();

    const randomPart = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `RCP-${timestamp}-${randomPart}`;
};

// ==========================================
// GENERATE QR PAYMENT REFERENCE
// ==========================================

const generatePaymentReference = () => {
    const timestamp = Date.now()
        .toString(36)
        .toUpperCase();

    const randomPart = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `PAY-${timestamp}-${randomPart}`;
};

// ==========================================
// VALIDATE TICKET ID FORMAT
// ==========================================

const isValidTicketId = (ticketId) => {
    if (!ticketId) {
        return false;
    }

    return /^EVS-[A-Z0-9]+-[A-F0-9]+$/.test(
        ticketId
    );
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    generateTicketId,
    generateReceiptId,
    generatePaymentReference,
    isValidTicketId,
};