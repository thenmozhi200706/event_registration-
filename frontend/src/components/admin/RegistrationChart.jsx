import React, { useMemo } from "react";
import "./RegistrationChart.css";
const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const getValue = (item) => {
  return Number(
    item?.registrations ??
      item?.registrationCount ??
      item?.count ??
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
    `Day ${index + 1}`
  );
};

const RegistrationChart = ({
  data = [],
  loading = false,
  title = "Registration Overview",
  subtitle = "Registration activity over time",
}) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map((item, index) => ({
      label: getLabel(item, index),
      value: getValue(item),
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    if (!chartData.length) return 1;

    return Math.max(
      ...chartData.map((item) => item.value),
      1
    );
  }, [chartData]);

  const totalRegistrations = useMemo(() => {
    return chartData.reduce(
      (total, item) => total + item.value,
      0
    );
  }, [chartData]);

  const highestRegistration = useMemo(() => {
    if (!chartData.length) return 0;

    return Math.max(
      ...chartData.map((item) => item.value),
      0
    );
  }, [chartData]);

  if (loading) {
    return (
      <div className="registration-chart-card">
        <div className="registration-chart-header">
          <div>
            <div className="chart-skeleton-title"></div>
            <div className="chart-skeleton-subtitle"></div>
          </div>
        </div>

        <div className="registration-chart-loading">
          <div className="chart-loading-bars">
            {[40, 65, 50, 80, 60, 75, 45].map(
              (height, index) => (
                <div
                  key={index}
                  className="chart-loading-bar"
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
    <div className="registration-chart-card">
      {/* HEADER */}
      <div className="registration-chart-header">
        <div>
          <span className="chart-eyebrow">REGISTRATIONS</span>

          <h2>{title}</h2>

          <p>{subtitle}</p>
        </div>

        <div className="chart-total">
          <span>Total</span>
          <strong>{formatNumber(totalRegistrations)}</strong>
        </div>
      </div>

      {/* QUICK SUMMARY */}
      <div className="registration-chart-summary">
        <div className="chart-summary-item">
          <span>Registrations</span>
          <strong>
            {formatNumber(totalRegistrations)}
          </strong>
        </div>

        <div className="chart-summary-item">
          <span>Peak</span>
          <strong>
            {formatNumber(highestRegistration)}
          </strong>
        </div>

        <div className="chart-summary-item">
          <span>Data Points</span>
          <strong>{formatNumber(chartData.length)}</strong>
        </div>
      </div>

      {/* CHART */}
      {chartData.length > 0 ? (
        <div className="registration-chart-container">
          {/* Y AXIS */}
          <div className="chart-y-axis">
            <span>{formatNumber(maxValue)}</span>

            <span>
              {formatNumber(Math.round(maxValue * 0.75))}
            </span>

            <span>
              {formatNumber(Math.round(maxValue * 0.5))}
            </span>

            <span>
              {formatNumber(Math.round(maxValue * 0.25))}
            </span>

            <span>0</span>
          </div>

          {/* GRAPH */}
          <div className="registration-chart">
            {/* GRID */}
            <div className="chart-grid">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            {/* BARS */}
            <div className="chart-bars">
              {chartData.map((item, index) => {
                const percentage =
                  maxValue > 0
                    ? (item.value / maxValue) * 100
                    : 0;

                return (
                  <div
                    className="chart-column"
                    key={`${item.label}-${index}`}
                  >
                    {/* VALUE */}
                    <span className="chart-bar-value">
                      {formatNumber(item.value)}
                    </span>

                    {/* BAR */}
                    <div className="chart-bar-area">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.max(
                            percentage,
                            item.value > 0 ? 4 : 1
                          )}%`,
                        }}
                        title={`${item.label}: ${formatNumber(
                          item.value
                        )} registrations`}
                      ></div>
                    </div>

                    {/* LABEL */}
                    <span className="chart-label">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="registration-chart-empty">
          <div className="empty-chart-icon">▥</div>

          <h3>No registration data</h3>

          <p>
            Registration activity will appear here once
            registrations are available.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegistrationChart;