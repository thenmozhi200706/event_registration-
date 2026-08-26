// =====================================================
// EVENTSPHERE - APP ROUTER
// =====================================================

import React from "react";

import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

// =====================================================
// LAYOUTS
// =====================================================

import PublicLayout from "./layouts/PublicLayout";

import ParticipantLayout from "./layouts/ParticipantLayout";

import OrganizerLayout from "./layouts/OrganizerLayout";

import AdminLayout from "./layouts/AdminLayout";

// =====================================================
// AUTHENTICATION
// =====================================================

import Login from "./pages/auth/Login";

import AuthSuccess from "./pages/auth/AuthSuccess";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/public/Home";

import Events from "./pages/public/Events";

import EventDetailsPage from "./pages/participant/EventDetailsPage";

// =====================================================
// PARTICIPANT PAGES
// =====================================================

import ParticipantDashboard from "./pages/participant/ParticipantDashboard";

import BrowseEvents from "./pages/participant/BrowseEvents";

import RegistrationPage from "./pages/participant/RegistrationPage";

import MyRegistrations from "./pages/participant/MyRegistrations";

import RegistrationDetails from "./pages/participant/RegistrationDetails";

import RegistrationSuccess from "./pages/participant/RegistrationSuccess";

import PaymentPage from "./pages/participant/PaymentPage";

import PaymentSuccess from "./pages/participant/PaymentSuccess";

// =====================================================
// ORGANIZER PAGES
// =====================================================

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";

import VerifyOTP from "./pages/organizer/VerifyOTP";

import MyEvents from "./pages/organizer/MyEvents";

import CreateEvent from "./pages/organizer/CreateEvent";

import EditEvent from "./pages/organizer/EditEvent";

import ManageEvent from "./pages/organizer/ManageEvent";

import Participants from "./pages/organizer/Participants";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/admin/AdminDashboard";

import ManageOrganizers from "./pages/admin/ManageOrganizers";

// =====================================================
// PROTECTION
// =====================================================

import ProtectedRoute from "./components/common/ProtectedRoute";

// =====================================================
// APP
// =====================================================

const App = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* =================================================
                    PUBLIC ROUTES
                ================================================= */}

                <Route element={<PublicLayout />}>

                    {/* HOME */}

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    {/* LOGIN */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* GOOGLE AUTH SUCCESS */}

                    <Route
                        path="/auth/success"
                        element={<AuthSuccess />}
                    />

                    {/* PUBLIC EVENTS */}

                    <Route
                        path="/events"
                        element={<Events />}
                    />

                    {/* EVENT DETAILS */}

                    <Route
                        path="/events/:eventId"
                        element={<EventDetailsPage />}
                    />

                </Route>


                {/* =================================================
                    ORGANIZER OTP VERIFICATION
                ================================================= */}

                <Route
                    path="/organizer/verify-otp"
                    element={<VerifyOTP />}
                />


                {/* =================================================
                    PARTICIPANT PROTECTED ROUTES
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "participant",
                                "user",
                            ]}
                        />
                    }
                >

                    <Route element={<ParticipantLayout />}>

                        {/* PARTICIPANT DASHBOARD */}

                        <Route
                            path="/dashboard"
                            element={
                                <ParticipantDashboard />
                            }
                        />

                        {/* BROWSE EVENTS */}

                        <Route
                            path="/participant/events"
                            element={
                                <BrowseEvents />
                            }
                        />

                        {/* REGISTRATION */}

                        <Route
                            path="/events/:eventId/register"
                            element={
                                <RegistrationPage />
                            }
                        />

                        {/* MY REGISTRATIONS */}

                        <Route
                            path="/my-registrations"
                            element={
                                <MyRegistrations />
                            }
                        />

                        {/* REGISTRATION DETAILS */}

                        <Route
                            path="/registrations/:registrationId"
                            element={
                                <RegistrationDetails />
                            }
                        />

                        {/* REGISTRATION SUCCESS */}

                        <Route
                            path="/registrations/:registrationId/success"
                            element={
                                <RegistrationSuccess />
                            }
                        />

                        {/* PAYMENT */}

                        <Route
                            path="/payment/:registrationId"
                            element={
                                <PaymentPage />
                            }
                        />

                        {/* PAYMENT SUCCESS */}

                        <Route
                            path="/payment/:registrationId/success"
                            element={
                                <PaymentSuccess />
                            }
                        />

                    </Route>

                </Route>


                {/* =================================================
                    ORGANIZER PROTECTED ROUTES
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "organizer",
                            ]}
                        />
                    }
                >

                    <Route element={<OrganizerLayout />}>

                        {/* ORGANIZER DASHBOARD */}

                        <Route
                            path="/organizer/dashboard"
                            element={
                                <OrganizerDashboard />
                            }
                        />


                        {/* =================================================
                            MY EVENTS - ORIGINAL ROUTE
                        ================================================= */}

                        <Route
                            path="/organizer/events"
                            element={
                                <MyEvents />
                            }
                        />


                        {/* =================================================
                            MY EVENTS - COMPATIBILITY ROUTE
                        ================================================= */}

                        <Route
                            path="/organizer/my-events"
                            element={
                                <MyEvents />
                            }
                        />


                        {/* =================================================
                            CREATE EVENT
                        ================================================= */}

                        <Route
                            path="/organizer/create-event"
                            element={
                                <CreateEvent />
                            }
                        />


                        {/* =================================================
                            EDIT EVENT
                        ================================================= */}

                        <Route
                            path="/organizer/edit-event/:id"
                            element={
                                <EditEvent />
                            }
                        />


                        {/* =================================================
                            MANAGE EVENT
                        ================================================= */}

                        <Route
                            path="/organizer/manage-event/:id"
                            element={
                                <ManageEvent />
                            }
                        />


                        {/* =================================================
                            EVENT PARTICIPANTS
                            
                            IMPORTANT:
                            This route MUST be inside the
                            ORGANIZER protected route, not
                            the participant protected route.
                        ================================================= */}

                        <Route
                            path="/organizer/participants/:eventId"
                            element={
                                <Participants />
                            }
                        />

                    </Route>

                </Route>


                {/* =================================================
                    ADMIN PROTECTED ROUTES
                ================================================= */}

                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "admin",
                            ]}
                        />
                    }
                >

                    <Route element={<AdminLayout />}>

                        {/* ADMIN DASHBOARD */}

                        <Route
                            path="/admin/dashboard"
                            element={
                                <AdminDashboard />
                            }
                        />


                        {/* MANAGE ORGANIZERS */}

                        <Route
                            path="/admin/organizers"
                            element={
                                <ManageOrganizers />
                            }
                        />

                    </Route>

                </Route>


                {/* =================================================
                    FALLBACK
                ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
};

export default App;