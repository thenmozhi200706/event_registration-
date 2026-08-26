// backend/models/Event.js

const mongoose = require("mongoose");


// =====================================================
// EVENT SCHEMA
// =====================================================
//
// Stores all information related to an
// EventSphere event.
// =====================================================

const eventSchema = new mongoose.Schema(
    {
        /*
         * Event title
         */
        title: {
            type: String,

            required: true,

            trim: true,

            maxlength: 200,
        },


        /*
         * Event description
         */
        description: {
            type: String,

            required: true,

            trim: true,
        },


        /*
         * Event hashtags
         *
         * Example:
         *
         * ["hackathon", "ai", "technology"]
         */
        hashtags: {
            type: [String],

            default: [],

            set: (hashtags) => {
                if (!Array.isArray(hashtags)) {
                    return [];
                }

                return hashtags
                    .map((tag) =>
                        String(tag)
                            .trim()
                            .toLowerCase()
                            .replace(/^#/, "")
                    )
                    .filter(Boolean);
            },
        },


        /*
         * Event banner image URL
         *
         * This will contain the Cloudinary
         * URL after image upload.
         */
        bannerImageUrl: {
            type: String,

            default: "",

            trim: true,

            maxlength: 1000,
        },


        /*
         * Organizer who created the event
         */
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,
        },


        /*
         * Event venue
         */
        venue: {
            type: String,

            required: true,

            trim: true,

            maxlength: 500,
        },


        /*
         * Event date
         */
        eventDate: {
            type: Date,

            required: true,
        },


        /*
         * Event registration fee
         *
         * 0 = Free event
         *
         * Greater than 0 = Paid event
         */
        registrationFee: {
            type: Number,

            default: 0,

            min: 0,
        },


        // =================================================
        // PAYMENT
        // =================================================


        /*
         * =================================================
         * PAYMENT METHOD
         * =================================================
         *
         * free
         *     No payment required.
         *
         * razorpay
         *     Payment through Razorpay gateway.
         *
         * upi
         *     Payment through organizer UPI / QR.
         */
        paymentMethod: {
            type: String,

            enum: [
                "free",
                "razorpay",
                "upi",
            ],

            default: "free",

            trim: true,

            lowercase: true,
        },


        /*
         * =================================================
         * ORGANIZER UPI ID
         * =================================================
         *
         * Example:
         *
         * gowtham@upi
         * example@oksbi
         *
         * Used when:
         *
         * paymentMethod = "upi"
         */
        paymentUpiId: {
            type: String,

            default: "",

            trim: true,

            maxlength: 100,
        },


        /*
         * =================================================
         * UPI QR CODE IMAGE URL
         * =================================================
         *
         * This will normally contain the Cloudinary
         * URL after QR image upload.
         *
         * Used when:
         *
         * paymentMethod = "upi"
         */
        paymentQrImageUrl: {
            type: String,

            default: "",

            trim: true,

            maxlength: 1000,
        },


        /*
         * =================================================
         * PAYMENT INSTRUCTIONS
         * =================================================
         *
         * Additional payment instructions shown
         * to participants.
         *
         * Example:
         *
         * "Scan the QR code and complete the payment."
         */
        paymentInstructions: {
            type: String,

            default: "",

            trim: true,

            maxlength: 1000,
        },


        /*
         * =================================================
         * LAST DATE FOR REGISTRATION
         * =================================================
         */
        registrationDeadline: {
            type: Date,

            required: true,
        },


        /*
         * =================================================
         * EVENT STATUS
         * =================================================
         *
         * active
         *     Event is available.
         *
         * closed
         *     Organizer closed the event.
         */
        status: {
            type: String,

            enum: [
                "active",
                "closed",
            ],

            default: "active",
        },
    },

    {
        timestamps: true,
    }
);


// =====================================================
// INDEXES
// =====================================================


/*
 * Index for faster event searching
 * using hashtags.
 */
eventSchema.index({
    hashtags: 1,
});


/*
 * Index for organizer's events.
 */
eventSchema.index({
    organizerId: 1,
});


/*
 * Index for event date.
 */
eventSchema.index({
    eventDate: 1,
});


// =====================================================
// CREATE EVENT MODEL
// =====================================================

const Event = mongoose.model(
    "Event",
    eventSchema
);


// =====================================================
// EXPORT EVENT MODEL
// =====================================================

module.exports = Event;