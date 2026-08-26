import React from "react";
import { Link } from "react-router-dom";
import {
    CalendarDays,
    ArrowRight,
    Search,
    Ticket,
    Users,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

import "./Home.css";


const Home = () => {

    const {
        user,
        isAuthenticated,
    } = useAuth();


    /*
     * =====================================================
     * GET DASHBOARD PATH
     * =====================================================
     */

    const getDashboardPath = () => {

        const role = user?.role;

        switch (role) {

            case "admin":
                return "/admin/dashboard";

            case "organizer":
                return "/organizer/dashboard";

            case "participant":
            case "user":
                return "/dashboard";

            default:
                return "/login";
        }
    };


    /*
     * =====================================================
     * GET DASHBOARD BUTTON TEXT
     * =====================================================
     */

    const getDashboardText = () => {

        const role = user?.role;

        switch (role) {

            case "admin":
                return "Admin Dashboard";

            case "organizer":
                return "Organizer Dashboard";

            case "participant":
            case "user":
                return "My Dashboard";

            default:
                return "Login";
        }
    };


    /*
     * =====================================================
     * DASHBOARD PATH
     * =====================================================
     */

    const dashboardPath = getDashboardPath();


    /*
     * =====================================================
     * DASHBOARD TEXT
     * =====================================================
     */

    const dashboardText = getDashboardText();


    return (
        <div className="home-page">


            {/* =====================================================
                HERO SECTION
            ===================================================== */}

            <section className="home-hero">

                <div className="home-hero-content">


                    {/* =============================================
                        BADGE
                    ============================================= */}

                    <div className="home-badge">

                        <Sparkles size={14} />

                        <span>
                            Discover • Register • Experience
                        </span>

                    </div>


                    {/* =============================================
                        TITLE
                    ============================================= */}

                    <h1>
                        Find Events.
                        <br />
                        Create Memories.
                    </h1>


                    {/* =============================================
                        DESCRIPTION
                    ============================================= */}

                    <p>
                        Discover exciting events, register easily,
                        and manage all your event experiences
                        in one place with EventSphere.
                    </p>


                    {/* =============================================
                        HERO BUTTONS
                    ============================================= */}

                    <div className="home-hero-actions">


                        {/* Explore Events */}

                        <Link
                            to="/events"
                            className="home-primary-button"
                        >

                            <Search size={17} />

                            Explore Events

                            <ArrowRight size={16} />

                        </Link>


                        {/* =========================================
                            LOGIN / DASHBOARD
                        ========================================= */}

                        {isAuthenticated ? (

                            <Link
                                to={dashboardPath}
                                className="home-secondary-button"
                            >

                                {dashboardText}

                            </Link>

                        ) : (

                            <Link
                                to="/login"
                                className="home-secondary-button"
                            >

                                Login

                            </Link>

                        )}

                    </div>


                    {/* =============================================
                        TRUST ITEMS
                    ============================================= */}

                    <div className="home-trust">

                        <div className="home-trust-item">

                            <ShieldCheck size={15} />

                            <span>
                                Secure Registration
                            </span>

                        </div>


                        <div className="home-trust-item">

                            <Ticket size={15} />

                            <span>
                                Digital Tickets
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    HERO VISUAL
                ================================================= */}

                <div className="home-hero-visual">


                    {/* =============================================
                        FLOATING CARD ONE
                    ============================================= */}

                    <div className="home-floating-card card-one">

                        <div className="floating-icon">

                            <CalendarDays size={20} />

                        </div>


                        <div>

                            <strong>
                                Upcoming Events
                            </strong>

                            <span>
                                Discover something new
                            </span>

                        </div>

                    </div>


                    {/* =============================================
                        MAIN CARD
                    ============================================= */}

                    <div className="home-main-card">


                        <div className="home-main-card-top">

                            <div className="home-calendar-icon">

                                <CalendarDays size={25} />

                            </div>


                            <span>
                                EVENTSPHERE
                            </span>

                        </div>


                        {/* =========================================
                            EVENT PREVIEW
                        ========================================= */}

                        <div className="home-event-preview">

                            <span className="home-event-label">
                                FEATURED EVENT
                            </span>


                            <h3>
                                Discover Your Next
                                <br />
                                Experience
                            </h3>


                            <p>
                                Find technology, cultural,
                                academic and exciting events
                                happening around you.
                            </p>


                            <Link to="/events">

                                Browse Events

                                <ArrowRight size={15} />

                            </Link>

                        </div>


                        {/* =========================================
                            CARD FOOTER
                        ========================================= */}

                        <div className="home-card-footer">

                            <div>

                                <Users size={15} />

                                <span>
                                    Join the community
                                </span>

                            </div>


                            <div>

                                <Ticket size={15} />

                                <span>
                                    Easy registration
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* =============================================
                        FLOATING CARD TWO
                    ============================================= */}

                    <div className="home-floating-card card-two">

                        <div className="floating-avatar">

                            <Users size={18} />

                        </div>


                        <div>

                            <strong>
                                Event Community
                            </strong>

                            <span>
                                Connect & participate
                            </span>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                FEATURES
            ===================================================== */}

            <section className="home-features">


                <div className="home-section-heading">

                    <span>
                        WHY EVENTSPHERE
                    </span>


                    <h2>
                        Everything you need for events
                    </h2>


                    <p>
                        A simple platform for participants,
                        organizers and administrators.
                    </p>

                </div>


                <div className="home-feature-grid">


                    {/* =============================================
                        FEATURE 1
                    ============================================= */}

                    <div className="home-feature-card">

                        <div className="home-feature-icon purple">

                            <Search size={21} />

                        </div>


                        <h3>
                            Discover Events
                        </h3>


                        <p>
                            Browse available events and
                            find experiences that match
                            your interests.
                        </p>


                        <Link to="/events">

                            Explore events

                            <ArrowRight size={14} />

                        </Link>

                    </div>


                    {/* =============================================
                        FEATURE 2
                    ============================================= */}

                    <div className="home-feature-card">

                        <div className="home-feature-icon blue">

                            <Ticket size={21} />

                        </div>


                        <h3>
                            Easy Registration
                        </h3>


                        <p>
                            Register for events with a
                            simple and convenient process.
                        </p>


                        <Link to="/events">

                            Find an event

                            <ArrowRight size={14} />

                        </Link>

                    </div>


                    {/* =============================================
                        FEATURE 3
                    ============================================= */}

                    <div className="home-feature-card">

                        <div className="home-feature-icon green">

                            <ShieldCheck size={21} />

                        </div>


                        <h3>
                            Secure Payments
                        </h3>


                        <p>
                            Complete paid-event registrations
                            through secure payment methods.
                        </p>


                        {isAuthenticated ? (

                            <Link to={dashboardPath}>

                                Open Dashboard

                                <ArrowRight size={14} />

                            </Link>

                        ) : (

                            <Link to="/login">

                                Get started

                                <ArrowRight size={14} />

                            </Link>

                        )}

                    </div>

                </div>

            </section>


            {/* =====================================================
                CTA
            ===================================================== */}

            <section className="home-cta">


                <div>

                    <div className="home-cta-icon">

                        <Sparkles size={21} />

                    </div>


                    <h2>
                        Ready to discover your next event?
                    </h2>


                    <p>
                        Explore EventSphere and find an
                        experience worth remembering.
                    </p>

                </div>


                <Link
                    to="/events"
                    className="home-cta-button"
                >

                    Explore Events

                    <ArrowRight size={16} />

                </Link>

            </section>


            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="home-footer">


                <div className="home-footer-brand">


                    <div className="home-footer-logo">

                        <CalendarDays size={17} />

                    </div>


                    <strong>
                        EventSphere
                    </strong>

                </div>


                <span>

                    © {new Date().getFullYear()}
                    {" "}
                    EventSphere.
                    {" "}
                    All rights reserved.

                </span>


                {/* =============================================
                    FOOTER LOGIN / DASHBOARD
                ============================================= */}

                <div className="home-footer-action">

                    {isAuthenticated ? (

                        <Link to={dashboardPath}>

                            {dashboardText}

                        </Link>

                    ) : (

                        <Link to="/login">

                            Login

                        </Link>

                    )}

                </div>

            </footer>

        </div>
    );
};


export default Home;