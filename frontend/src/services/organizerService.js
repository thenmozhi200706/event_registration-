import api from "../api/api";

// =====================================================
// EVENTSPHERE - ORGANIZER SERVICE
// =====================================================
//
// Handles:
// 1. Verify Organizer OTP
// 2. Resend Organizer OTP
// 3. Get Organizer Profile
// 4. Get Organizer Events
//
// IMPORTANT:
// OTP verification sends BOTH:
//
// {
//     email,
//     otp
// }
//
// =====================================================


// =====================================================
// HELPER — NORMALIZE EMAIL
// =====================================================

const normalizeEmail = (email) => {

    return String(email || "")
        .trim()
        .toLowerCase();

};


// =====================================================
// HELPER — GET STORED ORGANIZER EMAIL
// =====================================================

const getStoredOrganizerEmail = () => {

    const possibleKeys = [
        "organizerEmail",
        "pendingOrganizerEmail",
        "otpEmail",
    ];


    // =================================================
    // LOCAL STORAGE
    // =================================================

    for (const key of possibleKeys) {

        try {

            const value =
                localStorage.getItem(key);

            if (value) {

                const email =
                    normalizeEmail(value);

                if (email) {
                    return email;
                }

            }

        } catch (storageError) {

            console.warn(
                "Unable to read localStorage:",
                storageError
            );

        }

    }


    // =================================================
    // SESSION STORAGE
    // =================================================

    for (const key of possibleKeys) {

        try {

            const value =
                sessionStorage.getItem(key);

            if (value) {

                const email =
                    normalizeEmail(value);

                if (email) {
                    return email;
                }

            }

        } catch (storageError) {

            console.warn(
                "Unable to read sessionStorage:",
                storageError
            );

        }

    }


    return "";

};


// =====================================================
// HELPER — SAVE ORGANIZER EMAIL
// =====================================================

const saveOrganizerEmail = (email) => {

    const normalizedEmail =
        normalizeEmail(email);


    if (!normalizedEmail) {
        return "";
    }


    // =================================================
    // LOCAL STORAGE
    // =================================================

    try {

        localStorage.setItem(
            "organizerEmail",
            normalizedEmail
        );

        localStorage.setItem(
            "pendingOrganizerEmail",
            normalizedEmail
        );

        localStorage.setItem(
            "otpEmail",
            normalizedEmail
        );

    } catch (storageError) {

        console.warn(
            "Unable to save organizer email to localStorage:",
            storageError
        );

    }


    // =================================================
    // SESSION STORAGE
    // =================================================

    try {

        sessionStorage.setItem(
            "organizerEmail",
            normalizedEmail
        );

        sessionStorage.setItem(
            "pendingOrganizerEmail",
            normalizedEmail
        );

        sessionStorage.setItem(
            "otpEmail",
            normalizedEmail
        );

    } catch (storageError) {

        console.warn(
            "Unable to save organizer email to sessionStorage:",
            storageError
        );

    }


    return normalizedEmail;

};


// =====================================================
// HELPER — CLEAR TEMPORARY ORGANIZER EMAIL
// =====================================================
//
// Called only after successful OTP verification.
//
// =====================================================

const clearOrganizerEmail = () => {

    // =================================================
    // LOCAL STORAGE
    // =================================================

    try {

        localStorage.removeItem(
            "organizerEmail"
        );

        localStorage.removeItem(
            "pendingOrganizerEmail"
        );

        localStorage.removeItem(
            "otpEmail"
        );

    } catch (storageError) {

        console.warn(
            "Unable to clear localStorage:",
            storageError
        );

    }


    // =================================================
    // SESSION STORAGE
    // =================================================

    try {

        sessionStorage.removeItem(
            "organizerEmail"
        );

        sessionStorage.removeItem(
            "pendingOrganizerEmail"
        );

        sessionStorage.removeItem(
            "otpEmail"
        );

    } catch (storageError) {

        console.warn(
            "Unable to clear sessionStorage:",
            storageError
        );

    }

};


// =====================================================
// HELPER — GET ERROR MESSAGE
// =====================================================

const getErrorMessage = (
    error,
    fallbackMessage
) => {

    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.message ||
        fallbackMessage
    );

};


// =====================================================
// VERIFY ORGANIZER OTP
// =====================================================

