// backend/controllers/qrPaymentController.js

const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

const {
    PAYMENT_STATUS,
    PAYMENT_METHOD,
    canSubmitPaymentProof,
    canVerifyQRPayment,
    canRejectPayment,
} = require("../utils/paymentStatus");

const {
    validateQRPayment,
} = require("../utils/paymentValidation");

const {
    generateTicketId,
} = require("../utils/ticketGenerator");

// ==========================================
// SUBMIT QR PAYMENT PROOF
// ==========================================
//
// POST /api/payments/qr/submit
//
// Body:
// {
//     "registrationId": "...",
//     "paymentProofUrl": "https://..."
// }
//
// ==========================================

const submitQRPayment = async (req, res) => {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const {
            registrationId,
            paymentProofUrl,
        } = req.body || {};

        // ==========================================
        // VALIDATE REQUEST
        // ==========================================

        const validation =
            validateQRPayment({
                registrationId,
                paymentProofUrl,
            });

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        // ==========================================
        // VALIDATE REGISTRATION ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                registrationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid registration ID",
            });
        }

        // ==========================================
        // FIND REGISTRATION
        // ==========================================

        const registration =
            await Registration.findById(
                registrationId
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // CHECK REGISTRATION OWNER
        // ==========================================

        if (
            registration.userId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only submit payment for your own registration",
            });
        }

        // ==========================================
        // FIND EVENT
        // ==========================================

        const event =
            await Event.findById(
                registration.eventId
            );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ==========================================
        // CHECK EVENT STATUS
        // ==========================================

        if (
            event.status !== "active"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This event is not accepting payments",
            });
        }

        // ==========================================
        // CHECK PAYMENT METHOD
        // ==========================================

        if (
            event.paymentMethod !==
            PAYMENT_METHOD.QR
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This event does not use QR payment",
                paymentMethod:
                    event.paymentMethod ||
                    null,
            });
        }

        // ==========================================
        // CHECK CURRENT PAYMENT STATUS
        // ==========================================

        if (
            !canSubmitPaymentProof(
                registration.paymentStatus
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment proof cannot be submitted with the current payment status",
                paymentStatus:
                    registration.paymentStatus,
            });
        }

        // ==========================================
        // CHECK IF ALREADY PAID
        // ==========================================

        if (
            registration.paymentStatus ===
            PAYMENT_STATUS.PAID
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This registration has already been paid",
            });
        }

        // ==========================================
        // GET EVENT FEE
        // ==========================================

        const amount =
            Number(
                event.registrationFee || 0
            );

        // ==========================================
        // QR PAYMENT CANNOT BE USED FOR FREE EVENT
        // ==========================================

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message:
                    "QR payment is not required for a free event",
            });
        }

        // ==========================================
        // FIND EXISTING QR PAYMENT
        // ==========================================

        let payment =
            await Payment.findOne({
                registrationId:
                    registration._id,

                paymentMethod:
                    PAYMENT_METHOD.QR,
            }).sort({
                createdAt: -1,
            });

        // ==========================================
        // CREATE PAYMENT IF NOT EXISTS
        // ==========================================

        if (!payment) {
            payment =
                new Payment({
                    registrationId:
                        registration._id,

                    eventId:
                        event._id,

                    userId:
                        req.user._id,

                    paymentMethod:
                        PAYMENT_METHOD.QR,

                    gateway: null,

                    amount,

                    currency: "INR",

                    status:
                        PAYMENT_STATUS.PENDING,
                });
        }

        // ==========================================
        // UPDATE PAYMENT PROOF
        // ==========================================

        payment.paymentProofUrl =
            String(
                paymentProofUrl
            ).trim();

        payment.paymentSubmittedAt =
            new Date();

        payment.status =
            PAYMENT_STATUS.PAYMENT_SUBMITTED;

        payment.rejectionReason = "";

        payment.verifiedBy = null;

        payment.verifiedAt = null;

        await payment.save();

        // ==========================================
        // UPDATE REGISTRATION
        // ==========================================

        registration.paymentStatus =
            PAYMENT_STATUS.PAYMENT_SUBMITTED;

        registration.paymentId =
            payment._id;

        registration.paymentProofUrl =
            payment.paymentProofUrl;

        registration.paymentSubmittedAt =
            payment.paymentSubmittedAt;

        registration.paymentRejectedAt =
            null;

        registration.paymentRejectionReason =
            "";

        await registration.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            message:
                "QR payment proof submitted successfully. Waiting for organizer verification.",

            payment: {
                id:
                    payment._id,

                registrationId:
                    payment.registrationId,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                paymentMethod:
                    payment.paymentMethod,

                status:
                    payment.status,

                paymentProofUrl:
                    payment.paymentProofUrl,

                paymentSubmittedAt:
                    payment.paymentSubmittedAt,
            },

            registration: {
                id:
                    registration._id,

                paymentStatus:
                    registration.paymentStatus,
            },
        });
    } catch (error) {
        console.error(
            "========== Submit QR Payment Error =========="
        );

        console.error(error);

        console.error(
            "=============================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to submit QR payment proof",
        });
    }
};

// ==========================================
// APPROVE QR PAYMENT
// ==========================================
//
// PATCH /api/payments/qr/:paymentId/approve
//
// Organizer only
//
// ==========================================

