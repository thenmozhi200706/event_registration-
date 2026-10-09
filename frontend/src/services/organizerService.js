import api from "../api/api";

/* ============================================================
   ORGANIZER DASHBOARD
============================================================ */

export const getOrganizerDashboard = async () => {
    const response = await api.get("/organizer/dashboard");
    return response.data;
};

export const getOrganizerAnalytics = async () => {
    const response = await api.get("/organizer/analytics");
    return response.data;
};

export const getDashboardEvents = async () => {
    const response = await api.get("/organizer/dashboard/events");
    return response.data;
};

export const getDashboardRegistrations = async () => {
    const response = await api.get("/organizer/dashboard/registrations");
    return response.data;
};


/* ============================================================
   EVENT MANAGEMENT
============================================================ */

export const getOrganizerEvents = async () => {
    const response = await api.get("/organizer/events");
    return response.data;
};

export const getOrganizerEvent = async (eventId) => {
    if (!eventId) {
        throw new Error("Event ID is required.");
    }

    const response = await api.get(
        `/organizer/events/${eventId}`
    );

    return response.data;
};

export const createEvent = async (formData) => {
    if (!formData) {
        throw new Error("Event form data is required.");
    }

    const response = await api.post(
        "/organizer/events",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const updateEvent = async (eventId, formData) => {
    if (!eventId) {
        throw new Error("Event ID is required.");
    }

    if (!formData) {
        throw new Error("Event form data is required.");
    }

    const response = await api.put(
        `/organizer/events/${eventId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const deleteEvent = async (eventId) => {
    if (!eventId) {
        throw new Error("Event ID is required.");
    }

    const response = await api.delete(
        `/organizer/events/${eventId}`
    );

    return response.data;
};

export const toggleEventStatus = async (eventId) => {
    if (!eventId) {
        throw new Error("Event ID is required.");
    }

    const response = await api.patch(
        `/organizer/events/${eventId}/status`
    );

    return response.data;
};

export const getEventRegistrations = async (eventId) => {
    if (!eventId) {
        throw new Error("Event ID is required.");
    }

    const response = await api.get(
        `/organizer/events/${eventId}/registrations`
    );

    return response.data;
};


/* ============================================================
   ORGANIZER OTP
============================================================ */

export const verifyOrganizerOTP = async (email, otp) => {
    if (!email) {
        throw new Error("Organizer email is required.");
    }

    if (!otp) {
        throw new Error("OTP is required.");
    }

    const response = await api.post(
        "/organizer/verify-otp",
        {
            email,
            otp,
        }
    );

    return response.data;
};

export const resendOrganizerOTP = async (email) => {
    if (!email) {
        throw new Error("Organizer email is required.");
    }

    const response = await api.post(
        "/organizer/resend-otp",
        {
            email,
        }
    );

    return response.data;
};


/* ============================================================
   DEFAULT EXPORT
============================================================ */

const organizerService = {
    getOrganizerDashboard,
    getOrganizerAnalytics,
    getDashboardEvents,
    getDashboardRegistrations,

    getOrganizerEvents,
    getOrganizerEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventStatus,
    getEventRegistrations,

    verifyOrganizerOTP,
    resendOrganizerOTP,
};

export default organizerService;