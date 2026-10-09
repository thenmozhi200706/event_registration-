// frontend/src/context/AuthContext.jsx

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getCurrentUser,
    getStoredUser,
    logout as logoutService,
} from "../services/authService";

import {
    getToken,
} from "../utils/storage";


export const AuthContext =
    createContext(null);


// =========================================================
// AUTH PROVIDER
// =========================================================

export const AuthProvider = ({
    children,
}) => {

    // =====================================================
    // USER STATE
    // =====================================================

    const [
        user,
        setUser,
    ] = useState(() => {

        try {

            return getStoredUser();

        } catch (error) {

            console.error(
                "Failed to load stored user:",
                error
            );

            return null;
        }
    });


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState(null);


    // =====================================================
    // CLEAR ALL FRONTEND AUTH DATA
    // =====================================================

    const clearAuthData = () => {

        try {

            // -------------------------------------------------
            // localStorage
            // -------------------------------------------------

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "refreshToken"
            );

            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "currentUser"
            );


            // -------------------------------------------------
            // sessionStorage
            // -------------------------------------------------

            sessionStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "authToken"
            );

            sessionStorage.removeItem(
                "accessToken"
            );

            sessionStorage.removeItem(
                "refreshToken"
            );

            sessionStorage.removeItem(
                "user"
            );

            sessionStorage.removeItem(
                "currentUser"
            );

        } catch (storageError) {

            console.error(
                "Failed to clear authentication storage:",
                storageError
            );
        }
    };


    // =====================================================
    // LOAD CURRENT LOGGED-IN USER
    // =====================================================

    useEffect(() => {

        let mounted = true;


        const loadUser = async () => {

            try {

                setLoading(true);

                setError(null);


                // -------------------------------------------------
                // GET TOKEN
                // -------------------------------------------------

                const token =
                    getToken();


                console.log(
                    "AuthContext: checking token:",
                    token
                        ? "FOUND"
                        : "NOT FOUND"
                );


                // -------------------------------------------------
                // NO TOKEN
                // -------------------------------------------------

                if (!token) {

                    if (mounted) {

                        setUser(null);
                        setLoading(false);
                    }

                    return;
                }


                // -------------------------------------------------
                // GET CURRENT USER FROM BACKEND
                // -------------------------------------------------

                const currentUser =
                    await getCurrentUser();


                if (!mounted) {
                    return;
                }


                // -------------------------------------------------
                // VALID USER
                // -------------------------------------------------

                if (currentUser) {

                    setUser(
                        currentUser
                    );

                    console.log(
                        "AuthContext: user loaded:",
                        currentUser
                    );

                } else {

                    clearAuthData();

                    setUser(null);

                }

            } catch (error) {

                console.error(
                    "Failed to load current user:",
                    error?.response?.data ||
                    error?.message ||
                    error
                );


                if (!mounted) {
                    return;
                }


                // -------------------------------------------------
                // INVALID / EXPIRED TOKEN
                // -------------------------------------------------

                clearAuthData();

                setUser(null);

                setError(
                    "Your session has expired. Please login again."
                );

            } finally {

                if (mounted) {

                    setLoading(false);
                }
            }
        };


        loadUser();


        return () => {

            mounted = false;

        };

    }, []);


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = async () => {

        console.log(
            "AuthContext: Logout started..."
        );


        try {

            setLoading(true);


            // -------------------------------------------------
            // Try backend logout
            // -------------------------------------------------

            try {

                await logoutService();

                console.log(
                    "AuthContext: Backend logout successful."
                );

            } catch (serviceError) {

                /*
                 * Even if backend logout fails because the JWT
                 * is expired or invalid, we MUST still clear
                 * frontend authentication.
                 */

                console.warn(
                    "AuthContext: Backend logout failed. Clearing frontend authentication anyway.",
                    serviceError?.response?.data ||
                    serviceError?.message ||
                    serviceError
                );
            }


            // -------------------------------------------------
            // ALWAYS CLEAR FRONTEND AUTH
            // -------------------------------------------------

            clearAuthData();


            // -------------------------------------------------
            // CLEAR REACT AUTH STATE
            // -------------------------------------------------

            setUser(null);

            setError(null);


            console.log(
                "AuthContext: Logout completed."
            );

        } catch (error) {

            console.error(
                "AuthContext: Logout error:",
                error
            );


            // -------------------------------------------------
            // Even if something unexpected happens,
            // force frontend logout.
            // -------------------------------------------------

            clearAuthData();

            setUser(null);

            setError(null);

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // REFRESH USER
    // =========================================================

    const refreshUser = async () => {

        try {

            setError(null);


            const token =
                getToken();


            if (!token) {

                clearAuthData();

                setUser(null);

                return null;
            }


            const currentUser =
                await getCurrentUser();


            if (!currentUser) {

                clearAuthData();

                setUser(null);

                return null;
            }


            setUser(
                currentUser
            );


            return currentUser;

        } catch (error) {

            console.error(
                "Failed to refresh user:",
                error?.response?.data ||
                error?.message ||
                error
            );


            clearAuthData();

            setUser(null);


            setError(
                "Unable to refresh your account."
            );


            throw error;
        }
    };


    // =========================================================
    // ROLE HELPERS
    // =========================================================

    const normalizedRole =
        String(
            user?.role || ""
        )
            .trim()
            .toLowerCase();


    const isAdmin =
        normalizedRole === "admin";


    const isOrganizer =
        normalizedRole === "organizer";


    const isParticipant =
        normalizedRole === "participant" ||
        normalizedRole === "user";


    // =========================================================
    // CONTEXT VALUE
    // =========================================================

    const value = {

        // User
        user,
        setUser,

        // Authentication state
        loading,
        error,

        isAuthenticated:
            Boolean(user),

        // Roles
        isAdmin,
        isOrganizer,
        isParticipant,

        // Functions
        refreshUser,
        logout,

    };


    // =========================================================
    // PROVIDER
    // =========================================================

    return (

        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
};


// =========================================================
// useAuth HOOK
// =========================================================

export const useAuth = () => {

    const context =
        useContext(
            AuthContext
        );


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }


    return context;
};


export default AuthContext;