const approveQRPayment = async (req, res) => {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        const {
            paymentId,
        } = req.params;

        // ==========================================
        // VALIDATE PAYMENT ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                paymentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment ID",
            });
        }

        // ==========================================
        // FIND PAYMENT
        // ==========================================

        const payment =
            await Payment.findById(
                paymentId
            );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment not found",
            });
        }

        // ==========================================
        // CHECK PAYMENT METHOD
        // ==========================================

        if (
            payment.paymentMethod !==
            PAYMENT_METHOD.QR
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This payment is not a QR payment",
            });
        }

        // ==========================================
        // FIND EVENT
        // ==========================================

        const event =
            await Event.findById(
                payment.eventId
            );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ==========================================
        // CHECK ORGANIZER
        // ==========================================

        const isOwner =
            event.organizerId &&
            event.organizerId.toString() ===
                req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (
            !isOwner &&
            !isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the event organizer or admin can approve this payment",
            });
        }

        // ==========================================
        // CHECK PAYMENT STATUS
        // ==========================================

        if (
            !canVerifyQRPayment(
                payment.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This QR payment is not waiting for verification",
                paymentStatus:
                    payment.status,
            });
        }

        // ==========================================
        // FIND REGISTRATION
        // ==========================================

        const registration =
            await Registration.findById(
                payment.registrationId
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // APPROVE PAYMENT
        // ==========================================

        payment.status =
            PAYMENT_STATUS.PAID;

        payment.verifiedBy =
            req.user._id;

        payment.verifiedAt =
            new Date();

        payment.paidAt =
            new Date();

        payment.rejectionReason =
            "";

        await payment.save();

        // ==========================================
        // UPDATE REGISTRATION
        // ==========================================

        registration.paymentStatus =
            PAYMENT_STATUS.PAID;

        registration.paymentId =
            payment._id;

        registration.paymentVerifiedAt =
            new Date();

        registration.paymentRejectionReason =
            "";

        registration.ticketId =
            registration.ticketId ||
            generateTicketId();

        await registration.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            message:
                "QR payment approved successfully",

            payment: {
                id:
                    payment._id,

                status:
                    payment.status,

                amount:
                    payment.amount,

                verifiedAt:
                    payment.verifiedAt,
            },

            registration: {
                id:
                    registration._id,

                paymentStatus:
                    registration.paymentStatus,

                ticketId:
                    registration.ticketId,
            },
        });
    } catch (error) {
        console.error(
            "========== Approve QR Payment Error =========="
        );

        console.error(error);

        console.error(
            "================================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to approve QR payment",
        });
    }
};

// ==========================================
// REJECT QR PAYMENT
// ==========================================
//
// PATCH /api/payments/qr/:paymentId/reject
//
// Body:
// {
//     "reason": "Payment amount does not match"
// }
//
// Organizer only
//
// ==========================================

const rejectQRPayment = async (req, res) => {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        const {
            paymentId,
        } = req.params;

        const {
            reason,
        } = req.body || {};

        // ==========================================
        // VALIDATE PAYMENT ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                paymentId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid payment ID",
            });
        }

        // ==========================================
        // VALIDATE REJECTION REASON
        // ==========================================

        if (
            !reason ||
            !String(reason).trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rejection reason is required",
            });
        }

        // ==========================================
        // FIND PAYMENT
        // ==========================================

        const payment =
            await Payment.findById(
                paymentId
            );

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment not found",
            });
        }

        // ==========================================
        // CHECK PAYMENT METHOD
        // ==========================================

        if (
            payment.paymentMethod !==
            PAYMENT_METHOD.QR
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This payment is not a QR payment",
            });
        }

        // ==========================================
        // FIND EVENT
        // ==========================================

        const event =
            await Event.findById(
                payment.eventId
            );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ==========================================
        // CHECK ORGANIZER
        // ==========================================

        const isOwner =
            event.organizerId &&
            event.organizerId.toString() ===
                req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (
            !isOwner &&
            !isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the event organizer or admin can reject this payment",
            });
        }

        // ==========================================
        // CHECK STATUS
        // ==========================================

        if (
            !canRejectPayment(
                payment.status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This QR payment cannot be rejected in its current status",
                paymentStatus:
                    payment.status,
            });
        }

        // ==========================================
        // FIND REGISTRATION
        // ==========================================

        const registration =
            await Registration.findById(
                payment.registrationId
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // REJECT PAYMENT
        // ==========================================

        payment.status =
            PAYMENT_STATUS.REJECTED;

        payment.verifiedBy =
            req.user._id;

        payment.verifiedAt =
            new Date();

        payment.rejectionReason =
            String(reason).trim();

        await payment.save();

        // ==========================================
        // UPDATE REGISTRATION
        // ==========================================

        registration.paymentStatus =
            PAYMENT_STATUS.REJECTED;

        registration.paymentRejectedAt =
            new Date();

        registration.paymentRejectionReason =
            String(reason).trim();

        await registration.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            message:
                "QR payment rejected successfully",

            payment: {
                id:
                    payment._id,

                status:
                    payment.status,

                rejectionReason:
                    payment.rejectionReason,

                verifiedAt:
                    payment.verifiedAt,
            },

            registration: {
                id:
                    registration._id,

                paymentStatus:
                    registration.paymentStatus,

                paymentRejectionReason:
                    registration.paymentRejectionReason,
            },
        });
    } catch (error) {
        console.error(
            "========== Reject QR Payment Error =========="
        );

        console.error(error);

        console.error(
            "================================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to reject QR payment",
        });
    }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    submitQRPayment,
    approveQRPayment,
    rejectQRPayment,
};