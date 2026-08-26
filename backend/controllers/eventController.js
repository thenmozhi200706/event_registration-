const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const cloudinary = require("../config/cloudinary");

const { validateEventData } = require("../utils/eventValidation");

// ==========================================
// HELPER — UPLOAD IMAGE TO CLOUDINARY
// ==========================================

const uploadToCloudinary = (
    fileBuffer,
    folder = "eventsphere/events"
) => {
    return new Promise((resolve, reject) => {
        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(result);
                }
            );

        uploadStream.end(fileBuffer);
    });
};

// ==========================================
// HELPER — NORMALIZE HASHTAGS
// ==========================================

const normalizeHashtags = (hashtags) => {
    if (!hashtags) {
        return [];
    }

    let parsedHashtags = hashtags;

    if (typeof parsedHashtags === "string") {
        try {
            parsedHashtags = JSON.parse(
                parsedHashtags
            );
        } catch (error) {
            parsedHashtags =
                parsedHashtags.split(",");
        }
    }

    if (!Array.isArray(parsedHashtags)) {
        return [];
    }

    return parsedHashtags
        .map((tag) =>
            String(tag)
                .trim()
                .toLowerCase()
                .replace(/^#/, "")
        )
        .filter(Boolean);
};

// ==========================================
// HELPER — VALIDATE EVENT ID
// ==========================================

const isValidEventId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// ==========================================
// HELPER — NORMALIZE PAYMENT METHOD
// ==========================================

const normalizePaymentMethod = (
    paymentMethod
) => {
    if (!paymentMethod) {
        return "free";
    }

    return String(paymentMethod)
        .trim()
        .toLowerCase();
};

// ==========================================
// HELPER — VALIDATE PAYMENT DATA
// ==========================================

const validatePaymentData = ({
    registrationFee,
    paymentMethod,
    paymentUpiId,
    paymentQrImageUrl,
}) => {
    const errors = [];

    const fee =
        registrationFee !== undefined &&
        registrationFee !== ""
            ? Number(registrationFee)
            : 0;

    const method =
        normalizePaymentMethod(
            paymentMethod
        );

    // ------------------------------------------
    // VALID PAYMENT METHOD
    // ------------------------------------------

    if (
        ![
            "free",
            "razorpay",
            "upi",
        ].includes(method)
    ) {
        errors.push(
            "Payment method must be free, razorpay, or upi"
        );
    }

    // ------------------------------------------
    // FREE EVENT
    // ------------------------------------------

    if (fee === 0) {
        return {
            valid: true,
            errors: [],
            paymentMethod: "free",
        };
    }

    // ------------------------------------------
    // PAID EVENT MUST HAVE PAYMENT METHOD
    // ------------------------------------------

    if (method === "free") {
        errors.push(
            "A paid event must use Razorpay or UPI payment"
        );
    }

    // ------------------------------------------
    // UPI VALIDATION
    // ------------------------------------------

    if (method === "upi") {
        if (
            !paymentQrImageUrl ||
            !String(
                paymentQrImageUrl
            ).trim()
        ) {
            errors.push(
                "UPI QR code is required for UPI payment"
            );
        }

        if (
            paymentUpiId &&
            !String(
                paymentUpiId
            ).trim()
        ) {
            errors.push(
                "UPI ID cannot be empty"
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        paymentMethod: method,
    };
};

// ==========================================
// HELPER — GET UPLOAD FILE
// ==========================================

const getUploadedFile = (
    req,
    fieldName
) => {
    // multer.fields()

    if (
        req.files &&
        !Array.isArray(req.files) &&
        req.files[fieldName] &&
        req.files[fieldName].length > 0
    ) {
        return req.files[fieldName][0];
    }

    // multer.array()

    if (Array.isArray(req.files)) {
        const file = req.files.find(
            (item) =>
                item.fieldname ===
                fieldName
        );

        if (file) {
            return file;
        }
    }

    // multer.single()

    if (
        req.file &&
        req.file.fieldname === fieldName
    ) {
        return req.file;
    }

    return null;
};
// ==========================================
// CREATE EVENT
// ==========================================
//
// POST /api/events
//
// Access:
// Organizer
//
// Content-Type:
// multipart/form-data
//
// Fields:
//
// title
// description
// hashtags
// venue
// eventDate
// registrationFee
// registrationDeadline
//
// paymentMethod
// paymentUpiId
// paymentInstructions
//
// Files:
//
// banner
// paymentQr
// ==========================================

const createEvent = async (req, res) => {
    try {
        // ------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // ------------------------------------------
        // CHECK ORGANIZER ROLE
        // ------------------------------------------

        if (req.user.role !== "organizer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only organizers can create events",
            });
        }

        // ------------------------------------------
        // SAFELY GET REQUEST BODY
        // ------------------------------------------

        const data = req.body || {};

        // ------------------------------------------
        // VALIDATE EVENT DATA
        // ------------------------------------------

        const validation =
            validateEventData(data);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Event validation failed",
                errors:
                    validation.errors,
            });
        }

        // ------------------------------------------
        // NORMALIZE HASHTAGS
        // ------------------------------------------

        const hashtags =
            normalizeHashtags(
                data.hashtags
            );

        // ------------------------------------------
        // CONVERT REGISTRATION FEE
        // ------------------------------------------

        const registrationFee =
            data.registrationFee !==
                undefined &&
            data.registrationFee !== ""
                ? Number(
                      data.registrationFee
                  )
                : 0;

        if (
            Number.isNaN(
                registrationFee
            ) ||
            registrationFee < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Registration fee must be a valid positive number",
            });
        }

        // ------------------------------------------
        // PAYMENT METHOD
        // ------------------------------------------

        let paymentMethod =
            normalizePaymentMethod(
                data.paymentMethod
            );

        if (registrationFee === 0) {
            paymentMethod = "free";
        }

        // ------------------------------------------
        // PAYMENT UPI ID
        // ------------------------------------------

        const paymentUpiId =
            data.paymentUpiId
                ? String(
                      data.paymentUpiId
                  ).trim()
                : "";

        // ------------------------------------------
        // PAYMENT INSTRUCTIONS
        // ------------------------------------------

        const paymentInstructions =
            data.paymentInstructions
                ? String(
                      data.paymentInstructions
                  ).trim()
                : "";

        // ------------------------------------------
        // PAYMENT QR URL
        // ------------------------------------------

        let paymentQrImageUrl =
            data.paymentQrImageUrl
                ? String(
                      data.paymentQrImageUrl
                  ).trim()
                : "";

        // ------------------------------------------
        // UPLOAD EVENT BANNER
        // ------------------------------------------

        let bannerImageUrl = "";

        const bannerFile =
            getUploadedFile(
                req,
                "banner"
            );

        if (bannerFile) {
            const uploadResult =
                await uploadToCloudinary(
                    bannerFile.buffer,
                    "eventsphere/events"
                );

            bannerImageUrl =
                uploadResult.secure_url;
        }

        // ------------------------------------------
        // UPLOAD PAYMENT QR
        // ------------------------------------------

        if (paymentMethod === "upi") {
            const paymentQrFile =
                getUploadedFile(
                    req,
                    "paymentQr"
                );

            if (paymentQrFile) {
                const uploadResult =
                    await uploadToCloudinary(
                        paymentQrFile.buffer,
                        "eventsphere/payment-qrs"
                    );

                paymentQrImageUrl =
                    uploadResult.secure_url;
            }
        }

        // ------------------------------------------
        // FINAL PAYMENT VALIDATION
        // ------------------------------------------

        const paymentValidation =
            validatePaymentData({
                registrationFee,
                paymentMethod,
                paymentUpiId,
                paymentQrImageUrl,
            });

        if (!paymentValidation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment validation failed",
                errors:
                    paymentValidation.errors,
            });
        }

        // ------------------------------------------
        // CONVERT DATES
        // ------------------------------------------

        const eventDate =
            new Date(
                data.eventDate
            );

        const registrationDeadline =
            new Date(
                data.registrationDeadline
            );

        if (
            Number.isNaN(
                eventDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid event date",
            });
        }

        if (
            Number.isNaN(
                registrationDeadline.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid registration deadline",
            });
        }

        // ------------------------------------------
        // CREATE EVENT
        // ------------------------------------------

        const event =
            await Event.create({
                title: String(
                    data.title
                ).trim(),

                description: String(
                    data.description
                ).trim(),

                hashtags,

                bannerImageUrl,

                organizerId:
                    req.user._id,

                venue: String(
                    data.venue
                ).trim(),

                eventDate,

                registrationFee,

                registrationDeadline,

                paymentMethod,

                paymentUpiId,

                paymentQrImageUrl,

                paymentInstructions,

                status: "active",
            });

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(201).json({
            success: true,
            message:
                "Event created successfully",
            event,
        });
    } catch (error) {
        console.error(
            "========== Create Event Error =========="
        );

        console.error(error);

        console.error(
            "========================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create event",
        });
    }
};
// ==========================================
// GET ALL EVENTS
// ==========================================
//
// GET /api/events
//
// Public
//
// Optional:
//
// ?hashtag=technology
// ?status=active
// ==========================================

