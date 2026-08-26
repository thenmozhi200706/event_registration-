// backend/controllers/paymentController.js

const crypto = require("crypto");
const mongoose = require("mongoose");

const razorpay = require("../config/razorpay");

const Payment = require("../models/Payment");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

const {
    validateGatewayPayment,
    validateRazorpayResponse,
} = require("../utils/paymentValidation");

const {
    PAYMENT_STATUS,
    PAYMENT_METHOD,
} = require("../utils/paymentStatus");

const {
    generateTicketId,
} = require("../utils/ticketGenerator");

// ==========================================
// CREATE RAZORPAY PAYMENT ORDER
// ==========================================
//
// POST /api/payments/create-order
//
// Header:
// Authorization: Bearer TOKEN
//
// Body:
// {
//     "registrationId": "REGISTRATION_ID"
// }
//
// ==========================================

const createPaymentOrder = async (req, res) => {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // ==========================================
        // GET REGISTRATION ID
        // ==========================================

        const {
            registrationId,
        } = req.body || {};

        const validation =
            validateGatewayPayment({
                registrationId,
                amount: 1,
                currency: "INR",
            });

        if (
            !validation.valid
        ) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        // ==========================================
        // VALIDATE OBJECT ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                registrationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid registration ID",
            });
        }

        // ==========================================
        // FIND REGISTRATION
        // ==========================================

        const registration =
            await Registration.findById(
                registrationId
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // CHECK REGISTRATION OWNER
        // ==========================================

        if (
            registration.userId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only make payment for your own registration",
            });
        }

        // ==========================================
        // CHECK EVENT
        // ==========================================

        const event =
            await Event.findById(
                registration.eventId
            );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ==========================================
        // CHECK EVENT STATUS
        // ==========================================

        if (
            event.status !== "active"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This event is not available for payment",
            });
        }

        // ==========================================
        // CHECK PAYMENT STATUS
        // ==========================================

        if (
            registration.paymentStatus ===
            PAYMENT_STATUS.PAID
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Registration has already been paid",
            });
        }

        // ==========================================
        // GET EVENT FEE
        // ==========================================

        const amount =
            Number(
                event.registrationFee || 0
            );

        // ==========================================
        // FREE EVENT
        // ==========================================

        if (amount === 0) {
            registration.paymentStatus =
                PAYMENT_STATUS.PAID;

            registration.ticketId =
                registration.ticketId ||
                generateTicketId();

            registration.paymentVerifiedAt =
                new Date();

            await registration.save();

            const freePayment =
                await Payment.create({
                    registrationId:
                        registration._id,

                    eventId:
                        event._id,

                    userId:
                        req.user._id,

                    paymentMethod:
                        PAYMENT_METHOD.FREE,

                    gateway: null,

                    amount: 0,

                    currency: "INR",

                    status:
                        PAYMENT_STATUS.PAID,

                    paidAt: new Date(),
                });

            registration.paymentId =
                freePayment._id;

            await registration.save();

            return res.status(200).json({
                success: true,
                message:
                    "Free event registration confirmed",
                payment: freePayment,
                ticketId:
                    registration.ticketId,
            });
        }

        // ==========================================
        // CHECK PAYMENT METHOD
        // ==========================================

        const paymentMethod =
            event.paymentMethod ||
            PAYMENT_METHOD.GATEWAY;

        if (
            paymentMethod !==
            PAYMENT_METHOD.GATEWAY
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This event does not use gateway payment",
                paymentMethod,
            });
        }

        // ==========================================
        // CHECK RAZORPAY CONFIGURATION
        // ==========================================

        if (
            !process.env.RAZORPAY_KEY_ID ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "Razorpay configuration is missing",
            });
        }

        // ==========================================
        // CHECK FOR EXISTING PENDING PAYMENT
        // ==========================================

        const existingPayment =
            await Payment.findOne({
                registrationId:
                    registration._id,

                status:
                    PAYMENT_STATUS.PENDING,

                paymentMethod:
                    PAYMENT_METHOD.GATEWAY,
            }).sort({
                createdAt: -1,
            });

        if (
            existingPayment &&
            existingPayment.orderId
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "Existing Razorpay order returned",
                payment:
                    existingPayment,
                razorpay: {
                    keyId:
                        process.env
                            .RAZORPAY_KEY_ID,

                    orderId:
                        existingPayment.orderId,

                    amount:
                        existingPayment.amount,

                    currency:
                        existingPayment.currency,
                },
            });
        }

        // ==========================================
        // VALIDATE PAYMENT AMOUNT
        // ==========================================

        const amountValidation =
            validateGatewayPayment({
                registrationId,
                amount,
                currency: "INR",
            });

        if (
            !amountValidation.valid
        ) {
            return res.status(400).json({
                success: false,
                message:
                    amountValidation.message,
            });
        }

        // ==========================================
        // RAZORPAY AMOUNT
        // ==========================================
        //
        // Razorpay expects amount in paise.
        //
        // ₹500 = 50000 paise
        //

        const amountInPaise =
            Math.round(
                amount * 100
            );

        // ==========================================
        // GENERATE RECEIPT
        // ==========================================

        const receipt =
            `EVS_${registration._id.toString()}`;

        // ==========================================
        // CREATE RAZORPAY ORDER
        // ==========================================

        const razorpayOrder =
            await razorpay.orders.create({
                amount:
                    amountInPaise,

                currency: "INR",

                receipt,

                notes: {
                    registrationId:
                        registration._id.toString(),

                    eventId:
                        event._id.toString(),

                    userId:
                        req.user._id.toString(),
                },
            });

        // ==========================================
        // SAVE PAYMENT
        // ==========================================

        const payment =
            await Payment.create({
                registrationId:
                    registration._id,

                eventId:
                    event._id,

                userId:
                    req.user._id,

                paymentMethod:
                    PAYMENT_METHOD.GATEWAY,

                gateway:
                    "razorpay",

                orderId:
                    razorpayOrder.id,

                amount,

                currency: "INR",

                status:
                    PAYMENT_STATUS.PENDING,

                gatewayResponse:
                    razorpayOrder,
            });

        // ==========================================
        // UPDATE REGISTRATION
        // ==========================================

        registration.paymentStatus =
            PAYMENT_STATUS.PENDING;

        registration.paymentId =
            payment._id;

        await registration.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,

            message:
                "Razorpay payment order created successfully",

            payment: {
                id:
                    payment._id,

                registrationId:
                    payment.registrationId,

                orderId:
                    payment.orderId,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                status:
                    payment.status,
            },

            razorpay: {
                keyId:
                    process.env
                        .RAZORPAY_KEY_ID,

                orderId:
                    razorpayOrder.id,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency,
            },
        });
    } catch (error) {
        console.error(
            "========== Create Payment Order Error =========="
        );

        console.error(error);

        console.error(
            "================================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create payment order",
        });
    }
};

// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================
//
// POST /api/payments/verify
//
// Body:
//
// {
//     "registrationId": "...",
//     "razorpayOrderId": "...",
//     "razorpayPaymentId": "...",
//     "razorpaySignature": "..."
// }
//
// ==========================================

const verifyPayment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        const {
            registrationId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body || {};

        // ==========================================
        // VALIDATE RESPONSE
        // ==========================================

        const validation =
            validateRazorpayResponse({
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            });

        if (
            !validation.valid
        ) {
            return res.status(400).json({
                success: false,
                message:
                    validation.message,
            });
        }

        // ==========================================
        // VALIDATE REGISTRATION ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                registrationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid registration ID",
            });
        }

        // ==========================================
        // FIND REGISTRATION
        // ==========================================

        const registration =
            await Registration.findById(
                registrationId
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // CHECK OWNER
        // ==========================================

        if (
            registration.userId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only verify your own payment",
            });
        }

        // ==========================================
        // FIND PAYMENT
        // ==========================================

        const payment =
            await Payment.findOne({
                registrationId:
                    registration._id,

                orderId:
                    razorpayOrderId,
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment record not found",
            });
        }

        // ==========================================
        // CHECK PAYMENT OWNERSHIP
        // ==========================================

        if (
            payment.userId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Payment does not belong to this user",
            });
        }

        // ==========================================
        // VERIFY SIGNATURE
        // ==========================================

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpayOrderId}|${razorpayPaymentId}`
                )
                .digest("hex");

        const signatureValid =
            crypto.timingSafeEqual(
                Buffer.from(
                    generatedSignature
                ),
                Buffer.from(
                    razorpaySignature
                )
            );

        if (!signatureValid) {
            payment.status =
                PAYMENT_STATUS.FAILED;

            payment.gatewayResponse = {
                razorpayOrderId,
                razorpayPaymentId,
                reason:
                    "Invalid payment signature",
            };

            await payment.save();

            registration.paymentStatus =
                PAYMENT_STATUS.FAILED;

            await registration.save();

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Razorpay payment signature",
            });
        }

        // ==========================================
        // PAYMENT SUCCESS
        // ==========================================

        payment.paymentGatewayPaymentId =
            razorpayPaymentId;

        payment.signature =
            razorpaySignature;

        payment.status =
            PAYMENT_STATUS.PAID;

        payment.paidAt =
            new Date();

        payment.gatewayResponse = {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        };

        await payment.save();

        // ==========================================
        // UPDATE REGISTRATION
        // ==========================================

        registration.paymentStatus =
            PAYMENT_STATUS.PAID;

        registration.paymentId =
            payment._id;

        registration.paymentVerifiedAt =
            new Date();

        registration.ticketId =
            registration.ticketId ||
            generateTicketId();

        await registration.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            message:
                "Payment verified successfully",

            payment: {
                id:
                    payment._id,

                orderId:
                    payment.orderId,

                paymentId:
                    payment.paymentGatewayPaymentId,

                status:
                    payment.status,

                amount:
                    payment.amount,

                currency:
                    payment.currency,

                paidAt:
                    payment.paidAt,
            },

            registration: {
                id:
                    registration._id,

                paymentStatus:
                    registration.paymentStatus,

                ticketId:
                    registration.ticketId,
            },
        });
    } catch (error) {
        console.error(
            "========== Verify Payment Error =========="
        );

        console.error(error);

        console.error(
            "=========================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to verify payment",
        });
    }
};

// ==========================================
// RAZORPAY WEBHOOK
// ==========================================
//
// POST /api/payments/webhook
//
// This endpoint is called by Razorpay.
//
// Signature verification is handled by:
// paymentWebhookMiddleware.js
//
// ==========================================

const paymentWebhook = async (req, res) => {
    try {
        // ==========================================
        // GET WEBHOOK EVENT
        // ==========================================

        const event =
            req.body || {};

        const eventName =
            event.event;

        console.log(
            "Razorpay Webhook:",
            eventName
        );

        // ==========================================
        // PAYMENT CAPTURED
        // ==========================================

        if (
            eventName ===
            "payment.captured"
        ) {
            const paymentEntity =
                event.payload?.payment?.entity;

            if (!paymentEntity) {
                return res.status(200).json({
                    success: true,
                    message:
                        "Webhook received without payment entity",
                });
            }

            const razorpayOrderId =
                paymentEntity.order_id;

            const razorpayPaymentId =
                paymentEntity.id;

            // ==========================================
            // FIND PAYMENT
            // ==========================================

            const payment =
                await Payment.findOne({
                    orderId:
                        razorpayOrderId,
                });

            if (!payment) {
                console.warn(
                    "Payment record not found for Razorpay order:",
                    razorpayOrderId
                );

                return res.status(200).json({
                    success: true,
                    message:
                        "Webhook received",
                });
            }

            // ==========================================
            // AVOID DUPLICATE PROCESSING
            // ==========================================

            if (
                payment.status ===
                PAYMENT_STATUS.PAID
            ) {
                return res.status(200).json({
                    success: true,
                    message:
                        "Payment already processed",
                });
            }

            // ==========================================
            // UPDATE PAYMENT
            // ==========================================

            payment.paymentGatewayPaymentId =
                razorpayPaymentId;

            payment.status =
                PAYMENT_STATUS.PAID;

            payment.paidAt =
                new Date();

            payment.gatewayResponse =
                paymentEntity;

            await payment.save();

            // ==========================================
            // UPDATE REGISTRATION
            // ==========================================

            const registration =
                await Registration.findById(
                    payment.registrationId
                );

            if (registration) {
                registration.paymentStatus =
                    PAYMENT_STATUS.PAID;

                registration.paymentId =
                    payment._id;

                registration.paymentVerifiedAt =
                    new Date();

                registration.ticketId =
                    registration.ticketId ||
                    generateTicketId();

                await registration.save();
            }
        }

        // ==========================================
        // PAYMENT FAILED
        // ==========================================

        if (
            eventName ===
            "payment.failed"
        ) {
            const paymentEntity =
                event.payload?.payment?.entity;

            if (paymentEntity) {
                const razorpayOrderId =
                    paymentEntity.order_id;

                const payment =
                    await Payment.findOne({
                        orderId:
                            razorpayOrderId,
                    });

                if (payment) {
                    payment.status =
                        PAYMENT_STATUS.FAILED;

                    payment.gatewayResponse =
                        paymentEntity;

                    await payment.save();

                    const registration =
                        await Registration.findById(
                            payment.registrationId
                        );

                    if (
                        registration &&
                        registration.paymentStatus !==
                            PAYMENT_STATUS.PAID
                    ) {
                        registration.paymentStatus =
                            PAYMENT_STATUS.FAILED;

                        await registration.save();
                    }
                }
            }
        }

        // ==========================================
        // ALWAYS ACKNOWLEDGE WEBHOOK
        // ==========================================

        return res.status(200).json({
            success: true,
            message:
                "Payment webhook processed",
        });
    } catch (error) {
        console.error(
            "========== Payment Webhook Error =========="
        );

        console.error(error);

        console.error(
            "============================================"
        );

        return res.status(500).json({
            success: false,
            message:
                "Payment webhook processing failed",
        });
    }
};

// ==========================================
// GET PAYMENT BY REGISTRATION
// ==========================================
//
// GET /api/payments/:registrationId
//
// ==========================================

const getPaymentByRegistration = async (
    req,
    res
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        const {
            registrationId,
        } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                registrationId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid registration ID",
            });
        }

        const registration =
            await Registration.findById(
                registrationId
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // USER ACCESS
        // ==========================================

        const isOwner =
            registration.userId.toString() ===
            req.user._id.toString();

        // ==========================================
        // ORGANIZER ACCESS
        // ==========================================

        let isOrganizer = false;

        const event =
            await Event.findById(
                registration.eventId
            );

        if (
            event &&
            event.organizerId &&
            event.organizerId.toString() ===
                req.user._id.toString()
        ) {
            isOrganizer = true;
        }

        if (
            !isOwner &&
            !isOrganizer &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view this payment",
            });
        }

        // ==========================================
        // FIND PAYMENT
        // ==========================================

        const payment =
            await Payment.findOne({
                registrationId:
                    registration._id,
            }).sort({
                createdAt: -1,
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message:
                    "Payment not found",
            });
        }

        return res.status(200).json({
            success: true,
            payment,
        });
    } catch (error) {
        console.error(
            "========== Get Payment Error =========="
        );

        console.error(error);

        console.error(
            "======================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch payment",
        });
    }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createPaymentOrder,
    verifyPayment,
    paymentWebhook,
    getPaymentByRegistration,
};