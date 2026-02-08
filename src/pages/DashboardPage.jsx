
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Grid, Users, Plus, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../components/Dashboard";
import MembersList from "../components/MembersList";
import MemberForm from "../components/MemberForm";
import ViewMemberModal from "../components/ViewMemberModal";
import ImageModal from "../components/ImageModal";
import Loader from "../components/Loader";
import ConfirmationModal from "../components/ConfirmationModal";
// import logo from "../assets/react.svg"; // Removed unused import

// API Utilities
import {
    fetchMembers as apiFetchMembers,
    fetchStats,
    fetchExpiringMembers as apiFetchExpiringMembers,
    addMember,
    updateMember,
    deleteMember,
    checkPhoneExists, // Assuming these exist in api.js
    checkEmailExists  // Assuming these exist in api.js
} from "../utils/api";

const SEARCH_DEBOUNCE_MS = 500;
const ITEMS_PER_PAGE = 20;

const TABS = [
    { key: "dashboard", icon: Grid, label: "DASHBOARD" },
    { key: "members", icon: Users, label: "MEMBERS" },
];

// Mock validation (if not imported)
const validatePhoneNumber = (phone) => ({ isValid: true });
const validateEmail = (email) => ({ isValid: true });

export default function DashboardPage() {
    const { user, logout } = useAuth();

    // State management - grouped by concern
    const [activeTab, setActiveTab] = useState("dashboard");

    // Members data
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        unpaidMembers: 0,
        expiringMembers: 0,
    });
    const [expiringMembers, setExpiringMembers] = useState([]);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    // const [totalPages, setTotalPages] = useState(1);

    // UI state
    const [showAddMember, setShowAddMember] = useState(false);
    const [showEditMember, setShowEditMember] = useState(false);
    const [showViewMember, setShowViewMember] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [fullImageSrc, setFullImageSrc] = useState("");
    const [formData, setFormData] = useState(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // Modal Config State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'alert', // 'confirm', 'success', 'error', 'alert'
        title: '',
        message: '',
        onConfirm: null, // Callback for confirm action
    });

    const handleCloseModal = useCallback(() => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Refs
    const isFetchingRef = useRef(false);
    const searchTimeoutRef = useRef(null);

    // Fetch functions
    const fetchMembersData = useCallback(async (
        page = 1,
        append = false,
        search = searchTerm,
        filter = filterStatus
    ) => {
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;

            if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const result = await apiFetchMembers({
                searchTerm: search,
                filterStatus: filter,
                page,
                limit: ITEMS_PER_PAGE,
            });

            setMembers(prev => append ? [...prev, ...result.data] : result.data);
            setCurrentPage(page);
            setHasMore(result.hasMore);
            // setTotalPages(result.totalPages);
            setError("");
        } catch (err) {
            console.error("Error fetching members:", err);
            setError("Failed to load members.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [searchTerm, filterStatus]);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const data = await fetchStats();
            setStats(data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    }, []);

    const fetchExpiringMembersData = useCallback(async () => {
        try {
            const data = await apiFetchExpiringMembers();
            setExpiringMembers(data);
        } catch (err) {
            console.error("Error fetching expiring members:", err);
            setExpiringMembers([]);
        }
    }, []);

    const handleLoadMore = useCallback(() => {
        if (!loadingMore && hasMore && !isFetchingRef.current) {
            fetchMembersData(currentPage + 1, true, searchTerm, filterStatus);
        }
    }, [loadingMore, hasMore, currentPage, searchTerm, filterStatus, fetchMembersData]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setCurrentPage(1);
        setHasMore(true);
        await Promise.all([
            fetchMembersData(1, false),
            fetchDashboardStats(),
            fetchExpiringMembersData(),
        ]);
        setRefreshing(false);
    }, [fetchMembersData, fetchDashboardStats, fetchExpiringMembersData]);

    // Validation helper
    const validateMemberData = useCallback(async (memberData, memberId = null) => {
        const phoneValidation = validatePhoneNumber(memberData.phone);
        if (!phoneValidation.isValid) {
            // throw new Error(phoneValidation.message);
        }
        // Simple checks for now
        if (!memberData.phone) throw new Error("Phone number is required");
        if (!memberData.name) throw new Error("Name is required");

        // In a real app we'd call the check API here
        // const phoneExists = await checkPhoneExists(memberData.phone, memberId);
        // if (phoneExists) throw new Error("Phone number already exists.");
    }, []);

    // Member operations
    const handleAddMember = useCallback(async (memberData) => {
        try {
            setLoading(true);
            setError("");

            await validateMemberData(memberData);
            await addMember(memberData);

            setCurrentPage(1);
            setHasMore(true);
            await Promise.all([
                fetchMembersData(1, false),
                fetchDashboardStats(),
            ]);

            setShowAddMember(false);
            setError("");

            setLoading(false);

            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Success!',
                    message: 'Member added successfully!',
                });
            }, 50);

        } catch (err) {
            console.error("Error adding member:", err);
            const errorMessage = err.response?.data?.error || err.message || "Failed to add member";
            setError(errorMessage);
            setLoading(false);
            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Error',
                    message: errorMessage,
                });
            }, 50);
        }
    }, [validateMemberData, fetchMembersData, fetchDashboardStats]);

    // Helper to format date for input (YYYY-MM-DD) keeping local time
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleEditMember = useCallback((member) => {
        setSelectedMember(member);
        setFormData({
            name: member.name || "",
            email: member.email || "",
            phone: member.phone || "",
            weight: member.weight || "",
            membershipType: member.membershipType || "monthly",
            startDate: formatDateForInput(member.startDate),
            endDate: formatDateForInput(member.endDate),
            paymentStatus: member.paymentStatus || "unpaid",
            photo: null,
        });
        setShowEditMember(true);
    }, []);

    const handleUpdateMember = useCallback(async (memberData) => {
        try {
            setLoading(true);
            setError("");

            await validateMemberData(memberData, selectedMember.id);
            await updateMember(selectedMember.id, memberData);

            setCurrentPage(1);
            setHasMore(true);
            await Promise.all([
                fetchMembersData(1, false),
                fetchDashboardStats(), // Refresh stats as status might change
            ]);

            setShowEditMember(false);
            setSelectedMember(null);
            setFormData(null);
            setError("");

            setLoading(false);

            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Success!',
                    message: 'Member updated successfully!',
                });
            }, 50);

        } catch (err) {
            console.error("Error updating member:", err);
            const errorMessage = err.response?.data?.error || err.message || "Failed to update member";
            setError(errorMessage);
            setLoading(false);
            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Error',
                    message: errorMessage,
                });
            }, 50);
        }
    }, [selectedMember, validateMemberData, fetchMembersData, fetchDashboardStats]);

    const performDelete = useCallback(async (memberId) => {
        try {
            // Close confirmation modal first
            setModalConfig(prev => ({ ...prev, isOpen: false }));

            setLoading(true);
            await deleteMember(memberId);

            // Refresh data
            setCurrentPage(1);
            setHasMore(true);
            await Promise.all([
                fetchMembersData(1, false),
                fetchDashboardStats(),
            ]);

            setError("");
            setLoading(false);

            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Deleted',
                    message: 'Member deleted successfully!',
                });
            }, 50);

        } catch (err) {
            console.error("Error deleting member:", err);
            const msg = err.response?.data?.error || err.message || "Failed to delete member";
            setError(msg);
            setLoading(false);
            setTimeout(() => {
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Error',
                    message: msg,
                });
            }, 50);
        }
    }, [fetchMembersData, fetchDashboardStats]);

    const handleDeleteMember = useCallback((memberId) => {
        // Instead of window.confirm, open our modal
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'Delete Member?',
            message: 'Are you sure you want to delete this member? This action cannot be undone.',
            onConfirm: () => performDelete(memberId),
        });
    }, [performDelete]);

    const handleViewMember = useCallback((member) => {
        setSelectedMember(member);
        setShowViewMember(true);
    }, []);

    const handleImagePress = useCallback((imageUri) => {
        setFullImageSrc(imageUri);
        setShowFullImage(true);
    }, []);

    const handleCardClick = useCallback((cardType) => {
        const filterMap = {
            total: "all",
            active: "paid",
            unpaid: "unpaid",
        };

        const filter = filterMap[cardType];
        if (filter) {
            setActiveTab("members");
            setFilterStatus(filter);
            setSearchTerm("");
        }
    }, []);

    // WhatsApp Helpers
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getDaysRemaining = (endDateString) => {
        const endDate = new Date(endDateString);
        if (isNaN(endDate.getTime())) return 0;
        const now = new Date();
        const diffTime = endDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const sendWhatsAppMessage = (phone, message) => {
        if (!phone) return;
        let cleanPhone = phone.replace(/\D/g, "");
        if (!cleanPhone.startsWith("91") && cleanPhone.length === 10) {
            cleanPhone = "91" + cleanPhone;
        }
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
    }

    const sendExpiringMemberMessage = (member) => {
        const daysRemaining = getDaysRemaining(member.endDate);
        const message = `Hi ${member.name}! 👋

Your gym membership is expiring soon!

⏰ Days remaining: ${daysRemaining} days
📅 Expiry date: ${formatDate(member.endDate)}
🏋️‍♂️ Membership type: ${member.membershipType}

Please renew your membership to continue enjoying our services. Visit us or call for renewal options.

Thank you! 💪
- Revive Fitness`;

        sendWhatsAppMessage(member.phone, message);
    };

    const sendUnpaidMemberMessage = (member) => {
        const message = `Hi ${member.name}! 👋

We noticed your gym membership payment is pending.

📋 Membership details:
🏋️‍♂️ Type: ${member.membershipType}
📅 End date: ${formatDate(member.endDate)}
💳 Status: Payment Due

Please complete your payment to continue using our facilities without interruption.

Contact us for payment options or visit the gym reception.

Thank you! 🙏
- Revive Fitness`;

        sendWhatsAppMessage(member.phone, message);
    };

    // Effects
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setCurrentPage(1);
            setHasMore(true);
            fetchMembersData(1, false);
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, filterStatus, fetchMembersData]);

    useEffect(() => {
        if (activeTab === "dashboard") {
            fetchDashboardStats();
            fetchExpiringMembersData();
        }
    }, [activeTab, fetchDashboardStats, fetchExpiringMembersData]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 shadow-lg z-10">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">

                        {/* Logo Container */}
                        <div className="bg-white rounded-full h-12 w-12 flex items-center justify-center overflow-hidden">
                            <img src="/pwa-192x192.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-baseline md:gap-4">
                            <h1 className="text-2xl font-black text-white">REVIVE FITNESS</h1>
                            <div>
                                <p className="text-gray-300 text-sm font-bold">Pookkottumpadam</p>
                                <p className="text-gray-400 text-xs">Admin Dashboard</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} className="text-white" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-t border-gray-700">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-4 transition-all ${activeTab === tab.key
                                ? "bg-gray-700/50 border-gray-400 text-white"
                                : "border-transparent text-gray-400 hover:text-white"
                                }`}
                        >
                            <tab.icon size={20} />
                            <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === "dashboard" ? (
                    <Dashboard
                        stats={stats}
                        expiringMembers={expiringMembers}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        onCardClick={handleCardClick}
                        onViewMember={handleViewMember}
                        onSendExpiringMessage={sendExpiringMemberMessage}
                        onImagePress={handleImagePress}
                    />
                ) : (
                    <MembersList
                        members={members}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        loading={loading}
                        loadingMore={loadingMore}
                        error={error}
                        refreshing={refreshing}
                        hasMore={hasMore}
                        onRefresh={onRefresh}
                        onLoadMore={handleLoadMore}
                        onViewMember={handleViewMember}
                        onEditMember={handleEditMember}
                        onDeleteMember={handleDeleteMember}
                        onSendUnpaidMessage={sendUnpaidMemberMessage}
                        onSendExpiringMessage={sendExpiringMemberMessage}
                        onImagePress={handleImagePress}
                    />
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => setShowAddMember(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gray-700 hover:bg-gray-600 shadow-xl flex items-center justify-center transition-all active:scale-95 z-40 border border-gray-600"
            >
                {loading ? (
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                    <Plus size={32} className="text-white" />
                )}
            </button>

            {/* Modals */}
            <MemberForm
                visible={showAddMember}
                isEdit={false}
                initialData={null}
                loading={loading}
                error={error}
                onClose={() => { setShowAddMember(false); setError(""); }}
                onSubmit={handleAddMember}
                onImagePress={handleImagePress}
            />

            <MemberForm
                visible={showEditMember}
                isEdit={true}
                initialData={formData}
                loading={loading}
                error={error}
                onClose={() => { setShowEditMember(false); setError(""); }}
                onSubmit={handleUpdateMember}
                onImagePress={handleImagePress}
            />

            <ViewMemberModal
                visible={showViewMember}
                member={selectedMember}
                onClose={() => { setShowViewMember(false); setSelectedMember(null); }}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                onSendExpiringMessage={sendExpiringMemberMessage}
                onSendUnpaidMessage={sendUnpaidMemberMessage}
                onImagePress={(uri) => {
                    setShowViewMember(false);
                    handleImagePress(uri);
                }}
            />

            <ImageModal
                visible={showFullImage}
                imageUri={fullImageSrc}
                onClose={() => {
                    setShowFullImage(false);
                    if (selectedMember) setShowViewMember(true);
                }}
            />

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onClose={handleCloseModal}
            />

            {/* Global Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Loader />
                </div>
            )}
        </div>
    );
}
