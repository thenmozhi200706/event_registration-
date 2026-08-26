// backend/routes/qrPaymentRoutes.js

const express = require("express");

const {
    submitQRPayment,
    approveQRPayment,
    rejectQRPayment,
} = require("../controllers/qrPaymentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// SUBMIT QR PAYMENT PROOF
// ==========================================
//
// POST /api/payments/qr/submit
//
// Access:
// Authenticated participant
//
// Body:
// {
//     "registrationId": "REGISTRATION_ID",
//     "paymentProofUrl": "CLOUDINARY_IMAGE_URL"
// }
//
// ==========================================

router.post(
    "/submit",
    protect,
    submitQRPayment
);

// ==========================================
// APPROVE QR PAYMENT
// ==========================================
//
// PATCH /api/payments/qr/:paymentId/approve
//
// Access:
// Organizer / Admin
//
// ==========================================

router.patch(
    "/:paymentId/approve",
    protect,
    authorizeRoles(
        "organizer",
        "admin"
    ),
    approveQRPayment
);

// ==========================================
// REJECT QR PAYMENT
// ==========================================
//
// PATCH /api/payments/qr/:paymentId/reject
//
// Access:
// Organizer / Admin
//
// Body:
// {
//     "reason": "Payment proof is invalid"
// }
//
// ==========================================

router.patch(
    "/:paymentId/reject",
    protect,
    authorizeRoles(
        "organizer",
        "admin"
    ),
    rejectQRPayment
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;