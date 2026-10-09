import React, { useMemo, useState } from "react";
import "./RecentRegistrations.css";
const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getParticipantName = (registration) => {
  if (registration?.userId?.name) {
    return registration.userId.name;
  }

  if (
    registration?.firstName ||
    registration?.lastName
  ) {
    return `${registration.firstName || ""} ${
      registration.lastName || ""
    }`.trim();
  }

  if (registration?.name) {
    return registration.name;
  }

  return "Unknown Participant";
};

const getParticipantEmail = (registration) => {
  return (
    registration?.email ||
    registration?.userId?.email ||
    "-"
  );
};

const getEventName = (registration) => {
  return (
    registration?.eventId?.title ||
    registration?.eventId?.eventName ||
    registration?.eventTitle ||
    registration?.eventName ||
    "Unknown Event"
  );
};

const getPaymentStatus = (registration) => {
  return (
    registration?.paymentStatus ||
    registration?.payment?.status ||
    "pending"
  ).toLowerCase();
};

const getStatusLabel = (status) => {
  switch (status) {
    case "paid":
      return "Paid";

    case "pending":
      return "Pending";

    case "failed":
      return "Failed";

    case "success":
      return "Paid";

    default:
      return status || "Pending";
  }
};

const getPaymentClass = (status) => {
  switch (status) {
    case "paid":
    case "success":
      return "paid";

    case "failed":
      return "failed";

    case "pending":
    default:
      return "pending";
  }
};

const RecentRegistrations = ({
  registrations = [],
  loading = false,
  limit = 5,
  title = "Recent Registrations",
  subtitle = "Latest participant registrations",
  showViewAll = true,
  onViewAll,
}) => {
  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const recentRegistrations = useMemo(() => {
    if (!Array.isArray(registrations)) {
      return [];
    }

    return [...registrations]
      .sort((a, b) => {
        const dateA = new Date(
          a?.registeredAt ||
            a?.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b?.registeredAt ||
            b?.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, limit);
  }, [registrations, limit]);

  if (loading) {
    return (
      <div className="recent-registrations-card">
        <div className="recent-registrations-header">
          <div>
            <div className="recent-skeleton-title"></div>
            <div className="recent-skeleton-subtitle"></div>
          </div>
        </div>

        <div className="recent-registrations-loading">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              className="recent-registration-skeleton"
              key={item}
            >
              <div className="recent-skeleton-avatar"></div>

              <div className="recent-skeleton-info">
                <div className="skeleton-line"></div>
                <div className="skeleton-line small"></div>
              </div>

              <div className="recent-skeleton-event"></div>

              <div className="recent-skeleton-status"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="recent-registrations-card">
      {/* HEADER */}
      <div className="recent-registrations-header">
        <div>
          <span className="recent-registrations-eyebrow">
            REGISTRATIONS
          </span>

          <h2>{title}</h2>

          <p>{subtitle}</p>
        </div>

        {showViewAll && (
          <button
            className="recent-view-all-btn"
            onClick={onViewAll}
            type="button"
          >
            View All →
          </button>
        )}
      </div>

      {/* REGISTRATION LIST */}
      {recentRegistrations.length > 0 ? (
        <div className="recent-registrations-list">
          {recentRegistrations.map(
            (registration, index) => {
              const participantName =
                getParticipantName(registration);

              const participantEmail =
                getParticipantEmail(registration);

              const eventName =
                getEventName(registration);

              const paymentStatus =
                getPaymentStatus(registration);

              const statusClass =
                getPaymentClass(paymentStatus);

              return (
                <div
                  className="recent-registration-row"
                  key={
                    registration?._id ||
                    registration?.id ||
                    `${participantEmail}-${index}`
                  }
                  onClick={() =>
                    setSelectedRegistration(
                      registration
                    )
                  }
                >
                  {/* AVATAR */}
                  <div className="recent-registration-avatar">
                    {participantName
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  {/* PARTICIPANT */}
                  <div className="recent-registration-participant">
                    <strong>{participantName}</strong>

                    <span>{participantEmail}</span>
                  </div>

                  {/* EVENT */}
                  <div className="recent-registration-event">
                    <span>Event</span>

                    <strong>{eventName}</strong>
                  </div>

                  {/* DATE */}
                  <div className="recent-registration-date">
                    <span>Registered</span>

                    <strong>
                      {formatDate(
                        registration?.registeredAt ||
                          registration?.createdAt
                      )}
                    </strong>
                  </div>

                  {/* PAYMENT */}
                  <div className="recent-registration-payment">
                    <span
                      className={`recent-payment-status ${statusClass}`}
                    >
                      <span className="recent-status-dot"></span>

                      {getStatusLabel(paymentStatus)}
                    </span>
                  </div>

                  {/* ACTION */}
                  <button
                    type="button"
                    className="recent-registration-action"
                    onClick={(event) => {
                      event.stopPropagation();

                      setSelectedRegistration(
                        registration
                      );
                    }}
                    aria-label="View registration details"
                  >
                    →
                  </button>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div className="recent-registrations-empty">
          <div className="recent-empty-icon">♙</div>

          <h3>No recent registrations</h3>

          <p>
            New participant registrations will appear
            here.
          </p>
        </div>
      )}

      {/* FOOTER */}
      {recentRegistrations.length > 0 && (
        <div className="recent-registrations-footer">
          <span>
            Showing {recentRegistrations.length} recent{" "}
            {recentRegistrations.length === 1
              ? "registration"
              : "registrations"}
          </span>

          <span>Click a registration to view details</span>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedRegistration && (
        <div
          className="recent-registration-modal-overlay"
          onClick={() => setSelectedRegistration(null)}
        >
          <div
            className="recent-registration-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="recent-modal-header">
              <div>
                <span>REGISTRATION DETAILS</span>

                <h2>Participant Registration</h2>
              </div>

              <button
                type="button"
                className="recent-modal-close"
                onClick={() =>
                  setSelectedRegistration(null)
                }
              >
                ×
              </button>
            </div>

            {/* PARTICIPANT */}
            <div className="recent-modal-section">
              <h3>Participant Information</h3>

              <div className="recent-modal-grid">
                <div className="recent-modal-field">
                  <span>Name</span>

                  <strong>
                    {getParticipantName(
                      selectedRegistration
                    )}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Email</span>

                  <strong>
                    {getParticipantEmail(
                      selectedRegistration
                    )}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>WhatsApp Number</span>

                  <strong>
                    {selectedRegistration?.whatsappNumber ||
                      selectedRegistration?.userId
                        ?.whatsappNumber ||
                      "-"}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Age</span>

                  <strong>
                    {selectedRegistration?.age ||
                      selectedRegistration?.userId?.age ||
                      "-"}
                  </strong>
                </div>
              </div>
            </div>

            {/* INSTITUTE */}
            <div className="recent-modal-section">
              <h3>Institute Information</h3>

              <div className="recent-modal-grid">
                <div className="recent-modal-field">
                  <span>Institute</span>

                  <strong>
                    {selectedRegistration?.instituteName ||
                      selectedRegistration?.userId
                        ?.instituteName ||
                      "-"}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Department</span>

                  <strong>
                    {selectedRegistration?.department ||
                      selectedRegistration?.userId
                        ?.department ||
                      "-"}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Year</span>

                  <strong>
                    {selectedRegistration?.year ||
                      selectedRegistration?.userId?.year ||
                      "-"}
                  </strong>
                </div>
              </div>
            </div>

            {/* EVENT */}
            <div className="recent-modal-section">
              <h3>Event Information</h3>

              <div className="recent-modal-grid">
                <div className="recent-modal-field full">
                  <span>Event</span>

                  <strong>
                    {getEventName(
                      selectedRegistration
                    )}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Registration Date</span>

                  <strong>
                    {formatDateTime(
                      selectedRegistration?.registeredAt ||
                        selectedRegistration?.createdAt
                    )}
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Payment Status</span>

                  <strong>
                    <span
                      className={`recent-payment-status ${getPaymentClass(
                        getPaymentStatus(
                          selectedRegistration
                        )
                      )}`}
                    >
                      <span className="recent-status-dot"></span>

                      {getStatusLabel(
                        getPaymentStatus(
                          selectedRegistration
                        )
                      )}
                    </span>
                  </strong>
                </div>

                <div className="recent-modal-field">
                  <span>Payment ID</span>

                  <strong>
                    {selectedRegistration?.paymentId ||
                      selectedRegistration?.payment
                        ?.paymentId ||
                      "-"}
                  </strong>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="recent-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedRegistration(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentRegistrations;