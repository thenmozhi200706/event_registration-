import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import "./ErrorMessage.css";

const ErrorMessage = ({
    message = "Something went wrong.",
    title = "Unable to load",
    onRetry = null,
}) => {
    return (
        <div className="error-message">

            <div className="error-message-icon">
                <AlertCircle size={20} />
            </div>

            <div className="error-message-content">

                <h3>
                    {title}
                </h3>

                <p>
                    {message}
                </p>

                {onRetry && (
                    <button
                        type="button"
                        className="error-message-retry"
                        onClick={onRetry}
                    >
                        <RefreshCw size={14} />
                        Try Again
                    </button>
                )}

            </div>

        </div>
    );
};

export default ErrorMessage;