const getEvents = async (req, res) => {
    try {
        const {
            hashtag,
            status,
        } = req.query;

        const filter = {};

        // ------------------------------------------
        // STATUS FILTER
        // ------------------------------------------

        if (status) {
            filter.status = status;
        } else {
            filter.status = "active";
        }

        // ------------------------------------------
        // HASHTAG FILTER
        // ------------------------------------------

        if (hashtag) {
            filter.hashtags =
                hashtag
                    .trim()
                    .toLowerCase()
                    .replace(
                        /^#/,
                        ""
                    );
        }

        // ------------------------------------------
        // FETCH EVENTS
        // ------------------------------------------

        const events =
            await Event.find(filter)
                .populate(
                    "organizerId",
                    "name email profileImage"
                )
                .sort({
                    eventDate: 1,
                });

        return res.status(200).json({
            success: true,
            count: events.length,
            events,
        });
    } catch (error) {
        console.error(
            "========== Get Events Error =========="
        );

        console.error(error);

        console.error(
            "======================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch events",
        });
    }
};
// ==========================================
// GET EVENT BY ID
// ==========================================
//
// GET /api/events/:id
//
// Public
//
// Returns event + registration statistics.
// ==========================================

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;

        // ------------------------------------------
        // CHECK OBJECT ID
        // ------------------------------------------

        if (!isValidEventId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid event ID",
            });
        }

        // ------------------------------------------
        // FIND EVENT
        // ------------------------------------------

        const event =
            await Event.findById(id)
                .populate(
                    "organizerId",
                    "name email profileImage"
                );

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ------------------------------------------
        // REGISTRATION STATISTICS
        // ------------------------------------------

        const [
            totalRegistrations,
            paidRegistrations,
            pendingPayments,
            failedPayments,
            revenueResult,
        ] = await Promise.all([
            Registration.countDocuments({
                eventId: id,
            }),

            Registration.countDocuments({
                eventId: id,
                paymentStatus: "paid",
            }),

            Registration.countDocuments({
                eventId: id,
                paymentStatus: {
                    $in: [
                        "pending",
                        "payment_submitted",
                    ],
                },
            }),

            Registration.countDocuments({
                eventId: id,
                paymentStatus: {
                    $in: [
                        "failed",
                        "rejected",
                    ],
                },
            }),

            Registration.aggregate([
                {
                    $match: {
                        eventId:
                            new mongoose.Types.ObjectId(
                                id
                            ),
                        paymentStatus: "paid",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: {
                                $ifNull: [
                                    "$amount",
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
        ]);

        // ------------------------------------------
        // TOTAL REVENUE
        // ------------------------------------------

        const totalRevenue =
            revenueResult.length > 0
                ? Number(
                      revenueResult[0]
                          .totalRevenue || 0
                  )
                : 0;

        // ------------------------------------------
        // STATISTICS
        // ------------------------------------------

        const statistics = {
            totalRegistrations:
                Number(
                    totalRegistrations || 0
                ),

            paidRegistrations:
                Number(
                    paidRegistrations || 0
                ),

            pendingPayments:
                Number(
                    pendingPayments || 0
                ),

            failedPayments:
                Number(
                    failedPayments || 0
                ),

            totalRevenue,
        };

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            event,
            statistics,

            // Keep compatibility with
            // existing frontend code.
            stats: statistics,
        });
    } catch (error) {
        console.error(
            "========== Get Event Error =========="
        );

        console.error(error);

        console.error(
            "====================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch event",
        });
    }
};
// ==========================================
// GET MY EVENTS
// ==========================================
//
// GET /api/events/organizer/my-events
//
// Access:
// Organizer only
//
// Returns all events created by the
// currently authenticated organizer.
//
// Also returns registration statistics
// for each event.
// ==========================================

const getMyEvents = async (req, res) => {
    try {
        // ------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // ------------------------------------------
        // CHECK ORGANIZER ROLE
        // ------------------------------------------

        if (req.user.role !== "organizer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only organizers can access their events",
            });
        }

        // ------------------------------------------
        // FIND ORGANIZER EVENTS
        // ------------------------------------------

        const events =
            await Event.find({
                organizerId:
                    req.user._id,
            })
                .populate(
                    "organizerId",
                    "name email profileImage"
                )
                .sort({
                    createdAt: -1,
                });

        // ------------------------------------------
        // ADD REGISTRATION STATISTICS
        // ------------------------------------------

        const eventsWithStatistics =
            await Promise.all(
                events.map(
                    async (event) => {
                        const eventId =
                            event._id;

                        const [
                            totalRegistrations,
                            paidRegistrations,
                            pendingPayments,
                            failedPayments,
                            revenueResult,
                        ] =
                            await Promise.all([
                                Registration.countDocuments(
                                    {
                                        eventId,
                                    }
                                ),

                                Registration.countDocuments(
                                    {
                                        eventId,
                                        paymentStatus:
                                            "paid",
                                    }
                                ),

                                Registration.countDocuments(
                                    {
                                        eventId,
                                        paymentStatus:
                                            {
                                                $in: [
                                                    "pending",
                                                    "payment_submitted",
                                                ],
                                            },
                                    }
                                ),

                                Registration.countDocuments(
                                    {
                                        eventId,
                                        paymentStatus:
                                            {
                                                $in: [
                                                    "failed",
                                                    "rejected",
                                                ],
                                            },
                                    }
                                ),

                                Registration.aggregate(
                                    [
                                        {
                                            $match: {
                                                eventId:
                                                    new mongoose.Types.ObjectId(
                                                        eventId
                                                    ),
                                                paymentStatus:
                                                    "paid",
                                            },
                                        },

                                        {
                                            $group: {
                                                _id: null,

                                                totalRevenue:
                                                    {
                                                        $sum: {
                                                            $ifNull:
                                                                [
                                                                    "$amount",
                                                                    0,
                                                                ],
                                                        },
                                                    },
                                            },
                                        },
                                    ]
                                ),
                            ]);

                        const totalRevenue =
                            revenueResult.length >
                            0
                                ? Number(
                                      revenueResult[0]
                                          .totalRevenue ||
                                          0
                                  )
                                : 0;

                        const statistics = {
                            totalRegistrations:
                                Number(
                                    totalRegistrations ||
                                        0
                                ),

                            paidRegistrations:
                                Number(
                                    paidRegistrations ||
                                        0
                                ),

                            pendingPayments:
                                Number(
                                    pendingPayments ||
                                        0
                                ),

                            failedPayments:
                                Number(
                                    failedPayments ||
                                        0
                                ),

                            totalRevenue,
                        };

                        return {
                            ...event.toObject(),

                            statistics,

                            // Keep compatibility with
                            // frontend code using stats.
                            stats: statistics,
                        };
                    }
                )
            );

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({
            success: true,

            count:
                eventsWithStatistics.length,

            events:
                eventsWithStatistics,
        });
    } catch (error) {
        console.error(
            "========== Get My Events Error =========="
        );

        console.error(error);

        console.error(
            "========================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch organizer events",
        });
    }
};
// ==========================================
// UPDATE EVENT
// ==========================================
//
// PUT /api/events/:id
//
// Access:
// Organizer only
//
// Content-Type:
// multipart/form-data
//
// Optional files:
//
// banner
// paymentQr
// ==========================================

