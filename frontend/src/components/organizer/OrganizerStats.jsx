import React from "react";
import "./OrganizerStats.css";
const OrganizerStats = ({ dashboard }) => {
    const summary = dashboard?.summary || dashboard || {};

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString("en-IN");
    };

    const formatCurrency = (value) => {
        return `₹${Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const stats = [
        {
            title: "Total Events",
            value: formatNumber(summary.totalEvents),
            description: "Events created",
            icon: "▣",
            type: "events",
        },
        {
            title: "Active Events",
            value: formatNumber(summary.activeEvents),
            description: "Currently active",
            icon: "●",
            type: "active",
        },
        {
            title: "Total Registrations",
            value: formatNumber(summary.totalRegistrations),
            description: "Participants registered",
            icon: "♙",
            type: "registrations",
        },
        {
            title: "Total Revenue",
            value: formatCurrency(summary.totalRevenue),
            description: "Successful payments",
            icon: "₹",
            type: "revenue",
        },
        {
            title: "Paid Registrations",
            value: formatNumber(summary.paidRegistrations),
            description: "Successful registrations",
            icon: "✓",
            type: "paid",
        },
        {
            title: "Pending Payments",
            value: formatNumber(summary.pendingRegistrations),
            description: "Awaiting payment",
            icon: "◷",
            type: "pending",
        },
        {
            title: "Failed Payments",
            value: formatNumber(summary.failedRegistrations),
            description: "Payment failed",
            icon: "!",
            type: "failed",
        },
        {
            title: "Closed Events",
            value: formatNumber(summary.closedEvents),
            description: "Registration closed",
            icon: "■",
            type: "closed",
        },
    ];

    return (
        <div className="organizer-stats-grid">
            {stats.map((stat) => (
                <div
                    className={`organizer-stat-card organizer-stat-${stat.type}`}
                    key={stat.title}
                >
                    <div className="organizer-stat-card-top">
                        <div className="organizer-stat-icon">
                            {stat.icon}
                        </div>

                        <span className="organizer-stat-label">
                            {stat.title}
                        </span>
                    </div>

                    <div className="organizer-stat-value">
                        {stat.value}
                    </div>

                    <div className="organizer-stat-description">
                        {stat.description}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrganizerStats;