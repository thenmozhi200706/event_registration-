import React, { useEffect, useMemo, useState } from "react";

import axios from "axios";
import "./AdminAnalytics.css";



const API_BASE_URL =

  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";



// Read the authentication token from the storage keys used across EventSphere.
const TOKEN_KEYS = [
  "token",
  "accessToken",
  "jwt",
  "authToken",
  "auth_token",
  "access_token",
  "eventSphereToken",
  "eventSphere_token",
];

const USER_KEYS = ["user", "admin", "currentUser", "authUser"];

const cleanToken = (value) => {
  if (typeof value !== "string") return null;

  const token = value.trim();
  if (!token) return null;

  return token.startsWith("Bearer ") ? token.slice(7).trim() : token;
};

const safeGetItem = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch (error) {
    console.warn("Unable to read authentication storage:", error);
    return null;
  }
};

const getToken = () => {
  // Check direct token keys in localStorage and sessionStorage.
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of TOKEN_KEYS) {
      const token = cleanToken(safeGetItem(storage, key));
      if (token) return token;
    }
  }

  // Some login flows store the token inside a serialized user object.
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of USER_KEYS) {
      const rawUser = safeGetItem(storage, key);
      if (!rawUser) continue;

      try {
        const user = JSON.parse(rawUser);
        const token = cleanToken(
          user?.token ||
            user?.accessToken ||
            user?.jwt ||
            user?.authToken ||
            user?.auth_token ||
            user?.access_token
        );

        if (token) return token;
      } catch {
        // Ignore values that are not serialized user objects.
      }
    }
  }

  return null;
};



const formatCurrency = (value) => {

  const amount = Number(value || 0);



  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0,

  }).format(amount);

};



const formatNumber = (value) => {

  return new Intl.NumberFormat("en-IN").format(Number(value || 0));

};



