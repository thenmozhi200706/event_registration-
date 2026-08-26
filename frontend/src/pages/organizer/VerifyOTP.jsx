import React, {
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import OTPVerification from
    "../../components/organizer/OTPVerification";

import "./VerifyOTP.css";


// =====================================================
// VERIFY OTP PAGE
// =====================================================

const VerifyOTP = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    // =====================================================
    // EMAIL STATE
    // =====================================================

    const [
        organizerEmail,
        setOrganizerEmail,
    ] = useState("");


    const [
        loadingEmail,
        setLoadingEmail,
    ] = useState(true);


    // =====================================================
    // GET EMAIL
    // =====================================================

    useEffect(() => {

        let email = "";


        // -------------------------------------------------
        // 1. React Router state
        // -------------------------------------------------

        if (
            location.state?.email
        ) {

            email =
                String(
                    location.state.email
                )
                    .trim()
                    .toLowerCase();

        }


        // -------------------------------------------------
        // 2. URL query parameter
        // -------------------------------------------------

        if (!email) {

            const params =
                new URLSearchParams(
                    location.search
                );


            const queryEmail =
                params.get("email");


            if (queryEmail) {

                email =
                    String(
                        queryEmail
                    )
                        .trim()
                        .toLowerCase();

            }

        }


        // -------------------------------------------------
        // 3. localStorage
        // -------------------------------------------------

        if (!email) {

            const possibleKeys = [
                "organizerEmail",
                "pendingOrganizerEmail",
                "otpEmail",
            ];


            for (
                const key of possibleKeys
            ) {

                const storedEmail =
                    localStorage.getItem(
                        key
                    );


                if (storedEmail) {

                    email =
                        String(
                            storedEmail
                        )
                            .trim()
                            .toLowerCase();


                    if (email) {
                        break;
                    }

                }

            }

        }


        // -------------------------------------------------
        // 4. sessionStorage
        // -------------------------------------------------

        if (!email) {

            const possibleKeys = [
                "organizerEmail",
                "pendingOrganizerEmail",
                "otpEmail",
            ];


            for (
                const key of possibleKeys
            ) {

                const storedEmail =
                    sessionStorage.getItem(
                        key
                    );


                if (storedEmail) {

                    email =
                        String(
                            storedEmail
                        )
                            .trim()
                            .toLowerCase();


                    if (email) {
                        break;
                    }

                }

            }

        }


        // -------------------------------------------------
        // Save email
        // -------------------------------------------------

        if (email) {

            localStorage.setItem(
                "organizerEmail",
                email
            );

            sessionStorage.setItem(
                "organizerEmail",
                email
            );

            localStorage.setItem(
                "pendingOrganizerEmail",
                email
            );

            sessionStorage.setItem(
                "pendingOrganizerEmail",
                email
            );

            // FIX:
            // Also save OTP email so the OTP service
            // can recover it if required.

            localStorage.setItem(
                "otpEmail",
                email
            );

            sessionStorage.setItem(
                "otpEmail",
                email
            );

        }


        setOrganizerEmail(
            email
        );

        setLoadingEmail(false);

    }, [location]);


    // =====================================================
    // VERIFIED
    // =====================================================

    const handleVerified =
        (response) => {

            console.log(
                "Organizer verification complete:",
                response
            );


            // -------------------------------------------------
            // IMPORTANT:
            // Do not redirect if backend explicitly reports
            // verification failure.
            // -------------------------------------------------

            if (
                response?.success === false
            ) {

                console.error(
                    "Organizer verification was not successful:",
                    response
                );

                return;
            }


            // Remove temporary OTP email

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


            // Go organizer dashboard

            navigate(
                "/organizer/dashboard",
                {
                    replace: true,
                }
            );

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loadingEmail) {

        return (

            <div className="verify-otp-page">

                <div className="verify-otp-container">

                    <div className="otp-loading">

                        Loading...

                    </div>

                </div>

            </div>

        );

    }


    // =====================================================
    // EMAIL NOT FOUND
    // =====================================================

    if (!organizerEmail) {

        return (

            <div className="verify-otp-page">

                <div className="verify-otp-container">

                    <div className="otp-verification">

                        <div className="otp-header">

                            <h2>
                                Verify Organizer
                            </h2>

                            <p>
                                Organizer email is missing.
                            </p>

                        </div>


                        <div
                            className="otp-error"
                            role="alert"
                        >

                            Organizer email was not found.
                            Please return to the Admin
                            page and add the organizer
                            again.

                        </div>


                        <button
                            type="button"
                            className="otp-verify-button"
                            onClick={() =>
                                navigate(
                                    "/admin/organizers"
                                )
                            }
                        >

                            BACK TO ADMIN

                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (

        <div className="verify-otp-page">

            <div className="verify-otp-container">

                <OTPVerification
                    email={
                        organizerEmail
                    }
                    onVerified={
                        handleVerified
                    }
                />

            </div>

        </div>

    );

};


export default VerifyOTP;