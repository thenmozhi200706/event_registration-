// backend/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.error(
            "========== MongoDB Connection Error =========="
        );
        console.error(error.message);
        console.error(
            "==============================================="
        );

        process.exit(1);
    }
};

module.exports = connectDB;