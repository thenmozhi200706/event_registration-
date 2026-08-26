import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./OrganizerDashboard.css";
const OrganizerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="organizer-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Organizer Dashboard</h1>

          <p>
            Welcome, {user?.name || "Organizer"}!
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="logout-button"
        >
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Manage Your Events</h2>

          <p>
            Create events, manage your events, and view
            registered participants from your organizer dashboard.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link
            to="/organizer/events"
            className="dashboard-action-card"
          >
            <h3>My Events</h3>

            <p>
              View and manage the events you have created.
            </p>
          </Link>

          <Link
            to="/organizer/create-event"
            className="dashboard-action-card"
          >
            <h3>Create Event</h3>

            <p>
              Create a new event with its details, venue,
              date, and registration fee.
            </p>
          </Link>

          <Link
            to="/organizer/profile"
            className="dashboard-action-card"
          >
            <h3>Organizer Profile</h3>

            <p>
              View your organizer account information.
            </p>
          </Link>

          <Link
            to="/organizer/verify-otp"
            className="dashboard-action-card"
          >
            <h3>Verify Organizer</h3>

            <p>
              Verify your organizer account using the OTP
              sent to your email.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;