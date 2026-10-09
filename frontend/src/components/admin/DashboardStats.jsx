import React from "react";
import "./DashboardStats.css";
const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const DashboardStats = ({ stats = {}, loading = false }) => {
  const {
    totalEvents = 0,
    activeEvents = 0,
    closedEvents = 0,

    totalRegistrations = 0,
    paidRegistrations = 0,
    pendingRegistrations = 0,

    totalRevenue = 0,

    totalUsers = 0,
    totalOrganizers = 0,
    totalParticipants = 0,
  } = stats;

  const cards = [
    {
      id: "events",
      title: "Total Events",
      value: formatNumber(totalEvents),
      subtitle: `${formatNumber(activeEvents)} active`,
      icon: "▦",
      iconClass: "events",
    },
    {
      id: "registrations",
      title: "Registrations",
      value: formatNumber(totalRegistrations),
      subtitle: `${formatNumber(paidRegistrations)} paid`,
      icon: "♙",
      iconClass: "registrations",
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subtitle: "Successful payments",
      icon: "₹",
      iconClass: "revenue",
    },
    {
      id: "users",
      title: "Total Users",
      value: formatNumber(totalUsers),
      subtitle: `${formatNumber(totalParticipants)} participants`,
      icon: "◎",
      iconClass: "users",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <div className="dashboard-stat-card loading-card" key={item}>
            <div className="skeleton-icon"></div>

            <div className="skeleton-content">
              <div className="skeleton-line skeleton-small"></div>
              <div className="skeleton-line skeleton-large"></div>
              <div className="skeleton-line skeleton-medium"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-stats-wrapper">
      {/* MAIN STAT CARDS */}
      <div className="dashboard-stats-grid">
        {cards.map((card) => (
          <div className="dashboard-stat-card" key={card.id}>
            <div className={`dashboard-stat-icon ${card.iconClass}`}>
              {card.icon}
            </div>

            <div className="dashboard-stat-content">
              <span className="dashboard-stat-title">
                {card.title}
              </span>

              <h3 className="dashboard-stat-value">
                {card.value}
              </h3>

              <span className="dashboard-stat-subtitle">
                {card.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SECONDARY STATISTICS */}
      <div className="dashboard-secondary-stats">
        <div className="secondary-stat-card">
          <div className="secondary-stat-info">
            <span>Active Events</span>
            <strong>{formatNumber(activeEvents)}</strong>
          </div>

          <div className="secondary-stat-progress">
            <div
              className="secondary-stat-progress-fill"
              style={{
                width: `${
                  totalEvents
                    ? Math.min(
                        (activeEvents / totalEvents) * 100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <small>
            {totalEvents
              ? Math.round((activeEvents / totalEvents) * 100)
              : 0}
            % of total events
          </small>
        </div>

        <div className="secondary-stat-card">
          <div className="secondary-stat-info">
            <span>Closed Events</span>
            <strong>{formatNumber(closedEvents)}</strong>
          </div>

          <div className="secondary-stat-progress">
            <div
              className="secondary-stat-progress-fill"
              style={{
                width: `${
                  totalEvents
                    ? Math.min(
                        (closedEvents / totalEvents) * 100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <small>
            {totalEvents
              ? Math.round((closedEvents / totalEvents) * 100)
              : 0}
            % of total events
          </small>
        </div>

        <div className="secondary-stat-card">
          <div className="secondary-stat-info">
            <span>Paid Registrations</span>
            <strong>{formatNumber(paidRegistrations)}</strong>
          </div>

          <div className="secondary-stat-progress">
            <div
              className="secondary-stat-progress-fill"
              style={{
                width: `${
                  totalRegistrations
                    ? Math.min(
                        (paidRegistrations / totalRegistrations) *
                          100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <small>
            {totalRegistrations
              ? Math.round(
                  (paidRegistrations / totalRegistrations) * 100
                )
              : 0}
            % payment success
          </small>
        </div>

        <div className="secondary-stat-card">
          <div className="secondary-stat-info">
            <span>Organizers</span>
            <strong>{formatNumber(totalOrganizers)}</strong>
          </div>

          <div className="secondary-stat-progress">
            <div
              className="secondary-stat-progress-fill"
              style={{
                width: `${
                  totalUsers
                    ? Math.min(
                        (totalOrganizers / totalUsers) * 100,
                        100
                      )
                    : 0
                }%`,
              }}
            ></div>
          </div>

          <small>
            {totalUsers
              ? Math.round((totalOrganizers / totalUsers) * 100)
              : 0}
            % of users
          </small>
        </div>
      </div>

      {/* PAYMENT QUICK SUMMARY */}
      <div className="dashboard-payment-summary">
        <div className="payment-summary-item">
          <span className="summary-dot paid"></span>

          <div>
            <small>Paid</small>
            <strong>{formatNumber(paidRegistrations)}</strong>
          </div>
        </div>

        <div className="payment-summary-item">
          <span className="summary-dot pending"></span>

          <div>
            <small>Pending</small>
            <strong>{formatNumber(pendingRegistrations)}</strong>
          </div>
        </div>

        <div className="payment-summary-item">
          <span className="summary-dot revenue"></span>

          <div>
            <small>Revenue</small>
            <strong>{formatCurrency(totalRevenue)}</strong>
          </div>
        </div>

        <div className="payment-summary-item">
          <span className="summary-dot organizers"></span>

          <div>
            <small>Organizers</small>
            <strong>{formatNumber(totalOrganizers)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;