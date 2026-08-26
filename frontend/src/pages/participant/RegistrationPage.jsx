import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarDays,
    MapPin,
    IndianRupee,
    Loader2,
    AlertCircle,
} from "lucide-react";

import eventService from "../../services/eventService";
import RegistrationForm from "../../components/registration/RegistrationForm";

import "./RegistrationPage.css";


const RegistrationPage = () => {
    const { eventId } = useParams();

    const navigate = useNavigate();

    const [event, setEvent] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /*
     * =========================================================
     * LOAD EVENT
     * =========================================================
     */

    useEffect(() => {
        const loadEvent = async () => {
            if (!eventId) {
                setError("Event ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response =
                    await eventService.getEventById(eventId);

                const data =
                    response?.data ||
                    response;

                const loadedEvent =
                    data?.event ||
                    data?.data ||
                    data;

                if (!loadedEvent) {
                    throw new Error(
                        "Event information was not found."
                    );
                }

                setEvent(loadedEvent);
            } catch (err) {
                console.error(
                    "Failed to load event:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load event details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [eventId]);


    /*
     * =========================================================
     * REGISTRATION SUCCESS
     * =========================================================
     */

    const handleRegistrationSuccess = (
        response
    ) => {
        /*
         * If payment is required, go to
         * the payment page.
         */

        const registration =
            response?.registration ||
            response?.data?.registration;

        const paymentRequired =
            response?.paymentRequired ??
            response?.data?.paymentRequired;

        if (paymentRequired) {

            /*
             * Make sure we have a registration ID
             * before navigating to payment.
             */

            const registrationId =
                registration?._id ||
                registration?.id ||
                "";

            if (!registrationId) {
                console.error(
                    "Payment required but registration ID is missing:",
                    response
                );

                setError(
                    "Registration was created, but the registration ID was not received. Please try again."
                );

                return;
            }

            /*
             * IMPORTANT:
             *
             * App.jsx route is:
             *
             * /payment/:registrationId
             *
             * NOT:
             *
             * /participant/payment/:registrationId
             */

            navigate(
                `/payment/${registrationId}`,
                {
                    state: {
                        registration,
                        event,
                        response,
                    },
                }
            );

            return;
        }

        /*
         * Free event / completed registration.
         */

        navigate("/dashboard");
    };


    /*
     * =========================================================
     * LOADING
     * =========================================================
     */

    if (loading) {
        return (
            <div className="registration-page">

                <div className="registration-page-loading">

                    <Loader2
                        size={34}
                        className="registration-page-spinner"
                    />

                    <h2>
                        Loading event...
                    </h2>

                    <p>
                        Please wait while we fetch
                        the event details.
                    </p>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * ERROR
     * =========================================================
     */

    if (error || !event) {
        return (
            <div className="registration-page">

                <div className="registration-page-error">

                    <div className="registration-page-error-icon">
                        <AlertCircle
                            size={28}
                        />
                    </div>

                    <h2>
                        Unable to load event
                    </h2>

                    <p>
                        {error ||
                            "The requested event could not be found."}
                    </p>

                    <div className="registration-page-error-actions">

                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="registration-page-secondary-button"
                        >
                            <ArrowLeft
                                size={16}
                            />

                            Go Back
                        </button>

                        <Link
                            to="/events"
                            className="registration-page-primary-button"
                        >
                            Browse Events
                        </Link>

                    </div>

                </div>

            </div>
        );
    }


    /*
     * =========================================================
     * EVENT INFORMATION
     * =========================================================
     */

    const fee = Number(
        event.registrationFee ||
        event.fee ||
        0
    );

    const eventDate =
        event.eventDate ||
        event.date;

    const formattedDate = eventDate
        ? new Date(eventDate).toLocaleDateString(
              "en-IN",
              {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              }
          )
        : "Date not available";


    /*
     * =========================================================
     * PAGE
     * =========================================================
     */

    return (
        <div className="registration-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <header className="registration-page-header">

                <div className="registration-page-header-inner">

                    <Link
                        to={`/events/${eventId}`}
                        className="registration-back-link"
                    >
                        <ArrowLeft
                            size={17}
                        />

                        Back to Event
                    </Link>

                    <div>

                        <span className="registration-page-eyebrow">
                            EVENTSPHERE
                        </span>

                        <h1>
                            Event Registration
                        </h1>

                        <p>
                            Complete your details to
                            register for this event.
                        </p>

                    </div>

                </div>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="registration-page-content">

                {/* =============================================
                    EVENT SUMMARY
                ============================================= */}

                <section className="registration-event-summary">

                    {event.bannerImageUrl && (

                        <div className="registration-event-image">

                            <img
                                src={
                                    event.bannerImageUrl
                                }
                                alt={
                                    event.title ||
                                    "Event"
                                }
                            />

                        </div>
                    )}


                    <div className="registration-event-info">

                        <span className="registration-event-label">
                            REGISTERING FOR
                        </span>

                        <h2>
                            {event.title ||
                                "Event"}
                        </h2>


                        <div className="registration-event-meta">

                            <div>
                                <CalendarDays
                                    size={16}
                                />

                                <span>
                                    {formattedDate}
                                </span>
                            </div>


                            <div>
                                <MapPin
                                    size={16}
                                />

                                <span>
                                    {event.venue ||
                                        "Venue not available"}
                                </span>
                            </div>


                            <div>
                                <IndianRupee
                                    size={16}
                                />

                                <span>
                                    {fee > 0
                                        ? `₹${fee.toFixed(
                                              2
                                          )}`
                                        : "Free"}
                                </span>
                            </div>

                        </div>

                    </div>

                </section>


                {/* =============================================
                    REGISTRATION FORM
                ============================================= */}

                <section className="registration-page-form-section">

                    <RegistrationForm
                        event={event}
                        onSuccess={
                            handleRegistrationSuccess
                        }
                        onCancel={() =>
                            navigate(
                                `/events/${eventId}`
                            )
                        }
                    />

                </section>

            </main>

        </div>
    );
};


export default RegistrationPage;