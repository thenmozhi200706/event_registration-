// backend/models/Registration.js

const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
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

        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        age: {
            type: Number,
            required: true,
            min: 1,
            max: 120
        },

        whatsappNumber: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 150
        },

        instituteName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },

        department: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        year: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        paymentMethod: {
            type: String,
            enum: [
                "gateway",
                "qr",
                "free"
            ],
            required: true,
            default: "free"
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        paymentStatus: {
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

        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        },

        ticketId: {
            type: String,
            unique: true,
            sparse: true,
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

        paymentVerifiedAt: {
            type: Date,
            default: null
        },

        paymentRejectedAt: {
            type: Date,
            default: null
        },

        paymentRejectionReason: {
            type: String,
            default: "",
            trim: true,
            maxlength: 500
        },

        registeredAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

registrationSchema.index(
    {
        eventId: 1,
        userId: 1
    },
    {
        unique: true
    }
);

registrationSchema.index({
    eventId: 1,
    email: 1
});

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

module.exports = Registration;