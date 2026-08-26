// =====================================================
// EVENTSPHERE - EVENT FILTER
// =====================================================

import React from "react";
import { SlidersHorizontal, X } from "lucide-react";

import "./EventFilter.css";


const EventFilter = ({
    selectedHashtag = "",
    onHashtagChange,
    hashtags = [],
}) => {

    /*
     * Select hashtag
     */
    const handleChange = (event) => {

        if (onHashtagChange) {
            onHashtagChange(
                event.target.value
            );
        }
    };


    /*
     * Clear selected filter
     */
    const handleClear = () => {

        if (onHashtagChange) {
            onHashtagChange("");
        }
    };


    /*
     * Remove duplicate hashtags
     */
    const uniqueHashtags = [
        ...new Set(
            hashtags
                .filter(Boolean)
                .map((tag) =>
                    String(tag)
                        .trim()
                        .replace(/^#/, "")
                )
                .filter(Boolean)
        ),
    ];


    return (
        <div className="event-filter">

            {/* =================================================
                FILTER HEADER
                ================================================= */}

            <div className="event-filter-header">

                <div className="event-filter-title">

                    <SlidersHorizontal
                        size={17}
                        strokeWidth={2}
                    />

                    <span>
                        Filter Events
                    </span>

                </div>


                {selectedHashtag && (

                    <button
                        type="button"
                        className="event-filter-clear"
                        onClick={handleClear}
                    >
                        <X
                            size={14}
                            strokeWidth={2}
                        />

                        Clear
                    </button>

                )}

            </div>


            {/* =================================================
                HASHTAG FILTER
                ================================================= */}

            <div className="event-filter-group">

                <label
                    htmlFor="event-hashtag-filter"
                    className="event-filter-label"
                >
                    Category / Hashtag
                </label>


                <select
                    id="event-hashtag-filter"
                    value={selectedHashtag}
                    onChange={handleChange}
                    className="event-filter-select"
                >

                    <option value="">
                        All Events
                    </option>


                    {uniqueHashtags.map(
                        (hashtag) => (

                            <option
                                key={hashtag}
                                value={hashtag}
                            >
                                #{hashtag}
                            </option>

                        )
                    )}

                </select>

            </div>


            {/* =================================================
                SELECTED FILTER
                ================================================= */}

            {selectedHashtag && (

                <div className="event-filter-selected">

                    <span className="event-filter-selected-label">
                        Selected:
                    </span>

                    <span className="event-filter-tag">

                        #{selectedHashtag}

                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Remove selected filter"
                        >
                            <X
                                size={12}
                                strokeWidth={2.5}
                            />
                        </button>

                    </span>

                </div>

            )}

        </div>
    );
};


export default EventFilter;