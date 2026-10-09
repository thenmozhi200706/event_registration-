// frontend/src/pages/auth/AuthSuccess.jsx

import React, {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    saveAuthData,
    getCurrentUser,
} from "../../services/authService";

import {
    getToken,
} from "../../utils/storage";

import useAuth from "../../hooks/useAuth";

import "./AuthSuccess.css";


const AuthSuccess = () => {

    const navigate = useNavigate();

    const {
        setUser,
    } = useAuth();


    const [
        status,
        setStatus,
    ] = useState(
        "Completing login..."
    );


    const [
        error,
        setError,
    ] = useState("");


    useEffect(() => {

        let mounted = true;


        const completeAuthentication =
            async () => {

                try {

                    // =====================================================
                    // STEP 1 — CHECK AUTHENTICATION CALLBACK
                    // =====================================================

                    setStatus(
                        "Checking authentication..."
                    );


                    const url =
                        new URL(
                            window.location.href
                        );


                    const token =
                        url.searchParams.get(
                            "token"
                        );


                    console.log(
                        "========================================"
                    );

                    console.log(
                        "EventSphere Auth"
                    );

                    console.log(
                        "Current URL:",
                        window.location.href
                    );

                    console.log(
                        "Token from URL:",
                        token
                            ? "FOUND"
                            : "NOT FOUND"
                    );

                    console.log(
                        "Token length:",
                        token
                            ? token.length
                            : 0
                    );

                    console.log(
                        "Token from storage BEFORE:",
                        getToken()
                            ? "FOUND"
                            : "NOT FOUND"
                    );

                    console.log(
                        "========================================"
                    );


                    // =====================================================
                    // STEP 2 — SAVE TOKEN RECEIVED FROM BACKEND
                    // =====================================================

                    if (token) {

                        console.log(
                            "Saving authentication token..."
                        );


                        saveAuthData({
                            token,
                        });


                        console.log(
                            "Authentication token saved."
                        );
                    }


                    // =====================================================
                    // STEP 3 — GET TOKEN FROM STORAGE
                    // =====================================================

                    const storedToken =
                        getToken();


                    console.log(
                        "Token from storage AFTER:",
                        storedToken
                            ? "FOUND"
                            : "NOT FOUND"
                    );


                    if (!storedToken) {

                        throw new Error(
                            "Authentication token was not received from the server. Please try Google login again."
                        );
                    }


                    // =====================================================
                    // STEP 4 — LOAD USER
                    // =====================================================

                    setStatus(
                        "Loading your account..."
                    );


                    console.log(
                        "Requesting current user from backend..."
                    );


                    const currentUser =
                        await getCurrentUser();


                    // =====================================================
                    // STEP 5 — CHECK USER RESPONSE
                    // =====================================================

                    if (!currentUser) {

                        throw new Error(
                            "Unable to load user information from the server."
                        );
                    }


                    if (!mounted) {
                        return;
                    }


                    console.log(
                        "========================================"
                    );

                    console.log(
                        "Authenticated User:",
                        currentUser
                    );

                    console.log(
                        "User Role:",
                        currentUser.role
                    );

                    console.log(
                        "========================================"
                    );


                    // =====================================================
                    // STEP 6 — UPDATE AUTH CONTEXT
                    // =====================================================

                    setUser(
                        currentUser
                    );


                    // =====================================================
                    // STEP 7 — NORMALIZE ROLE
                    // =====================================================

                    const role =
                        String(
                            currentUser.role ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    console.log(
                        "Normalized Role:",
                        role
                    );


                    // =====================================================
                    // STEP 8 — ROLE BASED REDIRECT
                    // =====================================================

                    if (
                        role === "admin"
                    ) {

                        console.log(
                            "Redirecting to Admin Dashboard..."
                        );


                        navigate(
                            "/admin/dashboard",
                            {
                                replace: true,
                            }
                        );


                        return;
                    }


                    if (
                        role === "organizer"
                    ) {

                        console.log(
                            "Redirecting to Organizer Dashboard..."
                        );


                        navigate(
                            "/organizer/dashboard",
                            {
                                replace: true,
                            }
                        );


                        return;
                    }


                    if (
                        role === "participant" ||
                        role === "user"
                    ) {

                        console.log(
                            "Redirecting to Participant Dashboard..."
                        );


                        navigate(
                            "/dashboard",
                            {
                                replace: true,
                            }
                        );


                        return;
                    }


                    // =====================================================
                    // INVALID ROLE
                    // =====================================================

                    throw new Error(
                        `Unsupported account role: ${
                            currentUser.role
                        }`
                    );

                } catch (err) {

                    console.error(
                        "========================================"
                    );

                    console.error(
                        "Authentication failed:",
                        err
                    );

                    console.error(
                        "========================================"
                    );


                    if (!mounted) {
                        return;
                    }


                    setError(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Authentication failed. Please try again."
                    );


                    setStatus("");
                }
            };


        completeAuthentication();


        return () => {

            mounted = false;

        };

    }, [
        navigate,
        setUser,
    ]);


    // =====================================================
    // AUTHENTICATION SCREEN
    // =====================================================

    return (

        <div className="auth-success-page">

            <div className="auth-success-container">

                {!error ? (

                    <>

                        <div className="auth-loader">

                            <div className="spinner"></div>

                        </div>


                        <h2>
                            Signing you in...
                        </h2>


                        <p>
                            {status}
                        </p>

                    </>

                ) : (

                    <>

                        <div className="auth-error-icon">
                            ✕
                        </div>


                        <h2>
                            Authentication Failed
                        </h2>


                        <p className="auth-error-message">
                            {error}
                        </p>


                        <button
                            type="button"
                            className="auth-back-button"
                            onClick={() => {

                                navigate(
                                    "/login",
                                    {
                                        replace: true,
                                    }
                                );

                            }}
                        >
                            Back to Login
                        </button>

                    </>

                )}

            </div>

        </div>
    );
};


export default AuthSuccess;