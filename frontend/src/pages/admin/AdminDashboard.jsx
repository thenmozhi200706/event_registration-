    import React, {

        useCallback,

        useEffect,

        useState,

    } from "react";



    import axios from "axios";



    import {

        Link,

        useNavigate,

    } from "react-router-dom";



    import "./AdminDashboard.css";



    // ============================================================

    // DASHBOARD COMPONENTS

    // ============================================================



    import DashboardStats from "../../components/admin/DashboardStats";

    import RegistrationChart from "../../components/admin/RegistrationChart";

    import RevenueChart from "../../components/admin/RevenueChart";

    import PopularEvents from "../../components/admin/PopularEvents";

    import EventStatistics from "../../components/admin/EventStatistics";

    import RecentRegistrations from "../../components/admin/RecentRegistrations";



    // ============================================================

    // API CONFIGURATION

    // ============================================================



    const API_BASE_URL =

        import.meta.env.VITE_API_BASE_URL ||

        "http://localhost:5000";



    // Remove trailing slash

    const BASE_URL = API_BASE_URL.replace(/\/+$/, "");



    // ============================================================

    // TOKEN KEYS

    // ============================================================



    const TOKEN_KEYS = [

        "token",

        "accessToken",

        "jwt",

        "authToken",

        "auth_token",

        "access_token",

        "eventSphereToken",

        "eventSphere_token",

    ];



    // ============================================================

    // USER STORAGE KEYS

    // ============================================================



    const USER_KEYS = [

        "user",

        "admin",

        "currentUser",

        "authUser",

    ];



    // ============================================================

    // CLEAN TOKEN

    // ============================================================



    const cleanToken = (value) => {

        if (!value || typeof value !== "string") {

            return null;

        }



        const token = value.trim();



        if (!token) {

            return null;

        }



        if (token.startsWith("Bearer ")) {

            return token.substring(7).trim();

        }



        return token;

    };



    // ============================================================

    // READ STORAGE

    // ============================================================



    const readStorage = (storage, key) => {

        try {

            return storage.getItem(key);

        } catch (error) {

            console.error(

                "Storage read error:",

                error

            );



            return null;

        }

    };



    // ============================================================

    // PARSE JSON

    // ============================================================



    const parseJSON = (value) => {

        if (!value || typeof value !== "string") {

            return null;

        }



        try {

            return JSON.parse(value);

        } catch {

            return null;

        }

    };



    // ============================================================

    // GET TOKEN PAYLOAD

    // ============================================================



    const getTokenPayload = (token) => {

        try {

            if (!token) {

                return null;

            }



            const parts = token.split(".");



            if (parts.length !== 3) {

                return null;

            }



            const base64 = parts[1]

                .replace(/-/g, "+")

                .replace(/\_/g, "/");



            const padded =

                base64 +

                "=".repeat(

                    (4 - (base64.length % 4)) % 4

                );



            const json = decodeURIComponent(

                atob(padded)

                    .split("")

                    .map(

                        (character) =>

                            "%" +

                            (

                                "00" +

                                character

                                    .charCodeAt(0)

                                    .toString(16)

                            ).slice(-2)

                    )

                    .join("")

            );



            return JSON.parse(json);

        } catch (error) {

            console.warn(

                "Unable to decode JWT:",

                error

            );



            return null;

        }

    };



    // ============================================================

    // CHECK TOKEN EXPIRATION

    // ============================================================



    const isTokenExpired = (token) => {

        if (!token) {

            return true;

        }



        const payload = getTokenPayload(token);



        // If token cannot be decoded, allow backend

        // to decide whether it is valid.

        if (!payload) {

            return false;

        }



        // JWT exp is in seconds.

        if (!payload.exp) {

            return false;

        }



        const currentTime =

            Math.floor(Date.now() / 1000);



        return payload.exp <= currentTime;

    };



    // ============================================================

    // GET AUTH TOKEN

    // ============================================================



    const getAuthToken = () => {

        // --------------------------------------------------------

        // 1. localStorage

        // --------------------------------------------------------



        for (const key of TOKEN_KEYS) {

            const value = readStorage(

                localStorage,

                key

            );



            const token = cleanToken(value);



            if (token) {

                return token;

            }

        }



        // --------------------------------------------------------

        // 2. sessionStorage

        // --------------------------------------------------------



        for (const key of TOKEN_KEYS) {

            const value = readStorage(

                sessionStorage,

                key

            );



            const token = cleanToken(value);



            if (token) {

                return token;

            }

        }



        // --------------------------------------------------------

        // 3. Stored user object

        // --------------------------------------------------------



        for (const key of USER_KEYS) {

            const localUser = parseJSON(

                readStorage(

                    localStorage,

                    key

                )

            );



            const sessionUser = parseJSON(

                readStorage(

                    sessionStorage,

                    key

                )

            );



            const user =

                localUser || sessionUser;



            if (!user) {

                continue;

            }



            const possibleToken =

                user.token ||

                user.accessToken ||

                user.jwt ||

                user.authToken ||

                user.auth_token ||

                user.access_token;



            const token =

                cleanToken(possibleToken);



            if (token) {

                return token;

            }

        }



        return null;

    };



    // ============================================================

    // CLEAR AUTH DATA

    // ============================================================



    const clearAuthData = () => {

        // --------------------------------------------------------

        // Remove token keys

        // --------------------------------------------------------



        TOKEN_KEYS.forEach((key) => {

            try {

                localStorage.removeItem(key);

            } catch {

                // Ignore

            }



            try {

                sessionStorage.removeItem(key);

            } catch {

                // Ignore

            }

        });



        // --------------------------------------------------------

        // Remove user keys

        // --------------------------------------------------------



        USER_KEYS.forEach((key) => {

            try {

                localStorage.removeItem(key);

            } catch {

                // Ignore

            }



            try {

                sessionStorage.removeItem(key);

            } catch {

                // Ignore

            }

        });

    };



    // ============================================================

    // FORMAT NUMBER

    // ============================================================



    const formatNumber = (value) => {

        return Number(

            value || 0

        ).toLocaleString("en-IN");

    };



    // ============================================================

    // FORMAT CURRENCY

    // ============================================================



    const formatCurrency = (value) => {

        return Number(

            value || 0

        ).toLocaleString("en-IN", {

            maximumFractionDigits: 0,

        });

    };



    // ============================================================

    // ADMIN DASHBOARD

    // ============================================================



    const AdminDashboard = () => {

        const navigate = useNavigate();



        // ========================================================

        // STATE

        // ========================================================



        const [

            dashboardData,

            setDashboardData,

        ] = useState({});



        const [

            loading,

            setLoading,

        ] = useState(true);



        const [

            refreshing,

            setRefreshing,

        ] = useState(false);



        const [

            error,

            setError,

        ] = useState("");



        // ========================================================

        // GO TO LOGIN

        // ========================================================



        const goToLogin = useCallback(() => {

            clearAuthData();



            navigate("/login", {

                replace: true,

                state: {

                    message:

                        "Your login session has expired. Please login again.",

                },

            });

        }, [navigate]);



        // ========================================================

        // FETCH DASHBOARD

        // ========================================================



        const fetchDashboard = useCallback(

            async (isRefresh = false) => {

                try {

                    // --------------------------------------------

                    // Loading state

                    // --------------------------------------------



                    if (isRefresh) {

                        setRefreshing(true);

                    } else {

                        setLoading(true);

                    }



                    setError("");



                    // --------------------------------------------

                    // Get token

                    // --------------------------------------------



                    const token =

                        getAuthToken();



                    console.log(

                        "EventSphere Admin Dashboard:",

                        {

                            api:

                                `${BASE_URL}/api/admin/dashboard`,

                            token:

                                token

                                    ? "FOUND"

                                    : "NOT FOUND",

                        }

                    );



                    // --------------------------------------------

                    // No token

                    // --------------------------------------------



                    if (!token) {

                        goToLogin();

                        return;

                    }



                    // --------------------------------------------

                    // Check token expiration BEFORE API call

                    // --------------------------------------------



                    if (isTokenExpired(token)) {

                        console.warn(

                            "EventSphere JWT has expired."

                        );



                        goToLogin();

                        return;

                    }



                    // --------------------------------------------

                    // API request

                    // --------------------------------------------



                    const response =

                        await axios.get(

                            `${BASE_URL}/api/admin/dashboard`,

                            {

                                headers: {

                                    Authorization:

                                        `Bearer ${token}`,



                                    Accept:

                                        "application/json",

                                },



                                timeout: 15000,

                            }

                        );



                    console.log(

                        "EventSphere Admin Dashboard Response:",

                        response.data

                    );



                    // --------------------------------------------

                    // Successful response

                    // --------------------------------------------



                    if (

                        response.data?.success === true

                    ) {

                        const data =

                            response.data.dashboard ||

                            response.data.data ||

                            response.data;



                        setDashboardData(

                            data || {}

                        );



                        setError("");



                        return;

                    }



                    // --------------------------------------------

                    // API returned success false

                    // --------------------------------------------



                    setError(

                        response.data?.message ||

                        "Unable to load admin dashboard."

                    );

                } catch (err) {

                    console.error(

                        "EventSphere Admin Dashboard Error:",

                        err

                    );



                    // --------------------------------------------

                    // 401 Unauthorized

                    // --------------------------------------------



                    if (

                        err.response?.status === 401

                    ) {

                        console.warn(

                            "Admin session expired or invalid."

                        );



                        goToLogin();

                        return;

                    }



                    // --------------------------------------------

                    // 403 Forbidden

                    // --------------------------------------------



                    if (

                        err.response?.status === 403

                    ) {

                        setError(

                            "Access denied. Only administrators can access this dashboard."

                        );



                        return;

                    }



                    // --------------------------------------------

                    // Backend unavailable

                    // --------------------------------------------



                    if (!err.response) {

                        setError(

                            `Unable to connect to the EventSphere backend at ${BASE_URL}. Make sure the backend server is running.`

                        );



                        return;

                    }



                    // --------------------------------------------

                    // Other API error

                    // --------------------------------------------



                    setError(

                        err.response?.data?.message ||

                        "Unable to load admin dashboard."

                    );

                } finally {

                    setLoading(false);

                    setRefreshing(false);

                }

            },

            [goToLogin]

        );



        // ========================================================

        // INITIAL LOAD

        // ========================================================



        useEffect(() => {

            fetchDashboard(false);

        }, [fetchDashboard]);



        // ========================================================

        // LOGOUT

        // ========================================================



        const handleLogout = () => {

            clearAuthData();



            navigate("/login", {

                replace: true,

            });

        };



        // ========================================================

        // DASHBOARD VALUES

        // ========================================================



        const totalEvents = Number(

            dashboardData?.totalEvents ??

            dashboardData?.eventAnalytics

                ?.totalEvents ??

            dashboardData?.events

                ?.totalEvents ??

            0

        );



        const activeEvents = Number(

            dashboardData?.activeEvents ??

            dashboardData?.eventAnalytics

                ?.activeEvents ??

            dashboardData?.events

                ?.activeEvents ??

            0

        );



        const closedEvents = Number(

            dashboardData?.closedEvents ??

            dashboardData?.eventAnalytics

                ?.closedEvents ??

            dashboardData?.events

                ?.closedEvents ??

            0

        );



        const totalRegistrations = Number(

            dashboardData?.totalRegistrations ??

            dashboardData?.registrationAnalytics

                ?.totalRegistrations ??

            dashboardData?.registrations

                ?.totalRegistrations ??

            0

        );



        const paidRegistrations = Number(

            dashboardData?.paidRegistrations ??

            dashboardData?.registrationAnalytics

                ?.paidRegistrations ??

            dashboardData?.registrations

                ?.paidRegistrations ??

            0

        );



        const pendingRegistrations = Number(

            dashboardData?.pendingRegistrations ??

            dashboardData?.registrationAnalytics

                ?.pendingRegistrations ??

            dashboardData?.registrations

                ?.pendingRegistrations ??

            0

        );



        const failedRegistrations = Number(

            dashboardData?.failedRegistrations ??

            dashboardData?.registrationAnalytics

                ?.failedRegistrations ??

            dashboardData?.registrations

                ?.failedRegistrations ??

            0

        );



        const totalRevenue = Number(

            dashboardData?.totalRevenue ??

            dashboardData?.paymentAnalytics

                ?.totalRevenue ??

            dashboardData?.payments

                ?.totalRevenue ??

            0

        );



        const totalUsers = Number(

            dashboardData?.totalUsers ??

            dashboardData?.userAnalytics

                ?.totalUsers ??

            dashboardData?.users

                ?.totalUsers ??

            0

        );



        const totalOrganizers = Number(

            dashboardData?.totalOrganizers ??

            dashboardData?.userAnalytics

                ?.totalOrganizers ??

            dashboardData?.users

                ?.totalOrganizers ??

            0

        );



        const totalParticipants = Number(

            dashboardData?.totalParticipants ??

            dashboardData?.userAnalytics

                ?.totalParticipants ??

            dashboardData?.users

                ?.totalParticipants ??

            0

        );



        // ========================================================

        // REGISTRATION TREND

        // ========================================================



        const registrationTrend =

            dashboardData?.registrationTrend ||

            dashboardData?.registrationAnalytics

                ?.registrationTrend ||

            dashboardData?.registrationTrends ||

            [];



        // ========================================================

        // REVENUE TREND

        // ========================================================



        const revenueTrend =

            dashboardData?.revenueTrend ||

            dashboardData?.paymentAnalytics

                ?.revenueTrend ||

            dashboardData?.revenueTrends ||

            [];



        // ========================================================

        // POPULAR EVENTS

        // ========================================================



        const popularEvents =

            dashboardData?.popularEvents ||

            dashboardData?.eventAnalytics

                ?.popularEvents ||

            dashboardData?.popular ||

            [];



        // ========================================================

        // RECENT REGISTRATIONS

        // ========================================================



        const recentRegistrations =

            dashboardData?.recentRegistrations ||

            dashboardData?.registrationAnalytics

                ?.recentRegistrations ||

            dashboardData?.recentRegistration ||

            [];



        // ========================================================

        // DASHBOARD STATS

        // ========================================================



        const stats = {

            totalEvents,

            activeEvents,

            closedEvents,



            totalRegistrations,

            paidRegistrations,

            pendingRegistrations,

            failedRegistrations,



            totalRevenue,



            totalUsers,

            totalOrganizers,

            totalParticipants,

        };



        // ========================================================

        // EVENT ANALYTICS

        // ========================================================



        const eventAnalytics = {

            totalEvents,

            activeEvents,

            closedEvents,



            draftEvents: Number(

                dashboardData?.draftEvents ??

                dashboardData?.eventAnalytics

                    ?.draftEvents ??

                0

            ),



            upcomingEvents: Number(

                dashboardData?.upcomingEvents ??

                dashboardData?.eventAnalytics

                    ?.upcomingEvents ??

                0

            ),

        };



        // ========================================================

        // LOADING SCREEN

        // ========================================================



        if (loading) {

            return (

                <div className="admin-dashboard">

                    <div className="dashboard-loading">

                        <div className="spinner"></div>



                        <span>

                            Loading admin dashboard...

                        </span>

                    </div>

                </div>

            );

        }



        // ========================================================

        // PAGE

        // ========================================================



        return (

            <div className="admin-dashboard">



                {/* ==================================================

                    HEADER

                ================================================== */}



                <div className="dashboard-header">



                    <div>

                        <h1>

                            Admin Dashboard

                        </h1>



                        <p>

                            Monitor events,

                            registrations,

                            participants and

                            revenue across

                            EventSphere.

                        </p>

                    </div>



                    <div

                        style={{

                            display: "flex",

                            gap: "10px",

                            alignItems: "center",

                        }}

                    >



                        {/* Refresh */}



                        <button

                            type="button"

                            className="logout-button"

                            onClick={() =>

                                fetchDashboard(true)

                            }

                            disabled={refreshing}

                        >

                            {refreshing

                                ? "Refreshing..."

                                : "Refresh"}

                        </button>



                        {/* Logout */}



                        <button

                            type="button"

                            className="logout-button"

                            onClick={handleLogout}

                        >

                            Logout

                        </button>



                    </div>



                </div>





                {/* ==================================================

                    ERROR

                ================================================== */}



                {error ? (



                    <div className="dashboard-error">



                        <strong>

                            Dashboard Error

                        </strong>



                        <p>

                            {error}

                        </p>



                        <div

                            style={{

                                display: "flex",

                                gap: "10px",

                                marginTop: "14px",

                            }}

                        >



                            <button

                                type="button"

                                className="logout-button"

                                onClick={() =>

                                    fetchDashboard(false)

                                }

                            >

                                Try Again

                            </button>



                            <button

                                type="button"

                                className="logout-button"

                                onClick={

                                    handleLogout

                                }

                            >

                                Go to Login

                            </button>



                        </div>



                    </div>



                ) : (



                    <>



                        {/* ==================================================

                            MAIN STATISTICS

                        ================================================== */}



                        <div className="admin-statistics">



                            <div className="stat-card">

                                <span className="stat-label">

                                    Total Events

                                </span>



                                <span className="stat-value">

                                    {formatNumber(

                                        totalEvents

                                    )}

                                </span>

                            </div>





                            <div className="stat-card">

                                <span className="stat-label">

                                    Total Registrations

                                </span>



                                <span className="stat-value">

                                    {formatNumber(

                                        totalRegistrations

                                    )}

                                </span>

                            </div>





                            <div className="stat-card">

                                <span className="stat-label">

                                    Total Revenue

                                </span>



                                <span className="stat-value">

                                    ₹

                                    {formatCurrency(

                                        totalRevenue

                                    )}

                                </span>

                            </div>





                            <div className="stat-card">

                                <span className="stat-label">

                                    Total Users

                                </span>



                                <span className="stat-value">

                                    {formatNumber(

                                        totalUsers

                                    )}

                                </span>

                            </div>



                        </div>





                        {/* ==================================================

                            ADMIN ACTIONS

                        ================================================== */}



                        <div className="admin-actions">



                                                                                    <Link

                                to="/admin/organizers"

                                className="dashboard-action-card"

                            >

                                <h3>

                                    Manage Organizers

                                </h3>



                                <p>

                                    Monitor organizer

                                    accounts,

                                    OTP verification

                                    and account

                                    status.

                                </p>



                                <span className="action-link">

                                    View Organizers →

                                </span>

                            </Link>





                            <Link

                                to="/admin/analytics"

                                className="dashboard-action-card"

                            >

                                <h3>

                                    Analytics & Reports

                                </h3>



                                <p>

                                    View detailed

                                    registration,

                                    revenue and

                                    event analytics.

                                </p>



                                <span className="action-link">

                                    View Analytics →

                                </span>

                            </Link>



                        </div>





                        {/* ==================================================

                            PLATFORM OVERVIEW

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Platform Overview

                                    </h2>



                                    <p className="section-subtitle">

                                        Current EventSphere

                                        statistics

                                    </p>

                                </div>



                            </div>



                            <DashboardStats

                                stats={stats}

                                loading={false}

                            />



                        </div>





                        {/* ==================================================

                            REGISTRATION CHART

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Registration Overview

                                    </h2>



                                    <p className="section-subtitle">

                                        Registration

                                        activity over

                                        time

                                    </p>

                                </div>



                                <Link

                                    to="/admin/registrations"

                                    className="section-link"

                                >

                                    View All →

                                </Link>



                            </div>



                            <RegistrationChart

                                data={registrationTrend}

                                loading={false}

                            />



                        </div>





                        {/* ==================================================

                            REVENUE CHART

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Revenue Overview

                                    </h2>



                                    <p className="section-subtitle">

                                        Revenue generated

                                        from event

                                        registrations

                                    </p>

                                </div>



                                <Link

                                    to="/admin/analytics"

                                    className="section-link"

                                >

                                    Detailed Analytics →

                                </Link>



                            </div>



                            <RevenueChart

                                data={revenueTrend}

                                loading={false}

                            />



                        </div>





                        {/* ==================================================

                            EVENT STATISTICS

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Event Statistics

                                    </h2>



                                    <p className="section-subtitle">

                                        Current event

                                        activity

                                    </p>

                                </div>



                                <Link

                                    to="/admin/events"

                                    className="section-link"

                                >

                                    View Events →

                                </Link>



                            </div>



                            <EventStatistics

                                data={eventAnalytics}

                                loading={false}

                            />



                        </div>





                        {/* ==================================================

                            POPULAR EVENTS

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Popular Events

                                    </h2>



                                    <p className="section-subtitle">

                                        Events with the

                                        highest

                                        registrations

                                    </p>

                                </div>



                                <Link

                                    to="/admin/events"

                                    className="section-link"

                                >

                                    All Events →

                                </Link>



                            </div>



                            <PopularEvents

                                events={popularEvents}

                                loading={false}

                                limit={5}

                            />



                        </div>





                        {/* ==================================================

                            RECENT REGISTRATIONS

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Recent Registrations

                                    </h2>



                                    <p className="section-subtitle">

                                        Latest participant

                                        registrations

                                    </p>

                                </div>



                                <Link

                                    to="/admin/registrations"

                                    className="section-link"

                                >

                                    View All →

                                </Link>



                            </div>



                            <RecentRegistrations

                                registrations={

                                    recentRegistrations

                                }

                                loading={false}

                                limit={5}

                                showViewAll={false}

                            />



                        </div>





                        {/* ==================================================

                            REGISTRATION SUMMARY

                        ================================================== */}



                        <div className="dashboard-section">



                            <div className="section-header">



                                <div>

                                    <h2>

                                        Registration Summary

                                    </h2>



                                    <p className="section-subtitle">

                                        Current

                                        registration

                                        and payment

                                        status

                                    </p>

                                </div>



                            </div>





                            <div className="recent-list">



                                {/* PAID */}



                                <div className="recent-item">



                                    <div className="recent-item-info">



                                        <h3>

                                            Paid Registrations

                                        </h3>



                                        <p>

                                            Successfully

                                            completed

                                            payments

                                        </p>



                                    </div>



                                    <span className="status-active">

                                        {formatNumber(

                                            paidRegistrations

                                        )}

                                    </span>



                                </div>





                                {/* PENDING */}



                                <div className="recent-item">



                                    <div className="recent-item-info">



                                        <h3>

                                            Pending Registrations

                                        </h3>



                                        <p>

                                            Registrations

                                            waiting for

                                            payment

                                        </p>



                                    </div>



                                    <span className="status-active">

                                        {formatNumber(

                                            pendingRegistrations

                                        )}

                                    </span>



                                </div>





                                {/* FAILED */}



                                <div className="recent-item">



                                    <div className="recent-item-info">



                                        <h3>

                                            Failed Registrations

                                        </h3>



                                        <p>

                                            Registrations

                                            with failed

                                            payments

                                        </p>



                                    </div>



                                    <span className="status-inactive">

                                        {formatNumber(

                                            failedRegistrations

                                        )}

                                    </span>



                                </div>





                                {/* ORGANIZERS */}



                                <div className="recent-item">



                                    <div className="recent-item-info">



                                        <h3>

                                            Organizers

                                        </h3>



                                        <p>

                                            Total registered

                                            event organizers

                                        </p>



                                    </div>



                                    <span className="status-active">

                                        {formatNumber(

                                            totalOrganizers

                                        )}

                                    </span>



                                </div>





                                {/* PARTICIPANTS */}



                                <div className="recent-item">



                                    <div className="recent-item-info">



                                        <h3>

                                            Participants

                                        </h3>



                                        <p>

                                            Total participant

                                            accounts

                                        </p>



                                    </div>



                                    <span className="status-active">

                                        {formatNumber(

                                            totalParticipants

                                        )}

                                    </span>



                                </div>



                            </div>



                        </div>



                    </>

                )}



            </div>

        );

    };



    export default AdminDashboard;