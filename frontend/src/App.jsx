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



// Public / participant event details

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



import EventDetails from "./pages/organizer/EventDetails";

import EventRegistrations from "./pages/organizer/EventRegistrations";

import ManageEvent from "./pages/organizer/ManageEvent";



// IMPORTANT:

// Old working participant management page

import Participants from "./pages/organizer/Participants";



import OrganizerAnalytics from "./pages/organizer/OrganizerAnalytics";

import OrganizerRegistrations from "./pages/organizer/OrganizerRegistrations";



// =====================================================

// ADMIN PAGES

// =====================================================



import AdminDashboard from "./pages/admin/AdminDashboard";

import ManageOrganizers from "./pages/admin/ManageOrganizers";

import AdminAnalytics from "./pages/admin/AdminAnalytics";



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



                    {/* PUBLIC EVENT DETAILS

                        Participant-facing page

                    */}



                    <Route

                        path="/events/:eventId"

                        element={<EventDetailsPage />}

                    />



                </Route>





                {/* =================================================

                    ORGANIZER OTP

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



                        {/* =================================================

                            ORGANIZER DASHBOARD

                        ================================================= */}



                        <Route

                            path="/organizer/dashboard"

                            element={

                                <OrganizerDashboard />

                            }

                        />





                        {/* =================================================

                            MY EVENTS

                        ================================================= */}



                        <Route

                            path="/organizer/events"

                            element={

                                <MyEvents />

                            }

                        />

                        <Route

    path="/organizer/registrations"

    element={

        <OrganizerRegistrations />

    }

/>





                        {/* OLD COMPATIBILITY ROUTE */}



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

                            path="/organizer/events/create"

                            element={

                                <CreateEvent />

                            }

                        />





                        {/* OLD CREATE EVENT ROUTE */}



                        <Route

                            path="/organizer/create-event"

                            element={

                                <CreateEvent />

                            }

                        />





                        {/* =================================================

                            ORGANIZER EVENT DETAILS

                        ================================================= */}



                        <Route

                            path="/organizer/events/:id"

                            element={

                                <EventDetails />

                            }

                        />





                        {/* =================================================

                            EDIT EVENT

                        ================================================= */}



                        <Route

                            path="/organizer/events/:id/edit"

                            element={

                                <EditEvent />

                            }

                        />





                        {/* OLD EDIT EVENT ROUTE */}



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

                            path="/organizer/events/:id/manage"

                            element={

                                <ManageEvent />

                            }

                        />





                        {/* OLD MANAGE EVENT ROUTE */}



                        <Route

                            path="/organizer/manage-event/:id"

                            element={

                                <ManageEvent />

                            }

                        />





                        {/* =================================================

                            EVENT REGISTRATIONS

                        ================================================= */}



                        <Route

                            path="/organizer/events/:id/registrations"

                            element={

                                <EventRegistrations />

                            }

                        />





                        {/* =================================================

                            PARTICIPANTS



                            THIS IS THE OLD WORKING ROUTE

                            KEEP THIS ROUTE

                        ================================================= */}



                        <Route

                            path="/organizer/participants/:eventId"

                            element={

                                <Participants />

                            }

                        />





                        {/* =================================================

                            OLD PARTICIPANT ROUTE ALIAS

                        ================================================= */}



                        <Route

                            path="/organizer/events/:id/participants"

                            element={

                                <Participants />

                            }

                        />





                        {/* =================================================

                            ORGANIZER ANALYTICS

                        ================================================= */}



                        <Route

                            path="/organizer/analytics"

                            element={

                                <OrganizerAnalytics />

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

                        <Route

        path="/admin/analytics"

        element={<AdminAnalytics />}

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
