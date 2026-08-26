// backend/server.js

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");

const connectDB = require("./config/db");
const configurePassport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const eventRoutes = require("./routes/eventRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const qrPaymentRoutes = require("./routes/qrPaymentRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

const emailService = require("./utils/sendEmail");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// JSON BODY PARSER
// ==========================================
// Keep the raw body for Razorpay webhook
// signature verification.

app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = Buffer.from(buf);
        },
    })
);

// ==========================================
// URL ENCODED BODY
// ==========================================

app.use(
    express.urlencoded({
        extended: true,
    })
);

// ==========================================
// CORS
// ==========================================

app.use(
    cors({
        origin:
            process.env.CLIENT_URL ||
            "http://localhost:5173",
        credentials: true,
    })
);

// ==========================================
// PASSPORT
// ==========================================

configurePassport();

app.use(passport.initialize());

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// EMAIL CONNECTION CHECK
// ==========================================

if (
    emailService &&
    typeof emailService.verifyEmailConnection ===
        "function"
) {
    emailService
        .verifyEmailConnection()
        .then(() => {
            console.log(
                "Gmail SMTP connection successful"
            );
        })
        .catch((error) => {
            console.error(
                "Gmail SMTP connection failed:"
            );
            console.error(error.message);
        });
} else {
    console.warn(
        "Warning: verifyEmailConnection() is not available in utils/sendEmail.js"
    );
}

// ==========================================
// CLOUDINARY CONFIGURATION CHECK
// ==========================================

console.log(
    "=========================================="
);
console.log(
    "Cloudinary Configuration"
);
console.log(
    "=========================================="
);

console.log(
    "Cloud Name:",
    process.env.CLOUDINARY_CLOUD_NAME ||
        "NOT SET"
);

console.log(
    "API Key:",
    process.env.CLOUDINARY_API_KEY ||
        "NOT SET"
);

console.log(
    "API Secret:",
    process.env.CLOUDINARY_API_SECRET
        ? "Loaded"
        : "NOT SET"
);

console.log(
    "=========================================="
);

// ==========================================
// RAZORPAY CONFIGURATION CHECK
// ==========================================

console.log(
    "=========================================="
);
console.log(
    "Razorpay Configuration"
);
console.log(
    "=========================================="
);

console.log(
    "Key ID:",
    process.env.RAZORPAY_KEY_ID ||
        "NOT SET"
);

console.log(
    "Key Secret:",
    process.env.RAZORPAY_KEY_SECRET
        ? "Loaded"
        : "NOT SET"
);

console.log(
    "Webhook Secret:",
    process.env.RAZORPAY_WEBHOOK_SECRET
        ? "Loaded"
        : "NOT SET"
);

console.log(
    "=========================================="
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message:
            "EventSphere Backend API is running",
        modules: [
            "Module 1 - Authentication & User Management",
            "Module 2 - Event Management",
            "Module 3 - Payment System",
        ],
        paymentMethods: [
            "Payment Gateway",
            "QR Code Payment",
            "Free Event",
        ],
        status: "OK",
    });
});

// ==========================================
// MODULE 1 - AUTHENTICATION
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

// ==========================================
// MODULE 1 - ADMIN
// ==========================================

app.use(
    "/api/admin",
    adminRoutes
);

// ==========================================
// MODULE 1 - ORGANIZER
// ==========================================

app.use(
    "/api/organizer",
    organizerRoutes
);

// ==========================================
// MODULE 2 - EVENTS
// ==========================================

app.use(
    "/api/events",
    eventRoutes
);

// ==========================================
// MODULE 3 - PAYMENT GATEWAY
// ==========================================
//
// POST /api/payments/create-order
// POST /api/payments/verify
// POST /api/payments/webhook
// GET  /api/payments/:registrationId
//

app.use(
    "/api/payments",
    paymentRoutes
);

// ==========================================
// MODULE 3 - QR PAYMENT
// ==========================================
//
// POST  /api/payments/qr/submit
// PATCH /api/payments/qr/:paymentId/approve
// PATCH /api/payments/qr/:paymentId/reject
//

app.use(
    "/api/payments/qr",
    qrPaymentRoutes
);
// ==========================================
// MODULE 3 - REGISTRATION ROUTES
// ==========================================

app.use(
    "/api/registrations",
    registrationRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message:
            `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
    (error, req, res, next) => {
        console.error(
            "========== Global Server Error =========="
        );

        console.error(error);

        console.error(
            "=========================================="
        );

        return res.status(
            error.status || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Internal server error",
        });
    }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    () => {
        console.log(
            "=========================================="
        );

        console.log(
            "       EventSphere Backend Server"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server running at: http://localhost:${PORT}`
        );

        console.log(
            `Frontend URL: ${
                process.env.CLIENT_URL ||
                "Not configured"
            }`
        );

        console.log(
            "Authentication API: /api/auth"
        );

        console.log(
            "Admin API: /api/admin"
        );

        console.log(
            "Organizer API: /api/organizer"
        );

        console.log(
            "Event API: /api/events"
        );

        console.log(
            "Payment API: /api/payments"
        );

        console.log(
            "QR Payment API: /api/payments/qr"
        );

        console.log(
            "=========================================="
        );
    }
);