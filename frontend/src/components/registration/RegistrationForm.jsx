import React, { useMemo, useState } from "react";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    IndianRupee,
    Mail,
    Phone,
    School,
    Send,
    User,
} from "lucide-react";

import registrationService from "../../services/registrationService";

import "./RegistrationForm.css";


const RegistrationForm = ({
    event,
    onSuccess,
    onCancel,
}) => {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        age: "",
        whatsappNumber: "",
        email: "",
        instituteName: "",
        department: "",
        year: "",
    });

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    const [serverError, setServerError] = useState("");

    const [successMessage, setSuccessMessage] = useState("");


    /*
     * ---------------------------------------------------------
     * EVENT FEE
     * ---------------------------------------------------------
     */

    const registrationFee = useMemo(() => {
        return Number(
            event?.registrationFee ||
            event?.fee ||
            0
        );
    }, [event]);


    const isFreeEvent = registrationFee <= 0;


    /*
     * ---------------------------------------------------------
     * HANDLE INPUT
     * ---------------------------------------------------------
     */

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        /*
         * Remove field error
         * when user starts correcting it.
         */

        if (errors[name]) {

            setErrors((previous) => ({
                ...previous,
                [name]: "",
            }));
        }

        /*
         * Remove server error
         * when user changes form.
         */

        if (serverError) {
            setServerError("");
        }
    };


    /*
     * ---------------------------------------------------------
     * VALIDATE FORM
     * ---------------------------------------------------------
     */

    const validate = () => {

        const nextErrors = {};

        const firstName =
            formData.firstName.trim();

        const lastName =
            formData.lastName.trim();

        const email =
            formData.email.trim();

        const whatsapp =
            formData.whatsappNumber.trim();

        const institute =
            formData.instituteName.trim();

        const department =
            formData.department.trim();

        const year =
            formData.year.trim();

        const age =
            Number(formData.age);


        if (!firstName) {
            nextErrors.firstName =
                "First name is required.";
        }

        if (!lastName) {
            nextErrors.lastName =
                "Last name is required.";
        }


        if (!formData.age) {

            nextErrors.age =
                "Age is required.";

        } else if (
            !Number.isInteger(age) ||
            age < 1 ||
            age > 120
        ) {

            nextErrors.age =
                "Enter a valid age between 1 and 120.";
        }


        if (!whatsapp) {

            nextErrors.whatsappNumber =
                "WhatsApp number is required.";

        } else if (
            !/^[0-9+\-\s()]{7,20}$/.test(
                whatsapp
            )
        ) {

            nextErrors.whatsappNumber =
                "Enter a valid WhatsApp number.";
        }


        if (!email) {

            nextErrors.email =
                "Email address is required.";

        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            nextErrors.email =
                "Enter a valid email address.";
        }


        if (!institute) {
            nextErrors.instituteName =
                "Institute name is required.";
        }


        if (!department) {
            nextErrors.department =
                "Department is required.";
        }


        if (!year) {
            nextErrors.year =
                "Academic year is required.";
        }


        setErrors(nextErrors);

        return (
            Object.keys(nextErrors).length === 0
        );
    };


    /*
     * ---------------------------------------------------------
     * SUBMIT REGISTRATION
     * ---------------------------------------------------------
     */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setServerError("");
        setSuccessMessage("");


        const isValid = validate();

        if (!isValid) {
            return;
        }


        /*
         * Event ID is required.
         */

        const eventId =
            event?._id ||
            event?.id;


        if (!eventId) {

            setServerError(
                "Event information is missing. Please reopen the event and try again."
            );

            return;
        }


        try {

            setLoading(true);


            /*
             * Prepare registration payload.
             */

            const payload = {
                eventId,

                firstName:
                    formData.firstName.trim(),

                lastName:
                    formData.lastName.trim(),

                age:
                    Number(formData.age),

                whatsappNumber:
                    formData.whatsappNumber.trim(),

                email:
                    formData.email.trim().toLowerCase(),

                instituteName:
                    formData.instituteName.trim(),

                department:
                    formData.department.trim(),

                year:
                    formData.year.trim(),

                /*
                 * Backend determines the actual
                 * payment flow based on event fee.
                 */

                paymentMethod:
                    isFreeEvent
                        ? "free"
                        : "gateway",

                amount:
                    registrationFee,
            };


            /*
             * Create registration.
             */

            const response =
                await registrationService.createRegistration(
                    payload
                );


            /*
             * API may return:
             *
             * response.data
             * OR
             * response
             */

            const data =
                response?.data ||
                response;


            if (
                data?.success === false
            ) {

                throw new Error(
                    data?.message ||
                    "Registration failed."
                );
            }


            /*
             * Registration successful.
             */

            setSuccessMessage(
                data?.message ||
                "Registration created successfully."
            );


            /*
             * Send response to parent.
             */

            if (onSuccess) {

                onSuccess(data);
            }


        } catch (error) {

            console.error(
                "Registration failed:",
                error
            );


            const message =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Unable to complete registration. Please try again.";


            setServerError(message);

        } finally {

            setLoading(false);
        }
    };


    /*
     * ---------------------------------------------------------
     * SUCCESS STATE
     * ---------------------------------------------------------
     */

    if (successMessage) {

        return (
            <div className="registration-form">

                <div
                    style={{
                        minHeight: "320px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: "20px",
                    }}
                >

                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "18px",
                            color: "#027a48",
                            background: "#ecfdf3",
                            borderRadius: "50%",
                        }}
                    >
                        <CheckCircle2
                            size={34}
                        />
                    </div>


                    <h2
                        style={{
                            margin: "0 0 10px",
                            color: "#101828",
                        }}
                    >
                        Registration Successful
                    </h2>


                    <p
                        style={{
                            maxWidth: "500px",
                            margin: "0 0 24px",
                            color: "#667085",
                            lineHeight: 1.6,
                        }}
                    >
                        {successMessage}
                    </p>


                    <button
                        type="button"
                        className="registration-submit-button"
                        onClick={() => {

                            if (onSuccess) {
                                onSuccess();
                            }
                        }}
                    >
                        Continue
                        <CheckCircle2
                            size={17}
                        />
                    </button>

                </div>

            </div>
        );
    }


    /*
     * ---------------------------------------------------------
     * FORM
     * ---------------------------------------------------------
     */

    return (
        <form
            className="registration-form"
            onSubmit={handleSubmit}
            noValidate
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="registration-form-header">

                <div>

                    <span className="registration-form-eyebrow">
                        EVENT REGISTRATION
                    </span>

                    <h2>
                        Register for this event
                    </h2>

                    <p>
                        Enter your details below to
                        complete your EventSphere
                        registration.
                    </p>

                </div>


                <div className="registration-form-status-icon">

                    <CalendarDays
                        size={22}
                    />

                </div>

            </div>


            {/* =================================================
                SERVER ERROR
            ================================================= */}

            {serverError && (

                <div className="registration-form-server-error">

                    <AlertCircle
                        size={18}
                    />

                    <div>

                        <strong>
                            Registration failed
                        </strong>

                        <span>
                            {serverError}
                        </span>

                    </div>

                </div>
            )}


            {/* =================================================
                EVENT INFORMATION
            ================================================= */}

            <div className="registration-form-section">

                <div className="registration-section-heading">

                    <CalendarDays
                        size={19}
                    />

                    <div>

                        <h3>
                            Event
                        </h3>

                        <p>
                            You are registering for
                            the following event.
                        </p>

                    </div>

                </div>


                <div className="registration-form-note">

                    <CalendarDays
                        size={17}
                    />

                    <p>

                        <strong>
                            {event?.title ||
                                "Selected Event"}
                        </strong>

                        {event?.venue
                            ? ` — ${event.venue}`
                            : ""}

                        {" • "}

                        {isFreeEvent
                            ? "Free registration"
                            : `Registration fee: ₹${registrationFee.toFixed(2)}`}

                    </p>

                </div>

            </div>


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <div className="registration-form-section">

                <div className="registration-section-heading">

                    <User
                        size={19}
                    />

                    <div>

                        <h3>
                            Personal Information
                        </h3>

                        <p>
                            Provide your basic
                            participant details.
                        </p>

                    </div>

                </div>


                <div className="registration-form-grid">

                    {/* First Name */}

                    <div className="registration-field">

                        <label htmlFor="firstName">
                            First Name
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <User
                                size={17}
                            />

                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={
                                    formData.firstName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter first name"
                                className={`registration-input ${
                                    errors.firstName
                                        ? "has-error"
                                        : ""
                                }`}
                                autoComplete="given-name"
                            />

                        </div>

                        {errors.firstName && (
                            <span className="registration-field-error">
                                {errors.firstName}
                            </span>
                        )}

                    </div>


                    {/* Last Name */}

                    <div className="registration-field">

                        <label htmlFor="lastName">
                            Last Name
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <User
                                size={17}
                            />

                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={
                                    formData.lastName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter last name"
                                className={`registration-input ${
                                    errors.lastName
                                        ? "has-error"
                                        : ""
                                }`}
                                autoComplete="family-name"
                            />

                        </div>

                        {errors.lastName && (
                            <span className="registration-field-error">
                                {errors.lastName}
                            </span>
                        )}

                    </div>


                    {/* Age */}

                    <div className="registration-field">

                        <label htmlFor="age">
                            Age
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <User
                                size={17}
                            />

                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="1"
                                max="120"
                                value={
                                    formData.age
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter age"
                                className={`registration-input ${
                                    errors.age
                                        ? "has-error"
                                        : ""
                                }`}
                            />

                        </div>

                        {errors.age && (
                            <span className="registration-field-error">
                                {errors.age}
                            </span>
                        )}

                    </div>


                    {/* WhatsApp */}

                    <div className="registration-field">

                        <label htmlFor="whatsappNumber">
                            WhatsApp Number
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <Phone
                                size={17}
                            />

                            <input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                type="tel"
                                value={
                                    formData.whatsappNumber
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="+91 9876543210"
                                className={`registration-input ${
                                    errors.whatsappNumber
                                        ? "has-error"
                                        : ""
                                }`}
                                autoComplete="tel"
                            />

                        </div>

                        {errors.whatsappNumber && (
                            <span className="registration-field-error">
                                {errors.whatsappNumber}
                            </span>
                        )}

                    </div>


                    {/* Email */}

                    <div className="registration-field full-width">

                        <label htmlFor="email">
                            Email Address
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <Mail
                                size={17}
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={
                                    formData.email
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="you@example.com"
                                className={`registration-input ${
                                    errors.email
                                        ? "has-error"
                                        : ""
                                }`}
                                autoComplete="email"
                            />

                        </div>

                        {errors.email && (
                            <span className="registration-field-error">
                                {errors.email}
                            </span>
                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                ACADEMIC INFORMATION
            ================================================= */}

            <div className="registration-form-section">

                <div className="registration-section-heading">

                    <School
                        size={19}
                    />

                    <div>

                        <h3>
                            Academic Information
                        </h3>

                        <p>
                            Enter your institute and
                            academic details.
                        </p>

                    </div>

                </div>


                <div className="registration-form-grid">

                    {/* Institute */}

                    <div className="registration-field full-width">

                        <label htmlFor="instituteName">
                            Institute / College
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <School
                                size={17}
                            />

                            <input
                                id="instituteName"
                                name="instituteName"
                                type="text"
                                value={
                                    formData.instituteName
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter institute or college name"
                                className={`registration-input ${
                                    errors.instituteName
                                        ? "has-error"
                                        : ""
                                }`}
                            />

                        </div>

                        {errors.instituteName && (
                            <span className="registration-field-error">
                                {errors.instituteName}
                            </span>
                        )}

                    </div>


                    {/* Department */}

                    <div className="registration-field">

                        <label htmlFor="department">
                            Department
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <School
                                size={17}
                            />

                            <input
                                id="department"
                                name="department"
                                type="text"
                                value={
                                    formData.department
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="e.g. CSE"
                                className={`registration-input ${
                                    errors.department
                                        ? "has-error"
                                        : ""
                                }`}
                            />

                        </div>

                        {errors.department && (
                            <span className="registration-field-error">
                                {errors.department}
                            </span>
                        )}

                    </div>


                    {/* Academic Year */}

                    <div className="registration-field">

                        <label htmlFor="year">
                            Academic Year
                            <span>*</span>
                        </label>

                        <div className="registration-input-wrapper">

                            <CalendarDays
                                size={17}
                            />

                            <select
                                id="year"
                                name="year"
                                value={
                                    formData.year
                                }
                                onChange={
                                    handleChange
                                }
                                className={`registration-input ${
                                    errors.year
                                        ? "has-error"
                                        : ""
                                }`}
                            >

                                <option value="">
                                    Select academic year
                                </option>

                                <option value="1st Year">
                                    1st Year
                                </option>

                                <option value="2nd Year">
                                    2nd Year
                                </option>

                                <option value="3rd Year">
                                    3rd Year
                                </option>

                                <option value="4th Year">
                                    4th Year
                                </option>

                                <option value="5th Year">
                                    5th Year
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>

                        {errors.year && (
                            <span className="registration-field-error">
                                {errors.year}
                            </span>
                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                PAYMENT INFORMATION
            ================================================= */}

            <div className="registration-form-section">

                <div className="registration-section-heading">

                    <IndianRupee
                        size={19}
                    />

                    <div>

                        <h3>
                            Registration & Payment
                        </h3>

                        <p>
                            Review the registration
                            amount before submitting.
                        </p>

                    </div>

                </div>


                <div className="registration-form-note">

                    <IndianRupee
                        size={17}
                    />

                    <p>

                        {isFreeEvent ? (

                            <>
                                This is a
                                <strong>
                                    {" free event"}
                                </strong>
                                . No payment is
                                required.
                            </>

                        ) : (

                            <>
                                Registration fee:
                                <strong>
                                    {" ₹"}
                                    {registrationFee.toFixed(
                                        2
                                    )}
                                </strong>
                                . You will continue to
                                the payment process
                                after registration.
                            </>
                        )}

                    </p>

                </div>

            </div>


            {/* =================================================
                GENERAL NOTE
            ================================================= */}

            <div className="registration-form-note">

                <AlertCircle
                    size={17}
                />

                <p>
                    Please make sure all information
                    is correct. Your registration
                    details will be associated with
                    your EventSphere account.
                </p>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="registration-form-actions">

                {onCancel && (

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            marginRight: "12px",
                            minHeight: "48px",
                            padding: "0 20px",
                            color: "#344054",
                            background: "#ffffff",
                            border: "1px solid #d0d5dd",
                            borderRadius: "11px",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            fontFamily: "inherit",
                            fontSize: "14px",
                            fontWeight: 650,
                        }}
                    >
                        Cancel
                    </button>
                )}


                <button
                    type="submit"
                    className="registration-submit-button"
                    disabled={loading}
                >

                    {loading ? (

                        <>
                            <span className="registration-spinner"></span>

                            Processing...
                        </>

                    ) : (

                        <>
                            {isFreeEvent
                                ? "Complete Registration"
                                : "Continue to Payment"}

                            <Send
                                size={17}
                            />
                        </>
                    )}

                </button>

            </div>

        </form>
    );
};


export default RegistrationForm;