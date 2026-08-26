// backend/controllers/registrationController.js

const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const { PAYMENT_STATUS } = require("../utils/paymentStatus");
const { generateTicketId } = require("../utils/ticketGenerator");

// ==========================================
// CREATE EVENT REGISTRATION
// POST /api/registrations
// ==========================================

const createRegistration = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const {
            eventId,
            firstName,
            lastName,
            age,
            whatsappNumber,
            email,
            instituteName,
            department,
            year,
        } = req.body || {};

        // ==========================================
        // VALIDATE PARTICIPANT DATA
        // ==========================================

        const errors = [];

        if (!eventId) {
            errors.push("Event ID is required");
        }

        if (!firstName || !String(firstName).trim()) {
            errors.push("First name is required");
        }

        if (!lastName || !String(lastName).trim()) {
            errors.push("Last name is required");
        }

        if (
            age === undefined ||
            age === null ||
            age === ""
        ) {
            errors.push("Age is required");
        } else if (
            Number.isNaN(Number(age)) ||
            Number(age) < 1 ||
            Number(age) > 120
        ) {
            errors.push("Age must be between 1 and 120");
        }

        if (
            !whatsappNumber ||
            !String(whatsappNumber).trim()
        ) {
            errors.push("WhatsApp number is required");
        }

        if (!email || !String(email).trim()) {
            errors.push("Email is required");
        }

        if (
            !instituteName ||
            !String(instituteName).trim()
        ) {
            errors.push("Institute name is required");
        }

        if (
            !department ||
            !String(department).trim()
        ) {
            errors.push("Department is required");
        }

        if (!year || !String(year).trim()) {
            errors.push("Year is required");
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Registration validation failed",
                errors,
            });
        }

        // ==========================================
        // VALIDATE EVENT ID
        // ==========================================

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID",
            });
        }

        // ==========================================
        // FIND EVENT
        // ==========================================

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // ==========================================
        // CHECK EVENT STATUS
        // ==========================================

        if (event.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "This event is not accepting registrations",
            });
        }

        // ==========================================
        // CHECK REGISTRATION DEADLINE
        // ==========================================

        if (event.registrationDeadline) {
            const deadline = new Date(
                event.registrationDeadline
            );

            if (
                !Number.isNaN(deadline.getTime()) &&
                new Date() > deadline
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Registration deadline has passed",
                });
            }
        }

        // ==========================================
        // CHECK EVENT DATE
        // ==========================================

        if (event.eventDate) {
            const eventDate = new Date(event.eventDate);

            if (
                !Number.isNaN(eventDate.getTime()) &&
                new Date() >= eventDate
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This event has already started or ended",
                });
            }
        }

        // ==========================================
        // PREVENT ORGANIZER REGISTRATION
        // ==========================================

        if (
            event.organizerId &&
            event.organizerId.toString() ===
                req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Organizer cannot register for their own event",
            });
        }

        // ==========================================
        // CHECK DUPLICATE REGISTRATION
        // ==========================================

        const existingRegistration =
            await Registration.findOne({
                eventId: event._id,
                userId: req.user._id,
            });

        if (existingRegistration) {
            return res.status(409).json({
                success: false,
                message:
                    "You are already registered for this event",
                registration: existingRegistration,
            });
        }

        // ==========================================
        // EVENT FEE
        // ==========================================

        const registrationFee = Number(
            event.registrationFee || 0
        );

        const isFreeEvent = registrationFee <= 0;

        // ==========================================
        // PAYMENT STATUS
        // ==========================================

        const paymentStatus = isFreeEvent
            ? PAYMENT_STATUS.PAID
            : PAYMENT_STATUS.PENDING;

        // ==========================================
        // REGISTRATION DATA
        // ==========================================

        const registrationData = {
            eventId: event._id,
            userId: req.user._id,

            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            age: Number(age),
            whatsappNumber: String(whatsappNumber).trim(),
            email: String(email).trim().toLowerCase(),
            instituteName: String(instituteName).trim(),
            department: String(department).trim(),
            year: String(year).trim(),

            paymentStatus,
        };

        // ==========================================
        // FREE EVENT
        // ==========================================

        if (isFreeEvent) {
            registrationData.ticketId =
                generateTicketId();

            registrationData.paymentVerifiedAt =
                new Date();
        }

        // ==========================================
        // CREATE REGISTRATION
        // ==========================================

        const registration =
            await Registration.create(
                registrationData
            );

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({
            success: true,
            message: isFreeEvent
                ? "Event registration completed successfully"
                : "Event registration created successfully. Complete payment to confirm your registration.",

            registration: {
                id: registration._id,
                eventId: registration.eventId,
                userId: registration.userId,

                firstName: registration.firstName,
                lastName: registration.lastName,
                age: registration.age,
                whatsappNumber:
                    registration.whatsappNumber,
                email: registration.email,
                instituteName:
                    registration.instituteName,
                department: registration.department,
                year: registration.year,

                paymentStatus:
                    registration.paymentStatus,

                paymentId:
                    registration.paymentId || null,

                ticketId:
                    registration.ticketId || null,

                registeredAt:
                    registration.registeredAt,

                createdAt:
                    registration.createdAt,
            },

            paymentRequired: !isFreeEvent,

            paymentAmount: registrationFee,
        });
    } catch (error) {
        console.error(
            "========== Create Registration Error =========="
        );
        console.error(error);
        console.error(
            "================================================"
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "You are already registered for this event",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create registration",
        });
    }
};

