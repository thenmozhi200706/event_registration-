// frontend/src/components/organizer/OrganizerSidebar.jsx

import React from "react";
import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import {
    useAuth,
} from "../../context/AuthContext";

import "./OrganizerSidebar.css";


const OrganizerSidebar = ({
    isOpen = true,
    onClose,
}) => {

    const navigate =
        useNavigate();


    // =========================================================
    // AUTH CONTEXT
    // =========================================================

    const {
        user,
        logout,
    } = useAuth();


    // =========================================================
    // USER NAME
    // =========================================================

    const displayName =
        user?.name ||
        user?.fullName ||
        "Organizer";


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {

        console.log(
            "EventSphere: Sidebar logout clicked"
        );


        // Close mobile sidebar
        if (onClose) {
            onClose();
        }


        try {

            // Use centralized AuthContext logout.
            // This clears React auth state and
            // authentication storage.
            await logout();

        } catch (error) {

            console.error(
                "Sidebar logout error:",
                error
            );

        } finally {

            // Always go to login page,
            // even if backend logout fails.
            navigate(
                "/login",
                {
                    replace: true,
                }
            );
        }
    };


    // =========================================================
    // NAVIGATION
    // =========================================================

    const handleNavigation = () => {

        if (onClose) {
            onClose();
        }
    };


    // =========================================================
    // NAVIGATION ITEMS
    // =========================================================

    const navItems = [

        {
            label: "Dashboard",
            path: "/organizer/dashboard",
            icon: "⌂",
        },

        {
            label: "My Events",
            path: "/organizer/events",
            icon: "▣",
        },

        {
            label: "Create Event",
            path: "/organizer/events/create",
            icon: "+",
        },

        {
            label: "Analytics",
            path: "/organizer/analytics",
            icon: "◫",
        },

    ];


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <>

            {/* =================================================
                MOBILE OVERLAY
            ================================================= */}

            {isOpen && onClose && (

                <div
                    className="organizer-sidebar-overlay"
                    onClick={onClose}
                    aria-hidden="true"
                />

            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`organizer-sidebar ${
                    isOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >

                {/* =================================================
                    LOGO
                ================================================= */}

                <div className="organizer-sidebar-logo">

                    <div className="organizer-logo-mark">
                        ES
                    </div>


                    <div className="organizer-logo-text">

                        <strong>
                            EventSphere
                        </strong>

                        <span>
                            ORGANIZER
                        </span>

                    </div>


                    {/* MOBILE CLOSE */}

                    {onClose && (

                        <button
                            type="button"
                            className="organizer-sidebar-close"
                            onClick={onClose}
                            aria-label="Close sidebar"
                        >
                            ×
                        </button>

                    )}

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav
                    className="organizer-sidebar-nav"
                    aria-label="Organizer navigation"
                >

                    <p className="organizer-nav-title">
                        MANAGEMENT
                    </p>


                    {navItems.map(
                        (item) => (

                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={
                                    handleNavigation
                                }
                                className={({
                                    isActive,
                                }) =>
                                    `organizer-nav-link ${
                                        isActive
                                            ? "active"
                                            : ""
                                    }`
                                }
                            >

                                <span className="organizer-nav-icon">
                                    {item.icon}
                                </span>


                                <span className="organizer-nav-label">
                                    {item.label}
                                </span>

                            </NavLink>

                        )
                    )}

                </nav>


                {/* =================================================
                    QUICK ACTION
                ================================================= */}

                <div className="organizer-sidebar-quick">

                    <div className="quick-card">

                        <span className="quick-card-icon">
                            +
                        </span>


                        <div>

                            <strong>
                                Create Event
                            </strong>

                            <small>
                                Publish a new event
                            </small>

                        </div>


                        <button
                            type="button"
                            onClick={() => {

                                navigate(
                                    "/organizer/events/create"
                                );

                                handleNavigation();

                            }}
                            aria-label="Create Event"
                        >
                            →
                        </button>

                    </div>

                </div>


                {/* =================================================
                    BOTTOM SECTION
                ================================================= */}

                <div className="organizer-sidebar-bottom">

                    <div className="organizer-sidebar-divider" />


                    {/* =================================================
                        ORGANIZER PROFILE
                    ================================================= */}

                    <button
                        type="button"
                        className="organizer-sidebar-profile"
                        onClick={() => {

                            navigate(
                                "/organizer/dashboard"
                            );

                            handleNavigation();

                        }}
                    >

                        <div className="organizer-profile-avatar">

                            {displayName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <div className="organizer-profile-info">

                            <strong>
                                {displayName}
                            </strong>

                            <span>
                                Event Manager
                            </span>

                        </div>

                    </button>


                    {/* =================================================
                        LOGOUT
                    ================================================= */}

                    <button
                        type="button"
                        className="organizer-logout-button"
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

            </aside>

        </>
    );
};


export default OrganizerSidebar;