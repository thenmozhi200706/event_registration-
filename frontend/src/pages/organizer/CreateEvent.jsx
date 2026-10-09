// =====================================================
// EVENTSPHERE - CREATE EVENT
// =====================================================

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ArrowLeft,
    CalendarDays,
    ImagePlus,
    MapPin,
    Plus,
    Save,
    Tag,
    Trash2,
    X,
    CreditCard,
    QrCode,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import eventService from "../../services/eventService";

import "./CreateEvent.css";

// =====================================================
// CONSTANTS
// =====================================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

// =====================================================
// COMPONENT
// =====================================================

const CreateEvent = () => {
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const paymentQrInputRef = useRef(null);

    // =================================================
    // FORM STATE
    // =================================================

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        venue: "",
        eventDate: "",
        registrationFee: "0",
        registrationDeadline: "",

        // Payment
        paymentMethod: "free",
        paymentUpiId: "",
        paymentInstructions: "",
    });

    // =================================================
    // HASHTAGS
    // =================================================

    const [hashtags, setHashtags] = useState([]);
    const [hashtagInput, setHashtagInput] = useState("");

    // =================================================
    // BANNER IMAGE
    // =================================================

    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState("");

    // =================================================
    // PAYMENT QR
    // =================================================

    const [paymentQrFile, setPaymentQrFile] = useState(null);
    const [paymentQrPreview, setPaymentQrPreview] = useState("");

    // =================================================
    // STATUS
    // =================================================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =================================================
    // CLEAN BANNER PREVIEW URL
    // =================================================

    useEffect(() => {
        return () => {
            if (bannerPreview) {
                URL.revokeObjectURL(bannerPreview);
            }
        };
    }, [bannerPreview]);

    // =================================================
    // CLEAN PAYMENT QR PREVIEW URL
    // =================================================

    useEffect(() => {
        return () => {
            if (paymentQrPreview) {
                URL.revokeObjectURL(paymentQrPreview);
            }
        };
    }, [paymentQrPreview]);

    // =================================================
    // INPUT CHANGE
    // =================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Automatically change payment method
        // when fee becomes 0
        if (name === "registrationFee") {
            const numericFee = Number(value);

            if (
                !Number.isNaN(numericFee) &&
                numericFee === 0
            ) {
                setFormData((previous) => ({
                    ...previous,
                    [name]: value,
                    paymentMethod: "free",
                    paymentUpiId: "",
                    paymentInstructions: "",
                }));

                removePaymentQrImage();
            }
        }

        setError("");
        setSuccess("");
    };

    // =================================================
    // PAYMENT METHOD
    // =================================================

    const handlePaymentMethodChange = (method) => {
        setFormData((previous) => ({
            ...previous,
            paymentMethod: method,
        }));

        setError("");
        setSuccess("");

        // Free event
        if (method === "free") {
            setFormData((previous) => ({
                ...previous,
                paymentMethod: "free",
                paymentUpiId: "",
                paymentInstructions: "",
            }));

            removePaymentQrImage();
        }
    };

    // =================================================
    // HASHTAG INPUT
    // =================================================

    const handleHashtagInputChange = (event) => {
        setHashtagInput(event.target.value);
        setError("");
    };

    // =================================================
    // ADD HASHTAG
    // =================================================

    const addHashtag = () => {
        let cleanedTag = hashtagInput
            .trim()
            .replace(/^#+/, "")
            .toLowerCase();

        if (!cleanedTag) {
            return;
        }

        cleanedTag = cleanedTag.replace(
            /[^a-z0-9_-]/g,
            ""
        );

        if (!cleanedTag) {
            return;
        }

        if (hashtags.includes(cleanedTag)) {
            setHashtagInput("");
            return;
        }

        setHashtags((previous) => [
            ...previous,
            cleanedTag,
        ]);

        setHashtagInput("");
    };

    // =================================================
    // HASHTAG KEYBOARD
    // =================================================

    const handleHashtagKeyDown = (event) => {
        if (
            event.key === "Enter" ||
            event.key === ","
        ) {
            event.preventDefault();
            addHashtag();
        }
    };

    // =================================================
    // REMOVE HASHTAG
    // =================================================

    const removeHashtag = (hashtag) => {
        setHashtags((previous) =>
            previous.filter(
                (tag) => tag !== hashtag
            )
        );
    };

    // =================================================
    // VALIDATE IMAGE
    // =================================================

    const validateImage = (file, imageName) => {
        if (
            !ALLOWED_IMAGE_TYPES.includes(
                file.type
            )
        ) {
            return `${imageName} must be a JPG, JPEG, PNG, or WEBP image.`;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            return `${imageName} must be smaller than 5 MB.`;
        }

        return null;
    };

    // =================================================
    // BANNER IMAGE SELECT
    // =================================================

    const handleImageChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        const imageError = validateImage(
            file,
            "Banner image"
        );

        if (imageError) {
            setError(imageError);
            event.target.value = "";
            return;
        }

        if (bannerPreview) {
            URL.revokeObjectURL(
                bannerPreview
            );
        }

        setBannerFile(file);

        setBannerPreview(
            URL.createObjectURL(file)
        );
    };

    // =================================================
    // OPEN BANNER FILE SELECTOR
    // =================================================

    const openFileSelector = () => {
        fileInputRef.current?.click();
    };

    // =================================================
    // REMOVE BANNER
    // =================================================

    const removeBannerImage = () => {
        if (bannerPreview) {
            URL.revokeObjectURL(
                bannerPreview
            );
        }

        setBannerFile(null);
        setBannerPreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // =================================================
    // PAYMENT QR SELECT
    // =================================================

    const handlePaymentQrChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setError("");
        setSuccess("");

        const imageError = validateImage(
            file,
            "Payment QR image"
        );

        if (imageError) {
            setError(imageError);
            event.target.value = "";
            return;
        }

        if (paymentQrPreview) {
            URL.revokeObjectURL(
                paymentQrPreview
            );
        }

        setPaymentQrFile(file);

        setPaymentQrPreview(
            URL.createObjectURL(file)
        );
    };

    // =================================================
    // OPEN PAYMENT QR SELECTOR
    // =================================================

    const openPaymentQrSelector = () => {
        paymentQrInputRef.current?.click();
    };

    // =================================================
    // REMOVE PAYMENT QR
    // =================================================

    const removePaymentQrImage = () => {
        if (paymentQrPreview) {
            URL.revokeObjectURL(
                paymentQrPreview
            );
        }

        setPaymentQrFile(null);
        setPaymentQrPreview("");

        if (paymentQrInputRef.current) {
            paymentQrInputRef.current.value = "";
        }
    };

    // =================================================
    // VALIDATE FORM
    // =================================================

    const validateForm = () => {
        // TITLE
        if (!formData.title.trim()) {
            return "Event title is required.";
        }

        // DESCRIPTION
        if (!formData.description.trim()) {
            return "Event description is required.";
        }

        // VENUE
        if (!formData.venue.trim()) {
            return "Event venue is required.";
        }

        // EVENT DATE
        if (!formData.eventDate) {
            return "Event date is required.";
        }

        // DEADLINE
        if (!formData.registrationDeadline) {
            return "Registration deadline is required.";
        }

        const eventDate = new Date(
            formData.eventDate
        );

        const deadline = new Date(
            formData.registrationDeadline
        );

        if (
            Number.isNaN(
                eventDate.getTime()
            )
        ) {
            return "Please enter a valid event date.";
        }

        if (
            Number.isNaN(
                deadline.getTime()
            )
        ) {
            return "Please enter a valid registration deadline.";
        }

        if (deadline >= eventDate) {
            return "Registration deadline must be before the event date.";
        }

        // FEE
        const fee = Number(
            formData.registrationFee
        );

        if (
            Number.isNaN(fee) ||
            fee < 0
        ) {
            return "Registration fee cannot be negative.";
        }

        // PAYMENT METHOD
        if (
            fee > 0 &&
            formData.paymentMethod === "free"
        ) {
            return "Please select a payment method for a paid event.";
        }

        // UPI VALIDATION
        if (
            fee > 0 &&
            formData.paymentMethod === "upi"
        ) {
            if (!paymentQrFile) {
                return "Please upload a UPI QR code for UPI payment.";
            }

            if (
                formData.paymentUpiId.trim()
            ) {
                const upiPattern =
                    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/;

                if (
                    !upiPattern.test(
                        formData.paymentUpiId.trim()
                    )
                ) {
                    return "Please enter a valid UPI ID.";
                }
            }
        }

        return null;
    };

    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }

        try {
            setLoading(true);

            // =========================================
            // CREATE FORMDATA
            // =========================================

            const data = new FormData();

            // BASIC INFORMATION

            data.append(
                "title",
                formData.title.trim()
            );

            data.append(
                "description",
                formData.description.trim()
            );

            data.append(
                "venue",
                formData.venue.trim()
            );

            // DATE

            data.append(
                "eventDate",
                formData.eventDate
            );

            data.append(
                "registrationDeadline",
                formData.registrationDeadline
            );

            // FEE

            const numericFee =
                Number(
                    formData.registrationFee
                ) || 0;

            data.append(
                "registrationFee",
                String(numericFee)
            );

            // PAYMENT METHOD

            const finalPaymentMethod =
                numericFee === 0
                    ? "free"
                    : formData.paymentMethod;

            data.append(
                "paymentMethod",
                finalPaymentMethod
            );

            // UPI ID

            if (
                finalPaymentMethod === "upi" &&
                formData.paymentUpiId.trim()
            ) {
                data.append(
                    "paymentUpiId",
                    formData.paymentUpiId.trim()
                );
            }

            // PAYMENT INSTRUCTIONS

            if (
                finalPaymentMethod === "upi" &&
                formData.paymentInstructions.trim()
            ) {
                data.append(
                    "paymentInstructions",
                    formData.paymentInstructions.trim()
                );
            }

            // HASHTAGS

            data.append(
                "hashtags",
                JSON.stringify(hashtags)
            );

            // BANNER

            if (bannerFile) {
                data.append(
                    "banner",
                    bannerFile
                );
            }

            // PAYMENT QR

            if (
                finalPaymentMethod === "upi" &&
                paymentQrFile
            ) {
                data.append(
                    "paymentQr",
                    paymentQrFile
                );
            }

            // DEBUG

            console.log(
                "========== CREATE EVENT =========="
            );

            console.log(
                "Payment Method:",
                finalPaymentMethod
            );

            console.log(
                "Payment UPI ID:",
                formData.paymentUpiId ||
                    "Not provided"
            );

            console.log(
                "Payment Instructions:",
                formData.paymentInstructions ||
                    "Not provided"
            );

            console.log(
                "Payment QR:",
                paymentQrFile
                    ? paymentQrFile.name
                    : "Not uploaded"
            );

            console.log(
                "Banner:",
                bannerFile
                    ? bannerFile.name
                    : "Not uploaded"
            );

            console.log(
                "=================================="
            );

            // =========================================
            // API
            // =========================================

            const response =
                await eventService.createEvent(
                    data
                );

            console.log(
                "Create event response:",
                response
            );

            // =========================================
            // SUCCESS
            // =========================================

            setSuccess(
                response?.message ||
                    "Event created successfully."
            );

            // =========================================
            // REDIRECT
            // =========================================

            setTimeout(() => {
                navigate(
                    "/organizer/events",
                    {
                        replace: true,
                    }
                );
            }, 1000);

        } catch (err) {
            console.error(
                "Create event error:",
                err
            );

            const responseData =
                err?.response?.data;

            let serverMessage =
                responseData?.message ||
                responseData?.error ||
                "";

            // Backend validation errors

            if (
                Array.isArray(
                    responseData?.errors
                )
            ) {
                serverMessage =
                    responseData.errors.join(
                        " "
                    );
            }

            setError(
                serverMessage ||
                    err?.message ||
                    "Unable to create event. Please try again."
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // BACK / CANCEL
    // =================================================

    const handleBack = () => {
        if (loading) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * navigate(-1) returns to the actual
         * previous page in browser history.
         *
         * Example:
         *
         * My Events
         *     ↓
         * Create Event
         *     ↓
         * Back
         *     ↓
         * My Events
         *
         * Dashboard
         *     ↓
         * Create Event
         *     ↓
         * Back
         *     ↓
         * Dashboard
         */

        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // Safe fallback if there is
            // no previous browser history.
            navigate(
                "/organizer/dashboard",
                {
                    replace: true,
                }
            );
        }
    };

    // =================================================
    // RENDER
    // =================================================

    return (
        <main className="create-event-page">

            <div className="create-event-container">

                {/* =================================================
                    HEADER
                    ================================================= */}

                <div className="create-event-header">

                    <button
                        type="button"
                        className="create-event-back"
                        onClick={handleBack}
                        disabled={loading}
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Back
                    </button>

                    <div>

                        <span className="create-event-eyebrow">
                            ORGANIZER
                        </span>

                        <h1>
                            Create Event
                        </h1>

                        <p>
                            Create and publish a new
                            EventSphere event.
                        </p>

                    </div>

                </div>

                {/* =================================================
                    ERROR
                    ================================================= */}

                {error && (
                    <div
                        className="create-event-message error"
                        role="alert"
                    >
                        <strong>
                            Unable to create event
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {/* =================================================
                    SUCCESS
                    ================================================= */}

                {success && (
                    <div
                        className="create-event-message success"
                        role="status"
                    >
                        {success}
                    </div>
                )}

                {/* =================================================
                    FORM
                    ================================================= */}

                <form
                    className="create-event-form"
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                >

                    {/* =================================================
                        BASIC INFORMATION
                        ================================================= */}

                    <section className="create-event-section">

                        <div className="create-event-section-header">

                            <div className="create-event-section-icon">
                                <Plus size={18} />
                            </div>

                            <div>
                                <h2>
                                    Basic Information
                                </h2>

                                <p>
                                    Add the main details
                                    about your event.
                                </p>
                            </div>

                        </div>

                        <div className="create-event-fields">

                            {/* TITLE */}

                            <div className="create-event-field full">

                                <label htmlFor="title">
                                    Event Title
                                </label>

                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter event title"
                                    maxLength={200}
                                    autoComplete="off"
                                    required
                                    disabled={loading}
                                />

                            </div>

                            {/* DESCRIPTION */}

                            <div className="create-event-field full">

                                <label htmlFor="description">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe your event..."
                                    rows={6}
                                    required
                                    disabled={loading}
                                />

                            </div>

                            {/* VENUE */}

                            <div className="create-event-field full">

                                <label htmlFor="venue">

                                    <MapPin
                                        size={14}
                                    />

                                    Venue

                                </label>

                                <input
                                    id="venue"
                                    name="venue"
                                    type="text"
                                    value={
                                        formData.venue
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter event venue"
                                    required
                                    disabled={loading}
                                />

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        EVENT SCHEDULE
                        ================================================= */}

                    <section className="create-event-section">

                        <div className="create-event-section-header">

                            <div className="create-event-section-icon">
                                <CalendarDays
                                    size={18}
                                />
                            </div>

                            <div>
                                <h2>
                                    Event Schedule
                                </h2>

                                <p>
                                    Set the event date and
                                    registration deadline.
                                </p>
                            </div>

                        </div>

                        <div className="create-event-fields">

                            {/* EVENT DATE */}

                            <div className="create-event-field">

                                <label htmlFor="eventDate">
                                    Event Date
                                </label>

                                <input
                                    id="eventDate"
                                    name="eventDate"
                                    type="datetime-local"
                                    value={
                                        formData.eventDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={loading}
                                />

                            </div>

                            {/* DEADLINE */}

                            <div className="create-event-field">

                                <label htmlFor="registrationDeadline">
                                    Registration Deadline
                                </label>

                                <input
                                    id="registrationDeadline"
                                    name="registrationDeadline"
                                    type="datetime-local"
                                    value={
                                        formData.registrationDeadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={loading}
                                />

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        REGISTRATION
                        ================================================= */}

                    <section className="create-event-section">

                        <div className="create-event-section-header">

                            <div className="create-event-section-icon">
                                <Tag size={18} />
                            </div>

                            <div>
                                <h2>
                                    Registration
                                </h2>

                                <p>
                                    Set the registration
                                    fee and event tags.
                                </p>
                            </div>

                        </div>

                        <div className="create-event-fields">

                            {/* FEE */}

                            <div className="create-event-field">

                                <label htmlFor="registrationFee">
                                    Registration Fee
                                </label>

                                <input
                                    id="registrationFee"
                                    name="registrationFee"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        formData.registrationFee
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="0"
                                    disabled={loading}
                                />

                                <small>
                                    Enter 0 for a free event.
                                </small>

                            </div>

                            {/* HASHTAGS */}

                            <div className="create-event-field">

                                <label htmlFor="hashtagInput">
                                    Hashtags
                                </label>

                                <div className="create-event-hashtag-input">

                                    <input
                                        id="hashtagInput"
                                        type="text"
                                        value={
                                            hashtagInput
                                        }
                                        onChange={
                                            handleHashtagInputChange
                                        }
                                        onKeyDown={
                                            handleHashtagKeyDown
                                        }
                                        placeholder="#technology"
                                        autoComplete="off"
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        onClick={addHashtag}
                                        disabled={loading}
                                    >
                                        Add
                                    </button>

                                </div>

                                {hashtags.length > 0 && (
                                    <div className="create-event-tags">

                                        {hashtags.map(
                                            (tag) => (
                                                <span
                                                    key={tag}
                                                    className="create-event-tag"
                                                >
                                                    #{tag}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeHashtag(
                                                                tag
                                                            )
                                                        }
                                                        disabled={
                                                            loading
                                                        }
                                                        aria-label={`Remove ${tag}`}
                                                    >
                                                        <Trash2
                                                            size={12}
                                                        />
                                                    </button>
                                                </span>
                                            )
                                        )}

                                    </div>
                                )}

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        PAYMENT
                        ================================================= */}

                    <section className="create-event-section">

                        <div className="create-event-section-header">

                            <div className="create-event-section-icon">
                                <CreditCard
                                    size={18}
                                />
                            </div>

                            <div>

                                <h2>
                                    Payment Collection
                                </h2>

                                <p>
                                    Choose how participants
                                    will pay for this event.
                                </p>

                            </div>

                        </div>

                        <div className="create-event-payment">

                            {/* FREE */}

                            <button
                                type="button"
                                className={`create-event-payment-option ${
                                    formData.paymentMethod ===
                                    "free"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    handlePaymentMethodChange(
                                        "free"
                                    )
                                }
                                disabled={
                                    loading ||
                                    Number(
                                        formData.registrationFee
                                    ) > 0
                                }
                            >

                                <div className="create-event-payment-option-icon">
                                    <Tag size={20} />
                                </div>

                                <div>
                                    <strong>
                                        Free Event
                                    </strong>

                                    <span>
                                        No payment required.
                                    </span>
                                </div>

                            </button>

                            {/* UPI */}

                            <button
                                type="button"
                                className={`create-event-payment-option ${
                                    formData.paymentMethod ===
                                    "upi"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    handlePaymentMethodChange(
                                        "upi"
                                    )
                                }
                                disabled={
                                    loading ||
                                    Number(
                                        formData.registrationFee
                                    ) <= 0
                                }
                            >

                                <div className="create-event-payment-option-icon">
                                    <QrCode size={20} />
                                </div>

                                <div>
                                    <strong>
                                        UPI / QR Code
                                    </strong>

                                    <span>
                                        Accept payment using your UPI QR.
                                    </span>
                                </div>

                            </button>

                            {/* RAZORPAY */}

                            <button
                                type="button"
                                className={`create-event-payment-option ${
                                    formData.paymentMethod ===
                                    "razorpay"
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() =>
                                    handlePaymentMethodChange(
                                        "razorpay"
                                    )
                                }
                                disabled={
                                    loading ||
                                    Number(
                                        formData.registrationFee
                                    ) <= 0
                                }
                            >

                                <div className="create-event-payment-option-icon">
                                    <CreditCard
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <strong>
                                        Razorpay
                                    </strong>

                                    <span>
                                        Collect online payments securely.
                                    </span>
                                </div>

                            </button>

                        </div>

                        {/* UPI DETAILS */}

                        {formData.paymentMethod ===
                            "upi" && (
                            <div className="create-event-payment-details">

                                <div className="create-event-fields">

                                    {/* UPI ID */}

                                    <div className="create-event-field">

                                        <label htmlFor="paymentUpiId">
                                            UPI ID
                                        </label>

                                        <input
                                            id="paymentUpiId"
                                            name="paymentUpiId"
                                            type="text"
                                            value={
                                                formData.paymentUpiId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="example@upi"
                                            autoComplete="off"
                                            disabled={loading}
                                        />

                                        <small>
                                            Optional when a QR code is uploaded.
                                        </small>

                                    </div>

                                    {/* QR */}

                                    <div className="create-event-field">

                                        <label>
                                            Payment QR Code
                                        </label>

                                        <input
                                            ref={
                                                paymentQrInputRef
                                            }
                                            id="paymentQr"
                                            name="paymentQr"
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={
                                                handlePaymentQrChange
                                            }
                                            className="create-event-file-input"
                                            disabled={loading}
                                        />

                                        {!paymentQrPreview && (
                                            <button
                                                type="button"
                                                className="create-event-payment-qr-upload"
                                                onClick={
                                                    openPaymentQrSelector
                                                }
                                                disabled={loading}
                                            >
                                                <QrCode
                                                    size={24}
                                                />

                                                <strong>
                                                    Upload UPI QR
                                                </strong>

                                                <span>
                                                    PNG, JPG, JPEG or WEBP
                                                </span>

                                                <small>
                                                    Maximum file size: 5 MB
                                                </small>
                                            </button>
                                        )}

                                        {paymentQrPreview && (
                                            <div className="create-event-payment-qr-preview">

                                                <div className="create-event-payment-qr-image">

                                                    <img
                                                        src={
                                                            paymentQrPreview
                                                        }
                                                        alt="Payment QR preview"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            removePaymentQrImage
                                                        }
                                                        disabled={
                                                            loading
                                                        }
                                                        aria-label="Remove payment QR"
                                                    >
                                                        <X
                                                            size={17}
                                                        />
                                                    </button>

                                                </div>

                                                <div className="create-event-payment-qr-info">

                                                    <strong>
                                                        {
                                                            paymentQrFile?.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {paymentQrFile
                                                            ? `${(
                                                                  paymentQrFile.size /
                                                                  1024 /
                                                                  1024
                                                              ).toFixed(
                                                                  2
                                                              )} MB`
                                                            : ""}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            openPaymentQrSelector
                                                        }
                                                        disabled={
                                                            loading
                                                        }
                                                    >
                                                        Change QR
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                    {/* PAYMENT INSTRUCTIONS */}

                                    <div className="create-event-field full">

                                        <label htmlFor="paymentInstructions">
                                            Payment Instructions
                                        </label>

                                        <textarea
                                            id="paymentInstructions"
                                            name="paymentInstructions"
                                            value={
                                                formData.paymentInstructions
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Example: Scan the QR code and complete the payment. Keep the payment screenshot for registration."
                                            rows={4}
                                            maxLength={1000}
                                            disabled={loading}
                                        />

                                        <small>
                                            Optional instructions shown to participants.
                                        </small>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* RAZORPAY DETAILS */}

                        {formData.paymentMethod ===
                            "razorpay" && (
                            <div className="create-event-payment-info">

                                <CreditCard
                                    size={22}
                                />

                                <div>

                                    <strong>
                                        Razorpay payment
                                    </strong>

                                    <p>
                                        Participants will be redirected
                                        to Razorpay during registration
                                        to complete the payment.
                                    </p>

                                </div>

                            </div>
                        )}

                    </section>

                    {/* =================================================
                        EVENT BANNER
                        ================================================= */}

                    <section className="create-event-section">

                        <div className="create-event-section-header">

                            <div className="create-event-section-icon">
                                <ImagePlus
                                    size={18}
                                />
                            </div>

                            <div>

                                <h2>
                                    Event Banner
                                </h2>

                                <p>
                                    Upload an image for
                                    your event banner.
                                </p>

                            </div>

                        </div>

                        <input
                            ref={fileInputRef}
                            id="bannerImage"
                            name="bannerImage"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={
                                handleImageChange
                            }
                            className="create-event-file-input"
                            disabled={loading}
                        />

                        {!bannerPreview && (
                            <button
                                type="button"
                                className="create-event-upload-box"
                                onClick={
                                    openFileSelector
                                }
                                disabled={loading}
                            >

                                <span className="create-event-upload-icon">
                                    <ImagePlus
                                        size={30}
                                    />
                                </span>

                                <strong>
                                    Click to upload
                                </strong>

                                <span>
                                    PNG, JPG, JPEG or WEBP
                                </span>

                                <small>
                                    Maximum file size: 5 MB
                                </small>

                            </button>
                        )}

                        {bannerPreview && (
                            <div className="create-event-image-preview">

                                <div className="create-event-image-wrapper">

                                    <img
                                        src={
                                            bannerPreview
                                        }
                                        alt="Event banner preview"
                                    />

                                    <button
                                        type="button"
                                        className="create-event-remove-image"
                                        onClick={
                                            removeBannerImage
                                        }
                                        disabled={loading}
                                        aria-label="Remove banner image"
                                    >
                                        <X
                                            size={18}
                                        />
                                    </button>

                                </div>

                                <div className="create-event-image-info">

                                    <div>

                                        <strong>
                                            {
                                                bannerFile?.name
                                            }
                                        </strong>

                                        <span>
                                            {bannerFile
                                                ? `${(
                                                      bannerFile.size /
                                                      1024 /
                                                      1024
                                                  ).toFixed(
                                                      2
                                                  )} MB`
                                                : ""}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        className="create-event-change-image"
                                        onClick={
                                            openFileSelector
                                        }
                                        disabled={loading}
                                    >
                                        Change Image
                                    </button>

                                </div>

                            </div>
                        )}

                    </section>

                    {/* =================================================
                        ACTIONS
                        ================================================= */}

                    <div className="create-event-actions">

                        <button
                            type="button"
                            className="create-event-cancel"
                            onClick={handleBack}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-event-submit"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="create-event-spinner" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={17} />
                                    Create Event
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>

        </main>
    );
};

export default CreateEvent;