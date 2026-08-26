// =====================================================
// EVENTSPHERE - EVENT SEARCH
// =====================================================

import React from "react";
import { Search, X } from "lucide-react";

import "./EventSearch.css";


const EventSearch = ({
    value = "",
    onChange,
    onClear,
    placeholder = "Search events..."
}) => {

    const handleChange = (event) => {

        if (onChange) {
            onChange(event.target.value);
        }
    };


    const handleClear = () => {

        if (onClear) {
            onClear();
            return;
        }

        if (onChange) {
            onChange("");
        }
    };


    return (
        <div className="event-search">

            <div className="event-search-input-wrapper">

                <Search
                    className="event-search-icon"
                    size={19}
                    strokeWidth={2}
                />

                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="event-search-input"
                    aria-label="Search events"
                />

                {value && (

                    <button
                        type="button"
                        className="event-search-clear"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <X
                            size={17}
                            strokeWidth={2}
                        />
                    </button>

                )}

            </div>

        </div>
    );
};


export default EventSearch;