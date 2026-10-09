import React, { useMemo, useState } from "react";
import "./RegistrationChart.css";

const RegistrationChart = ({
    data = [],
    registrationTrend = [],
    loading = false,
}) => {
    const [period, setPeriod] = useState("all");

    const chartData =
        data.length > 0 ? data : registrationTrend;

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

    const filteredData = useMemo(() => {
        if (!chartData.length) {
            return [];
        }

        if (period === "all") {
            return chartData;
        }

        const days = Number(period);

        return chartData.slice(-days);
    }, [chartData, period]);

    const totalRegistrations = useMemo(() => {
        return filteredData.reduce(
            (total, item) =>
                total +
                Number(
                    item.registrations ??
                        item.totalRegistrations ??
                        item.count ??
                        0
                ),
            0
        );
    }, [filteredData]);

    const maxValue = useMemo(() => {
        if (!filteredData.length) {
            return 1;
        }

        return Math.max(
            ...filteredData.map((item) =>
                Number(
                    item.registrations ??
                        item.totalRegistrations ??
                        item.count ??
                        0
                )
            ),
            1
        );
    }, [filteredData]);

    const averageRegistrations =
        filteredData.length > 0
            ? totalRegistrations /
              filteredData.length
            : 0;

    if (loading) {
        return (
            <section className="organizer-section">

                <div className="organizer-section-header">
                    <div>
                        <h2>
                            Registration Overview
                        </h2>

                        <p>
                            Registration activity
                            over time.
                        </p>
                    </div>
                </div>

                <div className="registration-chart-loading">

                    <div className="registration-chart-spinner"></div>

                    <span>
                        Loading registration
                        data...
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
                    <h2>
                        Registration Overview
                    </h2>

                    <p>
                        Track participant
                        registrations over time.
                    </p>
                </div>


                <div className="registration-chart-controls">

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

            <div className="registration-chart-summary">

                <div>
                    <span>
                        Registrations
                    </span>

                    <strong>
                        {totalRegistrations.toLocaleString(
                            "en-IN"
                        )}
                    </strong>
                </div>


                <div>
                    <span>
                        Daily Average
                    </span>

                    <strong>
                        {averageRegistrations.toFixed(
                            1
                        )}
                    </strong>
                </div>

            </div>


            {/* ==================================================
                CHART
            ================================================== */}

            <div className="registration-chart-card">

                {filteredData.length > 0 ? (
                    <div className="registration-chart">

                        {/* Y AXIS */}

                        <div className="registration-chart-y-axis">

                            <span>
                                {maxValue}
                            </span>

                            <span>
                                {Math.round(
                                    maxValue * 0.75
                                )}
                            </span>

                            <span>
                                {Math.round(
                                    maxValue * 0.5
                                )}
                            </span>

                            <span>
                                {Math.round(
                                    maxValue * 0.25
                                )}
                            </span>

                            <span>
                                0
                            </span>

                        </div>


                        {/* GRAPH */}

                        <div className="registration-chart-main">

                            <div className="registration-chart-grid">

                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>

                            </div>


                            <div className="registration-chart-bars">

                                {filteredData.map(
                                    (
                                        item,
                                        index
                                    ) => {

                                        const value =
                                            Number(
                                                item.registrations ??
                                                    item.totalRegistrations ??
                                                    item.count ??
                                                    0
                                            );

                                        const height =
                                            Math.max(
                                                (value /
                                                    maxValue) *
                                                    100,
                                                value >
                                                    0
                                                    ? 3
                                                    : 0
                                            );

                                        return (
                                            <div
                                                className="registration-chart-column"
                                                key={
                                                    item.date ||
                                                    item._id ||
                                                    index
                                                }
                                            >

                                                {/* VALUE */}

                                                <div className="registration-chart-value">
                                                    {value}
                                                </div>


                                                {/* BAR */}

                                                <div className="registration-bar-area">

                                                    <div
                                                        className="registration-chart-bar"
                                                        style={{
                                                            height: `${height}%`,
                                                        }}
                                                        title={`${formatDate(
                                                            item.date
                                                        )}: ${value} registrations`}
                                                    />

                                                </div>


                                                {/* DATE */}

                                                <span className="registration-chart-date">
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
                    <div className="registration-chart-empty">

                        <div>
                            ◫
                        </div>

                        <strong>
                            No Registration Data
                        </strong>

                        <p>
                            Registration activity
                            will appear here once
                            participants register
                            for your events.
                        </p>

                    </div>
                )}

            </div>

        </section>
    );
};

export default RegistrationChart;