// =====================================================
// EVENTSPHERE - EVENT SERVICE
// frontend/src/services/eventService.js
// =====================================================

import api from "../api/api";


// =====================================================
// HELPER
// =====================================================

const extractResponseData = (response) => {
    return response?.data;
};


// =====================================================
// GET ALL PUBLIC EVENTS
// =====================================================
//
// GET /api/events
//
// Used by:
// - Events.jsx
// - BrowseEvents.jsx
//
// Optional query:
// {
//     search,
//     hashtag,
//     status
// }
//
// =====================================================

const getEvents = async (params = {}) => {

    try {

        const response = await api.get(
            "/events",
            {
                params,
            }
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.getEvents error:",
            error
        );

        throw error;
    }
};


// =====================================================
// GET EVENT BY ID
// =====================================================
//
// GET /api/events/:id
//
// Used by:
// - EventDetailsPage.jsx
//
// =====================================================

const getEventById = async (
    eventId
) => {

    if (!eventId) {

        throw new Error(
            "Event ID is required."
        );
    }

    try {

        const response = await api.get(
            `/events/${eventId}`
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.getEventById error:",
            error
        );

        throw error;
    }
};


// =====================================================
// GET MY ORGANIZER EVENTS
// =====================================================
//
// GET /api/organizer/events
//
// This is the route currently implemented
// in your backend.
//
// Used by:
// - MyEvents.jsx
//
// =====================================================

const getMyEvents = async () => {

    try {

        const response = await api.get(
            "/organizer/events"
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.getMyEvents error:",
            error
        );

        throw error;
    }
};


// =====================================================
// GET ORGANIZER EVENTS
// =====================================================
//
// Alias for compatibility.
//
// Some existing components may call:
//
// eventService.getOrganizerEvents()
//
// =====================================================

const getOrganizerEvents =
    getMyEvents;


// =====================================================
// CREATE EVENT
// =====================================================
//
// POST /api/events
//
// Project API specification:
// POST /api/events
//
// Organizer creates an event with:
// - title
// - description
// - hashtags
// - banner image
// - event date
// - venue
// - registration fee
// - registration deadline
//
// Supports FormData for image upload.
//
// =====================================================

const createEvent = async (
    formData
) => {

    if (!formData) {

        throw new Error(
            "Event data is required."
        );
    }

    try {

        const response = await api.post(
            "/events",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.createEvent error:",
            error
        );

        throw error;
    }
};


// =====================================================
// UPDATE EVENT
// =====================================================
//
// PUT /api/events/:id
//
// Project API specification:
// PUT /api/events/:id
//
// Supports FormData.
//
// =====================================================

const updateEvent = async (
    eventId,
    formData
) => {

    if (!eventId) {

        throw new Error(
            "Event ID is required."
        );
    }

    if (!formData) {

        throw new Error(
            "Event data is required."
        );
    }

    try {

        const response = await api.put(
            `/events/${eventId}`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.updateEvent error:",
            error
        );

        throw error;
    }
};


// =====================================================
// DELETE EVENT
// =====================================================
//
// DELETE /api/events/:id
//
// Used by:
// - ManageEvent.jsx
//
// =====================================================

const deleteEvent = async (
    eventId
) => {

    if (!eventId) {

        throw new Error(
            "Event ID is required."
        );
    }

    try {

        const response = await api.delete(
            `/events/${eventId}`
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.deleteEvent error:",
            error
        );

        throw error;
    }
};


// =====================================================
// CLOSE EVENT
// =====================================================
//
// This uses the same update endpoint.
//
// Backend should support:
//
// PUT /api/events/:id
//
// body:
// {
//     status: "closed"
// }
//
// =====================================================

const closeEvent = async (
    eventId
) => {

    if (!eventId) {

        throw new Error(
            "Event ID is required."
        );
    }

    try {

        const response = await api.put(
            `/events/${eventId}`,
            {
                status: "closed",
            }
        );

        return extractResponseData(
            response
        );

    } catch (error) {

        console.error(
            "eventService.closeEvent error:",
            error
        );

        throw error;
    }
};


// =====================================================
// EXPORT SERVICE
// =====================================================

const eventService = {

    // -----------------------------------------------
    // Public events
    // -----------------------------------------------

    getEvents,

    getEventById,


    // -----------------------------------------------
    // Organizer events
    // -----------------------------------------------

    getMyEvents,

    getOrganizerEvents,


    // -----------------------------------------------
    // Event CRUD
    // -----------------------------------------------

    createEvent,

    updateEvent,

    deleteEvent,

    closeEvent,

};


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default eventService;