// ==========================================
// GET MY REGISTRATIONS
// GET /api/registrations/my
// ==========================================

const getMyRegistrations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const registrations =
            await Registration.find({
                userId: req.user._id,
            })
                .populate(
                    "eventId",
                    "title description hashtags bannerImageUrl venue eventDate registrationFee registrationDeadline status organizerId paymentMethod paymentUpiId paymentQrImageUrl paymentInstructions"
                )
                .populate(
                    "paymentId"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            count: registrations.length,
            registrations,
        });
    } catch (error) {
        console.error(
            "========== Get My Registrations Error =========="
        );
        console.error(error);
        console.error(
            "================================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch registrations",
        });
    }
};

// ==========================================
// GET REGISTRATION BY ID
// GET /api/registrations/:id
// ==========================================

const getRegistrationById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration ID",
            });
        }

        const registration =
            await Registration.findById(id)
                .populate(
                    "eventId",
                    "title description hashtags bannerImageUrl venue eventDate registrationFee registrationDeadline status organizerId paymentMethod paymentUpiId paymentQrImageUrl paymentInstructions"
                )
                .populate("paymentId");

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        const isOwner =
            registration.userId.toString() ===
            req.user._id.toString();

        let isOrganizer = false;

        if (
            registration.eventId &&
            registration.eventId.organizerId
        ) {
            isOrganizer =
                registration.eventId.organizerId.toString() ===
                req.user._id.toString();
        }

        const isAdmin =
            req.user.role === "admin";

        if (
            !isOwner &&
            !isOrganizer &&
            !isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to view this registration",
            });
        }

        return res.status(200).json({
            success: true,
            registration,
        });
    } catch (error) {
        console.error(
            "========== Get Registration Error =========="
        );
        console.error(error);
        console.error(
            "============================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch registration",
        });
    }
};

// ==========================================
// CANCEL REGISTRATION
// DELETE /api/registrations/:id
// ==========================================

const cancelRegistration = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration ID",
            });
        }

        const registration =
            await Registration.findById(id);

        if (!registration) {
            return res.status(404).json({
                success: false,
                message: "Registration not found",
            });
        }

        if (
            registration.userId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only cancel your own registration",
            });
        }

        const event =
            await Event.findById(
                registration.eventId
            );

        if (
            event &&
            event.eventDate
        ) {
            const eventDate =
                new Date(event.eventDate);

            if (
                !Number.isNaN(
                    eventDate.getTime()
                ) &&
                new Date() >= eventDate
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Registration cannot be cancelled after the event has started",
                });
            }
        }

        await Registration.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message:
                "Registration cancelled successfully",
        });
    } catch (error) {
        console.error(
            "========== Cancel Registration Error =========="
        );
        console.error(error);
        console.error(
            "================================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to cancel registration",
        });
    }
};

// ==========================================
// GET EVENT REGISTRATIONS
// GET /api/registrations/event/:eventId
// ==========================================

