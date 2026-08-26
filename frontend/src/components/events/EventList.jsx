// =====================================================
// EVENTSPHERE - EVENT LIST
// =====================================================

import React from "react";

import EventCard from "./EventCard";

import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";

import "./EventList.css";


const EventList = ({
    events = [],
    loading = false,
    error = "",
    onRetry,
}) => {

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <div className="event-list-state">
                <Loader />

                <p>
                    Loading events...
                </p>
            </div>
        );
    }


    // =================================================
    // ERROR
    // =================================================

    if (error) {
        return (
            <div className="event-list-state">

                <ErrorMessage
                    message={error}
                />

                {onRetry && (
                    <button
                        type="button"
                        className="event-list-retry"
                        onClick={onRetry}
                    >
                        Try Again
                    </button>
                )}

            </div>
        );
    }


    // =================================================
    // EMPTY
    // =================================================

    if (!Array.isArray(events) || events.length === 0) {
        return (
            <div className="event-list-empty">

                <div className="event-list-empty-icon">
                    📅
                </div>

                <h3>
                    No Events Found
                </h3>

                <p>
                    There are no events matching
                    your search or filter.
                </p>

            </div>
        );
    }


    // =================================================
    // EVENT LIST
    // =================================================

    return (
        <div className="event-list">

            {events.map((event) => (

                <EventCard
                    key={
                        event._id ||
                        event.id
                    }
                    event={event}
                />

            ))}

        </div>
    );
};


export default EventList;