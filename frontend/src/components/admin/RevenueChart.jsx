import React, { useMemo } from "react";
import "./RevenueChart.css";
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

const getRevenue = (item) => {
  return Number(
    item?.revenue ??
      item?.totalRevenue ??
      item?.amount ??
      item?.total ??
      item?.value ??
      0
  );
};

const getLabel = (item, index) => {
  if (item?.date) {
    const date = new Date(item.date);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }

    return item.date;
  }

  return (
    item?.label ||
    item?.month ||
    item?._id ||
    `Period ${index + 1}`
  );
};

const RevenueChart = ({
  data = [],
  loading = false,
  title = "Revenue Overview",
  subtitle = "Revenue generated from event registrations",
}) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => ({
      label: getLabel(item, index),
      revenue: getRevenue(item),
    }));
  }, [data]);

  const maxRevenue = useMemo(() => {
    if (!chartData.length) return 1;

    return Math.max(
      ...chartData.map((item) => item.revenue),
      1
    );
  }, [chartData]);

  const totalRevenue = useMemo(() => {
    return chartData.reduce(
      (total, item) => total + item.revenue,
      0
    );
  }, [chartData]);

  const highestRevenue = useMemo(() => {
    if (!chartData.length) return 0;

    return Math.max(
      ...chartData.map((item) => item.revenue),
      0
    );
  }, [chartData]);

  const averageRevenue = useMemo(() => {
    if (!chartData.length) return 0;

    return totalRevenue / chartData.length;
  }, [chartData, totalRevenue]);

  if (loading) {
    return (
      <div className="revenue-chart-card">
        <div className="revenue-chart-header">
          <div>
            <div className="chart-skeleton-title"></div>
            <div className="chart-skeleton-subtitle"></div>
          </div>
        </div>

        <div className="revenue-chart-loading">
          <div className="revenue-loading-bars">
            {[45, 70, 55, 85, 60, 75, 50].map(
              (height, index) => (
                <div
                  key={index}
                  className="revenue-loading-bar"
                  style={{
                    height: `${height}%`,
                  }}
                ></div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-chart-card">
      {/* HEADER */}
      <div className="revenue-chart-header">
        <div>
          <span className="revenue-chart-eyebrow">
            REVENUE
          </span>

          <h2>{title}</h2>

          <p>{subtitle}</p>
        </div>

        <div className="revenue-chart-total">
          <span>Total Revenue</span>

          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="revenue-chart-summary">
        <div className="revenue-summary-item">
          <span>Total Revenue</span>

          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>

        <div className="revenue-summary-item">
          <span>Highest Period</span>

          <strong>{formatCurrency(highestRevenue)}</strong>
        </div>

        <div className="revenue-summary-item">
          <span>Average</span>

          <strong>{formatCurrency(averageRevenue)}</strong>
        </div>

        <div className="revenue-summary-item">
          <span>Periods</span>

          <strong>{formatNumber(chartData.length)}</strong>
        </div>
      </div>

      {/* CHART */}
      {chartData.length > 0 ? (
        <div className="revenue-chart-container">
          {/* Y AXIS */}
          <div className="revenue-y-axis">
            <span>{formatCurrency(maxRevenue)}</span>

            <span>
              {formatCurrency(Math.round(maxRevenue * 0.75))}
            </span>

            <span>
              {formatCurrency(Math.round(maxRevenue * 0.5))}
            </span>

            <span>
              {formatCurrency(Math.round(maxRevenue * 0.25))}
            </span>

            <span>₹0</span>
          </div>

          {/* GRAPH */}
          <div className="revenue-chart">
            {/* GRID */}
            <div className="revenue-chart-grid">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            {/* BARS */}
            <div className="revenue-chart-bars">
              {chartData.map((item, index) => {
                const percentage =
                  maxRevenue > 0
                    ? (item.revenue / maxRevenue) * 100
                    : 0;

                return (
                  <div
                    className="revenue-chart-column"
                    key={`${item.label}-${index}`}
                  >
                    {/* VALUE */}
                    <span className="revenue-bar-value">
                      {formatCurrency(item.revenue)}
                    </span>

                    {/* BAR */}
                    <div className="revenue-bar-area">
                      <div
                        className="revenue-bar"
                        style={{
                          height: `${Math.max(
                            percentage,
                            item.revenue > 0 ? 4 : 1
                          )}%`,
                        }}
                        title={`${item.label}: ${formatCurrency(
                          item.revenue
                        )}`}
                      ></div>
                    </div>

                    {/* LABEL */}
                    <span className="revenue-chart-label">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="revenue-chart-empty">
          <div className="revenue-empty-icon">₹</div>

          <h3>No revenue data</h3>

          <p>
            Revenue activity will appear here once successful
            payments are available.
          </p>
        </div>
      )}

      {/* FOOTER */}
      {chartData.length > 0 && (
        <div className="revenue-chart-footer">
          <span>
            Showing {formatNumber(chartData.length)} data
            {chartData.length === 1 ? " point" : " points"}
          </span>

          <span>
            Peak revenue: {formatCurrency(highestRevenue)}
          </span>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;