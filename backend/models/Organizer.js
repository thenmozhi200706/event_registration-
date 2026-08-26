// backend/models/Organizer.js

const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema(
    {
        /*
         * Organizer name
         */
        name: {
            type: String,
            required: true,
            trim: true,
        },

        /*
         * Organizer Gmail address
         */
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        /*
         * Six-digit OTP sent to organizer Gmail
         */
        otpCode: {
            type: String,
            default: null,
        },

        /*
         * OTP expiration time
         */
        otpExpiresAt: {
            type: Date,
            default: null,
        },

        /*
         * Whether organizer successfully
         * verified the OTP
         */
        otpVerified: {
            type: Boolean,
            default: false,
        },

        /*
         * Organizer account status
         *
         * false = waiting for OTP verification
         * true  = active organizer
         */
        isActive: {
            type: Boolean,
            default: false,
        },

        /*
         * Admin who created this organizer
         */
        addedByAdminId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,
        },

        /*
         * Date and time when organizer
         * successfully verified OTP
         */
        verifiedAt: {
            type: Date,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);


/*
 * Create Organizer model
 */
const Organizer = mongoose.model(
    "Organizer",
    organizerSchema
);


/*
 * Export Organizer model
 */
module.exports = Organizer;