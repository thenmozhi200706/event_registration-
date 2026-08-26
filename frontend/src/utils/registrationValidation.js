// frontend/src/utils/registrationValidation.js

/*
 * ============================================================
 * EVENTSPHERE — REGISTRATION VALIDATION
 * ============================================================
 *
 * Validates participant registration information
 * before sending it to the backend.
 *
 * Fields:
 * - First Name
 * - Last Name
 * - Age
 * - WhatsApp Number
 * - Email
 * - Institute Name
 * - Department
 * - Academic Year
 * ============================================================
 */


/*
 * ============================================================
 * EMAIL VALIDATION
 * ============================================================
 */

const isValidEmail = (email) => {
    if (!email) {
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(
        email.trim()
    );
};


/*
 * ============================================================
 * WHATSAPP NUMBER VALIDATION
 * ============================================================
 *
 * Allows:
 * - 10 digit Indian numbers
 * - International numbers
 * - Optional + prefix
 * - Spaces
 * - Hyphens
 *
 * Examples:
 *
 * 9876543210
 * +919876543210
 * +91 9876543210
 * ============================================================
 */

const isValidWhatsAppNumber = (
    whatsappNumber
) => {
    if (!whatsappNumber) {
        return false;
    }

    const cleanedNumber =
        whatsappNumber
            .toString()
            .replace(/[\s-]/g, "");

    const whatsappRegex =
        /^\+?[0-9]{10,15}$/;

    return whatsappRegex.test(
        cleanedNumber
    );
};


/*
 * ============================================================
 * AGE VALIDATION
 * ============================================================
 */

const isValidAge = (age) => {
    if (
        age === null ||
        age === undefined ||
        age === ""
    ) {
        return false;
    }

    const numericAge =
        Number(age);

    return (
        Number.isInteger(numericAge) &&
        numericAge >= 1 &&
        numericAge <= 120
    );
};


/*
 * ============================================================
 * TEXT VALIDATION
 * ============================================================
 */

const isValidText = (
    value,
    minLength = 1,
    maxLength = 200
) => {
    if (
        value === null ||
        value === undefined
    ) {
        return false;
    }

    const text =
        value.toString().trim();

    return (
        text.length >= minLength &&
        text.length <= maxLength
    );
};


/*
 * ============================================================
 * VALIDATE REGISTRATION DATA
 * ============================================================
 *
 * Returns:
 *
 * {
 *     isValid: true,
 *     errors: {}
 * }
 *
 * OR:
 *
 * {
 *     isValid: false,
 *     errors: {
 *         firstName: "...",
 *         email: "..."
 *     }
 * }
 *
 * This structure will make it easy for
 * RegistrationForm.jsx to display
 * field-specific validation messages.
 * ============================================================
 */

const validateRegistration = (
    registrationData = {}
) => {
    const errors = {};

    const {
        firstName,
        lastName,
        age,
        whatsappNumber,
        email,
        instituteName,
        department,
        year,
    } = registrationData;


    /*
     * --------------------------------------------------------
     * FIRST NAME
     * --------------------------------------------------------
     */

    if (!isValidText(
        firstName,
        2,
        100
    )) {
        errors.firstName =
            "First name must be between 2 and 100 characters.";
    }


    /*
     * --------------------------------------------------------
     * LAST NAME
     * --------------------------------------------------------
     */

    if (!isValidText(
        lastName,
        1,
        100
    )) {
        errors.lastName =
            "Last name must be between 1 and 100 characters.";
    }


    /*
     * --------------------------------------------------------
     * AGE
     * --------------------------------------------------------
     */

    if (!isValidAge(age)) {
        errors.age =
            "Age must be between 1 and 120.";
    }


    /*
     * --------------------------------------------------------
     * WHATSAPP NUMBER
     * --------------------------------------------------------
     */

    if (
        !isValidWhatsAppNumber(
            whatsappNumber
        )
    ) {
        errors.whatsappNumber =
            "Enter a valid WhatsApp number.";
    }


    /*
     * --------------------------------------------------------
     * EMAIL
     * --------------------------------------------------------
     */

    if (!isValidEmail(email)) {
        errors.email =
            "Enter a valid email address.";
    }


    /*
     * --------------------------------------------------------
     * INSTITUTE NAME
     * --------------------------------------------------------
     */

    if (!isValidText(
        instituteName,
        2,
        200
    )) {
        errors.instituteName =
            "Institute name must be between 2 and 200 characters.";
    }


    /*
     * --------------------------------------------------------
     * DEPARTMENT
     * --------------------------------------------------------
     */

    if (!isValidText(
        department,
        2,
        150
    )) {
        errors.department =
            "Department must be between 2 and 150 characters.";
    }


    /*
     * --------------------------------------------------------
     * ACADEMIC YEAR
     * --------------------------------------------------------
     */

    if (!isValidText(
        year,
        1,
        50
    )) {
        errors.year =
            "Academic year is required.";
    }


    /*
     * --------------------------------------------------------
     * RESULT
     * --------------------------------------------------------
     */

    return {
        isValid:
            Object.keys(errors).length === 0,

        errors,
    };
};


/*
 * ============================================================
 * GET FIRST VALIDATION ERROR
 * ============================================================
 *
 * Useful for displaying a general error
 * at the top of the registration form.
 * ============================================================
 */

const getFirstValidationError = (
    errors = {}
) => {
    const firstKey =
        Object.keys(errors)[0];

    if (!firstKey) {
        return "";
    }

    return errors[firstKey];
};


/*
 * ============================================================
 * EXPORT
 * ============================================================
 */

export {
    isValidEmail,
    isValidWhatsAppNumber,
    isValidAge,
    isValidText,
    validateRegistration,
    getFirstValidationError,
};