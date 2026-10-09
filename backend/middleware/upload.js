const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
 * ============================================================
 * EVENTSPHERE — FILE UPLOAD MIDDLEWARE
 * ============================================================
 *
 * Used for:
 * - Event banner images
 *
 * Storage:
 * - backend/uploads/events/
 *
 * Allowed files:
 * - JPG
 * - JPEG
 * - PNG
 * - WEBP
 *
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * UPLOAD DIRECTORY
 * ------------------------------------------------------------
 */
const uploadDirectory = path.join(
    __dirname,
    "../uploads/events"
);


/*
 * ------------------------------------------------------------
 * CREATE DIRECTORY IF NOT EXISTS
 * ------------------------------------------------------------
 */
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}


/*
 * ------------------------------------------------------------
 * STORAGE CONFIGURATION
 * ------------------------------------------------------------
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const baseName = path
            .basename(
                file.originalname,
                extension
            )
            .replace(/[^a-zA-Z0-9]/g, "-")
            .toLowerCase();

        const uniqueName =
            `${baseName}-${Date.now()}${extension}`;

        cb(null, uniqueName);
    },
});


/*
 * ------------------------------------------------------------
 * FILE FILTER
 * ------------------------------------------------------------
 */
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP image files are allowed."
            ),
            false
        );
    }
};


/*
 * ------------------------------------------------------------
 * MULTER CONFIGURATION
 * ------------------------------------------------------------
 */
const upload = multer({
    storage,

    fileFilter,

    limits: {
        // Maximum file size: 5 MB
        fileSize: 5 * 1024 * 1024,
    },
});


module.exports = upload;