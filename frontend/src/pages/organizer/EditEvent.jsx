// =====================================================
// EVENTSPHERE - EDIT EVENT
// =====================================================

import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    ImagePlus,
    MapPin,
    Save,
    Tag,
    Trash2,
} from "lucide-react";

import eventService from "../../services/eventService";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/common/ErrorMessage";

import "./EditEvent.css";


const EditEvent = () => {

    const navigate = useNavigate();

    const { id } = useParams();


    // =================================================
    // FORM STATE
    // =================================================

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        venue: "",
        eventDate: "",
        registrationFee: "",
        registrationDeadline: "",
        bannerImageUrl: "",
        status: "active",
    });


    const [hashtags, setHashtags] =
        useState([]);

    const [hashtagInput, setHashtagInput] =
        useState("");


    // =================================================
    // PAGE STATE
    // =================================================

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =================================================
    // LOAD EVENT
    // =================================================

    const loadEvent = useCallback(
        async () => {

            if (!id) {
                setError(
                    "Event ID is missing."
                );

                setLoading(false);

                return;
            }


            try {

                setLoading(true);

                setError("");

                const response =
                    await eventService.getEventById(
                        id
                    );


                const event =
                    response?.event ||
                    response?.data?.event ||
                    response?.data ||
                    response;


                if (!event) {
                    throw new Error(
                        "Event not found."
                    );
                }


                setFormData({
                    title:
                        event.title || "",

                    description:
                        event.description || "",

                    venue:
                        event.venue || "",

                    eventDate:
                        formatDateTimeLocal(
                            event.eventDate
                        ),

                    registrationFee:
                        event.registrationFee ??
                        "",

                    registrationDeadline:
                        formatDateTimeLocal(
                            event.registrationDeadline
                        ),

                    bannerImageUrl:
                        event.bannerImageUrl ||
                        event.bannerImage ||
                        "",

                    status:
                        event.status ||
                        "active",
                });


                setHashtags(
                    Array.isArray(
                        event.hashtags
                    )
                        ? event.hashtags
                            .map((tag) =>
                                String(tag)
                                    .trim()
                                    .replace(
                                        /^#/,
                                        ""
                                    )
                                    .toLowerCase()
                            )
                            .filter(Boolean)
                        : []
                );


            } catch (err) {

                console.error(
                    "Load event error:",
                    err?.response?.data ||
                    err?.message ||
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load event."
                );

            } finally {

                setLoading(false);

            }

        },
        [id]
    );


    // =================================================
    // FORMAT DATE FOR DATETIME-LOCAL
    // =================================================

    function formatDateTimeLocal(
        date
    ) {

        if (!date) {
            return "";
        }


        const parsedDate =
            new Date(date);


        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }


        const year =
            parsedDate.getFullYear();

        const month =
            String(
                parsedDate.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                parsedDate.getDate()
            ).padStart(2, "0");

        const hours =
            String(
                parsedDate.getHours()
            ).padStart(2, "0");

        const minutes =
            String(
                parsedDate.getMinutes()
            ).padStart(2, "0");


        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        loadEvent();

    }, [loadEvent]);


    // =================================================
    // INPUT CHANGE
    // =================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    // =================================================
    // ADD HASHTAG
    // =================================================

    const addHashtag = () => {

        const cleanedTag =
            hashtagInput
                .trim()
                .replace(/^#/, "")
                .toLowerCase();


        if (!cleanedTag) {
            return;
        }


        if (
            !hashtags.includes(
                cleanedTag
            )
        ) {

            setHashtags(
                (previous) => [
                    ...previous,
                    cleanedTag,
                ]
            );

        }


        setHashtagInput("");

    };


    // =================================================
    // HASHTAG KEY
    // =================================================

    const handleHashtagKeyDown = (
        event
    ) => {

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

    const removeHashtag = (
        tag
    ) => {

        setHashtags(
            (previous) =>
                previous.filter(
                    (item) =>
                        item !== tag
                )
        );

    };


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");

        setSuccess("");


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!formData.title.trim()) {

            setError(
                "Event title is required."
            );

            return;
        }


        if (!formData.description.trim()) {

            setError(
                "Event description is required."
            );

            return;
        }


        if (!formData.venue.trim()) {

            setError(
                "Event venue is required."
            );

            return;
        }


        if (!formData.eventDate) {

            setError(
                "Event date is required."
            );

            return;
        }


        if (!formData.registrationDeadline) {

            setError(
                "Registration deadline is required."
            );

            return;
        }


        const eventDate =
            new Date(
                formData.eventDate
            );

        const deadline =
            new Date(
                formData.registrationDeadline
            );


        if (
            Number.isNaN(
                eventDate.getTime()
            )
        ) {

            setError(
                "Please enter a valid event date."
            );

            return;
        }


        if (
            Number.isNaN(
                deadline.getTime()
            )
        ) {

            setError(
                "Please enter a valid registration deadline."
            );

            return;
        }


        if (deadline > eventDate) {

            setError(
                "Registration deadline cannot be after the event date."
            );

            return;
        }


        // ---------------------------------------------
        // PAYLOAD
        // ---------------------------------------------

        const payload = {

            title:
                formData.title.trim(),

            description:
                formData.description.trim(),

            venue:
                formData.venue.trim(),

            eventDate:
                formData.eventDate,

            registrationFee:
                Number(
                    formData.registrationFee
                ) || 0,

            registrationDeadline:
                formData.registrationDeadline,

            hashtags,

            bannerImageUrl:
                formData.bannerImageUrl.trim(),

            status:
                formData.status,
        };


        // ---------------------------------------------
        // UPDATE API
        // ---------------------------------------------

        try {

            setSaving(true);

            const response =
                await eventService.updateEvent(
                    id,
                    payload
                );


            setSuccess(
                response?.message ||
                "Event updated successfully."
            );


            setTimeout(() => {

                navigate(
                    `/organizer/manage-event/${id}`
                );

            }, 900);


        } catch (err) {

            console.error(
                "Update event error:",
                err?.response?.data ||
                err?.message ||
                err
            );


            setError(
                err?.response?.data?.message ||
                "Unable to update event. Please try again."
            );

        } finally {

            setSaving(false);

        }

    };


    // =================================================
    // CANCEL
    // =================================================

    const handleCancel = () => {

        navigate(-1);

    };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <main className="edit-event-page">

                <div className="edit-event-state">

                    <Loader />

                    <p>
                        Loading event...
                    </p>

                </div>

            </main>
        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (error && !formData.title) {

        return (
            <main className="edit-event-page">

                <div className="edit-event-state">

                    <ErrorMessage
                        message={error}
                    />

                    <div className="edit-event-state-actions">

                        <button
                            type="button"
                            className="edit-event-retry"
                            onClick={loadEvent}
                        >
                            Try Again
                        </button>

                        <button
                            type="button"
                            className="edit-event-back"
                            onClick={handleCancel}
                        >
                            Go Back
                        </button>

                    </div>

                </div>

            </main>
        );

    }


    // =================================================
    // RENDER
    // =================================================

    return (

        <main className="edit-event-page">

            <div className="edit-event-container">

                {/* =================================================
                    HEADER
                    ================================================= */}

                <div className="edit-event-header">

                    <button
                        type="button"
                        className="edit-event-back-button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Back
                    </button>


                    <div>

                        <span className="edit-event-eyebrow">
                            ORGANIZER
                        </span>

                        <h1>
                            Edit Event
                        </h1>

                        <p>
                            Update your event
                            information.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                    ================================================= */}

                {error && (

                    <div className="edit-event-message error">
                        {error}
                    </div>

                )}


                {/* =================================================
                    SUCCESS
                    ================================================= */}

                {success && (

                    <div className="edit-event-message success">
                        {success}
                    </div>

                )}


                {/* =================================================
                    FORM
                    ================================================= */}

                <form
                    className="edit-event-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        BASIC INFORMATION
                        ================================================= */}

                    <section className="edit-event-section">

                        <div className="edit-event-section-header">

                            <div className="edit-event-section-icon">
                                <Tag size={18} />
                            </div>

                            <div>

                                <h2>
                                    Event Information
                                </h2>

                                <p>
                                    Update the main event
                                    details.
                                </p>

                            </div>

                        </div>


                        <div className="edit-event-fields">

                            {/* TITLE */}

                            <div className="edit-event-field full">

                                <label htmlFor="edit-title">
                                    Event Title
                                </label>

                                <input
                                    id="edit-title"
                                    name="title"
                                    type="text"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    maxLength={200}
                                    required
                                    disabled={saving}
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="edit-event-field full">

                                <label htmlFor="edit-description">
                                    Description
                                </label>

                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={6}
                                    required
                                    disabled={saving}
                                />

                            </div>


                            {/* VENUE */}

                            <div className="edit-event-field full">

                                <label htmlFor="edit-venue">

                                    <MapPin
                                        size={14}
                                    />

                                    Venue

                                </label>

                                <input
                                    id="edit-venue"
                                    name="venue"
                                    type="text"
                                    value={
                                        formData.venue
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={saving}
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        DATE / TIME
                        ================================================= */}

                    <section className="edit-event-section">

                        <div className="edit-event-section-header">

                            <div className="edit-event-section-icon">

                                <CalendarDays
                                    size={18}
                                />

                            </div>

                            <div>

                                <h2>
                                    Schedule
                                </h2>

                                <p>
                                    Update event date and
                                    registration deadline.
                                </p>

                            </div>

                        </div>


                        <div className="edit-event-fields">

                            <div className="edit-event-field">

                                <label htmlFor="edit-eventDate">
                                    Event Date
                                </label>

                                <input
                                    id="edit-eventDate"
                                    name="eventDate"
                                    type="datetime-local"
                                    value={
                                        formData.eventDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={saving}
                                />

                            </div>


                            <div className="edit-event-field">

                                <label htmlFor="edit-deadline">
                                    Registration Deadline
                                </label>

                                <input
                                    id="edit-deadline"
                                    name="registrationDeadline"
                                    type="datetime-local"
                                    value={
                                        formData.registrationDeadline
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={saving}
                                />

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        REGISTRATION
                        ================================================= */}

                    <section className="edit-event-section">

                        <div className="edit-event-section-header">

                            <div className="edit-event-section-icon">
                                <Tag size={18} />
                            </div>

                            <div>

                                <h2>
                                    Registration
                                </h2>

                                <p>
                                    Update fee and event
                                    hashtags.
                                </p>

                            </div>

                        </div>


                        <div className="edit-event-fields">

                            {/* FEE */}

                            <div className="edit-event-field">

                                <label htmlFor="edit-fee">
                                    Registration Fee
                                </label>

                                <input
                                    id="edit-fee"
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
                                    disabled={saving}
                                />

                                <small>
                                    Enter 0 for a free event.
                                </small>

                            </div>


                            {/* HASHTAGS */}

                            <div className="edit-event-field">

                                <label htmlFor="edit-hashtag">
                                    Hashtags
                                </label>

                                <div className="edit-event-hashtag-input">

                                    <input
                                        id="edit-hashtag"
                                        type="text"
                                        value={
                                            hashtagInput
                                        }
                                        onChange={(event) =>
                                            setHashtagInput(
                                                event.target.value
                                            )
                                        }
                                        onKeyDown={
                                            handleHashtagKeyDown
                                        }
                                        placeholder="#technology"
                                        disabled={saving}
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            addHashtag
                                        }
                                        disabled={saving}
                                    >
                                        Add
                                    </button>

                                </div>


                                {hashtags.length > 0 && (

                                    <div className="edit-event-tags">

                                        {hashtags.map(
                                            (tag) => (

                                                <span
                                                    key={tag}
                                                    className="edit-event-tag"
                                                >

                                                    #{tag}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeHashtag(
                                                                tag
                                                            )
                                                        }
                                                        disabled={saving}
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
                        BANNER
                        ================================================= */}

                    <section className="edit-event-section">

                        <div className="edit-event-section-header">

                            <div className="edit-event-section-icon">

                                <ImagePlus
                                    size={18}
                                />

                            </div>

                            <div>

                                <h2>
                                    Event Banner
                                </h2>

                                <p>
                                    Update the event banner
                                    image URL.
                                </p>

                            </div>

                        </div>


                        <div className="edit-event-field">

                            <label htmlFor="edit-banner">
                                Banner Image URL
                            </label>

                            <input
                                id="edit-banner"
                                name="bannerImageUrl"
                                type="url"
                                value={
                                    formData.bannerImageUrl
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://example.com/banner.jpg"
                                disabled={saving}
                            />

                        </div>


                        {formData.bannerImageUrl && (

                            <div className="edit-event-preview">

                                <img
                                    src={
                                        formData.bannerImageUrl
                                    }
                                    alt="Event banner preview"
                                    onError={(event) => {
                                        event.currentTarget.style.display =
                                            "none";
                                    }}
                                />

                            </div>

                        )}

                    </section>


                    {/* =================================================
                        STATUS
                        ================================================= */}

                    <section className="edit-event-section">

                        <div className="edit-event-section-header">

                            <div className="edit-event-section-icon">

                                <Tag
                                    size={18}
                                />

                            </div>

                            <div>

                                <h2>
                                    Event Status
                                </h2>

                                <p>
                                    Control whether the
                                    event is available.
                                </p>

                            </div>

                        </div>


                        <div className="edit-event-status-options">

                            <label
                                className={
                                    formData.status ===
                                    "active"
                                        ? "selected"
                                        : ""
                                }
                            >

                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    checked={
                                        formData.status ===
                                        "active"
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
                                />

                                <span>
                                    Active
                                </span>

                                <small>
                                    Event is available
                                    for registration.
                                </small>

                            </label>


                            <label
                                className={
                                    formData.status ===
                                    "closed"
                                        ? "selected"
                                        : ""
                                }
                            >

                                <input
                                    type="radio"
                                    name="status"
                                    value="closed"
                                    checked={
                                        formData.status ===
                                        "closed"
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
                                />

                                <span>
                                    Closed
                                </span>

                                <small>
                                    Registration is
                                    unavailable.
                                </small>

                            </label>

                        </div>

                    </section>


                    {/* =================================================
                        ACTIONS
                        ================================================= */}

                    <div className="edit-event-actions">

                        <button
                            type="button"
                            className="edit-event-cancel"
                            onClick={
                                handleCancel
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="edit-event-submit"
                            disabled={saving}
                        >

                            {saving ? (

                                <>
                                    <span className="edit-event-spinner" />

                                    Saving...
                                </>

                            ) : (

                                <>
                                    <Save
                                        size={17}
                                    />

                                    Save Changes
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </main>
    );
};


export default EditEvent;