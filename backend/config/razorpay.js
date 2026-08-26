// backend/config/razorpay.js

const Razorpay = require("razorpay");

// ==========================================
// VALIDATE ENVIRONMENT VARIABLES
// ==========================================

if (!process.env.RAZORPAY_KEY_ID) {
    console.warn(
        "Warning: RAZORPAY_KEY_ID is not configured"
    );
}

if (!process.env.RAZORPAY_KEY_SECRET) {
    console.warn(
        "Warning: RAZORPAY_KEY_SECRET is not configured"
    );
}

// ==========================================
// INITIALIZE RAZORPAY
// ==========================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// EXPORT
// ==========================================

module.exports = razorpay;