export const verifyOrganizerOTP = async (
    firstValue,
    secondValue
) => {

    let email = "";
    let otp = "";


    if (
        typeof firstValue === "object" &&
        firstValue !== null
    ) {

        email =
            firstValue.email;

        otp =
            firstValue.otp;

    }

    else if (
        secondValue !== undefined
    ) {

        email =
            firstValue;

        otp =
            secondValue;

    }

    else {

        const possibleValue =
            String(
                firstValue || ""
            ).trim();


        if (
            /^\d{6}$/.test(
                possibleValue
            )
        ) {

            otp =
                possibleValue;

            email =
                getStoredOrganizerEmail();

        }

        else {

            email =
                possibleValue;

        }

    }


    if (!email) {

        email =
            getStoredOrganizerEmail();

    }


    email =
        normalizeEmail(email);

    otp =
        String(
            otp || ""
        ).trim();


    if (!email) {

        throw new Error(
            "Organizer email is required. Please return to the admin page and add the organizer again."
        );

    }


    if (!otp) {

        throw new Error(
            "OTP is required."
        );

    }


    if (
        !/^\d{6}$/.test(
            otp
        )
    ) {

        throw new Error(
            "OTP must contain exactly 6 digits."
        );

    }


    saveOrganizerEmail(
        email
    );


    console.log(
        "========================================"
    );

    console.log(
        "EVENTSPHERE - VERIFY ORGANIZER OTP"
    );

    console.log(
        "Email:",
        email
    );

    console.log(
        "OTP:",
        otp
    );

    console.log(
        "========================================"
    );


    try {

        const response =
            await api.post(
                "/organizer/verify-otp",
                {
                    email,
                    otp,
                }
            );


        const data =
            response?.data;


        console.log(
            "Organizer OTP verification response:",
            data
        );


        if (data?.token) {

            localStorage.setItem(
                "token",
                data.token
            );

        }


        if (data?.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );

        }


        if (data?.authUser) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.authUser
                )
            );

        }


        // =================================================
        // FIX:
        // Only a real verification flag means success.
        // =================================================

        const verificationSuccessful =
            data?.success === true ||
            data?.verified === true ||
            data?.otpVerified === true;


        if (
            verificationSuccessful
        ) {

            clearOrganizerEmail();

        }


        return data;

    } catch (error) {

        console.error(
            "Organizer OTP verification failed:",
            error?.response?.data ||
            error
        );


        if (error?.response) {

            throw error;

        }


        throw new Error(
            getErrorMessage(
                error,
                "OTP verification failed."
            )
        );

    }

};


// =====================================================
// RESEND ORGANIZER OTP
// =====================================================

export const resendOrganizerOTP = async (
    emailValue = ""
) => {

    let email =
        emailValue;


    if (!email) {

        email =
            getStoredOrganizerEmail();

    }


    email =
        normalizeEmail(email);


    if (!email) {

        throw new Error(
            "Organizer email is required. Please return to the admin page and add the organizer again."
        );

    }


    saveOrganizerEmail(
        email
    );


    console.log(
        "========================================"
    );

    console.log(
        "EVENTSPHERE - RESEND ORGANIZER OTP"
    );

    console.log(
        "Email:",
        email
    );

    console.log(
        "========================================"
    );


    try {

        const response =
            await api.post(
                "/organizer/resend-otp",
                {
                    email,
                }
            );


        console.log(
            "Resend organizer OTP response:",
            response?.data
        );


        return response.data;

    } catch (error) {

        console.error(
            "Resend organizer OTP failed:",
            error?.response?.data ||
            error
        );


        if (error?.response) {

            throw error;

        }


        throw new Error(
            getErrorMessage(
                error,
                "Failed to resend organizer OTP."
            )
        );

    }

};


// =====================================================
// GET ORGANIZER PROFILE
// =====================================================

export const getOrganizerProfile =
    async () => {

        try {

            const response =
                await api.get(
                    "/organizer/profile"
                );


            return response.data;

        } catch (error) {

            console.error(
                "Failed to load organizer profile:",
                error?.response?.data ||
                error
            );


            if (error?.response) {

                throw error;

            }


            throw new Error(
                getErrorMessage(
                    error,
                    "Failed to load organizer profile."
                )
            );

        }

    };


// =====================================================
// GET ORGANIZER EVENTS
// =====================================================

export const getOrganizerEvents =
    async () => {

        try {

            const response =
                await api.get(
                    "/organizer/events"
                );


            return response.data;

        } catch (error) {

            console.error(
                "Failed to load organizer events:",
                error?.response?.data ||
                error
            );


            if (error?.response) {

                throw error;

            }


            throw new Error(
                getErrorMessage(
                    error,
                    "Failed to load organizer events."
                )
            );

        }

    };


// =====================================================
// EXPORT DEFAULT
// =====================================================

const organizerService = {

    verifyOrganizerOTP,

    resendOrganizerOTP,

    getOrganizerProfile,

    getOrganizerEvents,

};


export default organizerService;