import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ArrowLeft,
    Edit3,
    Mail,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    ShieldOff,
    Trash2,
    UserPlus,
    X,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import adminService from "../../services/adminService";

import "./ManageOrganizers.css";


const ManageOrganizers = () => {

    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [organizers, setOrganizers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [showModal, setShowModal] =
        useState(false);

    const [editingOrganizer, setEditingOrganizer] =
        useState(null);

    const [form, setForm] =
        useState({
            name: "",
            email: "",
        });

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================================
    // LOAD ORGANIZERS
    // =====================================================

    const loadOrganizers = async (
        refresh = false
    ) => {

        try {

            setError("");

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response =
                await adminService.getOrganizers();


            const list =
                response?.organizers ||
                response?.data?.organizers ||
                response?.data ||
                response?.results ||
                [];


            setOrganizers(
                Array.isArray(list)
                    ? list
                    : []
            );

        } catch (err) {

            console.error(
                "Load organizers error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.data?.message ||
                err?.message ||
                "Failed to load organizers."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }

    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadOrganizers();

    }, []);


    // =====================================================
    // SUCCESS MESSAGE AUTO HIDE
    // =====================================================

    useEffect(() => {

        if (!success) {
            return;
        }

        const timer =
            setTimeout(() => {
                setSuccess("");
            }, 4000);

        return () =>
            clearTimeout(timer);

    }, [success]);


    // =====================================================
    // FILTER
    // =====================================================

    const filteredOrganizers =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return organizers.filter(
                (organizer) => {

                    const name =
                        String(
                            organizer?.name || ""
                        ).toLowerCase();

                    const email =
                        String(
                            organizer?.email || ""
                        ).toLowerCase();


                    const matchesSearch =
                        !query ||
                        name.includes(query) ||
                        email.includes(query);


                    const isActive =
                        organizer?.isActive === true;


                    const matchesStatus =
                        statusFilter === "all" ||

                        (
                            statusFilter === "active" &&
                            isActive
                        ) ||

                        (
                            statusFilter === "inactive" &&
                            !isActive
                        );


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            organizers,
            search,
            statusFilter,
        ]);


    // =====================================================
    // COUNTS
    // =====================================================

    const total =
        organizers.length;


    const active =
        organizers.filter(
            (organizer) =>
                organizer?.isActive === true
        ).length;


    const inactive =
        total - active;


    // =====================================================
    // OPEN ADD MODAL
    // =====================================================

    const openAddModal = () => {

        setEditingOrganizer(null);

        setForm({
            name: "",
            email: "",
        });

        setError("");
        setSuccess("");

        setShowModal(true);

    };


    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const openEditModal = (
        organizer
    ) => {

        setEditingOrganizer(
            organizer
        );

        setForm({
            name:
                organizer?.name || "",

            email:
                organizer?.email || "",
        });

        setError("");
        setSuccess("");

        setShowModal(true);

    };


    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setEditingOrganizer(null);

        setForm({
            name: "",
            email: "",
        });

    };


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        // Remove old error while typing
        if (error) {
            setError("");
        }

    };


    // =====================================================
    // ADD / EDIT ORGANIZER
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        const name =
            String(form.name || "").trim();


        const email =
            String(form.email || "")
                .trim()
                .toLowerCase();


        // =================================================
        // VALIDATE NAME
        // =================================================

        if (!name) {

            setError(
                "Organizer name is required."
            );

            return;
        }


        // =================================================
        // VALIDATE EMAIL
        // =================================================

        if (!email) {

            setError(
                "Organizer Gmail address is required."
            );

            return;
        }


        if (
            !/^[^\s@]+@gmail\.com$/i.test(
                email
            )
        ) {

            setError(
                "Please enter a valid Gmail address."
            );

            return;
        }


        try {

            setSaving(true);


            // =================================================
            // EDIT ORGANIZER
            // =================================================

            if (editingOrganizer) {

                const organizerId =
                    editingOrganizer?._id ||
                    editingOrganizer?.id;


                if (!organizerId) {

                    throw new Error(
                        "Organizer ID is missing."
                    );

                }


                await adminService.updateOrganizer(
                    organizerId,
                    {
                        name,
                        email,
                    }
                );


                setShowModal(false);

                setEditingOrganizer(null);

                setForm({
                    name: "",
                    email: "",
                });


                setSuccess(
                    "Organizer updated successfully."
                );


                await loadOrganizers(true);

                return;
            }


            // =================================================
            // ADD ORGANIZER
            // =================================================

            const response =
                await adminService.addOrganizer(
                    {
                        name,
                        email,
                    }
                );


            console.log(
                "Organizer added:",
                response
            );


            // =================================================
            // GET ORGANIZER ID
            // =================================================

            const organizerId =
                response?.organizerId ||
                response?.organizer?._id ||
                response?.organizer?.id ||
                response?.data?.organizerId ||
                response?.data?.organizer?._id ||
                response?.data?.organizer?.id ||
                null;


            // =================================================
            // GET EMAIL
            // =================================================

            const organizerEmail =
                response?.email ||
                response?.organizer?.email ||
                response?.data?.email ||
                response?.data?.organizer?.email ||
                email;


            // =================================================
            // CLOSE ADD MODAL
            // =================================================

            setShowModal(false);

            setEditingOrganizer(null);

            setForm({
                name: "",
                email: "",
            });


            // =================================================
            // GO TO OTP VERIFICATION
            // =================================================
            //
            // Email is passed through:
            //
            // 1. React Router state
            // 2. URL query parameter
            //
            // This makes the OTP page more reliable after
            // refresh/navigation.
            // =================================================

            const query =
                new URLSearchParams({
                    email: organizerEmail,
                });


            navigate(
                `/organizer/verify-otp?${query.toString()}`,
                {
                    state: {
                        email:
                            organizerEmail,

                        organizerId,

                        fromAdmin: true,

                        organizerVerification:
                            true,
                    },

                    replace: true,
                }
            );


        } catch (err) {

            console.error(
                "Save organizer error:",
                err
            );


            // =================================================
            // GET HTTP STATUS
            // =================================================

            const status =
                err?.response?.status ||
                err?.status;


            const backendMessage =
                err?.response?.data?.message ||
                err?.data?.message ||
                err?.message ||
                "";


            // =================================================
            // HANDLE 409 DUPLICATE GMAIL
            // =================================================

            if (status === 409) {

                setError(
                    backendMessage ||
                    "This Gmail address is already registered. If this person is already an EventSphere user, the backend must convert that account to an organizer instead of creating a duplicate account."
                );

                return;
            }


            // =================================================
            // HANDLE 400
            // =================================================

            if (status === 400) {

                setError(
                    backendMessage ||
                    "Invalid organizer information."
                );

                return;
            }


            // =================================================
            // HANDLE 401
            // =================================================

            if (status === 401) {

                setError(
                    "Your admin session has expired. Please login again."
                );

                return;
            }


            // =================================================
            // HANDLE 403
            // =================================================

            if (status === 403) {

                setError(
                    "You do not have permission to manage organizers."
                );

                return;
            }


            // =================================================
            // GENERAL ERROR
            // =================================================

            setError(
                backendMessage ||
                "Failed to save organizer."
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // ENABLE / DISABLE
    // =====================================================

    const handleToggleStatus = async (
        organizer
    ) => {

        const organizerId =
            organizer?._id ||
            organizer?.id;


        if (!organizerId) {

            setError(
                "Organizer ID is missing."
            );

            return;
        }


        const currentStatus =
            organizer?.isActive === true;


        const newStatus =
            !currentStatus;


        const action =
            newStatus
                ? "enable"
                : "disable";


        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} ${organizer?.name || "this organizer"}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");


            await adminService.updateOrganizerStatus(
                organizerId,
                newStatus
            );


            setSuccess(
                newStatus
                    ? "Organizer enabled successfully."
                    : "Organizer disabled successfully."
            );


            await loadOrganizers(true);

        } catch (err) {

            console.error(
                "Toggle organizer error:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.data?.message ||
                err?.message ||
                "Failed to update organizer status."
            );

        }

    };


    // =====================================================
    // DELETE ORGANIZER
    // =====================================================

    const handleDelete = async (
        organizer
    ) => {

        const organizerId =
            organizer?._id ||
            organizer?.id;


        if (!organizerId) {

            setError(
                "Organizer ID is missing."
            );

            return;
        }


        const confirmed =
            window.confirm(
                `Remove "${organizer?.name || "this organizer"}" permanently?\n\nThis will remove the organizer account as well.`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");


            await adminService.deleteOrganizer(
                organizerId
            );


            setSuccess(
                "Organizer removed successfully."
            );


            await loadOrganizers(true);

        } catch (err) {

            console.error(
                "Delete organizer error:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.data?.message ||
                err?.message ||
                "Failed to remove organizer."
            );

        }

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <main className="manage-organizers-page">

            <div className="manage-organizers-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="manage-organizers-header">

                    <div>

                        <button
                            type="button"
                            className="manage-organizers-back"
                            onClick={() =>
                                navigate(
                                    "/admin/dashboard"
                                )
                            }
                        >

                            <ArrowLeft
                                size={18}
                            />

                            Back to Dashboard

                        </button>


                        <span className="manage-organizers-eyebrow">

                            ADMINISTRATION

                        </span>


                        <h1>
                            Manage Organizers
                        </h1>


                        <p>
                            Add, edit, enable,
                            disable and remove
                            EventSphere organizers.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="manage-organizers-add"
                        onClick={
                            openAddModal
                        }
                    >

                        <UserPlus
                            size={18}
                        />

                        Add Organizer

                    </button>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="organizer-message error">

                        <span>
                            {error}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setError("")
                            }
                        >

                            <X
                                size={18}
                            />

                        </button>

                    </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                    <div className="organizer-message success">

                        <span>
                            {success}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccess("")
                            }
                        >

                            <X
                                size={18}
                            />

                        </button>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section className="organizer-stats">

                    <div className="organizer-stat-card">

                        <span>
                            Total Organizers
                        </span>

                        <strong>
                            {total}
                        </strong>

                    </div>


                    <div className="organizer-stat-card active">

                        <span>
                            Active Organizers
                        </span>

                        <strong>
                            {active}
                        </strong>

                    </div>


                    <div className="organizer-stat-card inactive">

                        <span>
                            Inactive Organizers
                        </span>

                        <strong>
                            {inactive}
                        </strong>

                    </div>

                </section>


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <section className="organizer-toolbar">

                    <div className="organizer-search">

                        <Search
                            size={18}
                        />

                        <input
                            type="search"
                            placeholder="Search by name or Gmail..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="organizer-filters">

                        <button
                            type="button"
                            className={
                                statusFilter === "all"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter("all")
                            }
                        >
                            All
                        </button>


                        <button
                            type="button"
                            className={
                                statusFilter === "active"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter("active")
                            }
                        >
                            Active
                        </button>


                        <button
                            type="button"
                            className={
                                statusFilter === "inactive"
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                setStatusFilter("inactive")
                            }
                        >
                            Inactive
                        </button>

                    </div>


                    <button
                        type="button"
                        className="organizer-refresh"
                        disabled={refreshing}
                        onClick={() =>
                            loadOrganizers(true)
                        }
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </section>


                {/* =================================================
                    TABLE
                ================================================= */}

                <section className="organizer-table-card">

                    {loading ? (

                        <div className="organizer-loading">

                            <RefreshCw
                                size={30}
                                className="spin"
                            />

                            <h3>
                                Loading organizers...
                            </h3>

                        </div>

                    ) : filteredOrganizers.length === 0 ? (

                        <div className="organizer-empty">

                            <div className="organizer-empty-icon">

                                <UserPlus
                                    size={28}
                                />

                            </div>


                            <h3>
                                No organizers found
                            </h3>


                            <p>
                                {search ||
                                statusFilter !== "all"
                                    ? "Try changing your search or filter."
                                    : "There are no organizers yet."}
                            </p>


                            {!search &&
                                statusFilter === "all" && (

                                    <button
                                        type="button"
                                        onClick={
                                            openAddModal
                                        }
                                    >

                                        <Plus
                                            size={17}
                                        />

                                        Add First Organizer

                                    </button>

                                )}

                        </div>

                    ) : (

                        <div className="organizer-table-wrapper">

                            <table className="organizer-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Organizer
                                        </th>

                                        <th>
                                            Gmail
                                        </th>

                                        <th>
                                            Verification
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Added
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredOrganizers.map(
                                        (organizer) => {

                                            const organizerId =
                                                organizer?._id ||
                                                organizer?.id;


                                            const isActive =
                                                organizer?.isActive === true;


                                            const isVerified =
                                                organizer?.otpVerified === true;


                                            return (

                                                <tr
                                                    key={
                                                        organizerId
                                                    }
                                                >

                                                    <td>

                                                        <div className="organizer-person">

                                                            <div className="organizer-avatar">

                                                                {(
                                                                    organizer?.name ||
                                                                    "O"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}

                                                            </div>


                                                            <div>

                                                                <strong>
                                                                    {
                                                                        organizer?.name ||
                                                                        "Unnamed"
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    Organizer
                                                                </small>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <div className="organizer-email">

                                                            <Mail
                                                                size={16}
                                                            />

                                                            {
                                                                organizer?.email ||
                                                                "No email"
                                                            }

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                isVerified
                                                                    ? "verification-badge verified"
                                                                    : "verification-badge pending"
                                                            }
                                                        >

                                                            <ShieldCheck
                                                                size={15}
                                                            />

                                                            {isVerified
                                                                ? "Verified"
                                                                : "Pending"}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                isActive
                                                                    ? "status-badge active"
                                                                    : "status-badge inactive"
                                                            }
                                                        >

                                                            {isActive
                                                                ? "Active"
                                                                : "Inactive"}

                                                        </span>

                                                    </td>


                                                    <td>

                                                        {organizer?.createdAt
                                                            ? new Date(
                                                                organizer.createdAt
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )
                                                            : "—"}

                                                    </td>


                                                    <td>

                                                        <div className="organizer-actions">


                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                className="edit"
                                                                title="Edit organizer"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        organizer
                                                                    )
                                                                }
                                                            >

                                                                <Edit3
                                                                    size={16}
                                                                />

                                                            </button>


                                                            {/* ENABLE / DISABLE */}

                                                            <button
                                                                type="button"
                                                                className={
                                                                    isActive
                                                                        ? "disable"
                                                                        : "enable"
                                                                }
                                                                title={
                                                                    isActive
                                                                        ? "Disable organizer"
                                                                        : "Enable organizer"
                                                                }
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        organizer
                                                                    )
                                                                }
                                                            >

                                                                {isActive ? (

                                                                    <ShieldOff
                                                                        size={16}
                                                                    />

                                                                ) : (

                                                                    <ShieldCheck
                                                                        size={16}
                                                                    />

                                                                )}

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                className="delete"
                                                                title="Remove organizer"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        organizer
                                                                    )
                                                                }
                                                            >

                                                                <Trash2
                                                                    size={16}
                                                                />

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>


            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showModal && (

                <div
                    className="organizer-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div className="organizer-modal">


                        <div className="organizer-modal-header">

                            <div className="organizer-modal-title">

                                <div className="organizer-modal-icon">

                                    {editingOrganizer ? (
                                        <Edit3 size={20} />
                                    ) : (
                                        <UserPlus size={20} />
                                    )}

                                </div>


                                <div>

                                    <h2>

                                        {editingOrganizer
                                            ? "Edit Organizer"
                                            : "Add Organizer"}

                                    </h2>


                                    <p>

                                        {editingOrganizer
                                            ? "Update organizer information."
                                            : "Add an organizer using their Gmail address."}

                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <form
                            className="organizer-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <label>

                                Organizer Name

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter organizer name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        saving
                                    }
                                    autoFocus
                                />

                            </label>


                            <label>

                                Gmail Address

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="organizer@gmail.com"
                                    value={
                                        form.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                            </label>


                            {!editingOrganizer && (

                                <div className="organizer-form-note">

                                    <Mail
                                        size={17}
                                    />

                                    <span>
                                        After adding the
                                        organizer, a
                                        6-digit OTP will
                                        be sent to this
                                        Gmail address.
                                    </span>

                                </div>

                            )}


                            <div className="organizer-modal-actions">

                                <button
                                    type="button"
                                    className="cancel"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="save"
                                    disabled={
                                        saving
                                    }
                                >

                                    {saving ? (

                                        <>

                                            <RefreshCw
                                                size={17}
                                                className="spin"
                                            />

                                            Saving...

                                        </>

                                    ) : (

                                        editingOrganizer
                                            ? "Save Changes"
                                            : "Add Organizer"

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </main>

    );

};


export default ManageOrganizers;