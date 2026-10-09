import React, { useEffect, useState } from "react";
import "./EventForm.css";
const EventForm = ({
    initialData = null,
    onSubmit,
    onCancel,
    loading = false,
    submitLabel = "Create Event",
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        hashtags: "",
        venue: "",
        eventDate: "",
        registrationFee: "",
        registrationDeadline: "",
        status: "active",
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [errors, setErrors] = useState({});

    /* ============================================================
       LOAD EXISTING EVENT DATA
    ============================================================ */

    useEffect(() => {
        if (!initialData) {
            return;
        }

        const formatDateTimeLocal = (date) => {
            if (!date) {
                return "";
            }

            const parsedDate = new Date(date);

            if (Number.isNaN(parsedDate.getTime())) {
                return "";
            }

            const year = parsedDate.getFullYear();
            const month = String(
                parsedDate.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                parsedDate.getDate()
            ).padStart(2, "0");
            const hours = String(
                parsedDate.getHours()
            ).padStart(2, "0");
            const minutes = String(
                parsedDate.getMinutes()
            ).padStart(2, "0");

            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        const hashtags = Array.isArray(
            initialData.hashtags
        )
            ? initialData.hashtags.join(", ")
            : initialData.hashtags || "";

        setFormData({
            title: initialData.title || "",
            description:
                initialData.description || "",
            hashtags,
            venue: initialData.venue || "",
            eventDate: formatDateTimeLocal(
                initialData.eventDate
            ),
            registrationFee:
                initialData.registrationFee ?? "",
            registrationDeadline:
                formatDateTimeLocal(
                    initialData.registrationDeadline
                ),
            status:
                initialData.status || "active",
        });

        if (initialData.bannerImageUrl) {
            setPreview(
                initialData.bannerImageUrl
            );
        }
    }, [initialData]);

    /* ============================================================
       INPUT CHANGE
    ============================================================ */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    /* ============================================================
       IMAGE CHANGE
    ============================================================ */

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        setErrors((previous) => ({
            ...previous,
            bannerImage: "",
        }));

        if (!file) {
            setBannerImage(null);

            if (initialData?.bannerImageUrl) {
                setPreview(
                    initialData.bannerImageUrl
                );
            } else {
                setPreview("");
            }

            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setBannerImage(null);
            setPreview("");

            setErrors((previous) => ({
                ...previous,
                bannerImage:
                    "Only JPG, JPEG, PNG and WEBP images are allowed.",
            }));

            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setBannerImage(null);
            setPreview("");

            setErrors((previous) => ({
                ...previous,
                bannerImage:
                    "Banner image must be less than 5MB.",
            }));

            event.target.value = "";
            return;
        }

        setBannerImage(file);

        const imageUrl =
            URL.createObjectURL(file);

        setPreview(imageUrl);
    };

    /* ============================================================
       REMOVE IMAGE
    ============================================================ */

    const handleRemoveImage = () => {
        setBannerImage(null);

        if (initialData?.bannerImageUrl) {
            setPreview(
                initialData.bannerImageUrl
            );
        } else {
            setPreview("");
        }

        const input =
            document.getElementById(
                "event-banner-image"
            );

        if (input) {
            input.value = "";
        }
    };

    /* ============================================================
       VALIDATION
    ============================================================ */

    const validate = () => {
        const newErrors = {};

        const title = formData.title.trim();
        const description =
            formData.description.trim();
        const venue = formData.venue.trim();

        if (!title) {
            newErrors.title =
                "Event title is required.";
        } else if (title.length < 3) {
            newErrors.title =
                "Event title must contain at least 3 characters.";
        }

        if (!description) {
            newErrors.description =
                "Event description is required.";
        } else if (description.length < 10) {
            newErrors.description =
                "Description must contain at least 10 characters.";
        }

        if (!venue) {
            newErrors.venue =
                "Venue is required.";
        }

        if (!formData.eventDate) {
            newErrors.eventDate =
                "Event date is required.";
        }

        if (!formData.registrationDeadline) {
            newErrors.registrationDeadline =
                "Registration deadline is required.";
        }

        if (
            formData.eventDate &&
            formData.registrationDeadline
        ) {
            const eventDate = new Date(
                formData.eventDate
            );

            const deadline = new Date(
                formData.registrationDeadline
            );

            if (
                !Number.isNaN(eventDate.getTime()) &&
                !Number.isNaN(deadline.getTime()) &&
                deadline >= eventDate
            ) {
                newErrors.registrationDeadline =
                    "Registration deadline must be before the event date.";
            }
        }

        const fee = Number(
            formData.registrationFee
        );

        if (
            formData.registrationFee === "" ||
            Number.isNaN(fee)
        ) {
            newErrors.registrationFee =
                "Registration fee is required.";
        } else if (fee < 0) {
            newErrors.registrationFee =
                "Registration fee cannot be negative.";
        }

        if (bannerImage) {
            if (
                bannerImage.size >
                5 * 1024 * 1024
            ) {
                newErrors.bannerImage =
                    "Banner image must be less than 5MB.";
            }
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    /* ============================================================
       SUBMIT
    ============================================================ */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        const data = {
            ...formData,

            title: formData.title.trim(),

            description:
                formData.description.trim(),

            venue: formData.venue.trim(),

            registrationFee:
                Number(
                    formData.registrationFee
                ),

            hashtags: formData.hashtags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
        };

        if (onSubmit) {
            await onSubmit(
                data,
                bannerImage
            );
        }
    };

    return (
        <form
            className="event-form"
            onSubmit={handleSubmit}
        >
            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <div className="event-form-section">

                <div className="event-form-section-header">
                    <h2>
                        Basic Information
                    </h2>

                    <p>
                        Enter the main details
                        of your event.
                    </p>
                </div>


                {/* TITLE */}

                <div className="form-group">

                    <label htmlFor="event-title">
                        Event Title
                        <span>*</span>
                    </label>

                    <input
                        id="event-title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter event title"
                        maxLength={150}
                        disabled={loading}
                    />

                    {errors.title && (
                        <small className="form-error">
                            {errors.title}
                        </small>
                    )}

                </div>


                {/* DESCRIPTION */}

                <div className="form-group">

                    <label htmlFor="event-description">
                        Description
                        <span>*</span>
                    </label>

                    <textarea
                        id="event-description"
                        name="description"
                        value={
                            formData.description
                        }
                        onChange={handleChange}
                        placeholder="Describe your event..."
                        rows="6"
                        maxLength={5000}
                        disabled={loading}
                    />

                    <div className="event-form-character-count">
                        {
                            formData.description
                                .length
                        }{" "}
                        / 5000
                    </div>

                    {errors.description && (
                        <small className="form-error">
                            {errors.description}
                        </small>
                    )}

                </div>


                {/* HASHTAGS */}

                <div className="form-group">

                    <label htmlFor="event-hashtags">
                        Hashtags
                    </label>

                    <input
                        id="event-hashtags"
                        type="text"
                        name="hashtags"
                        value={formData.hashtags}
                        onChange={handleChange}
                        placeholder="technology, workshop, coding"
                        disabled={loading}
                    />

                    <small className="form-help">
                        Separate multiple hashtags
                        using commas.
                    </small>

                </div>

            </div>


            {/* ==================================================
                EVENT BANNER
            ================================================== */}

            <div className="event-form-section">

                <div className="event-form-section-header">
                    <h2>
                        Event Banner
                    </h2>

                    <p>
                        Upload an attractive
                        banner for your event.
                    </p>
                </div>


                <div className="form-group">

                    <label htmlFor="event-banner-image">
                        Banner Image
                    </label>

                    <div className="event-image-upload">

                        {preview ? (
                            <div className="event-image-preview">

                                <img
                                    src={preview}
                                    alt="Event banner preview"
                                />

                                <button
                                    type="button"
                                    className="event-image-remove"
                                    onClick={
                                        handleRemoveImage
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Remove
                                </button>

                            </div>
                        ) : (
                            <label
                                htmlFor="event-banner-image"
                                className="event-image-upload-box"
                            >

                                <div className="event-image-upload-icon">
                                    +
                                </div>

                                <strong>
                                    Upload Banner
                                </strong>

                                <span>
                                    JPG, JPEG, PNG
                                    or WEBP
                                </span>

                                <small>
                                    Maximum size:
                                    5MB
                                </small>

                            </label>
                        )}

                        <input
                            id="event-banner-image"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={
                                handleImageChange
                            }
                            disabled={loading}
                            hidden
                        />

                    </div>

                    {errors.bannerImage && (
                        <small className="form-error">
                            {errors.bannerImage}
                        </small>
                    )}

                </div>

            </div>


            {/* ==================================================
                EVENT SCHEDULE
            ================================================== */}

            <div className="event-form-section">

                <div className="event-form-section-header">
                    <h2>
                        Schedule & Location
                    </h2>

                    <p>
                        Set when and where the
                        event will happen.
                    </p>
                </div>


                <div className="form-row">

                    {/* EVENT DATE */}

                    <div className="form-group">

                        <label htmlFor="event-date">
                            Event Date & Time
                            <span>*</span>
                        </label>

                        <input
                            id="event-date"
                            type="datetime-local"
                            name="eventDate"
                            value={
                                formData.eventDate
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />

                        {errors.eventDate && (
                            <small className="form-error">
                                {
                                    errors.eventDate
                                }
                            </small>
                        )}

                    </div>


                    {/* DEADLINE */}

                    <div className="form-group">

                        <label htmlFor="registration-deadline">
                            Registration Deadline
                            <span>*</span>
                        </label>

                        <input
                            id="registration-deadline"
                            type="datetime-local"
                            name="registrationDeadline"
                            value={
                                formData.registrationDeadline
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                        />

                        {errors.registrationDeadline && (
                            <small className="form-error">
                                {
                                    errors.registrationDeadline
                                }
                            </small>
                        )}

                    </div>

                </div>


                {/* VENUE */}

                <div className="form-group">

                    <label htmlFor="event-venue">
                        Venue
                        <span>*</span>
                    </label>

                    <input
                        id="event-venue"
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        placeholder="Enter event venue"
                        maxLength={300}
                        disabled={loading}
                    />

                    {errors.venue && (
                        <small className="form-error">
                            {errors.venue}
                        </small>
                    )}

                </div>

            </div>


            {/* ==================================================
                PAYMENT
            ================================================== */}

            <div className="event-form-section">

                <div className="event-form-section-header">
                    <h2>
                        Registration & Payment
                    </h2>

                    <p>
                        Configure the registration
                        fee for participants.
                    </p>
                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label htmlFor="registration-fee">
                            Registration Fee
                            <span>*</span>
                        </label>

                        <div className="event-fee-input">

                            <span>
                                ₹
                            </span>

                            <input
                                id="registration-fee"
                                type="number"
                                name="registrationFee"
                                value={
                                    formData.registrationFee
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0"
                                min="0"
                                step="0.01"
                                disabled={loading}
                            />

                        </div>

                        {errors.registrationFee && (
                            <small className="form-error">
                                {
                                    errors.registrationFee
                                }
                            </small>
                        )}

                        <small className="form-help">
                            Enter 0 for a free
                            event.
                        </small>

                    </div>


                    {/* STATUS */}

                    {initialData && (
                        <div className="form-group">

                            <label htmlFor="event-status">
                                Event Status
                            </label>

                            <select
                                id="event-status"
                                name="status"
                                value={
                                    formData.status
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                            >
                                <option value="active">
                                    Active
                                </option>

                                <option value="closed">
                                    Closed
                                </option>
                            </select>

                        </div>
                    )}

                </div>

            </div>


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="form-actions">

                {onCancel && (
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="event-form-spinner"></span>

                            Saving...
                        </>
                    ) : (
                        submitLabel
                    )}
                </button>

            </div>

        </form>
    );
};

export default EventForm;