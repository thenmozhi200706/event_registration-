// backend/middleware/paymentWebhookMiddleware.js

const crypto = require("crypto");

// ==========================================
// VERIFY RAZORPAY WEBHOOK SIGNATURE
// ==========================================

const verifyRazorpayWebhook = (req, res, next) => {
    try {
        const webhookSecret =
            process.env.RAZORPAY_WEBHOOK_SECRET;

        // ==========================================
        // CHECK WEBHOOK SECRET
        // ==========================================

        if (!webhookSecret) {
            console.error(
                "RAZORPAY_WEBHOOK_SECRET is not configured"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Payment webhook configuration is missing",
            });
        }

        // ==========================================
        // GET RAZORPAY SIGNATURE
        // ==========================================

        const receivedSignature =
            req.headers[
                "x-razorpay-signature"
            ];

        if (!receivedSignature) {
            return res.status(400).json({
                success: false,
                message:
                    "Razorpay webhook signature is missing",
            });
        }

        // ==========================================
        // GET RAW REQUEST BODY
        // ==========================================

        if (!req.rawBody) {
            return res.status(400).json({
                success: false,
                message:
                    "Raw webhook body is missing",
            });
        }

        // ==========================================
        // CREATE EXPECTED SIGNATURE
        // ==========================================

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    webhookSecret
                )
                .update(
                    req.rawBody
                )
                .digest("hex");

        // ==========================================
        // SAFE SIGNATURE COMPARISON
        // ==========================================

        const receivedBuffer =
            Buffer.from(
                receivedSignature,
                "utf8"
            );

        const expectedBuffer =
            Buffer.from(
                expectedSignature,
                "utf8"
            );

        if (
            receivedBuffer.length !==
            expectedBuffer.length
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid Razorpay webhook signature",
            });
        }

        const signatureValid =
            crypto.timingSafeEqual(
                receivedBuffer,
                expectedBuffer
            );

        if (!signatureValid) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid Razorpay webhook signature",
            });
        }

        // ==========================================
        // SIGNATURE VERIFIED
        // ==========================================

        return next();
    } catch (error) {
        console.error(
            "========== Razorpay Webhook Verification Error =========="
        );

        console.error(error);

        console.error(
            "=========================================================="
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to verify payment webhook",
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = verifyRazorpayWebhook;