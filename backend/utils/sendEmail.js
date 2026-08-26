// backend/utils/sendEmail.js

const nodemailer = require("nodemailer");

// ==========================================
// CREATE GMAIL TRANSPORTER
// ==========================================

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// ==========================================
// VERIFY GMAIL CONNECTION
// ==========================================

const verifyEmailConnection = async () => {
    try {
        await transporter.verify();

        console.log(
            "Gmail SMTP connection successful"
        );

        return true;
    } catch (error) {
        console.error(
            "Gmail SMTP connection failed:"
        );

        console.error(
            error.message
        );

        return false;
    }
};


// ==========================================
// SEND OTP EMAIL
// ==========================================

const sendOTPEmail = async ({
    email,
    name,
    otp
}) => {
    try {
        if (!process.env.EMAIL_USER) {
            throw new Error(
                "EMAIL_USER is missing in .env"
            );
        }

        if (!process.env.EMAIL_PASS) {
            throw new Error(
                "EMAIL_PASS is missing in .env"
            );
        }

        const mailOptions = {
            from:
                `"EventSphere" <${process.env.EMAIL_USER}>`,

            to: email,

            subject:
                "EventSphere Organizer Verification OTP",

            text:
                `Hello ${name || "Organizer"},\n\n` +
                `Your EventSphere OTP is: ${otp}\n\n` +
                `This OTP is valid for 10 minutes.\n\n` +
                `Regards,\n` +
                `EventSphere Team`,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 30px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2>
                        EventSphere Organizer Verification
                    </h2>

                    <p>
                        Hello ${name || "Organizer"},
                    </p>

                    <p>
                        Your verification OTP is:
                    </p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        text-align: center;
                        padding: 15px;
                        margin: 20px 0;
                        background: #f5f5f5;
                        border-radius: 8px;
                    ">
                        ${otp}
                    </div>

                    <p>
                        This OTP is valid for
                        <strong>10 minutes</strong>.
                    </p>

                    <p>
                        If you did not request this
                        OTP, please ignore this email.
                    </p>

                    <p>
                        Regards,<br>
                        <strong>EventSphere Team</strong>
                    </p>

                </div>
            `
        };

        const info =
            await transporter.sendMail(
                mailOptions
            );

        console.log(
            "OTP email sent successfully"
        );

        console.log(
            `Message ID: ${info.messageId}`
        );

        return info;

    } catch (error) {

        console.error(
            "========== OTP Email Error =========="
        );

        console.error(
            error.message
        );

        console.error(
            "====================================="
        );

        throw new Error(
            "Failed to send OTP email"
        );
    }
};


// ==========================================
// SEND WELCOME EMAIL
// ==========================================

const sendWelcomeEmail = async ({
    email,
    name
}) => {
    try {

        const mailOptions = {
            from:
                `"EventSphere" <${process.env.EMAIL_USER}>`,

            to: email,

            subject:
                "Welcome to EventSphere",

            text:
                `Hello ${name},\n\n` +
                `Your EventSphere Organizer account ` +
                `has been successfully activated.\n\n` +
                `You can now create and manage events.\n\n` +
                `Regards,\n` +
                `EventSphere Team`,

            html: `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 30px;
                ">

                    <h2>
                        Welcome to EventSphere!
                    </h2>

                    <p>
                        Hello ${name},
                    </p>

                    <p>
                        Your Organizer account has been
                        successfully activated.
                    </p>

                    <p>
                        You can now create and manage
                        events on EventSphere.
                    </p>

                    <p>
                        Regards,<br>
                        <strong>EventSphere Team</strong>
                    </p>

                </div>
            `
        };

        const info =
            await transporter.sendMail(
                mailOptions
            );

        console.log(
            "Welcome email sent successfully"
        );

        console.log(
            `Message ID: ${info.messageId}`
        );

        return info;

    } catch (error) {

        console.error(
            "========== Welcome Email Error =========="
        );

        console.error(
            error.message
        );

        console.error(
            "=========================================="
        );

        throw new Error(
            "Failed to send welcome email"
        );
    }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail,
    verifyEmailConnection
};