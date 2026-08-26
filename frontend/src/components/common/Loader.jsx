import React from "react";
import "./Loader.css";

const Loader = ({
    message = "Loading...",
    fullScreen = false,
}) => {
    return (
        <div
            className={`app-loader ${
                fullScreen ? "app-loader-fullscreen" : ""
            }`}
        >
            <div className="app-loader-spinner"></div>

            {message && (
                <p className="app-loader-message">
                    {message}
                </p>
            )}
        </div>
    );
};

export default Loader;