import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Calendar } from "lucide-react";

// Simple helpers
const calculateEndDate = (startDate, type) => {
    const date = new Date(startDate);
    if (type === 'monthly') date.setMonth(date.getMonth() + 1);
    if (type === 'quarterly') date.setMonth(date.getMonth() + 3);
    if (type === 'yearly') date.setFullYear(date.getFullYear() + 1);

    // Return YYYY-MM-DD in local time to avoid timezone shifting issues with toISOString()
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getAutoPaymentStatus = (endDate) => {
    return new Date(endDate) >= new Date() ? 'paid' : 'unpaid';
};

const MemberForm = ({
    visible,
    isEdit,
    initialData,
    loading,
    error,
    onClose,
    onSubmit,
    onImagePress,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        weight: "",
        membershipType: "monthly",
        startDate: "",
        endDate: "",
        paymentStatus: "unpaid",
        photo: null,
    });

    // Track if this is a fresh load of data (to avoid overwriting custom DB dates on open)
    const isDataLoaded = useRef(false);

    // Initialize form data
    useEffect(() => {
        if (initialData && isEdit) {
            setFormData({
                ...initialData,
                photo: null, // Always reset photo file on load
            });
            isDataLoaded.current = true;
        } else if (!visible) {
            // Reset form when modal closes
            setFormData({
                name: "",
                email: "",
                phone: "",
                weight: "",
                membershipType: "monthly",
                startDate: "",
                endDate: "",
                paymentStatus: "unpaid",
                photo: null,
            });
            isDataLoaded.current = false;
        } else {
            // Fresh add mode
            isDataLoaded.current = false;
        }
    }, [initialData, isEdit, visible]);

    // Auto-calculate end date and payment status
    useEffect(() => {
        // If we just loaded member data for editing, skip the first calculation 
        // to preserve any custom dates stored in the database.
        if (isEdit && isDataLoaded.current) {
            isDataLoaded.current = false;
            return;
        }

        if (formData.startDate && formData.membershipType) {
            const calculatedEndDate = calculateEndDate(
                formData.startDate,
                formData.membershipType
            );

            if (calculatedEndDate !== formData.endDate) {
                const autoStatus = getAutoPaymentStatus(calculatedEndDate);
                setFormData((prev) => ({
                    ...prev,
                    endDate: calculatedEndDate,
                    paymentStatus: autoStatus,
                }));
            }
        }
    }, [formData.startDate, formData.membershipType, isEdit]);

    const compressImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.7); // 0.7 quality is usually plenty
                };
            };
        });
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Show some sort of feedback or just do it silently
            // iPhone photos are usually huge, so compression is key
            if (file.size > 1024 * 1024) { // Only compress if larger than 1MB
                const compressed = await compressImage(file);
                setFormData({ ...formData, photo: compressed });
            } else {
                setFormData({ ...formData, photo: file });
            }
        }
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-0 mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {isEdit ? "Edit Member" : "Add New Member"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 pb-6 flex-1 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-600 rounded-xl text-white font-semibold text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="Enter member name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Email <span className="text-xs font-normal text-gray-400">(Optional - will use default if empty)</span>
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="member@revivefitness.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Phone <span className="text-xs font-normal text-gray-400">(Include country code for WhatsApp)</span>
                        </label>
                        <input
                            type="tel"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="e.g., +919876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            Weight <span className="text-xs font-normal text-gray-400">(in kg)</span>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            placeholder="e.g., 75.5"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    {/* Membership Type */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Membership Type</label>
                        <div className="bg-gray-800 rounded-xl border border-gray-600 flex overflow-hidden">
                            {["monthly", "quarterly", "yearly"].map((type) => (
                                <button
                                    key={type}
                                    className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${formData.membershipType === type
                                        ? "bg-gray-600 text-white"
                                        : "bg-transparent text-gray-400 hover:text-white"
                                        }`}
                                    onClick={() => setFormData({ ...formData, membershipType: type })}
                                    disabled={loading}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Start Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                disabled={loading}
                            />
                            <Calendar className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">
                            End Date <span className="text-xs font-normal text-gray-400">(Auto-calculated)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                disabled={loading}
                            />
                            <Calendar className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {/* Payment Status Display */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Payment Status</label>
                        <div className="bg-gray-700 rounded-xl p-3 text-gray-300 font-semibold capitalize">
                            {formData.paymentStatus}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-semibold">
                            {formData.endDate && new Date(formData.endDate) >= new Date()
                                ? "✅ Membership is active - Status: Paid"
                                : "❌ Membership expired - Status: Unpaid"}
                        </p>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-sm font-bold text-white mb-2">Photo</label>
                        <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors">
                            <Camera size={20} className="text-white" />
                            <span className="text-white font-semibold">
                                {formData.photo ? "Change Photo" : "Upload Photo"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                                disabled={loading}
                            />
                        </label>

                        {/* Photo Preview */}
                        {(formData.photo || (isEdit && initialData?.photo && !formData.photo)) && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-300 font-semibold mb-2">Selected photo:</p>
                                <div className="relative inline-block">
                                    <img
                                        src={formData.photo ? URL.createObjectURL(formData.photo) : initialData.photo}
                                        alt="Preview"
                                        className="h-20 w-20 rounded-xl object-cover"
                                    />
                                    {formData.photo && (
                                        <button
                                            onClick={() => setFormData({ ...formData, photo: null })}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 transition-colors flex items-center gap-2"
                        disabled={loading}
                    >
                        Save Member
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberForm;
