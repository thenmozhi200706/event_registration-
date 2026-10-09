import React, { useMemo } from "react";
import "./EventStatistics.css";
const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const EventStatistics = ({
  data = {},
  loading = false,
  title = "Event Statistics",
  subtitle = "Overview of event activity across EventSphere",
}) => {
  const totalEvents = Number(
    data?.totalEvents ??
      data?.total ??
      data?.count ??
      0
  );

  const activeEvents = Number(
    data?.activeEvents ??
      data?.active ??
      0
  );

  const closedEvents = Number(
    data?.closedEvents ??
      data?.closed ??
      0
  );

  const draftEvents = Number(
    data?.draftEvents ??
      data?.draft ??
      0
  );

  const upcomingEvents = Number(
    data?.upcomingEvents ??
      data?.upcoming ??
      0
  );

  const calculatedOtherEvents = Math.max(
    totalEvents -
      activeEvents -
      closedEvents -
      draftEvents,
    0
  );

  const statusData = useMemo(() => {
    const items = [];

    if (activeEvents > 0) {
      items.push({
        label: "Active",
        value: activeEvents,
        className: "active",
      });
    }

    if (closedEvents > 0) {
      items.push({
        label: "Closed",
        value: closedEvents,
        className: "closed",
      });
    }

    if (draftEvents > 0) {
      items.push({
        label: "Draft",
        value: draftEvents,
        className: "draft",
      });
    }

    if (calculatedOtherEvents > 0) {
      items.push({
        label: "Other",
        value: calculatedOtherEvents,
        className: "other",
      });
    }

    return items;
  }, [
    activeEvents,
    closedEvents,
    draftEvents,
    calculatedOtherEvents,
  ]);

  const activePercentage = totalEvents
    ? Math.round((activeEvents / totalEvents) * 100)
    : 0;

  const closedPercentage = totalEvents
    ? Math.round((closedEvents / totalEvents) * 100)
    : 0;

  const draftPercentage = totalEvents
    ? Math.round((draftEvents / totalEvents) * 100)
    : 0;

  if (loading) {
    return (
      <div className="event-statistics-card">
        <div className="event-statistics-header">
          <div>
            <div className="event-stat-skeleton-title"></div>
            <div className="event-stat-skeleton-subtitle"></div>
          </div>
        </div>

        <div className="event-statistics-loading">
          <div className="event-stat-skeleton-circle"></div>

          <div className="event-stat-skeleton-list">
            {[1, 2, 3].map((item) => (
              <div
                className="event-stat-skeleton-row"
                key={item}
              >
                <div></div>
                <div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-statistics-card">
      {/* HEADER */}
      <div className="event-statistics-header">
        <div>
          <span className="event-statistics-eyebrow">
            EVENTS
          </span>

          <h2>{title}</h2>

          <p>{subtitle}</p>
        </div>

        <div className="event-stat-total">
          <span>Total Events</span>

          <strong>{formatNumber(totalEvents)}</strong>
        </div>
      </div>

      {/* MAIN STAT GRID */}
      <div className="event-stat-grid">
        {/* TOTAL */}
        <div className="event-stat-item total">
          <div className="event-stat-icon">▦</div>

          <div>
            <span>Total</span>
            <strong>{formatNumber(totalEvents)}</strong>
          </div>
        </div>

        {/* ACTIVE */}
        <div className="event-stat-item active">
          <div className="event-stat-icon">✓</div>

          <div>
            <span>Active</span>
            <strong>{formatNumber(activeEvents)}</strong>
          </div>
        </div>

        {/* CLOSED */}
        <div className="event-stat-item closed">
          <div className="event-stat-icon">●</div>

          <div>
            <span>Closed</span>
            <strong>{formatNumber(closedEvents)}</strong>
          </div>
        </div>

        {/* DRAFT */}
        {draftEvents > 0 && (
          <div className="event-stat-item draft">
            <div className="event-stat-icon">✎</div>

            <div>
              <span>Draft</span>
              <strong>{formatNumber(draftEvents)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* STATUS DISTRIBUTION */}
      <div className="event-status-section">
        <div className="event-status-header">
          <div>
            <h3>Event Status Distribution</h3>
            <p>Current status of all events</p>
          </div>
        </div>

        {totalEvents > 0 ? (
          <>
            {/* STATUS BAR */}
            <div className="event-status-bar">
              {activeEvents > 0 && (
                <div
                  className="event-status-segment active"
                  style={{
                    width: `${activePercentage}%`,
                  }}
                  title={`Active: ${activePercentage}%`}
                ></div>
              )}

              {closedEvents > 0 && (
                <div
                  className="event-status-segment closed"
                  style={{
                    width: `${closedPercentage}%`,
                  }}
                  title={`Closed: ${closedPercentage}%`}
                ></div>
              )}

              {draftEvents > 0 && (
                <div
                  className="event-status-segment draft"
                  style={{
                    width: `${draftPercentage}%`,
                  }}
                  title={`Draft: ${draftPercentage}%`}
                ></div>
              )}
            </div>

            {/* STATUS LIST */}
            <div className="event-status-list">
              {statusData.map((item) => {
                const percentage = totalEvents
                  ? Math.round(
                      (item.value / totalEvents) * 100
                    )
                  : 0;

                return (
                  <div
                    className="event-status-row"
                    key={item.label}
                  >
                    <div className="event-status-name">
                      <span
                        className={`event-status-dot ${item.className}`}
                      ></span>

                      <span>{item.label}</span>
                    </div>

                    <div className="event-status-value">
                      <strong>
                        {formatNumber(item.value)}
                      </strong>

                      <span>{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="event-statistics-empty">
            <div className="event-empty-icon">▦</div>

            <h3>No events available</h3>

            <p>
              Event statistics will appear here when events
              are created.
            </p>
          </div>
        )}
      </div>

      {/* ADDITIONAL INFORMATION */}
      <div className="event-statistics-footer">
        <div className="event-footer-item">
          <span>Active Rate</span>

          <strong>{activePercentage}%</strong>
        </div>

        <div className="event-footer-item">
          <span>Closed Rate</span>

          <strong>{closedPercentage}%</strong>
        </div>

        {upcomingEvents > 0 && (
          <div className="event-footer-item">
            <span>Upcoming</span>

            <strong>{formatNumber(upcomingEvents)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventStatistics;