// backend/utils/eventValidation.js

/*
 * Validate event data before creating
 * or updating an event.
 *
 * Returns:
 *
 * {
 *     valid: true,
 *     errors: []
 * }
 *
 * OR
 *
 * {
 *     valid: false,
 *     errors: [...]
 * }
 */

const validateEventData = (data = {}) => {
    const errors = [];

    // ==========================================
    // GET EVENT DATA
    // ==========================================

    const {
        title,
        description,
        venue,
        eventDate,
        registrationFee,
        registrationDeadline,
    } = data;

    // ==========================================
    // TITLE
    // ==========================================

    if (
        !title ||
        !String(title).trim()
    ) {
        errors.push(
            "Event title is required"
        );
    } else if (
        String(title).trim().length > 200
    ) {
        errors.push(
            "Event title cannot exceed 200 characters"
        );
    }

    // ==========================================
    // DESCRIPTION
    // ==========================================

    if (
        !description ||
        !String(description).trim()
    ) {
        errors.push(
            "Event description is required"
        );
    } else if (
        String(description).trim().length > 5000
    ) {
        errors.push(
            "Event description cannot exceed 5000 characters"
        );
    }

    // ==========================================
    // VENUE
    // ==========================================

    if (
        !venue ||
        !String(venue).trim()
    ) {
        errors.push(
            "Event venue is required"
        );
    } else if (
        String(venue).trim().length > 500
    ) {
        errors.push(
            "Event venue cannot exceed 500 characters"
        );
    }

    // ==========================================
    // EVENT DATE
    // ==========================================

    let parsedEventDate = null;

    if (!eventDate) {
        errors.push(
            "Event date is required"
        );
    } else {
        parsedEventDate =
            new Date(eventDate);

        if (
            Number.isNaN(
                parsedEventDate.getTime()
            )
        ) {
            errors.push(
                "Invalid event date"
            );
            parsedEventDate = null;
        }
    }

    // ==========================================
    // REGISTRATION DEADLINE
    // ==========================================

    let parsedDeadline = null;

    if (!registrationDeadline) {
        errors.push(
            "Registration deadline is required"
        );
    } else {
        parsedDeadline =
            new Date(
                registrationDeadline
            );

        if (
            Number.isNaN(
                parsedDeadline.getTime()
            )
        ) {
            errors.push(
                "Invalid registration deadline"
            );
            parsedDeadline = null;
        }
    }

    // ==========================================
    // EVENT DATE VS DEADLINE
    // ==========================================

    if (
        parsedEventDate &&
        parsedDeadline
    ) {
        if (
            parsedDeadline >
            parsedEventDate
        ) {
            errors.push(
                "Registration deadline cannot be after the event date"
            );
        }
    }

    // ==========================================
    // REGISTRATION FEE
    // ==========================================

    if (
        registrationFee !== undefined &&
        registrationFee !== null &&
        registrationFee !== ""
    ) {
        const fee =
            Number(registrationFee);

        if (
            Number.isNaN(fee)
        ) {
            errors.push(
                "Registration fee must be a valid number"
            );
        } else if (
            !Number.isFinite(fee)
        ) {
            errors.push(
                "Registration fee must be a finite number"
            );
        } else if (
            fee < 0
        ) {
            errors.push(
                "Registration fee cannot be negative"
            );
        }
    }

    // ==========================================
    // HASHTAGS
    // ==========================================

    if (
        data.hashtags !== undefined &&
        data.hashtags !== null &&
        data.hashtags !== ""
    ) {
        let hashtags =
            data.hashtags;

        // --------------------------------------
        // JSON STRING
        // --------------------------------------

        if (
            typeof hashtags === "string"
        ) {
            try {
                hashtags =
                    JSON.parse(
                        hashtags
                    );
            } catch (error) {
                // --------------------------------
                // COMMA-SEPARATED STRING
                // --------------------------------

                hashtags =
                    hashtags.split(",");
            }
        }

        // --------------------------------------
        // CHECK ARRAY
        // --------------------------------------

        if (
            !Array.isArray(
                hashtags
            )
        ) {
            errors.push(
                "Hashtags must be an array"
            );
        } else {
            // --------------------------------
            // MAX HASHTAGS
            // --------------------------------

            if (
                hashtags.length > 10
            ) {
                errors.push(
                    "Maximum 10 hashtags are allowed"
                );
            }

            // --------------------------------
            // VALIDATE EACH HASHTAG
            // --------------------------------

            hashtags.forEach(
                (tag, index) => {
                    if (
                        !String(tag).trim()
                    ) {
                        errors.push(
                            `Hashtag ${index + 1} cannot be empty`
                        );
                    }
                }
            );
        }
    }

    // ==========================================
    // RETURN VALIDATION RESULT
    // ==========================================

    return {
        valid:
            errors.length === 0,

        errors,
    };
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    validateEventData,
};