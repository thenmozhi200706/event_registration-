// frontend/src/components/organizer/OrganizerHeader.jsx

import React, {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import "./OrganizerHeader.css";


const OrganizerHeader = ({
    title = "Organizer Dashboard",
    subtitle = "Manage your events and registrations",
    onMenuClick,
}) => {

    const navigate =
        useNavigate();


    // =========================================================
    // AUTH
    // =========================================================

    const {
        user,
        logout,
    } = useAuth();


    // =========================================================
    // STATE
    // =========================================================

    const [
        showMenu,
        setShowMenu,
    ] = useState(false);


    const [
        imageError,
        setImageError,
    ] = useState(false);


    // =========================================================
    // USER DATA
    // =========================================================

    const displayName =
        user?.name ||
        user?.fullName ||
        user?.displayName ||
        "Organizer";


    const email =
        user?.email ||
        "Organizer Account";


    const profileImage =
        user?.profileImage ||
        user?.photoURL ||
        user?.picture ||
        "";


    // =========================================================
    // RESET IMAGE ERROR WHEN USER / IMAGE CHANGES
    // =========================================================

    useEffect(() => {

        setImageError(false);

    }, [
        profileImage,
    ]);


    // =========================================================
    // INITIALS
    // =========================================================

    const getInitials = (name) => {

        if (!name) {
            return "O";
        }


        const words =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            words.length === 0
        ) {
            return "O";
        }


        if (
            words.length === 1
        ) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0].charAt(0) +
            words[
                words.length - 1
            ].charAt(0)
        ).toUpperCase();
    };


    const initials =
        getInitials(
            displayName
        );


    // =========================================================
    // PROFILE IMAGE ERROR
    // =========================================================

    const handleImageError = () => {

        console.warn(
            "EventSphere: Profile image could not be loaded."
        );

        setImageError(true);
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {

        console.log(
            "EventSphere: Logout clicked"
        );


        setShowMenu(false);


        try {

            await logout();

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        } finally {

            navigate(
                "/login",
                {
                    replace: true,
                }
            );
        }
    };


    // =========================================================
    // DASHBOARD
    // =========================================================

    const handleDashboard = () => {

        setShowMenu(false);

        navigate(
            "/organizer/dashboard"
        );
    };


    // =========================================================
    // MY EVENTS
    // =========================================================

    const handleMyEvents = () => {

        setShowMenu(false);

        navigate(
            "/organizer/events"
        );
    };


    // =========================================================
    // CREATE EVENT
    // =========================================================

    const handleCreateEvent = () => {

        setShowMenu(false);

        navigate(
            "/organizer/events/create"
        );
    };


    // =========================================================
    // REGISTRATIONS
    // =========================================================

    const handleRegistrations = () => {

        setShowMenu(false);

        navigate(
            "/organizer/registrations"
        );
    };


    // =========================================================
    // ANALYTICS
    // =========================================================

    const handleAnalytics = () => {

        setShowMenu(false);

        navigate(
            "/organizer/analytics"
        );
    };


    // =========================================================
    // PROFILE IMAGE COMPONENT
    // =========================================================

    const renderAvatar = (
        className = "organizer-header-avatar"
    ) => {

        /*
         * Only show the image when:
         *
         * 1. profileImage exists
         * 2. imageError is false
         */

        if (
            profileImage &&
            !imageError
        ) {

            return (

                <img
                    src={profileImage}
                    alt={`${displayName} profile`}
                    className={className}
                    onError={
                        handleImageError
                    }
                    referrerPolicy="no-referrer"
                />

            );
        }


        // -----------------------------------------------------
        // FALLBACK
        // -----------------------------------------------------

        return (

            <div
                className={`${className} organizer-header-avatar-placeholder`}
                aria-label={displayName}
            >
                {initials}
            </div>

        );
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <header className="organizer-header">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="organizer-header-left">

                {/* MOBILE MENU */}

                {onMenuClick && (

                    <button
                        type="button"
                        className="organizer-menu-button"
                        onClick={onMenuClick}
                        aria-label="Open organizer menu"
                    >

                        <span></span>
                        <span></span>
                        <span></span>

                    </button>

                )}


                {/* TITLE */}

                <div className="organizer-header-title">

                    <h1>
                        {title}
                    </h1>

                    <p>
                        {subtitle}
                    </p>

                </div>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div className="organizer-header-right">

                {/* =================================================
                    CREATE EVENT
                ================================================= */}

                <button
                    type="button"
                    className="header-create-event"
                    onClick={
                        handleCreateEvent
                    }
                >

                    <span>
                        +
                    </span>

                    Create Event

                </button>


                {/* =================================================
                    REGISTRATIONS
                ================================================= */}

                <button
                    type="button"
                    className="organizer-notification-button"
                    onClick={
                        handleRegistrations
                    }
                    aria-label="Registrations"
                    title="Registrations"
                >

                    <span className="notification-icon">
                        ♢
                    </span>

                    <span className="notification-dot"></span>

                </button>


                {/* =================================================
                    PROFILE
                ================================================= */}

                <div className="organizer-header-profile">

                    <button
                        type="button"
                        className="organizer-profile-button"
                        onClick={() =>
                            setShowMenu(
                                (previous) =>
                                    !previous
                            )
                        }
                        aria-expanded={
                            showMenu
                        }
                        aria-haspopup="true"
                    >

                        {/* AVATAR */}

                        {renderAvatar(
                            "organizer-header-avatar"
                        )}


                        {/* USER INFO */}

                        <div className="organizer-header-user">

                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                {email}
                            </span>

                        </div>


                        {/* ARROW */}

                        <span className="organizer-profile-arrow">

                            {showMenu
                                ? "⌃"
                                : "⌄"}

                        </span>

                    </button>


                    {/* =================================================
                        PROFILE DROPDOWN
                    ================================================= */}

                    {showMenu && (

                        <div className="organizer-profile-dropdown">

                            {/* PROFILE HEADER */}

                            <div className="profile-dropdown-header">

                                {renderAvatar(
                                    "dropdown-avatar"
                                )}


                                <div>

                                    <strong>
                                        {displayName}
                                    </strong>

                                    <span>
                                        {email}
                                    </span>

                                </div>

                            </div>


                            <div className="profile-dropdown-divider" />


                            {/* DASHBOARD */}

                            <button
                                type="button"
                                onClick={
                                    handleDashboard
                                }
                            >

                                <span>
                                    ◉
                                </span>

                                Dashboard

                            </button>


                            {/* MY EVENTS */}

                            <button
                                type="button"
                                onClick={
                                    handleMyEvents
                                }
                            >

                                <span>
                                    ▣
                                </span>

                                My Events

                            </button>


                            {/* REGISTRATIONS */}

                            <button
                                type="button"
                                onClick={
                                    handleRegistrations
                                }
                            >

                                <span>
                                    ◎
                                </span>

                                Registrations

                            </button>


                            {/* ANALYTICS */}

                            <button
                                type="button"
                                onClick={
                                    handleAnalytics
                                }
                            >

                                <span>
                                    ◫
                                </span>

                                Analytics

                            </button>


                            <div className="profile-dropdown-divider" />


                            {/* LOGOUT */}

                            <button
                                type="button"
                                className="profile-logout"
                                onClick={
                                    handleLogout
                                }
                            >

                                <span>
                                    ↪
                                </span>

                                Logout

                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
};


export default OrganizerHeader;