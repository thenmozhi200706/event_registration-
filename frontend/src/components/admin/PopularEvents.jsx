import React, { useMemo } from "react";
import "./PopularEvents.css";
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

const getRegistrations = (event) => {
  return Number(
    event?.registrations ??
      event?.registrationCount ??
      event?.totalRegistrations ??
      event?.count ??
      0
  );
};

const getRevenue = (event) => {
  return Number(
    event?.revenue ??
      event?.totalRevenue ??
      event?.amount ??
      0
  );
};

const getEventName = (event) => {
  return (
    event?.title ||
    event?.eventName ||
    event?.name ||
    "Untitled Event"
  );
};

const getOrganizerName = (event) => {
  return (
    event?.organizerName ||
    event?.organizer?.name ||
    event?.organizerId?.name ||
    "Unknown Organizer"
  );
};

const getEventStatus = (event) => {
  return event?.status || "active";
};

const PopularEvents = ({
  events = [],
  loading = false,
  title = "Popular Events",
  subtitle = "Events with the highest registration activity",
  limit = 5,
  showRevenue = true,
}) => {
  const popularEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }

    return [...events]
      .sort(
        (a, b) =>
          getRegistrations(b) - getRegistrations(a)
      )
      .slice(0, limit);
  }, [events, limit]);

  const highestRegistrations = useMemo(() => {
    if (!popularEvents.length) return 1;

    return Math.max(
      ...popularEvents.map((event) =>
        getRegistrations(event)
      ),
      1
    );
  }, [popularEvents]);

  if (loading) {
    return (
      <div className="popular-events-card">
        <div className="popular-events-header">
          <div>
            <div className="popular-skeleton-title"></div>
            <div className="popular-skeleton-subtitle"></div>
          </div>
        </div>

        <div className="popular-events-loading">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              className="popular-event-skeleton"
              key={item}
            >
              <div className="skeleton-rank"></div>

              <div className="skeleton-event-info">
                <div className="skeleton-line"></div>
                <div className="skeleton-line small"></div>
              </div>

              <div className="skeleton-event-count"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="popular-events-card">
      {/* HEADER */}
      <div className="popular-events-header">
        <div>
          <span className="popular-events-eyebrow">
            TOP EVENTS
          </span>

          <h2>{title}</h2>

          <p>{subtitle}</p>
        </div>

        <div className="popular-events-total">
          <span>Showing</span>
          <strong>{popularEvents.length}</strong>
        </div>
      </div>

      {/* EVENT LIST */}
      {popularEvents.length > 0 ? (
        <div className="popular-events-list">
          {popularEvents.map((event, index) => {
            const registrations = getRegistrations(event);
            const revenue = getRevenue(event);

            const percentage =
              highestRegistrations > 0
                ? (registrations / highestRegistrations) * 100
                : 0;

            const status = getEventStatus(event);

            return (
              <div
                className="popular-event-item"
                key={
                  event?._id ||
                  event?.id ||
                  `${getEventName(event)}-${index}`
                }
              >
                {/* RANK */}
                <div
                  className={`popular-event-rank rank-${index + 1}`}
                >
                  {index + 1}
                </div>

                {/* EVENT INFO */}
                <div className="popular-event-main">
                  <div className="popular-event-title-row">
                    <h3>{getEventName(event)}</h3>

                    <span
                      className={`popular-event-status ${
                        status.toLowerCase() === "closed"
                          ? "closed"
                          : "active"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <span className="popular-event-organizer">
                    {getOrganizerName(event)}
                  </span>

                  {/* PROGRESS */}
                  <div className="popular-event-progress">
                    <div className="popular-event-progress-track">
                      <div
                        className="popular-event-progress-fill"
                        style={{
                          width: `${Math.max(
                            percentage,
                            registrations > 0 ? 4 : 0
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* REGISTRATIONS */}
                <div className="popular-event-registrations">
                  <strong>
                    {formatNumber(registrations)}
                  </strong>

                  <span>registrations</span>
                </div>

                {/* REVENUE */}
                {showRevenue && (
                  <div className="popular-event-revenue">
                    <span>Revenue</span>

                    <strong>
                      {formatCurrency(revenue)}
                    </strong>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="popular-events-empty">
          <div className="popular-empty-icon">★</div>

          <h3>No popular events</h3>

          <p>
            Popular events will appear here when registration
            activity is available.
          </p>
        </div>
      )}

      {/* FOOTER */}
      {popularEvents.length > 0 && (
        <div className="popular-events-footer">
          <span>
            Ranked by registration count
          </span>

          <span>
            Top {popularEvents.length} events
          </span>
        </div>
      )}
    </div>
  );
};

export default PopularEvents;