const formatDate = (date) => {

  if (!date) return "-";



  const parsedDate = new Date(date);



  if (Number.isNaN(parsedDate.getTime())) return "-";



  return parsedDate.toLocaleDateString("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });

};



const getPercentage = (value, total) => {

  if (!total) return 0;



  return Math.round((Number(value || 0) / Number(total)) * 100);

};



const AdminAnalytics = () => {

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");



  const fetchAnalytics = async (showRefreshLoader = false) => {

    try {

      if (showRefreshLoader) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }



      setError("");



      const token = getToken();



      if (!token) {

        setError("Authentication token not found. Please login again.");

        return;

      }



      const response = await axios.get(

        `${API_BASE_URL}/api/admin/analytics`,

        {

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 15000,

        }

      );



      if (response.data?.success) {

        setAnalytics(response.data.analytics || response.data.data || {});

      } else {

        setError(

          response.data?.message || "Failed to load analytics data."

        );

      }

    } catch (err) {

      console.error("Admin analytics error:", err);



      if (err.response?.status === 401) {

        setError("Session expired. Please login again.");

      } else if (err.response?.status === 403) {

        setError("You do not have permission to view admin analytics.");

      } else {

        setError(

          err.response?.data?.message ||

            "Unable to load analytics. Please try again."

        );

      }

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };



  useEffect(() => {

    fetchAnalytics();

  }, []);



  /*

   * The backend analytics response may contain nested objects.

   * These helpers make the page tolerant of the analytics structure.

   */



  const registrationAnalytics = useMemo(() => {

    return (

      analytics?.registrationAnalytics ||

      analytics?.registrations ||

      analytics?.registration ||

      {}

    );

  }, [analytics]);



  const paymentAnalytics = useMemo(() => {

    return (

      analytics?.paymentAnalytics ||

      analytics?.payments ||

      analytics?.payment ||

      {}

    );

  }, [analytics]);



  const eventAnalytics = useMemo(() => {

    return (

      analytics?.eventAnalytics ||

      analytics?.events ||

      analytics?.event ||

      {}

    );

  }, [analytics]);



  const userAnalytics = useMemo(() => {

    return (

      analytics?.userAnalytics ||

      analytics?.users ||

      analytics?.user ||

      {}

    );

  }, [analytics]);



  const popularEvents =

    analytics?.popularEvents ||

    analytics?.popular ||

    eventAnalytics?.popularEvents ||

    [];



  const eventPerformance =

    analytics?.eventPerformance ||

    analytics?.performance ||

    [];



  const registrationTrend =

    analytics?.registrationTrend ||

    analytics?.registrationTrends ||

    [];



  const revenueTrend =

    analytics?.revenueTrend ||

    analytics?.revenueTrends ||

    [];



  const totalEvents =

    analytics?.totalEvents ??

    eventAnalytics?.totalEvents ??

    eventAnalytics?.total ??

    0;



  const activeEvents =

    analytics?.activeEvents ??

    eventAnalytics?.activeEvents ??

    eventAnalytics?.active ??

    0;



  const closedEvents =

    analytics?.closedEvents ??

    eventAnalytics?.closedEvents ??

    eventAnalytics?.closed ??

    0;



  const totalRegistrations =

    analytics?.totalRegistrations ??

    registrationAnalytics?.totalRegistrations ??

    registrationAnalytics?.total ??

    0;



  const paidRegistrations =

    analytics?.paidRegistrations ??

    registrationAnalytics?.paidRegistrations ??

    registrationAnalytics?.paid ??

    0;



  const pendingRegistrations =

    analytics?.pendingRegistrations ??

    registrationAnalytics?.pendingRegistrations ??

    registrationAnalytics?.pending ??

    0;



  const failedRegistrations =

    analytics?.failedRegistrations ??

    registrationAnalytics?.failedRegistrations ??

    registrationAnalytics?.failed ??

    0;



  const totalRevenue =

    analytics?.totalRevenue ??

    paymentAnalytics?.totalRevenue ??

    paymentAnalytics?.revenue ??

    0;



  const paidAmount =

    analytics?.paidAmount ??

    paymentAnalytics?.paidAmount ??

    paymentAnalytics?.totalPaid ??

    totalRevenue;



  const totalUsers =

    analytics?.totalUsers ??

    userAnalytics?.totalUsers ??

    userAnalytics?.total ??

    0;



  const totalOrganizers =

    analytics?.totalOrganizers ??

    userAnalytics?.totalOrganizers ??

    userAnalytics?.organizers ??

    0;



  const totalParticipants =

    analytics?.totalParticipants ??

    userAnalytics?.totalParticipants ??

    userAnalytics?.participants ??

    0;



  if (loading) {

    return (

      <div className="admin-analytics-page">

        <div className="analytics-header">

          <div>

            <h1>Analytics</h1>

            <p>Monitor EventSphere performance and activity.</p>

          </div>

        </div>



        <div className="analytics-loading">

          <div className="analytics-spinner"></div>

          <p>Loading analytics...</p>

        </div>

      </div>

    );

  }



  return (

    <div className="admin-analytics-page">

      
{/* HEADER */}
<div className="analytics-header">
  <div className="analytics-header-content">
    <span className="analytics-eyebrow">
      ADMINISTRATION
    </span>

    <h1>Analytics &amp; Reports</h1>

    <p>
      Monitor events, registrations, revenue and platform activity
      from one place.
    </p>
  </div>

  <div className="analytics-header-actions">
    {/* Back to Admin Dashboard */}
    <button
      type="button"
      className="analytics-back-btn"
      onClick={() => {
        window.location.href = "/admin/dashboard";
      }}
      aria-label="Back to Admin Dashboard"
    >
      <span aria-hidden="true">←</span>
      Back to Dashboard
    </button>

    {/* Refresh Analytics */}
    <button
      type="button"
      className="analytics-refresh-btn"
      onClick={() => fetchAnalytics(true)}
      disabled={refreshing}
    >
      {refreshing ? "Refreshing..." : "↻ Refresh"}
    </button>
  </div>
</div>




      {/* ERROR */}

      {error && (

        <div className="analytics-error">

          <div>

            <strong>Unable to load analytics</strong>

            <p>{error}</p>

          </div>



          <button onClick={() => fetchAnalytics()}>

            Retry

          </button>

        </div>

      )}



      {!error && (

        <>

          {/* MAIN KPI CARDS */}

          <div className="analytics-card-grid">

            <div className="analytics-stat-card">

              <div className="stat-icon events-icon">▦</div>



              <div className="stat-content">

                <span>Total Events</span>

                <strong>{formatNumber(totalEvents)}</strong>



                <small>

                  {formatNumber(activeEvents)} active

                </small>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon registration-icon">♙</div>



              <div className="stat-content">

                <span>Total Registrations</span>

                <strong>

                  {formatNumber(totalRegistrations)}

                </strong>



                <small>

                  {formatNumber(paidRegistrations)} paid

                </small>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon revenue-icon">₹</div>



              <div className="stat-content">

                <span>Total Revenue</span>

                <strong>{formatCurrency(totalRevenue)}</strong>



                <small>Successful payments</small>

              </div>

            </div>



            <div className="analytics-stat-card">

              <div className="stat-icon users-icon">◎</div>



              <div className="stat-content">

                <span>Total Users</span>

                <strong>{formatNumber(totalUsers)}</strong>



                <small>

                  {formatNumber(totalParticipants)} participants

                </small>

              </div>

            </div>

          </div>



          {/* SECONDARY STATISTICS */}

          <div className="analytics-section">

            <div className="section-title">

              <div>

                <h2>Platform Overview</h2>

                <p>Current EventSphere activity summary.</p>

              </div>

            </div>



            <div className="overview-grid">

              <div className="overview-card">

                <div className="overview-card-top">

                  <span>Active Events</span>

                  <strong>{formatNumber(activeEvents)}</strong>

                </div>



                <div className="progress-track">

                  <div

                    className="progress-fill"

                    style={{

                      width: `${getPercentage(

                        activeEvents,

                        totalEvents

                      )}%`,

                    }}

                  ></div>

                </div>



                <small>

                  {getPercentage(activeEvents, totalEvents)}% of

                  total events

                </small>

              </div>



              <div className="overview-card">

                <div className="overview-card-top">

                  <span>Closed Events</span>

                  <strong>{formatNumber(closedEvents)}</strong>

                </div>



                <div className="progress-track">

                  <div

                    className="progress-fill"

                    style={{

                      width: `${getPercentage(

                        closedEvents,

                        totalEvents

                      )}%`,

                    }}

                  ></div>

                </div>



                <small>

                  {getPercentage(closedEvents, totalEvents)}% of

                  total events

                </small>

              </div>



              <div className="overview-card">

                <div className="overview-card-top">

                  <span>Paid Registrations</span>

                  <strong>{formatNumber(paidRegistrations)}</strong>

                </div>



                <div className="progress-track">

                  <div

                    className="progress-fill"

                    style={{

                      width: `${getPercentage(

                        paidRegistrations,

                        totalRegistrations

                      )}%`,

                    }}

                  ></div>

                </div>



                <small>

                  {getPercentage(

                    paidRegistrations,

                    totalRegistrations

                  )}

                  % payment success

                </small>

              </div>



              <div className="overview-card">

                <div className="overview-card-top">

                  <span>Organizers</span>

                  <strong>{formatNumber(totalOrganizers)}</strong>

                </div>



                <div className="progress-track">

                  <div

                    className="progress-fill"

                    style={{

                      width: `${getPercentage(

                        totalOrganizers,

                        totalUsers

                      )}%`,

                    }}

                  ></div>

                </div>



                <small>

                  {getPercentage(totalOrganizers, totalUsers)}% of

                  platform users

                </small>

              </div>

            </div>

          </div>



          {/* REGISTRATION + PAYMENT */}

          <div className="analytics-two-column">

            <div className="analytics-panel">

              <div className="panel-header">

                <div>

                  <h2>Registration Statistics</h2>

                  <p>Registration payment status breakdown.</p>

                </div>

              </div>



              <div className="registration-stats">

                <div className="registration-row">

                  <div className="registration-label">

                    <span className="status-dot paid"></span>

                    Paid

                  </div>



                  <strong>{formatNumber(paidRegistrations)}</strong>



                  <span>

                    {getPercentage(

                      paidRegistrations,

                      totalRegistrations

                    )}

                    %

                  </span>

                </div>



                <div className="registration-row">

                  <div className="registration-label">

                    <span className="status-dot pending"></span>

                    Pending

                  </div>



                  <strong>

                    {formatNumber(pendingRegistrations)}

                  </strong>



                  <span>

                    {getPercentage(

                      pendingRegistrations,

                      totalRegistrations

                    )}

                    %

                  </span>

                </div>



                <div className="registration-row">

                  <div className="registration-label">

                    <span className="status-dot failed"></span>

                    Failed

                  </div>



                  <strong>

                    {formatNumber(failedRegistrations)}

                  </strong>



                  <span>

                    {getPercentage(

                      failedRegistrations,

                      totalRegistrations

                    )}

                    %

                  </span>

                </div>



                <div className="registration-total">

                  <span>Total</span>

                  <strong>

                    {formatNumber(totalRegistrations)}

                  </strong>

                </div>

              </div>

            </div>



            <div className="analytics-panel">

              <div className="panel-header">

                <div>

                  <h2>Payment Summary</h2>

                  <p>Revenue generated through registrations.</p>

                </div>

              </div>



              <div className="payment-summary">

                <div className="payment-main">

                  <span>Total Revenue</span>



                  <strong>{formatCurrency(totalRevenue)}</strong>

                </div>



                <div className="payment-item">

                  <span>Paid Amount</span>

                  <strong>{formatCurrency(paidAmount)}</strong>

                </div>



                <div className="payment-item">

                  <span>Paid Registrations</span>

                  <strong>

                    {formatNumber(paidRegistrations)}

                  </strong>

                </div>



                <div className="payment-item">

                  <span>Average Revenue / Paid Registration</span>



                  <strong>

                    {formatCurrency(

                      paidRegistrations

                        ? Number(paidAmount || 0) /

                            Number(paidRegistrations)

                        : 0

                    )}

                  </strong>

                </div>

              </div>

            </div>

          </div>



          {/* REGISTRATION TREND */}

          <div className="analytics-panel analytics-trend-panel">

            <div className="panel-header">

              <div>

                <h2>Registration Trend</h2>

                <p>Registration activity over time.</p>

              </div>

            </div>



            {registrationTrend.length > 0 ? (

              <div className="trend-chart">

                {registrationTrend.map((item, index) => {

                  const value = Number(

                    item.registrations ??

                      item.count ??

                      item.total ??

                      item.value ??

                      0

                  );



                  const maxValue = Math.max(

                    ...registrationTrend.map((trendItem) =>

                      Number(

                        trendItem.registrations ??

                          trendItem.count ??

                          trendItem.total ??

                          trendItem.value ??

                          0

                      )

                    ),

                    1

                  );



                  return (

                    <div className="trend-column" key={index}>

                      <div className="trend-value">

                        {value}

                      </div>



                      <div className="trend-bar-wrapper">

                        <div

                          className="trend-bar"

                          style={{

                            height: `${Math.max(

                              (value / maxValue) * 100,

                              value > 0 ? 8 : 2

                            )}%`,

                          }}

                        ></div>

                      </div>



                      <span>

                        {item.date ||

                          item.label ||

                          item.month ||

                          item._id ||

                          `Day ${index + 1}`}

                      </span>

                    </div>

                  );

                })}

              </div>

            ) : (

              <div className="empty-analytics">

                <div>◌</div>

                <p>No registration trend data available.</p>

              </div>

            )}

          </div>



          {/* REVENUE TREND */}

          <div className="analytics-panel analytics-trend-panel">

            <div className="panel-header">

              <div>

                <h2>Revenue Trend</h2>

                <p>Revenue generated over time.</p>

              </div>

            </div>



            {revenueTrend.length > 0 ? (

              <div className="revenue-trend-list">

                {revenueTrend.map((item, index) => {

                  const revenue = Number(

                    item.revenue ??

                      item.amount ??

                      item.total ??

                      item.value ??

                      0

                  );



                  return (

                    <div className="revenue-trend-row" key={index}>

                      <span>

                        {item.date ||

                          item.label ||

                          item.month ||

                          item._id ||

                          `Period ${index + 1}`}

                      </span>



                      <div className="revenue-line">

                        <div

                          className="revenue-line-fill"

                          style={{

                            width: `${Math.min(

                              (revenue /

                                Math.max(

                                  ...revenueTrend.map((r) =>

                                    Number(

                                      r.revenue ??

                                        r.amount ??

                                        r.total ??

                                        r.value ??

                                        0

                                    )

                                  ),

                                  1

                                )) *

                                100,

                              100

                            )}%`,

                          }}

                        ></div>

                      </div>



                      <strong>{formatCurrency(revenue)}</strong>

                    </div>

                  );

                })}

              </div>

            ) : (

              <div className="empty-analytics">

                <div>₹</div>

                <p>No revenue trend data available.</p>

              </div>

            )}

          </div>



          {/* POPULAR EVENTS */}

          <div className="analytics-panel">

            <div className="panel-header">

              <div>

                <h2>Popular Events</h2>

                <p>Events ranked by registration activity.</p>

              </div>

            </div>



            {popularEvents.length > 0 ? (

              <div className="popular-events-list">

                {popularEvents.slice(0, 10).map((event, index) => {

                  const registrations = Number(

                    event.registrations ??

                      event.registrationCount ??

                      event.totalRegistrations ??

                      event.count ??

                      0

                  );



                  const eventName =

                    event.title ||

                    event.eventName ||

                    event.name ||

                    event._id ||

                    "Untitled Event";



                  return (

                    <div className="popular-event-row" key={index}>

                      <div className="popular-rank">

                        #{index + 1}

                      </div>



                      <div className="popular-event-info">

                        <strong>{eventName}</strong>



                        <span>

                          {event.organizerName ||

                            event.organizer?.name ||

                            "Event"}

                        </span>

                      </div>



                      <div className="popular-event-count">

                        <strong>

                          {formatNumber(registrations)}

                        </strong>



                        <span>registrations</span>

                      </div>

                    </div>

                  );

                })}

              </div>

            ) : (

              <div className="empty-analytics">

                <div>★</div>

                <p>No popular event data available.</p>

              </div>

            )}

          </div>



          {/* EVENT PERFORMANCE */}

          <div className="analytics-panel">

            <div className="panel-header">

              <div>

                <h2>Event Performance</h2>

                <p>Registration and revenue performance by event.</p>

              </div>

            </div>



            {eventPerformance.length > 0 ? (

              <div className="analytics-table-wrapper">

                <table className="analytics-table">

                  <thead>

                    <tr>

                      <th>Event</th>

                      <th>Registrations</th>

                      <th>Paid</th>

                      <th>Revenue</th>

                      <th>Status</th>

                    </tr>

                  </thead>



                  <tbody>

                    {eventPerformance.map((event, index) => {

                      const registrations = Number(

                        event.registrations ??

                          event.registrationCount ??

                          event.totalRegistrations ??

                          0

                      );



                      const paid = Number(

                        event.paidRegistrations ??

                          event.paid ??

                          event.paidCount ??

                          0

                      );



                      const revenue = Number(

                        event.revenue ??

                          event.totalRevenue ??

                          event.amount ??

                          0

                      );



                      return (

                        <tr key={index}>

                          <td>

                            <strong>

                              {event.title ||

                                event.eventName ||

                                event.name ||

                                event._id ||

                                "Untitled Event"}

                            </strong>

                          </td>



                          <td>{formatNumber(registrations)}</td>



                          <td>{formatNumber(paid)}</td>



                          <td>{formatCurrency(revenue)}</td>



                          <td>

                            <span

                              className={`analytics-status ${

                                event.status === "closed"

                                  ? "closed"

                                  : "active"

                              }`}

                            >

                              {event.status || "active"}

                            </span>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="empty-analytics">

                <div>▦</div>

                <p>No event performance data available.</p>

              </div>

            )}

          </div>

        </>

      )}

    </div>

  );

};



export default AdminAnalytics;
