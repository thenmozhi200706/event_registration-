// =====================================================
// EVENTSPHERE - ADMIN SERVICE
// =====================================================

import api from "../api/api";

// =====================================================
// HELPER — GET ERROR MESSAGE
// =====================================================

const getErrorMessage = (
    error,
    fallback = "Something went wrong."
) => {

    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );

};


// =====================================================
// HELPER — CREATE SERVICE ERROR
// =====================================================
//
// Keeps Axios response/status/data available to the
// calling component.
//
// This is important for handling:
// 400 Bad Request
// 401 Unauthorized
// 403 Forbidden
// 404 Not Found
// 409 Conflict
// 500 Server Error
// =====================================================

const createServiceError = (
    error,
    fallback
) => {

    const message = getErrorMessage(
        error,
        fallback
    );

    const serviceError =
        new Error(message);

    // Preserve Axios information
    serviceError.status =
        error?.response?.status;

    serviceError.code =
        error?.code;

    serviceError.response =
        error?.response;

    serviceError.data =
        error?.response?.data;

    return serviceError;

};


// =====================================================
// HELPER — VALIDATE ORGANIZER ID
// =====================================================

const validateOrganizerId = (
    organizerId
) => {

    if (
        organizerId === undefined ||
        organizerId === null ||
        organizerId === ""
    ) {

        throw new Error(
            "Organizer ID is required."
        );

    }

};


// =====================================================
// HELPER — NORMALIZE STATUS
// =====================================================

const normalizeStatus = (
    status
) => {

    // Already boolean
    if (
        typeof status === "boolean"
    ) {

        return status;

    }


    // String status
    if (
        typeof status === "string"
    ) {

        const value =
            status
                .trim()
                .toLowerCase();


        if (
            value === "true" ||
            value === "active" ||
            value === "enabled"
        ) {

            return true;

        }


        if (
            value === "false" ||
            value === "inactive" ||
            value === "disabled"
        ) {

            return false;

        }

    }


    throw new Error(
        "Organizer status must be true or false."
    );

};


// =====================================================
// ADMIN DASHBOARD
// =====================================================
//
// GET /api/admin/dashboard
// =====================================================

export const getAdminDashboard =
    async () => {

        try {

            const response =
                await api.get(
                    "/admin/dashboard"
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to load admin dashboard:",
                error?.response?.data ||
                error
            );

            throw createServiceError(
                error,
                "Unable to load admin dashboard."
            );

        }

    };


// =====================================================
// GET ALL ORGANIZERS
// =====================================================
//
// GET /api/admin/organizers
// =====================================================

export const getOrganizers =
    async (
        params = {}
    ) => {

        try {

            const response =
                await api.get(
                    "/admin/organizers",
                    {
                        params,
                    }
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to load organizers:",
                error?.response?.data ||
                error
            );

            throw createServiceError(
                error,
                "Unable to load organizers."
            );

        }

    };


// =====================================================
// GET ORGANIZER BY ID
// =====================================================
//
// GET /api/admin/organizers/:id
// =====================================================

export const getOrganizerById =
    async (
        organizerId
    ) => {

        validateOrganizerId(
            organizerId
        );


        try {

            const response =
                await api.get(
                    `/admin/organizers/${organizerId}`
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to load organizer:",
                error?.response?.data ||
                error
            );

            throw createServiceError(
                error,
                "Unable to load organizer."
            );

        }

    };


// =====================================================
// ADD ORGANIZER
// =====================================================
//
// POST /api/admin/organizers
//
// Body:
//
// {
//     name: "Gowtham",
//     email: "gowtham@gmail.com"
// }
//
// Backend:
//
// 1. Creates/updates organizer
// 2. Generates OTP
// 3. Sends OTP to Gmail
// 4. Returns organizerId + email
//
// IMPORTANT:
//
// If Gmail already belongs to a User,
// backend must decide whether that User
// should become the Organizer.
//
// Frontend must NOT try to bypass
// a backend 409 conflict.
// =====================================================

export const addOrganizer =
    async (
        organizerData
    ) => {

        if (!organizerData) {

            throw new Error(
                "Organizer data is required."
            );

        }


        const name =
            String(
                organizerData.name || ""
            ).trim();


        const email =
            String(
                organizerData.email || ""
            )
                .trim()
                .toLowerCase();


        // ---------------------------------------------
        // VALIDATE NAME
        // ---------------------------------------------

        if (!name) {

            throw new Error(
                "Organizer name is required."
            );

        }


        // ---------------------------------------------
        // VALIDATE EMAIL
        // ---------------------------------------------

        if (!email) {

            throw new Error(
                "Organizer Gmail address is required."
            );

        }


        if (
            !email.endsWith(
                "@gmail.com"
            )
        ) {

            throw new Error(
                "Organizer email must be a Gmail address."
            );

        }


        try {

            const response =
                await api.post(
                    "/admin/organizers",
                    {
                        name,
                        email,
                    }
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to add organizer:",
                {
                    status:
                        error?.response?.status,

                    data:
                        error?.response?.data,

                    message:
                        error?.message,
                }
            );


            throw createServiceError(
                error,
                "Unable to add organizer."
            );

        }

    };


