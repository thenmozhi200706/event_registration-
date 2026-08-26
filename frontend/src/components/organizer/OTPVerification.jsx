import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    verifyOrganizerOTP,
    resendOrganizerOTP,
} from "../../services/organizerService";

import "./OTPVerification.css";


const OTP_LENGTH = 6;

const RESEND_SECONDS = 30;


// =====================================================
// OTP VERIFICATION COMPONENT
// =====================================================

const OTPVerification = ({
    email,
    onVerified,
}) => {

    // =====================================================
    // STATE
    // =====================================================

    const [otp, setOtp] = useState(
        Array(OTP_LENGTH).fill("")
    );

    const [loading, setLoading] =
        useState(false);

    const [resending, setResending] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [countdown, setCountdown] =
        useState(0);


    // =====================================================
    // REFS
    // =====================================================

    const inputRefs =
        useRef([]);


    // =====================================================
    // NORMALIZE EMAIL
    // =====================================================

    const getOrganizerEmail = () => {

        // ---------------------------------------------
        // First priority:
        // email passed from VerifyOTP.jsx
        // ---------------------------------------------

        if (email) {

            const normalizedEmail =
                String(email)
                    .trim()
                    .toLowerCase();

            if (normalizedEmail) {
                return normalizedEmail;
            }
        }


        // ---------------------------------------------
        // NEW:
        // Get email from URL query parameter
        //
        // /organizer/verify-otp?email=abc@gmail.com
        // ---------------------------------------------

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const urlEmail =
                params.get("email");

            if (urlEmail) {

                const normalizedEmail =
                    String(urlEmail)
                        .trim()
                        .toLowerCase();

                if (normalizedEmail) {
                    return normalizedEmail;
                }
            }

        } catch (urlError) {

            console.warn(
                "Unable to read organizer email from URL:",
                urlError
            );

        }


        // ---------------------------------------------
        // Fallback localStorage
        // ---------------------------------------------

        const storageKeys = [
            "organizerEmail",
            "pendingOrganizerEmail",
            "otpEmail",
        ];


        for (
            const key of storageKeys
        ) {

            const value =
                localStorage.getItem(key);

            if (value) {

                const normalizedEmail =
                    String(value)
                        .trim()
                        .toLowerCase();

                if (normalizedEmail) {
                    return normalizedEmail;
                }
            }
        }


        // ---------------------------------------------
        // Fallback sessionStorage
        // ---------------------------------------------

        for (
            const key of storageKeys
        ) {

            const value =
                sessionStorage.getItem(key);

            if (value) {

                const normalizedEmail =
                    String(value)
                        .trim()
                        .toLowerCase();

                if (normalizedEmail) {
                    return normalizedEmail;
                }
            }
        }


        return "";
    };


    // =====================================================
    // STORE EMAIL
    // =====================================================

    useEffect(() => {

        const normalizedEmail =
            getOrganizerEmail();

        if (normalizedEmail) {

            localStorage.setItem(
                "organizerEmail",
                normalizedEmail
            );

            sessionStorage.setItem(
                "organizerEmail",
                normalizedEmail
            );

        }

    }, [email]);


    // =====================================================
    // COUNTDOWN
    // =====================================================

    useEffect(() => {

        if (countdown <= 0) {
            return;
        }

        const timer =
            setInterval(() => {

                setCountdown(
                    (previous) =>
                        previous > 0
                            ? previous - 1
                            : 0
                );

            }, 1000);


        return () => {
            clearInterval(timer);
        };

    }, [countdown]);


    // =====================================================
    // AUTO FOCUS
    // =====================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                inputRefs.current[0]?.focus();

            }, 100);

        return () => {
            clearTimeout(timer);
        };

    }, []);


    // =====================================================
    // HANDLE INPUT
    // =====================================================

    const handleChange = (
        index,
        value
    ) => {

        if (!/^\d?$/.test(value)) {
            return;
        }


        const updatedOTP = [
            ...otp,
        ];


        updatedOTP[index] =
            value;


        setOtp(
            updatedOTP
        );


        setError("");
        setSuccess("");


        if (
            value &&
            index <
                OTP_LENGTH - 1
        ) {

            inputRefs.current[
                index + 1
            ]?.focus();

        }

    };


    // =====================================================
    // HANDLE KEYBOARD
    // =====================================================

    const handleKeyDown = (
        index,
        event
    ) => {

        if (
            event.key ===
                "Backspace" &&
            !otp[index] &&
            index > 0
        ) {

            inputRefs.current[
                index - 1
            ]?.focus();

            return;
        }


        if (
            event.key ===
                "ArrowLeft" &&
            index > 0
        ) {

            inputRefs.current[
                index - 1
            ]?.focus();

            return;
        }


        if (
            event.key ===
                "ArrowRight" &&
            index <
                OTP_LENGTH - 1
        ) {

            inputRefs.current[
                index + 1
            ]?.focus();

        }

    };


    // =====================================================
    // HANDLE PASTE
    // =====================================================

    const handlePaste = (
        event
    ) => {

        event.preventDefault();


        const pastedValue =
            event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(
                    0,
                    OTP_LENGTH
                );


        if (!pastedValue) {
            return;
        }


        const updatedOTP =
            Array(
                OTP_LENGTH
            ).fill("");


        pastedValue
            .split("")
            .forEach(
                (
                    digit,
                    index
                ) => {

                    updatedOTP[
                        index
                    ] = digit;

                }
            );


        setOtp(
            updatedOTP
        );


        setError("");
        setSuccess("");


        const focusIndex =
            Math.min(
                pastedValue.length,
                OTP_LENGTH - 1
            );


        inputRefs.current[
            focusIndex
        ]?.focus();

    };


    // =====================================================
    // VERIFY OTP
    // =====================================================

    const handleVerify =
        async (event) => {

            event.preventDefault();


            setError("");
            setSuccess("");


            const otpValue =
                otp.join("").trim();


            if (
                !/^\d{6}$/.test(
                    otpValue
                )
            ) {

                setError(
                    "Please enter the complete 6-digit OTP."
                );

                return;
            }


            // ---------------------------------------------
            // Get organizer email
            // ---------------------------------------------

            const organizerEmail =
                getOrganizerEmail();


            if (!organizerEmail) {

                setError(
                    "Organizer email was not found. Please return to the admin page and add the organizer again."
                );

                return;
            }


            setLoading(true);


            try {

                console.log(
                    "Verifying organizer OTP"
                );

                console.log(
                    "Email:",
                    organizerEmail
                );

                console.log(
                    "OTP:",
                    otpValue
                );


                // IMPORTANT:
                // Send BOTH email and OTP

                const response =
                    await verifyOrganizerOTP(
                        organizerEmail,
                        otpValue
                    );


                console.log(
                    "OTP verification response:",
                    response
                );


                // ---------------------------------------------
                // Check backend success
                // ---------------------------------------------

                if (
                    response?.success === false
                ) {

                    throw new Error(
                        response?.message ||
                        "OTP verification failed."
                    );

                }


                // ---------------------------------------------
                // Require successful verification
                // ---------------------------------------------

                const verificationSuccessful =
                    response?.success === true ||
                    response?.verified === true ||
                    response?.otpVerified === true;


                if (
                    !verificationSuccessful
                ) {

                    throw new Error(
                        response?.message ||
                        "OTP verification was not completed."
                    );

                }


                setSuccess(
                    response?.message ||
                    "Organizer verified successfully."
                );


                // ---------------------------------------------
                // Remove temporary email
                // ---------------------------------------------

                localStorage.removeItem(
                    "pendingOrganizerEmail"
                );

                localStorage.removeItem(
                    "otpEmail"
                );

                sessionStorage.removeItem(
                    "pendingOrganizerEmail"
                );

                sessionStorage.removeItem(
                    "otpEmail"
                );


                // Keep organizerEmail briefly
                // because parent may need it.

                if (onVerified) {

                    onVerified(
                        response
                    );

                }

            } catch (
                verificationError
            ) {

                console.error(
                    "OTP verification failed:",
                    verificationError?.response
                        ?.data ||
                    verificationError?.message ||
                    verificationError
                );


                const message =
                    verificationError
                        ?.response
                        ?.data
                        ?.message ||
                    verificationError
                        ?.response
                        ?.data
                        ?.error ||
                    verificationError
                        ?.message ||
                    "Invalid or expired OTP. Please try again.";


                setError(
                    message
                );

            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // RESEND OTP
    // =====================================================

    const handleResend =
        async () => {

            if (
                countdown > 0 ||
                resending ||
                loading
            ) {

                return;

            }


            setError("");
            setSuccess("");


            const organizerEmail =
                getOrganizerEmail();


            if (!organizerEmail) {

                setError(
                    "Organizer email was not found. Please return to the admin page and add the organizer again."
                );

                return;
            }


            setResending(true);


            try {

                console.log(
                    "Resending OTP to:",
                    organizerEmail
                );


                const response =
                    await resendOrganizerOTP(
                        organizerEmail
                    );


                console.log(
                    "OTP resend response:",
                    response
                );


                if (
                    response?.success === false
                ) {

                    throw new Error(
                        response?.message ||
                        "Unable to resend OTP."
                    );

                }


                setSuccess(
                    response?.message ||
                    "A new OTP has been sent to your email."
                );


                setOtp(
                    Array(
                        OTP_LENGTH
                    ).fill("")
                );


                setCountdown(
                    RESEND_SECONDS
                );


                setTimeout(() => {

                    inputRefs.current[
                        0
                    ]?.focus();

                }, 100);

            } catch (
                resendError
            ) {

                console.error(
                    "Resend OTP failed:",
                    resendError?.response
                        ?.data ||
                    resendError?.message ||
                    resendError
                );


                const message =
                    resendError
                        ?.response
                        ?.data
                        ?.message ||
                    resendError
                        ?.response
                        ?.data
                        ?.error ||
                    resendError
                        ?.message ||
                    "Unable to resend OTP. Please try again.";


                setError(
                    message
                );

            } finally {

                setResending(false);

            }

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="otp-verification">

            <div className="otp-header">

                <h2>
                    Verify Organizer
                </h2>

                <p>
                    OTP sent to your email
                </p>

            </div>


            <form
                onSubmit={
                    handleVerify
                }
            >

                <div
                    className="otp-input-container"
                    onPaste={
                        handlePaste
                    }
                >

                    {otp.map(
                        (
                            digit,
                            index
                        ) => (

                            <input
                                key={index}

                                ref={(
                                    element
                                ) => {

                                    inputRefs.current[
                                        index
                                    ] = element;

                                }}

                                type="text"

                                inputMode="numeric"

                                pattern="[0-9]*"

                                maxLength={1}

                                value={digit}

                                onChange={(
                                    event
                                ) =>
                                    handleChange(
                                        index,
                                        event
                                            .target
                                            .value
                                    )
                                }

                                onKeyDown={(
                                    event
                                ) =>
                                    handleKeyDown(
                                        index,
                                        event
                                    )
                                }

                                className="otp-input"

                                aria-label={
                                    `OTP digit ${
                                        index + 1
                                    }`
                                }

                                autoComplete={
                                    index === 0
                                        ? "one-time-code"
                                        : "off"
                                }

                                disabled={
                                    loading ||
                                    resending
                                }
                            />

                        )
                    )}

                </div>


                {error && (

                    <div
                        className="otp-error"
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                {success && (

                    <div
                        className="otp-success"
                        role="status"
                    >
                        {success}
                    </div>

                )}


                <button
                    type="submit"
                    className="otp-verify-button"
                    disabled={
                        loading ||
                        resending ||
                        otp.join("").length !==
                            OTP_LENGTH
                    }
                >

                    {loading
                        ? "VERIFYING..."
                        : "VERIFY"}

                </button>

            </form>


            <button
                type="button"
                className="otp-resend-button"
                onClick={
                    handleResend
                }
                disabled={
                    resending ||
                    loading ||
                    countdown > 0
                }
            >

                {resending
                    ? "SENDING..."
                    : countdown > 0
                    ? `RESEND OTP (${countdown}s)`
                    : "RESEND OTP"}

            </button>

        </div>

    );

};


export default OTPVerification;