import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    IndianRupee,
    Loader2,
    MapPin,
    Ticket,
    Users,
    AlertCircle,
} from "lucide-react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import eventService from "../../services/eventService";
import registrationService from "../../services/registrationService";
import useAuth from "../../hooks/useAuth";

import "./EventRegistration.css";


const EventRegistration = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        phone: "",
        organization: "",
        notes: "",
    });

    /*
     * ---------------------------------------------------------
     * LOAD EVENT
     * ---------------------------------------------------------
     */

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                setError("");

                if (!eventId) {
                    throw new Error("Event ID is missing.");
                }

                const response =
                    await eventService.getEventById(eventId);

                const eventData =
                    response?.data?.event ||
                    response?.event ||
                    response?.data ||
                    response;

                if (!eventData) {
                    throw new Error(
                        "Event information could not be found."
                    );
                }

                setEvent(eventData);

            } catch (err) {
                console.error(
                    "Failed to load event:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load event."
                );
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [eventId]);


    /*
     * ---------------------------------------------------------
     * NORMALIZE EVENT VALUES
     * ---------------------------------------------------------
     */

    const eventPrice = useMemo(() => {
        if (!event) {
            return 0;
        }

        const price =
            event.price ??
            event.registrationFee ??
            event.fee ??
            0;

        const parsed = Number(price);

        return Number.isFinite(parsed)
            ? parsed
            : 0;
    }, [event]);


    const isFree = eventPrice <= 0;


    const eventTitle =
        event?.title ||
        event?.name ||
        "Event";


    const eventImage =
        event?.image ||
        event?.imageUrl ||
        event?.bannerImage ||
        event?.banner ||
        "";


    const eventLocation =
        event?.location ||
        event?.venue ||
        event?.address ||
        "Location not available";


    const eventDate =
        event?.date ||
        event?.eventDate ||
        event?.startDate;


    const eventTime =
        event?.time ||
        event?.eventTime ||
        "";


    const availableSeats =
        event?.availableSeats ??
        event?.remainingSeats ??
        event?.capacity;


    /*
     * ---------------------------------------------------------
     * DATE FORMAT
     * ---------------------------------------------------------
     */

    const formattedDate = useMemo(() => {
        if (!eventDate) {
            return "Date not available";
        }

        const date = new Date(eventDate);

        if (Number.isNaN(date.getTime())) {
            return eventDate;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }, [eventDate]);


    /*
     * ---------------------------------------------------------
     * FORM CHANGE
     * ---------------------------------------------------------
     */

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    /*
     * ---------------------------------------------------------
     * SUBMIT REGISTRATION
     * ---------------------------------------------------------
     */

    const handleSubmit = async (submitEvent) => {
        submitEvent.preventDefault();

        if (!eventId) {
            setError("Event ID is missing.");
            return;
        }

        if (!user) {
            navigate(
                `/login?redirect=/events/${eventId}/register`
            );
            return;
        }

        if (
            event?.isActive === false ||
            event?.status === "closed" ||
            event?.status === "inactive"
        ) {
            setError(
                "Registration for this event is closed."
            );
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const payload = {
                eventId,

                phone:
                    formData.phone.trim(),

                organization:
                    formData.organization.trim(),

                notes:
                    formData.notes.trim(),
            };

            const response =
                await registrationService.createRegistration(
                    payload
                );

            const registration =
                response?.data?.registration ||
                response?.registration ||
                response?.data ||
                null;

            /*
             * Paid event
             *
             * Payment will be handled by the
             * payment page/module.
             */

            if (!isFree) {
                navigate(
                    `/events/${eventId}/payment`,
                    {
                        state: {
                            event,
                            registration,
                            registrationId:
                                registration?._id ||
                                registration?.id,
                        },
                    }
                );

                return;
            }

            /*
             * Free event
             */

            setSuccess(
                "Registration completed successfully."
            );

            setTimeout(() => {
                navigate(
                    "/participant/registrations"
                );
            }, 1000);

        } catch (err) {
            console.error(
                "Event registration failed:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };


    /*
     * ---------------------------------------------------------
     * LOADING
     * ---------------------------------------------------------
     */

    if (loading) {
        return (
            <div className="event-registration-state">

                <Loader2
                    size={34}
                    className="event-registration-spinner"
                />

                <h2>
                    Loading event...
                </h2>

                <p>
                    Please wait while we prepare
                    the registration page.
                </p>

            </div>
        );
    }


    /*
     * ---------------------------------------------------------
     * ERROR / EVENT NOT FOUND
     * ---------------------------------------------------------
     */

    if (error && !event) {
        return (
            <div className="event-registration-state">

                <div className="event-registration-state-icon error">
                    <AlertCircle size={30} />
                </div>

                <h2>
                    Unable to load event
                </h2>

                <p>
                    {error}
                </p>

                <Link
                    to="/events"
                    className="event-registration-back-button"
                >
                    <ArrowLeft size={16} />
                    Back to Events
                </Link>

            </div>
        );
    }


    /*
     * ---------------------------------------------------------
     * PAGE
     * ---------------------------------------------------------
     */

    return (
        <div className="event-registration-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="event-registration-header">

                <Link
                    to={`/events/${eventId}`}
                    className="event-registration-back"
                >
                    <ArrowLeft size={17} />
                    Back to Event
                </Link>

                <div>

                    <span className="event-registration-eyebrow">
                        EVENT REGISTRATION
                    </span>

                    <h1>
                        Register for {eventTitle}
                    </h1>

                    <p>
                        Complete your details below to
                        reserve your place.
                    </p>

                </div>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="event-registration-alert error">

                    <AlertCircle size={19} />

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
                <div className="event-registration-alert success">

                    <CheckCircle2 size={19} />

                    <span>
                        {success}
                    </span>

                </div>
            )}


            <main className="event-registration-layout">


                {/* =================================================
                    EVENT SUMMARY
                ================================================= */}

                <aside className="event-registration-event-card">

                    <div className="event-registration-image">

                        {eventImage ? (
                            <img
                                src={eventImage}
                                alt={eventTitle}
                            />
                        ) : (
                            <div className="event-registration-image-placeholder">
                                <CalendarDays
                                    size={42}
                                />
                            </div>
                        )}

                    </div>


                    <div className="event-registration-event-content">

                        <span className="event-registration-event-label">
                            EVENT
                        </span>

                        <h2>
                            {eventTitle}
                        </h2>


                        <div className="event-registration-event-info">

                            <div>
                                <CalendarDays size={17} />

                                <span>
                                    {formattedDate}
                                </span>
                            </div>


                            {eventTime && (
                                <div>
                                    <Clock3 size={17} />

                                    <span>
                                        {eventTime}
                                    </span>
                                </div>
                            )}


                            <div>
                                <MapPin size={17} />

                                <span>
                                    {eventLocation}
                                </span>
                            </div>


                            {availableSeats !== undefined &&
                                availableSeats !== null && (
                                    <div>
                                        <Users size={17} />

                                        <span>
                                            {availableSeats} seats available
                                        </span>
                                    </div>
                                )}

                        </div>


                        <div className="event-registration-price">

                            <span>
                                Registration Fee
                            </span>

                            <strong>

                                {isFree ? (
                                    "FREE"
                                ) : (
                                    <>
                                        <IndianRupee
                                            size={17}
                                        />

                                        {eventPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </>
                                )}

                            </strong>

                        </div>

                    </div>

                </aside>


                {/* =================================================
                    REGISTRATION FORM
                ================================================= */}

                <section className="event-registration-form-card">

                    <div className="event-registration-form-heading">

                        <div className="event-registration-form-icon">
                            <Ticket size={21} />
                        </div>

                        <div>

                            <h2>
                                Your Details
                            </h2>

                            <p>
                                Enter the information required
                                for your registration.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="event-registration-form"
                    >

                        {/* NAME */}

                        <div className="event-registration-field">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={
                                    user?.name ||
                                    user?.fullName ||
                                    ""
                                }
                                disabled
                            />

                            <small>
                                Your name is taken from
                                your EventSphere account.
                            </small>

                        </div>


                        {/* EMAIL */}

                        <div className="event-registration-field">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={
                                    user?.email ||
                                    ""
                                }
                                disabled
                            />

                        </div>


                        {/* PHONE */}

                        <div className="event-registration-field">

                            <label htmlFor="phone">
                                Phone Number
                                <span>*</span>
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter your phone number"
                                maxLength={15}
                                required
                            />

                        </div>


                        {/* ORGANIZATION */}

                        <div className="event-registration-field">

                            <label htmlFor="organization">
                                College / Organization
                            </label>

                            <input
                                id="organization"
                                name="organization"
                                type="text"
                                value={
                                    formData.organization
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter college or organization"
                                maxLength={150}
                            />

                        </div>


                        {/* NOTES */}

                        <div className="event-registration-field full">

                            <label htmlFor="notes">
                                Additional Information
                            </label>

                            <textarea
                                id="notes"
                                name="notes"
                                value={
                                    formData.notes
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Any additional information..."
                                rows={4}
                                maxLength={500}
                            />

                            <small>
                                Optional. Maximum 500 characters.
                            </small>

                        </div>


                        {/* CONFIRMATION */}

                        <div className="event-registration-confirmation">

                            <CheckCircle2 size={18} />

                            <p>
                                By registering, you confirm
                                that the information provided
                                is accurate and you agree to
                                the event registration terms.
                            </p>

                        </div>


                        {/* SUBMIT */}

                        <div className="event-registration-actions">

                            <Link
                                to={`/events/${eventId}`}
                                className="event-registration-cancel"
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                className="event-registration-submit"
                                disabled={
                                    submitting ||
                                    event?.isActive === false ||
                                    event?.status === "closed"
                                }
                            >

                                {submitting ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="event-registration-spinner"
                                        />

                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Ticket size={17} />

                                        {isFree
                                            ? "Confirm Registration"
                                            : "Continue to Payment"}
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
};


export default EventRegistration;