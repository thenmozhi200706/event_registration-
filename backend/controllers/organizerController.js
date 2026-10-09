// backend/controllers/organizerController.js

const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Payment = require("../models/Payment");


/*
|--------------------------------------------------------------------------
| CREATE EVENT
|--------------------------------------------------------------------------
| POST /api/organizer/events
|
| Access: Organizer
|--------------------------------------------------------------------------
*/

const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            hashtags,
            venue,
            eventDate,
            registrationFee,
            registrationDeadline,
            status,
        } = req.body;

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event title is required",
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event description is required",
            });
        }

        if (!venue || !venue.trim()) {
            return res.status(400).json({
                success: false,
                message: "Event venue is required",
            });
        }

        if (!eventDate) {
            return res.status(400).json({
                success: false,
                message: "Event date is required",
            });
        }

        if (!registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: "Registration deadline is required",
            });
        }

        // -------------------------------------------------
        // DATE VALIDATION
        // -------------------------------------------------

        const eventDateValue = new Date(eventDate);
        const registrationDeadlineValue =
            new Date(registrationDeadline);

        if (Number.isNaN(eventDateValue.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid event date",
            });
        }

        if (
            Number.isNaN(
                registrationDeadlineValue.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration deadline",
            });
        }

        if (registrationDeadlineValue > eventDateValue) {
            return res.status(400).json({
                success: false,
                message:
                    "Registration deadline cannot be after the event date",
            });
        }

        // -------------------------------------------------
        // REGISTRATION FEE
        // -------------------------------------------------

        const fee = Number(registrationFee || 0);

        if (Number.isNaN(fee) || fee < 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Registration fee must be a valid positive number",
            });
        }

        // -------------------------------------------------
        // HASHTAGS
        // -------------------------------------------------

        let normalizedHashtags = [];

        if (Array.isArray(hashtags)) {
            normalizedHashtags = hashtags
                .map((tag) => String(tag).trim())
                .filter(Boolean);
        } else if (typeof hashtags === "string") {
            normalizedHashtags = hashtags
                .split(",")
                .map((tag) =>
                    tag.trim().replace(/^#/, "")
                )
                .filter(Boolean);
        }

        // -------------------------------------------------
        // BANNER IMAGE
        // -------------------------------------------------

        let bannerImageUrl = "";

        if (req.file) {
            bannerImageUrl =
                req.file.path ||
                req.file.secure_url ||
                req.file.url ||
                "";
        }

        if (req.body.bannerImageUrl) {
            bannerImageUrl =
                req.body.bannerImageUrl;
        }

        // -------------------------------------------------
        // ORGANIZER ID
        // -------------------------------------------------

        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Organizer authentication information not found",
            });
        }

        // -------------------------------------------------
        // CREATE EVENT
        // -------------------------------------------------

        const event = await Event.create({
            title: title.trim(),
            description: description.trim(),

            hashtags: normalizedHashtags,

            bannerImageUrl,

            organizerId,

            venue: venue.trim(),

            eventDate: eventDateValue,

            registrationFee: fee,

            registrationDeadline:
                registrationDeadlineValue,

            status: status || "active",
        });

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            event,
        });

    } catch (error) {
        console.error(
            "Create Event Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create event",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET ORGANIZER EVENTS
|--------------------------------------------------------------------------
| GET /api/organizer/events
|
| Returns only events created by the logged-in organizer.
|--------------------------------------------------------------------------
*/

const getOrganizerEvents = async (req, res) => {
    try {
        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const events = await Event.find({
            organizerId,
        })
            .sort({
                createdAt: -1,
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: events.length,
            events,
        });

    } catch (error) {
        console.error(
            "Get Organizer Events Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch organizer events",
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET EVENT BY ID
|--------------------------------------------------------------------------
| GET /api/organizer/events/:id
|--------------------------------------------------------------------------
*/

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizerId,
        }).lean();

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found or you do not have permission to access it",
            });
        }

        return res.status(200).json({
            success: true,
            event,
        });

    } catch (error) {
        console.error(
            "Get Organizer Event Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch event",
        });
    }
};


