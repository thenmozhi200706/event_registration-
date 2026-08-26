// backend/models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        /*
         * User full name
         */
        name: {
            type: String,
            required: true,
            trim: true,
        },

        /*
         * User Gmail address
         */
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        /*
         * Google account ID
         *
         * Sparse allows users created through
         * other flows to have this field empty.
         */
        googleId: {
            type: String,
            unique: true,
            sparse: true,
            default: null,
        },

        /*
         * Google profile picture
         */
        profileImage: {
            type: String,
            default: "",
        },

        /*
         * Participant WhatsApp number
         */
        whatsappNumber: {
            type: String,
            default: "",
            trim: true,
        },

        /*
         * Participant age
         */
        age: {
            type: Number,
            default: null,
            min: 1,
        },

        /*
         * Institute / College name
         */
        instituteName: {
            type: String,
            default: "",
            trim: true,
        },

        /*
         * Department
         */
        department: {
            type: String,
            default: "",
            trim: true,
        },

        /*
         * Academic year
         */
        year: {
            type: String,
            default: "",
            trim: true,
        },

        /*
         * User role
         *
         * admin      = EventSphere administrator
         * organizer  = Event organizer
         * participant = Event participant
         */
        role: {
            type: String,
            enum: [
                "admin",
                "organizer",
                "participant",
            ],
            default: "participant",
        },

        /*
         * Account status
         */
        isActive: {
            type: Boolean,
            default: true,
        },
    },

    {
        timestamps: true,
    }
);


/*
 * Create User model
 */
const User = mongoose.model(
    "User",
    userSchema
);


/*
 * Export User model
 */
module.exports = User;