const getEventRegistrations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { eventId } = req.params;

        if (
            !mongoose.Types.ObjectId.isValid(
                eventId
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid event ID",
            });
        }

        const event =
            await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        const isOrganizer =
            event.organizerId &&
            event.organizerId.toString() ===
                req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (
            !isOrganizer &&
            !isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the event organizer or admin can view registrations",
            });
        }

        const registrations =
            await Registration.find({
                eventId,
            })
                .populate(
                    "userId",
                    "name email profileImage"
                )
                .populate("paymentId")
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,

            event: {
                id: event._id,
                title: event.title,
                registrationFee:
                    event.registrationFee,
                paymentMethod:
                    event.paymentMethod || "free",
            },

            count: registrations.length,
            registrations,
        });
    } catch (error) {
        console.error(
            "========== Get Event Registrations Error =========="
        );
        console.error(error);
        console.error(
            "===================================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch event registrations",
        });
    }
};
// ==========================================
// CONFIRM UPI / QR PAYMENT
// ==========================================
//
// PATCH /api/registrations/:id/confirm-payment
//
// Access:
// Event Organizer / Admin
//
// Used when organizer manually verifies
// a UPI / QR payment and confirms the
// participant registration.
// ==========================================

const confirmPayment = async (
    req,
    res
) => {
    try {
        // ==========================================
        // AUTHENTICATION
        // ==========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        const {
            id,
        } = req.params;

        // ==========================================
        // VALIDATE REGISTRATION ID
        // ==========================================

        if (
            !mongoose.Types.ObjectId.isValid(
                id
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
                id
            );

        if (!registration) {
            return res.status(404).json({
                success: false,
                message:
                    "Registration not found",
            });
        }

        // ==========================================
        // FIND EVENT
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
        // CHECK ORGANIZER / ADMIN
        // ==========================================

        const isOrganizer =
            event.organizerId &&
            event.organizerId.toString() ===
                req.user._id.toString();

        const isAdmin =
            req.user.role === "admin";

        if (
            !isOrganizer &&
            !isAdmin
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only the event organizer or admin can confirm payment",
            });
        }

        // ==========================================
        // ONLY UPI EVENTS
        // ==========================================

        const paymentMethod =
            String(
                event.paymentMethod ||
                ""
            )
                .trim()
                .toLowerCase();

        if (
            paymentMethod !==
                "upi" &&
            paymentMethod !==
                "qr"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Manual payment confirmation is only available for UPI / QR events",
            });
        }

        // ==========================================
        // ALREADY PAID
        // ==========================================

        if (
            registration.paymentStatus ===
            "paid"
        ) {
            return res.status(200).json({
                success: true,
                message:
                    "Payment is already confirmed",
                registration,
            });
        }

        // ==========================================
        // PREVENT CONFIRMING FAILED / REJECTED
        // ==========================================

        if (
            registration.paymentStatus ===
                "failed" ||
            registration.paymentStatus ===
                "rejected" ||
            registration.paymentStatus ===
                "refunded"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "This registration cannot be confirmed because its payment status is " +
                    registration.paymentStatus,
            });
        }

        // ==========================================
        // SET PAYMENT AMOUNT
        // ==========================================

        const eventAmount =
            Number(
                event.registrationFee || 0
            );

        if (
            Number(
                registration.amount || 0
            ) <= 0 &&
            eventAmount > 0
        ) {
            registration.amount =
                eventAmount;
        }

        // ==========================================
        // CONFIRM PAYMENT
        // ==========================================

        registration.paymentStatus =
            "paid";

        registration.paymentVerifiedAt =
            new Date();

        registration.paymentRejectedAt =
            null;

        registration.paymentRejectionReason =
            "";

        // ==========================================
        // CREATE TICKET ID
        // ==========================================

        if (
            !registration.ticketId
        ) {
            const randomPart =
                Math.random()
                    .toString(36)
                    .substring(
                        2,
                        8
                    )
                    .toUpperCase();

            registration.ticketId =
                `EVT-${Date.now()}-${randomPart}`;
        }

        // ==========================================
        // SAVE
        // ==========================================

        await registration.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({
            success: true,

            message:
                "Payment confirmed successfully. Participant registration is now complete.",

            registration,
        });

    } catch (error) {
        console.error(
            "========== Confirm Payment Error =========="
        );

        console.error(error);

        console.error(
            "==========================================="
        );

        return res.status(500).json({
            success: false,

            message:
                error.message ||
                "Failed to confirm payment",
        });
    }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createRegistration,
    getMyRegistrations,
    getRegistrationById,
    cancelRegistration,
    getEventRegistrations,
    confirmPayment,
};