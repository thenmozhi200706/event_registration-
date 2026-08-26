// frontend/src/pages/participant/RegistrationSuccess.jsx

import React from "react";

import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Home,
    MapPin,
    Ticket,
} from "lucide-react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import "./RegistrationSuccess.css";


const RegistrationSuccess = () => {

    const location = useLocation();

    const navigate = useNavigate();


    /*
     * =========================================================
     * DATA FROM REGISTRATION FLOW
     * =========================================================
     *
     * Expected navigation:
     *
     * navigate("/registration/success", {
     *     state: {
     *         registration,
     *         event,
     *         payment
     *     }
     * });
     */

    const registration =
        location.state?.registration || null;

    const event =
        location.state?.event || null;

    const payment =
        location.state?.payment || null;


    /*
     * =========================================================
     * REGISTRATION ID
     * =========================================================
     */

    const registrationId =
        registration?._id ||
        registration?.id ||
        "";


    /*
     * =========================================================
     * TICKET ID
     * =========================================================
     */

    const ticketId =
        registration?.ticketId ||
        "";


    /*
     * =========================================================
     * EVENT DETAILS
     * =========================================================
     */

    const eventTitle =
        event?.title ||
        registration?.eventId?.title ||
        "EventSphere Event";


    const eventVenue =
        event?.venue ||
        registration?.eventId?.venue ||
        "Venue will be announced";


    const eventDate =
        event?.eventDate ||
        registration?.eventId?.eventDate ||
        null;


    /*
     * =========================================================
     * FORMAT EVENT DATE
     * =========================================================
     */

    const formattedEventDate =
        eventDate
            ? new Date(
                  eventDate
              ).toLocaleDateString(
                  "en-IN",
                  {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                  }
              )
            : "Date not available";


    /*
     * =========================================================
     * PARTICIPANT NAME
     * =========================================================
     */

    const participantName =
        [
            registration?.firstName,
            registration?.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        "Participant";


    /*
     * =========================================================
     * PAYMENT STATUS
     * =========================================================
     */

    const paymentStatus =
        payment?.status ||
        registration?.paymentStatus ||
        "confirmed";


    /*
     * =========================================================
     * AMOUNT
     * =========================================================
     */

    const amount = Number(
        payment?.amount ||
        registration?.amount ||
        0
    );


    /*
     * =========================================================
     * GO TO TICKET
     * =========================================================
     */

    const handleViewTicket = () => {

        if (registrationId) {

            navigate(
                `/participant/payment/${registrationId}/success`,
                {
                    state: {
                        registration,
                        event,
                        payment,
                    },
                }
            );

            return;
        }


        navigate(
            "/dashboard"
        );
    };


    /*
     * =========================================================
     * EMPTY STATE
     * =========================================================
     *
     * If this page was opened directly without
     * registration information.
     */

    if (
        !registration &&
        !event
    ) {

        return (
            <div className="registration-success-page">

                <main className="registration-success-empty">

                    <div className="registration-success-empty-icon">

                        <Ticket
                            size={30}
                        />

                    </div>


                    <h1>
                        Registration Details
                    </h1>


                    <p>
                        No registration information
                        was provided for this page.
                    </p>


                    <Link
                        to="/dashboard"
                        className="registration-success-dashboard-button"
                    >
                        <Home
                            size={16}
                        />

                        Go to Dashboard

                    </Link>

                </main>

            </div>
        );
    }


    /*
     * =========================================================
     * MAIN
     * =========================================================
     */

    return (
        <div className="registration-success-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="registration-success-header">

                <div className="registration-success-header-inner">

                    <Link
                        to="/dashboard"
                        className="registration-success-brand"
                    >

                        <div className="registration-success-logo">

                            <CalendarDays
                                size={17}
                            />

                        </div>

                        <strong>
                            EventSphere
                        </strong>

                    </Link>


                    <Link
                        to="/dashboard"
                        className="registration-success-header-dashboard"
                    >

                        <Home
                            size={15}
                        />

                        Dashboard

                    </Link>

                </div>

            </header>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="registration-success-content">


                {/* =============================================
                    SUCCESS MESSAGE
                ============================================= */}

                <section className="registration-success-hero">

                    <div className="registration-success-icon">

                        <CheckCircle2
                            size={42}
                        />

                    </div>


                    <span className="registration-success-label">
                        REGISTRATION SUCCESSFUL
                    </span>


                    <h1>
                        You're Registered!
                    </h1>


                    <p>
                        Your registration for{" "}
                        <strong>
                            {eventTitle}
                        </strong>{" "}
                        has been successfully
                        completed.
                    </p>

                </section>


                {/* =============================================
                    EVENT CARD
                ============================================= */}

                <section className="registration-success-event-card">

                    <div className="registration-success-event-header">

                        <div>

                            <span>
                                EVENT
                            </span>

                            <h2>
                                {eventTitle}
                            </h2>

                        </div>


                        <div className="registration-success-event-status">

                            <CheckCircle2
                                size={14}
                            />

                            Confirmed

                        </div>

                    </div>


                    <div className="registration-success-event-details">


                        {/* Date */}

                        <div>

                            <CalendarDays
                                size={18}
                            />

                            <div>

                                <span>
                                    Event Date
                                </span>

                                <strong>
                                    {formattedEventDate}
                                </strong>

                            </div>

                        </div>


                        {/* Venue */}

                        <div>

                            <MapPin
                                size={18}
                            />

                            <div>

                                <span>
                                    Venue
                                </span>

                                <strong>
                                    {eventVenue}
                                </strong>

                            </div>

                        </div>


                        {/* Participant */}

                        <div>

                            <Ticket
                                size={18}
                            />

                            <div>

                                <span>
                                    Participant
                                </span>

                                <strong>
                                    {participantName}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =============================================
                    REGISTRATION INFORMATION
                ============================================= */}

                <section className="registration-success-info-card">

                    <div className="registration-success-info-header">

                        <div>

                            <span>
                                REGISTRATION DETAILS
                            </span>

                            <h2>
                                Confirmation
                            </h2>

                        </div>

                    </div>


                    <div className="registration-success-info-grid">


                        {/* Registration ID */}

                        <div>

                            <span>
                                Registration ID
                            </span>

                            <strong>
                                {registrationId ||
                                    "Available in dashboard"}
                            </strong>

                        </div>


                        {/* Ticket ID */}

                        <div>

                            <span>
                                Ticket ID
                            </span>

                            <strong>
                                {ticketId ||
                                    "Will be generated after payment verification"}
                            </strong>

                        </div>


                        {/* Payment status */}

                        <div>

                            <span>
                                Payment Status
                            </span>

                            <strong className="registration-success-paid">

                                <CheckCircle2
                                    size={14}
                                />

                                {paymentStatus === "paid"
                                    ? "Paid"
                                    : paymentStatus}

                            </strong>

                        </div>


                        {/* Amount */}

                        <div>

                            <span>
                                Registration Amount
                            </span>

                            <strong>
                                ₹
                                {amount.toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2,
                                    }
                                )}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =============================================
                    ACTIONS
                ============================================= */}

                <div className="registration-success-actions">

                    <button
                        type="button"
                        className="registration-success-primary"
                        onClick={
                            handleViewTicket
                        }
                    >

                        <Ticket
                            size={17}
                        />

                        View Ticket

                        <ArrowRight
                            size={16}
                        />

                    </button>


                    <Link
                        to="/dashboard"
                        className="registration-success-secondary"
                    >

                        <Home
                            size={16}
                        />

                        Go to Dashboard

                    </Link>

                </div>


                {/* =============================================
                    INFORMATION NOTE
                ============================================= */}

                <div className="registration-success-note">

                    <CheckCircle2
                        size={15}
                    />

                    <p>
                        Keep your registration and
                        ticket details safe. You may
                        need them when attending the
                        event.
                    </p>

                </div>

            </main>

        </div>
    );
};


export default RegistrationSuccess;