// frontend/src/services/registrationService.js

import api from "../api/api";

/*
 * ============================================================
 * EVENTSPHERE — REGISTRATION SERVICE
 * ============================================================
 *
 * Handles participant event registration API calls.
 *
 * Backend endpoints:
 *
 * POST /api/registrations
 * GET  /api/registrations
 * GET  /api/registrations/my
 * GET  /api/registrations/:id
 *
 * The api instance is responsible for:
 * - Base URL
 * - Authorization token
 * - Axios configuration
 * ============================================================
 */


/*
 * ============================================================
 * GET MY REGISTRATIONS — INTERNAL HELPER
 * ============================================================
 *
 * Used when the backend says:
 *
 * 409 Conflict
 * "You are already registered for this event"
 *
 * In that situation we find the existing registration
 * and return it instead of creating another registration.
 */

const getMyRegistrationsInternal = async () => {
    const response = await api.get(
        "/registrations/my"
    );

    return response.data;
};


/*
 * ============================================================
 * FIND EXISTING REGISTRATION FOR EVENT
 * ============================================================
 *
 * Finds the current user's registration for
 * the specified event.
 */

const findExistingRegistration = async (
    eventId
) => {
    if (!eventId) {
        return null;
    }

    try {
        const response =
            await getMyRegistrationsInternal();

        const data =
            response?.data ||
            response;

        const registrations =
            Array.isArray(
                data?.registrations
            )
                ? data.registrations
                : Array.isArray(data)
                    ? data
                    : [];

        const existingRegistration =
            registrations.find(
                (registration) => {

                    const registeredEventId =
                        registration?.eventId?._id ||
                        registration?.eventId?.id ||
                        registration?.eventId;

                    return (
                        String(
                            registeredEventId || ""
                        ) ===
                        String(eventId)
                    );
                }
            );

        return (
            existingRegistration ||
            null
        );
    } catch (error) {
        console.error(
            "Find existing registration error:",
            error?.response?.data ||
            error?.message ||
            error
        );

        return null;
    }
};


/*
 * ============================================================
 * CREATE REGISTRATION
 * ============================================================
 *
 * Creates a new event registration.
 *
 * Expected backend request body:
 *
 * {
 *     eventId,
 *     firstName,
 *     lastName,
 *     age,
 *     whatsappNumber,
 *     email,
 *     instituteName,
 *     department,
 *     year,
 *     paymentMethod,
 *     amount
 * }
 *
 * IMPORTANT:
 *
 * If the participant has already registered for the event,
 * the backend returns 409 Conflict.
 *
 * Instead of showing an error, this service finds the
 * existing registration and returns it.
 *
 * This allows the participant to continue to payment.
 */

const createRegistration = async (
    registrationData
) => {
    try {
        /*
         * ---------------------------------------------
         * BASIC VALIDATION
         * ---------------------------------------------
         */

        if (
            !registrationData ||
            typeof registrationData !==
                "object"
        ) {
            throw {
                success: false,
                message:
                    "Registration data is required",
            };
        }

        const eventId =
            registrationData?.eventId;

        if (!eventId) {
            throw {
                success: false,
                message:
                    "Event ID is required",
            };
        }


        /*
         * ---------------------------------------------
         * CREATE REGISTRATION
         * ---------------------------------------------
         */

        const response =
            await api.post(
                "/registrations",
                registrationData
            );

        return response.data;

    } catch (error) {

        const status =
            error?.response?.status;

        const backendData =
            error?.response?.data;


        console.error(
            "Create registration error:",
            backendData ||
            error?.message ||
            error
        );


        /*
         * =================================================
         * EXISTING REGISTRATION
         * =================================================
         *
         * Backend returns:
         *
         * 409 Conflict
         *
         * when this participant has already registered
         * for the same event.
         *
         * Reuse the existing registration.
         */

        if (
            status === 409
        ) {

            const existingRegistration =
                await findExistingRegistration(
                    registrationData.eventId
                );


            /*
             * ---------------------------------------------
             * EXISTING REGISTRATION FOUND
             * ---------------------------------------------
             */

            if (
                existingRegistration
            ) {

                const paymentStatus =
                    String(
                        existingRegistration
                            ?.paymentStatus ||
                        "pending"
                    )
                        .trim()
                        .toLowerCase();


                /*
                 * -----------------------------------------
                 * ALREADY PAID
                 * -----------------------------------------
                 *
                 * Do not send the participant
                 * to Razorpay again.
                 */

                if (
                    paymentStatus ===
                    "paid"
                ) {

                    return {
                        success: true,

                        message:
                            "You are already registered and your payment is confirmed.",

                        registration:
                            existingRegistration,

                        paymentRequired:
                            false,

                        alreadyRegistered:
                            true,

                        alreadyPaid:
                            true,
                    };
                }


                /*
                 * -----------------------------------------
                 * PENDING PAYMENT
                 * -----------------------------------------
                 *
                 * Return the existing registration.
                 *
                 * RegistrationPage will navigate to:
                 *
                 * /participant/payment/:registrationId
                 */

                return {
                    success: true,

                    message:
                        "You are already registered. You can continue with your pending payment.",

                    registration:
                        existingRegistration,

                    paymentRequired:
                        true,

                    alreadyRegistered:
                        true,

                    alreadyPaid:
                        false,
                };
            }


            /*
             * ---------------------------------------------
             * 409 BUT REGISTRATION NOT FOUND
             * ---------------------------------------------
             */

            return {
                success: false,

                message:
                    backendData?.message ||
                    "You are already registered for this event, but the existing registration could not be found.",
            };
        }


        /*
         * =================================================
         * OTHER ERRORS
         * =================================================
         */

        throw (
            backendData ||
            {
                success: false,

                message:
                    "Failed to create registration",
            }
        );
    }
};


/*
 * ============================================================
 * GET MY REGISTRATIONS
 * ============================================================
 *
 * Returns registrations belonging to the
 * currently logged-in participant.
 */

const getMyRegistrations = async () => {
    try {

        const response =
            await api.get(
                "/registrations/my"
            );

        return response.data;

    } catch (error) {

        console.error(
            "Get my registrations error:",
            error?.response?.data ||
            error?.message ||
            error
        );

        throw (
            error?.response?.data ||
            {
                success: false,

                message:
                    "Failed to fetch registrations",
            }
        );
    }
};


/*
 * ============================================================
 * GET REGISTRATION BY ID
 * ============================================================
 *
 * Fetches one registration.
 *
 * Example:
 *
 * getRegistrationById("65f123...")
 */

const getRegistrationById = async (
    registrationId
) => {

    try {

        if (!registrationId) {

            throw {
                success: false,

                message:
                    "Registration ID is required",
            };
        }


        const response =
            await api.get(
                `/registrations/${registrationId}`
            );


        return response.data;

    } catch (error) {

        console.error(
            "Get registration details error:",
            error?.response?.data ||
            error?.message ||
            error
        );


        throw (
            error?.response?.data ||
            {
                success: false,

                message:
                    "Failed to fetch registration details",
            }
        );
    }
};


/*
 * ============================================================
 * EXPORT
 * ============================================================
 */

const registrationService = {

    createRegistration,

    getMyRegistrations,

    getRegistrationById,

};


export default registrationService;