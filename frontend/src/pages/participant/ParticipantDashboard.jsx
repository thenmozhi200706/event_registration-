import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./ParticipantDashboard.css";

const ParticipantDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="participant-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Participant Dashboard</h1>

          <p>
            Welcome, {user?.name || "Participant"}!
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
          <h2>Welcome to EventSphere</h2>

          <p>
            Browse events, register for events, and manage
            your registrations from your dashboard.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link
            to="/events"
            className="dashboard-action-card"
          >
            <h3>Browse Events</h3>

            <p>
              Find available events and view their details.
            </p>
          </Link>

          <Link
            to="/my-registrations"
            className="dashboard-action-card"
          >
            <h3>My Registrations</h3>

            <p>
              View your event registrations and payment status.
            </p>
          </Link>

          <Link
            to="/profile"
            className="dashboard-action-card"
          >
            <h3>My Profile</h3>

            <p>
              View and manage your participant information.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;