const updateEvent = async (req, res) => {
    try {
        // ------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // ------------------------------------------
        // CHECK ORGANIZER ROLE
        // ------------------------------------------

        if (req.user.role !== "organizer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only organizers can update events",
            });
        }

        // ------------------------------------------
        // GET EVENT ID
        // ------------------------------------------

        const { id } = req.params;

        if (!isValidEventId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid event ID",
            });
        }

        // ------------------------------------------
        // FIND EVENT
        // ------------------------------------------

        const event =
            await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ------------------------------------------
        // CHECK EVENT OWNER
        // ------------------------------------------

        if (
            String(
                event.organizerId
            ) !==
            String(
                req.user._id
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only update your own events",
            });
        }

        const data = req.body || {};

        // ------------------------------------------
        // UPDATE BASIC FIELDS
        // ------------------------------------------

        if (
            data.title !==
            undefined
        ) {
            event.title =
                String(
                    data.title
                ).trim();
        }

        if (
            data.description !==
            undefined
        ) {
            event.description =
                String(
                    data.description
                ).trim();
        }

        if (
            data.venue !==
            undefined
        ) {
            event.venue =
                String(
                    data.venue
                ).trim();
        }

        // ------------------------------------------
        // UPDATE HASHTAGS
        // ------------------------------------------

        if (
            data.hashtags !==
            undefined
        ) {
            event.hashtags =
                normalizeHashtags(
                    data.hashtags
                );
        }

        // ------------------------------------------
        // UPDATE EVENT DATE
        // ------------------------------------------

        if (
            data.eventDate !==
            undefined
        ) {
            const eventDate =
                new Date(
                    data.eventDate
                );

            if (
                Number.isNaN(
                    eventDate.getTime()
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid event date",
                });
            }

            event.eventDate =
                eventDate;
        }

        // ------------------------------------------
        // UPDATE REGISTRATION DEADLINE
        // ------------------------------------------

        if (
            data.registrationDeadline !==
            undefined
        ) {
            const deadline =
                new Date(
                    data.registrationDeadline
                );

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

        // ------------------------------------------
        // UPDATE REGISTRATION FEE
        // ------------------------------------------

        if (
            data.registrationFee !==
            undefined
        ) {
            const fee =
                Number(
                    data.registrationFee
                );

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

            event.registrationFee =
                fee;
        }

        // ------------------------------------------
        // UPDATE PAYMENT METHOD
        // ------------------------------------------

        if (
            data.paymentMethod !==
            undefined
        ) {
            event.paymentMethod =
                normalizePaymentMethod(
                    data.paymentMethod
                );
        }

        // ------------------------------------------
        // FREE EVENT
        // ------------------------------------------

        if (
            Number(
                event.registrationFee
            ) === 0
        ) {
            event.paymentMethod =
                "free";

            event.paymentUpiId = "";

            event.paymentQrImageUrl = "";

            event.paymentInstructions = "";
        }

        // ------------------------------------------
        // UPDATE UPI ID
        // ------------------------------------------

        if (
            data.paymentUpiId !==
            undefined
        ) {
            event.paymentUpiId =
                String(
                    data.paymentUpiId
                ).trim();
        }

        // ------------------------------------------
        // UPDATE PAYMENT INSTRUCTIONS
        // ------------------------------------------

        if (
            data.paymentInstructions !==
            undefined
        ) {
            event.paymentInstructions =
                String(
                    data.paymentInstructions
                ).trim();
        }

        // ------------------------------------------
        // UPLOAD NEW EVENT BANNER
        // ------------------------------------------

        const bannerFile =
            getUploadedFile(
                req,
                "banner"
            );

        if (bannerFile) {
            const uploadResult =
                await uploadToCloudinary(
                    bannerFile.buffer,
                    "eventsphere/events"
                );

            event.bannerImageUrl =
                uploadResult.secure_url;
        }

        // ------------------------------------------
        // UPLOAD NEW PAYMENT QR
        // ------------------------------------------

        if (
            event.paymentMethod ===
            "upi"
        ) {
            const paymentQrFile =
                getUploadedFile(
                    req,
                    "paymentQr"
                );

            if (paymentQrFile) {
                const uploadResult =
                    await uploadToCloudinary(
                        paymentQrFile.buffer,
                        "eventsphere/payment-qrs"
                    );

                event.paymentQrImageUrl =
                    uploadResult.secure_url;
            }

            // --------------------------------------
            // EXISTING QR URL
            // --------------------------------------

            if (
                data.paymentQrImageUrl !==
                undefined
            ) {
                event.paymentQrImageUrl =
                    String(
                        data.paymentQrImageUrl
                    ).trim();
            }
        }

        // ------------------------------------------
        // RAZORPAY EVENT
        // ------------------------------------------

        if (
            event.paymentMethod ===
            "razorpay"
        ) {
            event.paymentUpiId = "";
            event.paymentQrImageUrl = "";
        }

        // ------------------------------------------
        // VALIDATE PAYMENT DATA
        // ------------------------------------------

        const paymentValidation =
            validatePaymentData({
                registrationFee:
                    event.registrationFee,

                paymentMethod:
                    event.paymentMethod,

                paymentUpiId:
                    event.paymentUpiId,

                paymentQrImageUrl:
                    event.paymentQrImageUrl,
            });

        if (!paymentValidation.valid) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment validation failed",
                errors:
                    paymentValidation.errors,
            });
        }

        // ------------------------------------------
        // SAVE EVENT
        // ------------------------------------------

        await event.save();

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Event updated successfully",
            event,
        });
    } catch (error) {
        console.error(
            "========== Update Event Error =========="
        );

        console.error(error);

        console.error(
            "========================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to update event",
        });
    }
};
// ==========================================
// DELETE EVENT
// ==========================================
//
// DELETE /api/events/:id
//
// Access:
// Organizer only
// ==========================================

