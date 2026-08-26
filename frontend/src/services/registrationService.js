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
 * Returns the complete backend response.
 */
const createRegistration = async (registrationData) => {
    try {
        const response = await api.post(
            "/registrations",
            registrationData
        );

        return response.data;
    } catch (error) {
        console.error(
            "Create registration error:",
            error.response?.data || error.message
        );

        throw (
            error.response?.data || {
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
        const response = await api.get(
            "/registrations/my"
        );

        return response.data;
    } catch (error) {
        console.error(
            "Get my registrations error:",
            error.response?.data || error.message
        );

        throw (
            error.response?.data || {
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

        const response = await api.get(
            `/registrations/${registrationId}`
        );

        return response.data;
    } catch (error) {
        console.error(
            "Get registration details error:",
            error.response?.data || error.message
        );

        throw (
            error.response?.data || {
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