/*
|--------------------------------------------------------------------------
| UPDATE EVENT
|--------------------------------------------------------------------------
| PUT /api/organizer/events/:id
|--------------------------------------------------------------------------
*/

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizerId,
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found or you do not have permission to update it",
            });
        }

        const {
            title,
            description,
            hashtags,
            venue,
            eventDate,
            registrationFee,
            registrationDeadline,
            status,
            bannerImageUrl,
        } = req.body;

        // -------------------------------------------------
        // UPDATE BASIC FIELDS
        // -------------------------------------------------

        if (title !== undefined) {
            if (!String(title).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Event title cannot be empty",
                });
            }

            event.title = String(title).trim();
        }

        if (description !== undefined) {
            event.description =
                String(description).trim();
        }

        if (venue !== undefined) {
            event.venue = String(venue).trim();
        }

        // -------------------------------------------------
        // HASHTAGS
        // -------------------------------------------------

        if (hashtags !== undefined) {

            if (Array.isArray(hashtags)) {

                event.hashtags = hashtags
                    .map((tag) =>
                        String(tag)
                            .trim()
                            .replace(/^#/, "")
                    )
                    .filter(Boolean);

            } else if (
                typeof hashtags === "string"
            ) {

                event.hashtags = hashtags
                    .split(",")
                    .map((tag) =>
                        tag
                            .trim()
                            .replace(/^#/, "")
                    )
                    .filter(Boolean);
            }
        }

        // -------------------------------------------------
        // EVENT DATE
        // -------------------------------------------------

        if (eventDate !== undefined) {

            const date = new Date(eventDate);

            if (Number.isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid event date",
                });
            }

            event.eventDate = date;
        }

        // -------------------------------------------------
        // REGISTRATION DEADLINE
        // -------------------------------------------------

        if (
            registrationDeadline !==
            undefined
        ) {

            const deadline =
                new Date(registrationDeadline);

            if (
                Number.isNaN(
                    deadline.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid registration deadline",
                });
            }

            event.registrationDeadline =
                deadline;
        }

        // -------------------------------------------------
        // DATE RELATIONSHIP
        // -------------------------------------------------

        if (
            event.registrationDeadline &&
            event.eventDate &&
            event.registrationDeadline >
                event.eventDate
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Registration deadline cannot be after the event date",
            });
        }

        // -------------------------------------------------
        // REGISTRATION FEE
        // -------------------------------------------------

        if (
            registrationFee !== undefined
        ) {

            const fee =
                Number(registrationFee);

            if (
                Number.isNaN(fee) ||
                fee < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Registration fee must be a valid positive number",
                });
            }

            event.registrationFee = fee;
        }

        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        if (status !== undefined) {

            const allowedStatuses = [
                "active",
                "closed",
            ];

            if (
                !allowedStatuses.includes(
                    String(status)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid event status",
                });
            }

            event.status = String(status);
        }

        // -------------------------------------------------
        // BANNER
        // -------------------------------------------------

        if (req.file) {
            event.bannerImageUrl =
                req.file.path ||
                req.file.secure_url ||
                req.file.url ||
                event.bannerImageUrl;
        } else if (
            bannerImageUrl !== undefined
        ) {
            event.bannerImageUrl =
                bannerImageUrl;
        }

        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        await event.save();

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            event,
        });

    } catch (error) {
        console.error(
            "Update Event Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update event",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


/*
|--------------------------------------------------------------------------
| DELETE EVENT
|--------------------------------------------------------------------------
| DELETE /api/organizer/events/:id
|--------------------------------------------------------------------------
*/

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizerId,
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found or you do not have permission to delete it",
            });
        }

        // -------------------------------------------------
        // CHECK REGISTRATIONS
        // -------------------------------------------------

        const registrationCount =
            await Registration.countDocuments({
                eventId: id,
            });

        if (registrationCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "This event cannot be deleted because participants are already registered",
                registrationCount,
            });
        }

        await Event.deleteOne({
            _id: id,
        });

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully",
        });

    } catch (error) {
        console.error(
            "Delete Event Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to delete event",
        });
    }
};


/*
|--------------------------------------------------------------------------
| TOGGLE EVENT STATUS
|--------------------------------------------------------------------------
| PATCH /api/organizer/events/:id/status
|--------------------------------------------------------------------------
*/

const toggleEventStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        const event = await Event.findOne({
            _id: id,
            organizerId,
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found or you do not have permission to modify it",
            });
        }

        event.status =
            event.status === "active"
                ? "closed"
                : "active";

        await event.save();

        return res.status(200).json({
            success: true,
            message: `Event ${
                event.status === "active"
                    ? "activated"
                    : "closed"
            } successfully`,
            status: event.status,
            event,
        });

    } catch (error) {
        console.error(
            "Toggle Event Status Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update event status",
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET EVENT REGISTRATIONS
|--------------------------------------------------------------------------
| GET /api/organizer/events/:id/registrations
|--------------------------------------------------------------------------
*/

const getEventRegistrations = async (
    req,
    res
) => {
    try {
        const { id } = req.params;

        const organizerId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!organizerId) {
            return res.status(401).json({
                success: false,
                message: "Organizer authentication required",
            });
        }

        // -------------------------------------------------
        // VERIFY EVENT OWNERSHIP
        // -------------------------------------------------

        const event = await Event.findOne({
            _id: id,
            organizerId,
        }).lean();

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found or you do not have permission to access it",
            });
        }

        // -------------------------------------------------
        // GET REGISTRATIONS
        // -------------------------------------------------

        const registrations =
            await Registration.find({
                eventId: id,
            })
                .populate(
                    "userId",
                    "name email whatsappNumber instituteName department year age"
                )
                .sort({
                    registeredAt: -1,
                })
                .lean();

        // -------------------------------------------------
        // PAYMENT INFORMATION
        // -------------------------------------------------

        const registrationIds =
            registrations.map(
                (registration) =>
                    registration._id
            );

        const payments =
            registrationIds.length
                ? await Payment.find({
                      registrationId: {
                          $in: registrationIds,
                      },
                  }).lean()
                : [];

        const paymentMap = new Map();

        payments.forEach((payment) => {
            paymentMap.set(
                String(
                    payment.registrationId
                ),
                payment
            );
        });

        const formattedRegistrations =
            registrations.map(
                (registration) => ({
                    ...registration,

                    payment:
                        paymentMap.get(
                            String(
                                registration._id
                            )
                        ) || null,
                })
            );

        return res.status(200).json({
            success: true,

            event: {
                _id: event._id,
                title: event.title,
                eventDate: event.eventDate,
                venue: event.venue,
                registrationFee:
                    event.registrationFee,
            },

            count:
                formattedRegistrations.length,

            registrations:
                formattedRegistrations,
        });

    } catch (error) {
        console.error(
            "Get Event Registrations Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch event registrations",
        });
    }
};
// =====================================================
// VERIFY ORGANIZER OTP
// =====================================================
// POST /api/organizer/verify-otp
// Access: Public
// =====================================================

const verifyOrganizerOTP = async (req, res) => {
    try {
        const Organizer = require("../models/Organizer");

        const { email, otp } = req.body;

        // -------------------------------
        // VALIDATION
        // -------------------------------

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // -------------------------------
        // FIND ORGANIZER
        // -------------------------------

        const organizer = await Organizer.findOne({
            email: String(email)
                .toLowerCase()
                .trim(),
        });

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found",
            });
        }

        // -------------------------------
        // CHECK OTP
        // -------------------------------

        if (!organizer.otpCode) {
            return res.status(400).json({
                success: false,
                message:
                    "No OTP found. Please request a new OTP.",
            });
        }

        if (
            String(organizer.otpCode).trim() !==
            String(otp).trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // -------------------------------
        // VERIFY ORGANIZER
        // -------------------------------

        organizer.otpVerified = true;
        organizer.otpCode = null;

        await organizer.save();

        // -------------------------------
        // RESPONSE
        // -------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Organizer OTP verified successfully",
        });

    } catch (error) {
        console.error(
            "Verify Organizer OTP Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to verify organizer OTP",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};


// =====================================================
// RESEND ORGANIZER OTP
// =====================================================
// POST /api/organizer/resend-otp
// Access: Public
// =====================================================

const resendOrganizerOTP = async (req, res) => {
    try {
        const Organizer = require("../models/Organizer");

        const { email } = req.body;

        // -------------------------------
        // VALIDATION
        // -------------------------------

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Organizer email is required",
            });
        }

        const normalizedEmail = String(email)
            .toLowerCase()
            .trim();

        // -------------------------------
        // FIND ORGANIZER
        // -------------------------------

        const organizer = await Organizer.findOne({
            email: normalizedEmail,
        });

        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "Organizer not found",
            });
        }

        // -------------------------------
        // GENERATE NEW OTP
        // -------------------------------

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // -------------------------------
        // SAVE OTP
        // -------------------------------

        organizer.otpCode = otp;
        organizer.otpVerified = false;

        await organizer.save();

        // -------------------------------
        // RESPONSE
        // -------------------------------

        return res.status(200).json({
            success: true,
            message:
                "New OTP generated successfully",
        });

    } catch (error) {
        console.error(
            "Resend Organizer OTP Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to resend organizer OTP",

            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

/*
|--------------------------------------------------------------------------
| EXPORT CONTROLLER
|--------------------------------------------------------------------------
*/

module.exports = {
    // Event Management
    createEvent,
    getOrganizerEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    getEventRegistrations,

    // Organizer OTP
    verifyOrganizerOTP,
    resendOrganizerOTP,
};