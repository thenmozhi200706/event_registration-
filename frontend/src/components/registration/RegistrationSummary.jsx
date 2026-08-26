import React from "react";
import {
    CalendarDays,
    MapPin,
    User,
    Mail,
    Phone,
    School,
    GraduationCap,
    IndianRupee,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

import "./RegistrationSummary.css";


const RegistrationSummary = ({
    event,
    registrationData,
    onContinue,
    onBack,
    loading = false,
}) => {

    /*
     * =========================================================
     * EVENT INFORMATION
     * =========================================================
     */

    const eventTitle =
        event?.title ||
        "Selected Event";

    const eventVenue =
        event?.venue ||
        "Venue not available";

    const eventDate =
        event?.eventDate ||
        event?.date;

    const registrationFee = Number(
        event?.registrationFee ||
        event?.fee ||
        0
    );

    const isFreeEvent =
        registrationFee <= 0;


    /*
     * =========================================================
     * FORMAT EVENT DATE
     * =========================================================
     */

    const formattedDate = eventDate
        ? new Date(eventDate).toLocaleDateString(
              "en-IN",
              {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              }
          )
        : "Date not available";


    /*
     * =========================================================
     * PARTICIPANT INFORMATION
     * =========================================================
     */

    const fullName = [
        registrationData?.firstName,
        registrationData?.lastName,
    ]
        .filter(Boolean)
        .join(" ");


    /*
     * =========================================================
     * SAFE CONTINUE
     * =========================================================
     */

    const handleContinue = () => {

        if (
            typeof onContinue ===
            "function"
        ) {
            onContinue();
        }
    };


    /*
     * =========================================================
     * SAFE BACK
     * =========================================================
     */

    const handleBack = () => {

        if (
            typeof onBack ===
            "function"
        ) {
            onBack();
        }
    };


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="registration-summary">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="registration-summary-header">

                <div>

                    <span className="registration-summary-eyebrow">
                        REVIEW REGISTRATION
                    </span>

                    <h2>
                        Confirm your details
                    </h2>

                    <p>
                        Please check the information
                        below before continuing.
                    </p>

                </div>


                <div className="registration-summary-check">

                    <CheckCircle2
                        size={24}
                    />

                </div>

            </div>


            {/* =================================================
                EVENT CARD
            ================================================= */}

            <section className="registration-summary-section">

                <div className="registration-summary-section-heading">

                    <CalendarDays
                        size={19}
                    />

                    <div>

                        <h3>
                            Event Details
                        </h3>

                        <p>
                            Your selected event
                        </p>

                    </div>

                </div>


                <div className="registration-summary-event">

                    {event?.bannerImageUrl && (

                        <div className="registration-summary-event-image">

                            <img
                                src={
                                    event.bannerImageUrl
                                }
                                alt={
                                    eventTitle
                                }
                            />

                        </div>
                    )}


                    <div className="registration-summary-event-content">

                        <span>
                            EVENT
                        </span>

                        <h4>
                            {eventTitle}
                        </h4>


                        <div className="registration-summary-event-meta">

                            <div>

                                <CalendarDays
                                    size={15}
                                />

                                <span>
                                    {formattedDate}
                                </span>

                            </div>


                            <div>

                                <MapPin
                                    size={15}
                                />

                                <span>
                                    {eventVenue}
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                PARTICIPANT DETAILS
            ================================================= */}

            <section className="registration-summary-section">

                <div className="registration-summary-section-heading">

                    <User
                        size={19}
                    />

                    <div>

                        <h3>
                            Participant Details
                        </h3>

                        <p>
                            Information used for
                            this registration
                        </p>

                    </div>

                </div>


                <div className="registration-summary-details-grid">

                    {/* Name */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <User
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {fullName ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>


                    {/* Age */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <User
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                Age
                            </span>

                            <strong>
                                {registrationData?.age ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>


                    {/* Email */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <Mail
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                Email
                            </span>

                            <strong>
                                {registrationData?.email ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>


                    {/* WhatsApp */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <Phone
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                WhatsApp
                            </span>

                            <strong>
                                {registrationData?.whatsappNumber ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>


                    {/* Institute */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <School
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                Institute
                            </span>

                            <strong>
                                {registrationData?.instituteName ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>


                    {/* Department */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <GraduationCap
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                Department
                            </span>

                            <strong>
                                {registrationData?.department ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>


                    {/* Year */}

                    <div className="registration-summary-detail">

                        <div className="registration-summary-detail-icon">
                            <CalendarDays
                                size={16}
                            />
                        </div>

                        <div>

                            <span>
                                Academic Year
                            </span>

                            <strong>
                                {registrationData?.year ||
                                    "Not provided"}
                            </strong>

                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                PAYMENT SUMMARY
            ================================================= */}

            <section className="registration-summary-payment">

                <div>

                    <span className="registration-summary-payment-label">
                        REGISTRATION FEE
                    </span>

                    <div className="registration-summary-payment-amount">

                        <IndianRupee
                            size={21}
                        />

                        <strong>
                            {registrationFee.toFixed(
                                2
                            )}
                        </strong>

                    </div>

                </div>


                <div
                    className={
                        isFreeEvent
                            ? "registration-summary-payment-status free"
                            : "registration-summary-payment-status"
                    }
                >

                    <CheckCircle2
                        size={16}
                    />

                    <span>
                        {isFreeEvent
                            ? "Free Event"
                            : "Payment Required"}
                    </span>

                </div>

            </section>


            {/* =================================================
                IMPORTANT NOTE
            ================================================= */}

            <div className="registration-summary-note">

                <CheckCircle2
                    size={17}
                />

                <p>

                    {isFreeEvent ? (
                        <>
                            This event is free.
                            Confirm your details
                            to complete registration.
                        </>
                    ) : (
                        <>
                            After confirming your
                            details, you will proceed
                            to the secure payment step.
                        </>
                    )}

                </p>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="registration-summary-actions">

                <button
                    type="button"
                    className="registration-summary-back-button"
                    onClick={handleBack}
                    disabled={loading}
                >
                    Back
                </button>


                <button
                    type="button"
                    className="registration-summary-continue-button"
                    onClick={handleContinue}
                    disabled={loading}
                >

                    {loading ? (
                        <>
                            <span className="registration-summary-spinner" />

                            Processing...
                        </>
                    ) : (
                        <>
                            {isFreeEvent
                                ? "Complete Registration"
                                : "Proceed to Payment"}

                            <ArrowRight
                                size={17}
                            />
                        </>
                    )}

                </button>

            </div>

        </div>
    );
};


export default RegistrationSummary;