// =====================================================
// UPDATE ORGANIZER
// =====================================================
//
// PUT /api/admin/organizers/:id
//
// Body:
//
// {
//     name: "...",
//     email: "..."
// }
// =====================================================

export const updateOrganizer =
    async (
        organizerId,
        organizerData
    ) => {

        validateOrganizerId(
            organizerId
        );


        if (!organizerData) {

            throw new Error(
                "Organizer data is required."
            );

        }


        const data = {};


        // ---------------------------------------------
        // NAME
        // ---------------------------------------------

        if (
            organizerData.name !==
            undefined
        ) {

            const name =
                String(
                    organizerData.name || ""
                ).trim();


            if (!name) {

                throw new Error(
                    "Organizer name is required."
                );

            }


            data.name = name;

        }


        // ---------------------------------------------
        // EMAIL
        // ---------------------------------------------

        if (
            organizerData.email !==
            undefined
        ) {

            const email =
                String(
                    organizerData.email || ""
                )
                    .trim()
                    .toLowerCase();


            if (!email) {

                throw new Error(
                    "Organizer email is required."
                );

            }


            if (
                !email.endsWith(
                    "@gmail.com"
                )
            ) {

                throw new Error(
                    "Organizer email must be a Gmail address."
                );

            }


            data.email = email;

        }


        // ---------------------------------------------
        // CHECK EMPTY UPDATE
        // ---------------------------------------------

        if (
            Object.keys(data).length === 0
        ) {

            throw new Error(
                "No organizer information was provided."
            );

        }


        try {

            const response =
                await api.put(
                    `/admin/organizers/${organizerId}`,
                    data
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to update organizer:",
                {
                    status:
                        error?.response?.status,

                    data:
                        error?.response?.data,

                    message:
                        error?.message,
                }
            );


            throw createServiceError(
                error,
                "Unable to update organizer."
            );

        }

    };


// =====================================================
// UPDATE ORGANIZER STATUS
// =====================================================
//
// PATCH /api/admin/organizers/:id/status
//
// Body:
//
// {
//     isActive: true
// }
//
// OR
//
// {
//     isActive: false
// }
// =====================================================

export const updateOrganizerStatus =
    async (
        organizerId,
        isActive
    ) => {

        validateOrganizerId(
            organizerId
        );


        const normalizedStatus =
            normalizeStatus(
                isActive
            );


        try {

            const response =
                await api.patch(
                    `/admin/organizers/${organizerId}/status`,
                    {
                        isActive:
                            normalizedStatus,
                    }
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to update organizer status:",
                {
                    status:
                        error?.response?.status,

                    data:
                        error?.response?.data,

                    message:
                        error?.message,
                }
            );


            throw createServiceError(
                error,
                "Unable to update organizer status."
            );

        }

    };


// =====================================================
// ENABLE ORGANIZER
// =====================================================

export const enableOrganizer =
    async (
        organizerId
    ) => {

        return updateOrganizerStatus(
            organizerId,
            true
        );

    };


// =====================================================
// DISABLE ORGANIZER
// =====================================================

export const disableOrganizer =
    async (
        organizerId
    ) => {

        return updateOrganizerStatus(
            organizerId,
            false
        );

    };


// =====================================================
// TOGGLE ORGANIZER STATUS
// =====================================================
//
// currentStatus = true
//      => false
//
// currentStatus = false
//      => true
// =====================================================

export const toggleOrganizerStatus =
    async (
        organizerId,
        currentStatus
    ) => {

        validateOrganizerId(
            organizerId
        );


        const current =
            normalizeStatus(
                currentStatus
            );


        return updateOrganizerStatus(
            organizerId,
            !current
        );

    };


// =====================================================
// DELETE ORGANIZER
// =====================================================
//
// DELETE /api/admin/organizers/:id
// =====================================================

export const deleteOrganizer =
    async (
        organizerId
    ) => {

        validateOrganizerId(
            organizerId
        );


        try {

            const response =
                await api.delete(
                    `/admin/organizers/${organizerId}`
                );

            return response.data;

        } catch (error) {

            console.error(
                "Failed to delete organizer:",
                {
                    status:
                        error?.response?.status,

                    data:
                        error?.response?.data,

                    message:
                        error?.message,
                }
            );


            throw createServiceError(
                error,
                "Unable to remove organizer."
            );

        }

    };


// =====================================================
// DEFAULT EXPORT
// =====================================================

const adminService = {

    // Dashboard
    getAdminDashboard,

    // Organizer
    getOrganizers,

    getOrganizerById,

    addOrganizer,

    updateOrganizer,

    updateOrganizerStatus,

    enableOrganizer,

    disableOrganizer,

    toggleOrganizerStatus,

    deleteOrganizer,

};


export default adminService;