// backend/config/passport.js

const passport = require("passport");
const GoogleStrategy =
    require("passport-google-oauth20").Strategy;

const User = require("../models/User");
const Organizer = require("../models/Organizer");


// =====================================================
// CONFIGURE GOOGLE PASSPORT
// =====================================================

const configurePassport = () => {

    passport.use(
        new GoogleStrategy(
            {
                clientID:
                    process.env.GOOGLE_CLIENT_ID,

                clientSecret:
                    process.env.GOOGLE_CLIENT_SECRET,

                callbackURL:
                    process.env.GOOGLE_CALLBACK_URL,
            },

            async (
                accessToken,
                refreshToken,
                profile,
                done
            ) => {

                try {

                    // ==========================================
                    // GOOGLE INFORMATION
                    // ==========================================

                    const googleId =
                        profile.id;

                    const email =
                        profile.emails &&
                        profile.emails[0]
                            ? profile.emails[0].value
                                  .trim()
                                  .toLowerCase()
                            : null;

                    const name =
                        profile.displayName ||
                        `${profile.name?.givenName || ""} ${
                            profile.name?.familyName || ""
                        }`.trim();

                    const profileImage =
                        profile.photos &&
                        profile.photos[0]
                            ? profile.photos[0].value
                            : "";


                    // ==========================================
                    // EMAIL REQUIRED
                    // ==========================================

                    if (!email) {

                        return done(
                            new Error(
                                "Google account email not available"
                            ),
                            null
                        );
                    }


                    // ==========================================
                    // ADMIN EMAIL
                    // ==========================================

                    const adminEmail =
                        process.env.ADMIN_EMAIL
                            ?.trim()
                            .toLowerCase();


                    // ==========================================
                    // ADMIN LOGIN
                    // ==========================================
                    //
                    // Check admin FIRST.
                    //
                    // This prevents an admin account from
                    // accidentally being converted to organizer.
                    //
                    // ==========================================

                    if (
                        adminEmail &&
                        email === adminEmail
                    ) {

                        let user =
                            await User.findOne({
                                $or: [
                                    {
                                        googleId,
                                    },
                                    {
                                        email,
                                    },
                                ],
                            });


                        // --------------------------------------
                        // CREATE ADMIN USER
                        // --------------------------------------

                        if (!user) {

                            user =
                                await User.create({

                                    name,

                                    email,

                                    googleId,

                                    profileImage,

                                    role:
                                        "admin",

                                    isActive:
                                        true,
                                });

                        } else {

                            user.googleId =
                                googleId;

                            user.name =
                                name;

                            user.profileImage =
                                profileImage;

                            user.role =
                                "admin";

                            user.isActive =
                                true;

                            await user.save();
                        }


                        return done(
                            null,
                            user
                        );
                    }


                    // ==========================================
                    // FIND ORGANIZER
                    // ==========================================
                    //
                    // Organizer must be checked BEFORE normal
                    // participant creation.
                    //
                    // ==========================================

                    const organizer =
                        await Organizer.findOne({
                            email,
                        });


                    // ==========================================
                    // ORGANIZER EXISTS
                    // ==========================================

                    if (organizer) {

                        // ======================================
                        // FIND EXISTING USER
                        // ======================================
                        //
                        // The same Gmail may already exist in
                        // the users collection as a participant.
                        //
                        // We REUSE that account instead of
                        // creating another User.
                        //
                        // This fixes:
                        //
                        // "This Gmail is already registered
                        // with another user."
                        //
                        // ======================================

                        let user =
                            await User.findOne({
                                email,
                            });


                        // ======================================
                        // PROTECT ADMIN
                        // ======================================

                        if (
                            user &&
                            user.role === "admin"
                        ) {

                            return done(
                                new Error(
                                    "Administrator account cannot be used as an organizer."
                                ),
                                null
                            );
                        }


                        // ======================================
                        // CREATE USER IF REQUIRED
                        // ======================================

                        if (!user) {

                            user =
                                await User.create({

                                    name:
                                        organizer.name ||
                                        name,

                                    email:
                                        organizer.email,

                                    googleId,

                                    profileImage,

                                    role:
                                        "organizer",

                                    isActive:
                                        false,
                                });

                        } else {

                            // ==================================
                            // CONVERT EXISTING USER
                            // ==================================

                            user.name =
                                organizer.name ||
                                name;

                            user.email =
                                organizer.email;

                            user.googleId =
                                googleId;

                            user.profileImage =
                                profileImage;

                            user.role =
                                "organizer";

                            /*
                             * IMPORTANT
                             *
                             * Do NOT activate the account yet.
                             *
                             * Organizer must complete OTP
                             * verification first.
                             */
                            user.isActive =
                                Boolean(
                                    organizer.otpVerified &&
                                    organizer.isActive
                                );

                            await user.save();
                        }


                        // ======================================
                        // ORGANIZER PENDING OTP
                        // ======================================
                        //
                        // Organizer exists but OTP has not been
                        // successfully verified.
                        //
                        // We return the REAL User document.
                        //
                        // IMPORTANT:
                        // Do NOT return organizer._id here.
                        //
                        // req.user must represent a User.
                        //
                        // ======================================

                        if (
                            !organizer.otpVerified ||
                            !organizer.isActive
                        ) {

                            /*
                             * Attach temporary information
                             * for authController.
                             *
                             * This property is available during
                             * the current authentication request.
                             */
                            user.organizerPending =
                                true;

                            user.organizerId =
                                organizer._id;

                            user.organizerOtpVerified =
                                false;


                            return done(
                                null,
                                user
                            );
                        }


                        // ======================================
                        // ORGANIZER ALREADY VERIFIED
                        // ======================================

                        user.role =
                            "organizer";

                        user.isActive =
                            true;

                        user.organizerPending =
                            false;

                        user.organizerId =
                            organizer._id;

                        user.organizerOtpVerified =
                            true;

                        await user.save();


                        return done(
                            null,
                            user
                        );
                    }


                    // ==========================================
                    // NORMAL USER / PARTICIPANT
                    // ==========================================

                    let user =
                        await User.findOne({
                            $or: [
                                {
                                    googleId,
                                },
                                {
                                    email,
                                },
                            ],
                        });


                    // ==========================================
                    // CREATE PARTICIPANT
                    // ==========================================

                    if (!user) {

                        user =
                            await User.create({

                                name,

                                email,

                                googleId,

                                profileImage,

                                role:
                                    "participant",

                                isActive:
                                    true,
                            });

                    } else {

                        // ======================================
                        // EXISTING USER
                        // ======================================

                        user.googleId =
                            googleId;

                        user.name =
                            name;

                        user.profileImage =
                            profileImage;


                        // ======================================
                        // DO NOT CHANGE SPECIAL ROLES
                        // ======================================

                        if (
                            user.role !== "admin" &&
                            user.role !== "organizer"
                        ) {

                            user.role =
                                "participant";
                        }


                        /*
                         * Existing normal participants remain
                         * active.
                         */
                        if (
                            user.role ===
                            "participant"
                        ) {

                            user.isActive =
                                true;
                        }


                        await user.save();
                    }


                    // ==========================================
                    // NORMAL LOGIN SUCCESS
                    // ==========================================

                    return done(
                        null,
                        user
                    );

                } catch (error) {

                    console.error(
                        "========== Google Authentication Error =========="
                    );

                    console.error(error);

                    console.error(
                        "=================================================="
                    );


                    return done(
                        error,
                        null
                    );
                }
            }
        )
    );


    return passport;
};


// =====================================================
// EXPORT
// =====================================================

module.exports =
    configurePassport;