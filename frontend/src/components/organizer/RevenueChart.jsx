import React, { useMemo, useState } from "react";
import "./RevenueChart.css";
const RevenueChart = ({
    data = [],
    revenueTrend = [],
    loading = false,
}) => {
    const [period, setPeriod] = useState("all");

    const chartData =
        data.length > 0 ? data : revenueTrend;

    const formatDate = (date) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
        });
    };

    const getRevenue = (item) => {
        return Number(
            item.revenue ??
                item.totalRevenue ??
                item.amount ??
                0
        );
    };

    const filteredData = useMemo(() => {
        if (!chartData.length) {
            return [];
        }

        if (period === "all") {
            return chartData;
        }

        return chartData.slice(-Number(period));
    }, [chartData, period]);

    const totalRevenue = useMemo(() => {
        return filteredData.reduce(
            (total, item) =>
                total + getRevenue(item),
            0
        );
    }, [filteredData]);

    const maxRevenue = useMemo(() => {
        if (!filteredData.length) {
            return 1;
        }

        return Math.max(
            ...filteredData.map(getRevenue),
            1
        );
    }, [filteredData]);

    const averageRevenue =
        filteredData.length > 0
            ? totalRevenue / filteredData.length
            : 0;

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2,
            }
        )}`;
    };

    if (loading) {
        return (
            <section className="organizer-section">

                <div className="organizer-section-header">
                    <div>
                        <h2>Revenue Overview</h2>

                        <p>
                            Track your event revenue
                            over time.
                        </p>
                    </div>
                </div>

                <div className="revenue-chart-loading">

                    <div className="revenue-chart-spinner"></div>

                    <span>
                        Loading revenue data...
                    </span>

                </div>

            </section>
        );
    }

    return (
        <section className="organizer-section">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="organizer-section-header">

                <div>
                    <h2>Revenue Overview</h2>

                    <p>
                        Monitor revenue generated
                        from your events.
                    </p>
                </div>

                <div className="revenue-chart-controls">

                    <button
                        type="button"
                        className={
                            period === "7"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPeriod("7")
                        }
                    >
                        7 Days
                    </button>

                    <button
                        type="button"
                        className={
                            period === "30"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPeriod("30")
                        }
                    >
                        30 Days
                    </button>

                    <button
                        type="button"
                        className={
                            period === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPeriod("all")
                        }
                    >
                        All
                    </button>

                </div>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="revenue-chart-summary">

                <div>
                    <span>
                        Total Revenue
                    </span>

                    <strong>
                        {formatCurrency(
                            totalRevenue
                        )}
                    </strong>
                </div>

                <div>
                    <span>
                        Average Revenue
                    </span>

                    <strong>
                        {formatCurrency(
                            averageRevenue
                        )}
                    </strong>
                </div>

            </div>


            {/* ==================================================
                CHART
            ================================================== */}

            <div className="revenue-chart-card">

                {filteredData.length > 0 ? (
                    <div className="revenue-chart">

                        {/* Y AXIS */}

                        <div className="revenue-chart-y-axis">

                            <span>
                                {formatCurrency(
                                    maxRevenue
                                )}
                            </span>

                            <span>
                                {formatCurrency(
                                    maxRevenue * 0.75
                                )}
                            </span>

                            <span>
                                {formatCurrency(
                                    maxRevenue * 0.5
                                )}
                            </span>

                            <span>
                                {formatCurrency(
                                    maxRevenue * 0.25
                                )}
                            </span>

                            <span>
                                ₹0
                            </span>

                        </div>


                        {/* MAIN CHART */}

                        <div className="revenue-chart-main">

                            <div className="revenue-chart-grid">

                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>

                            </div>


                            <div className="revenue-chart-bars">

                                {filteredData.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const revenue =
                                            getRevenue(
                                                item
                                            );

                                        const height =
                                            Math.max(
                                                (revenue /
                                                    maxRevenue) *
                                                    100,
                                                revenue >
                                                    0
                                                    ? 3
                                                    : 0
                                            );

                                        return (
                                            <div
                                                className="revenue-chart-column"
                                                key={
                                                    item.date ||
                                                    item._id ||
                                                    index
                                                }
                                            >

                                                {/* VALUE */}

                                                <div className="revenue-chart-value">
                                                    {formatCurrency(
                                                        revenue
                                                    )}
                                                </div>


                                                {/* BAR */}

                                                <div className="revenue-bar-area">

                                                    <div
                                                        className="revenue-chart-bar"
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                        title={`${formatDate(
                                                            item.date
                                                        )}: ${formatCurrency(
                                                            revenue
                                                        )}`}
                                                    />

                                                </div>


                                                {/* DATE */}

                                                <span className="revenue-chart-date">
                                                    {formatDate(
                                                        item.date
                                                    )}
                                                </span>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>
                ) : (
                    <div className="revenue-chart-empty">

                        <div>
                            ₹
                        </div>

                        <strong>
                            No Revenue Data
                        </strong>

                        <p>
                            Revenue generated from
                            paid registrations will
                            appear here.
                        </p>

                    </div>
                )}

            </div>

        </section>
    );
};

export default RevenueChart;