// backend/models/Payment.js

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        registrationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Registration",
            required: true
        },

        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            index: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        paymentMethod: {
            type: String,
            enum: ["gateway", "qr", "free"],
            required: true
        },

        gateway: {
            type: String,
            enum: ["razorpay", "stripe", null],
            default: null
        },

        orderId: {
            type: String,
            default: "",
            trim: true
        },

        paymentGatewayPaymentId: {
            type: String,
            default: "",
            trim: true,
            index: true
        },

        signature: {
            type: String,
            default: "",
            trim: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "payment_submitted",
                "paid",
                "failed",
                "rejected",
                "refunded"
            ],
            default: "pending",
            index: true
        },

        paymentProofUrl: {
            type: String,
            default: ""
        },

        paymentSubmittedAt: {
            type: Date,
            default: null
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        verifiedAt: {
            type: Date,
            default: null
        },

        rejectionReason: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        },

        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        refundId: {
            type: String,
            default: "",
            trim: true
        },

        refundedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// ==========================================
// INDEXES
// ==========================================

paymentSchema.index({
    registrationId: 1
});

paymentSchema.index({
    orderId: 1
});

paymentSchema.index({
    eventId: 1,
    status: 1
});

paymentSchema.index({
    userId: 1,
    status: 1
});

// ==========================================
// EXPORT MODEL
// ==========================================

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;