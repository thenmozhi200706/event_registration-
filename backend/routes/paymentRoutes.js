// backend/routes/paymentRoutes.js

const express = require("express");

const {
    createPaymentOrder,
    verifyPayment,
    paymentWebhook,
    getPaymentByRegistration,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const verifyRazorpayWebhook = require(
    "../middleware/paymentWebhookMiddleware"
);

const router = express.Router();

// ==========================================
// CREATE RAZORPAY PAYMENT ORDER
// ==========================================
//
// POST /api/payments/create-order
//
// Access:
// Authenticated user
//
// Body:
// {
//     "registrationId": "REGISTRATION_ID"
// }
//
// ==========================================

router.post(
    "/create-order",
    protect,
    createPaymentOrder
);

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================
//
// POST /api/payments/verify
//
// Access:
// Authenticated user
//
// Body:
// {
//     "registrationId": "...",
//     "razorpayOrderId": "...",
//     "razorpayPaymentId": "...",
//     "razorpaySignature": "..."
// }
//
// ==========================================

router.post(
    "/verify",
    protect,
    verifyPayment
);

// ==========================================
// RAZORPAY WEBHOOK
// ==========================================
//
// POST /api/payments/webhook
//
// IMPORTANT:
// This route must receive the RAW request body
// so Razorpay signature verification works.
//
// The raw body configuration will be added
// in server.js.
//
// ==========================================

router.post(
    "/webhook",
    verifyRazorpayWebhook,
    paymentWebhook
);

// ==========================================
// GET PAYMENT BY REGISTRATION
// ==========================================
//
// GET /api/payments/:registrationId
//
// Access:
// Authenticated user
//
// ==========================================

router.get(
    "/:registrationId",
    protect,
    getPaymentByRegistration
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;