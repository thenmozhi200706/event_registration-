import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useApi from "../../hooks/useApi";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { get, loading, error } = useApi();

  const [dashboard, setDashboard] = useState({
    totalOrganizers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    recentEvents: [],
    recentOrganizers: [],
  });

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        /*
         * Backend endpoint:
         *
         * GET /api/admin/dashboard
         *
         * Expected dashboard data:
         * {
         *   totalOrganizers,
         *   totalEvents,
         *   totalRegistrations,
         *   totalRevenue,
         *   recentEvents,
         *   recentOrganizers
         * }
         */

        const response = await get("/admin/dashboard");

        if (!mounted) return;

        /*
         * Support different response structures:
         *
         * 1. response = dashboard
         * 2. response.data = dashboard
         * 3. response.data.dashboard = dashboard
         * 4. response.dashboard = dashboard
         */

        const responseData = response?.data ?? response;

        const data =
          responseData?.dashboard ??
          responseData;

        setDashboard({
          totalOrganizers:
            Number(data?.totalOrganizers) || 0,

          totalEvents:
            Number(data?.totalEvents) || 0,

          totalRegistrations:
            Number(data?.totalRegistrations) || 0,

          totalRevenue:
            Number(data?.totalRevenue) || 0,

          recentEvents:
            Array.isArray(data?.recentEvents)
              ? data.recentEvents
              : [],

          recentOrganizers:
            Array.isArray(data?.recentOrganizers)
              ? data.recentOrganizers
              : [],
        });
      } catch (err) {
        console.error(
          "Failed to load admin dashboard:",
          err?.response?.data || err?.message || err
        );
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [get]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  return (
    <div className="admin-dashboard">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="dashboard-header">

        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Welcome, {user?.name || "Administrator"}!
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="logout-button"
        >
          Logout
        </button>

      </header>


      {/* =================================================
          API ERROR
          ================================================= */}

      {error && (
        <div className="dashboard-error">
          <strong>Unable to load dashboard.</strong>

          <span>
            {" "}
            Please check the backend server and
            `/api/admin/dashboard` endpoint.
          </span>
        </div>
      )}


      {/* =================================================
          LOADING
          ================================================= */}

      {loading ? (

        <div className="dashboard-loading">

          <div className="spinner"></div>

          <p>
            Loading admin dashboard...
          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              STATISTICS
              ================================================= */}

          <section className="admin-statistics">

            <div className="stat-card">

              <span className="stat-label">
                Total Organizers
              </span>

              <strong className="stat-value">
                {dashboard.totalOrganizers}
              </strong>

            </div>


            <div className="stat-card">

              <span className="stat-label">
                Total Events
              </span>

              <strong className="stat-value">
                {dashboard.totalEvents}
              </strong>

            </div>


            <div className="stat-card">

              <span className="stat-label">
                Total Registrations
              </span>

              <strong className="stat-value">
                {dashboard.totalRegistrations}
              </strong>

            </div>


            <div className="stat-card">

              <span className="stat-label">
                Total Revenue
              </span>

              <strong className="stat-value">
                {formatCurrency(
                  dashboard.totalRevenue
                )}
              </strong>

            </div>

          </section>


          {/* =================================================
              ADMIN ACTION
              ================================================= */}

          <section className="admin-actions">

            <Link
              to="/admin/organizers"
              className="dashboard-action-card"
            >

              <h3>
                Manage Organizers
              </h3>

              <p>
                Add, view, enable, or disable
                event organizers.
              </p>

              <span className="action-link">
                Manage Organizers →
              </span>

            </Link>

          </section>


          {/* =================================================
              RECENT EVENTS
              ================================================= */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Recent Events
                </h2>

                <p className="section-subtitle">
                  Latest events created on EventSphere
                </p>
              </div>

              <Link
                to="/events"
                className="section-link"
              >
                View All →
              </Link>

            </div>


            {dashboard.recentEvents.length === 0 ? (

              <div className="empty-message">
                No recent events found.
              </div>

            ) : (

              <div className="recent-list">

                {dashboard.recentEvents.map(
                  (event) => (

                    <div
                      key={
                        event._id ||
                        event.id
                      }
                      className="recent-item"
                    >

                      <div className="recent-item-info">

                        <h3>
                          {event.title ||
                            "Untitled Event"}
                        </h3>

                        <p>
                          {event.venue ||
                            "Venue not available"}
                        </p>

                      </div>


                      <span
                        className={
                          event.status === "closed"
                            ? "status-inactive"
                            : "status-active"
                        }
                      >
                        {event.status
                          ? event.status
                              .charAt(0)
                              .toUpperCase() +
                            event.status.slice(1)
                          : "Active"}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </section>


          {/* =================================================
              RECENT ORGANIZERS
              ================================================= */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>

                <h2>
                  Recent Organizers
                </h2>

                <p className="section-subtitle">
                  Recently added event organizers
                </p>

              </div>

              <Link
                to="/admin/organizers"
                className="section-link"
              >
                View All →
              </Link>

            </div>


            {dashboard.recentOrganizers.length === 0 ? (

              <div className="empty-message">
                No recent organizers found.
              </div>

            ) : (

              <div className="recent-list">

                {dashboard.recentOrganizers.map(
                  (organizer) => (

                    <div
                      key={
                        organizer._id ||
                        organizer.id
                      }
                      className="recent-item"
                    >

                      <div className="recent-item-info">

                        <h3>
                          {organizer.name ||
                            "Unnamed Organizer"}
                        </h3>

                        <p>
                          {organizer.email ||
                            "Email not available"}
                        </p>

                      </div>


                      <span
                        className={
                          organizer.isActive
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {organizer.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </>

      )}

    </div>
  );
};

export default AdminDashboard;