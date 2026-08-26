// backend/middleware/uploadMiddleware.js

const multer = require("multer");


// ==========================================
// MEMORY STORAGE
// ==========================================
//
// The uploaded image is temporarily stored
// in memory as a Buffer.
//
// Then eventController.js will send this
// buffer to Cloudinary.
//

const storage = multer.memoryStorage();


// ==========================================
// FILE FILTER
// ==========================================
//
// Only image files are allowed.
//

const fileFilter = (
    req,
    file,
    cb
) => {

    try {

        /*
         * Allowed image MIME types
         */
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        ];


        /*
         * Check file type
         */
        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG, PNG, and WEBP images are allowed"
                ),
                false
            );

        }

    } catch (error) {

        cb(
            error,
            false
        );

    }

};


// ==========================================
// MULTER CONFIGURATION
// ==========================================
//
// Maximum image size:
// 5 MB
//
// This applies to:
//
// - Event banner
// - Payment QR code
//

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024,

        files: 2,

    },

});


// ==========================================
// EXPORT
// ==========================================

module.exports = upload;