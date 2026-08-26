// backend/utils/generateOTP.js

/*
 * GENERATE 6-DIGIT OTP
 *
 * Returns a random 6-digit number
 * as a string.
 *
 * Example:
 * "583214"
 */
const generateOTP = () => {
    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    return otp;
};


/*
 * Export function
 */
module.exports = generateOTP;