const deleteEvent = async (req, res) => {
    try {
        // ------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // ------------------------------------------
        // CHECK ORGANIZER ROLE
        // ------------------------------------------

        if (req.user.role !== "organizer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only organizers can delete events",
            });
        }

        // ------------------------------------------
        // GET EVENT ID
        // ------------------------------------------

        const { id } = req.params;

        if (!isValidEventId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid event ID",
            });
        }

        // ------------------------------------------
        // FIND EVENT
        // ------------------------------------------

        const event =
            await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ------------------------------------------
        // CHECK EVENT OWNER
        // ------------------------------------------

        if (
            String(
                event.organizerId
            ) !==
            String(
                req.user._id
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete your own events",
            });
        }

        // ------------------------------------------
        // DELETE EVENT
        // ------------------------------------------

        await Event.findByIdAndDelete(id);

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Event deleted successfully",
        });
    } catch (error) {
        console.error(
            "========== Delete Event Error =========="
        );

        console.error(error);

        console.error(
            "========================================"
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete event",
        });
    }
};
// ==========================================
// CLOSE EVENT
// ==========================================
//
// PATCH /api/events/:id/close
//
// Access:
// Organizer only
//
// Changes event status:
//
// active → closed
// ==========================================

const closeEvent = async (req, res) => {
    try {
        // ------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message:
                    "Authentication required",
            });
        }

        // ------------------------------------------
        // CHECK ORGANIZER ROLE
        // ------------------------------------------

        if (req.user.role !== "organizer") {
            return res.status(403).json({
                success: false,
                message:
                    "Only organizers can close events",
            });
        }

        // ------------------------------------------
        // GET EVENT ID
        // ------------------------------------------

        const { id } = req.params;

        if (!isValidEventId(id)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid event ID",
            });
        }

        // ------------------------------------------
        // FIND EVENT
        // ------------------------------------------

        const event =
            await Event.findById(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message:
                    "Event not found",
            });
        }

        // ------------------------------------------
        // CHECK EVENT OWNER
        // ------------------------------------------

        if (
            String(
                event.organizerId
            ) !==
            String(
                req.user._id
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only close your own events",
            });
        }

        // ------------------------------------------
        // CHECK CURRENT STATUS
        // ------------------------------------------

        if (
            event.status ===
            "closed"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Event is already closed",
            });
        }

        // ------------------------------------------
        // CLOSE EVENT
        // ------------------------------------------

        event.status = "closed";

        await event.save();

        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Event closed successfully",
            event,
        });
    } catch (error) {
        console.error(
            "========== Close Event Error =========="
        );

        console.error(error);

        console.error(
            "======================================="
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to close event",
        });
    }
};
// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    deleteEvent,
    closeEvent,
};