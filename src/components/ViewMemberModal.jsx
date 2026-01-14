import React from "react";
import { X, Mail, Phone, Edit, Trash2, MessageCircle } from "lucide-react";

const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const ViewMemberModal = ({
    visible,
    member,
    onClose,
    onEdit,
    onDelete,
    onSendExpiringMessage,
    onSendUnpaidMessage,
    onImagePress,
}) => {
    if (!visible || !member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4">
                    <h2 className="text-xl font-bold text-white">Member Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 pb-6 space-y-6">
                    {/* Photo */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => member.photo && onImagePress(member.photo)}
                            className="h-28 w-28 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden"
                        >
                            {member.photo ? (
                                <img
                                    src={member.photo}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-white">
                                    {(member.name || "N").charAt(0).toUpperCase()}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Basic Info */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{member.name}</h2>
                        <p className="text-gray-300 capitalize font-semibold">
                            {member.membershipType} Membership
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <Mail size={20} className="text-gray-300" />
                            <p className="text-white font-semibold flex-1 overflow-hidden text-ellipsis">
                                {member.email || "member@revivefitness.com"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={20} className="text-gray-300" />
                            <p className="text-white font-semibold flex-1">
                                {member.phone || "No phone"}
                            </p>
                            {member.phone && (
                                <a href={`tel:${member.phone}`} className="p-1 text-green-500 hover:text-green-400">
                                    <Phone size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Membership Details */}
                    <div className="bg-gray-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Payment Status</span>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold text-white capitalize ${(member.paymentStatus || "unpaid") === "paid"
                                        ? "bg-green-600"
                                        : "bg-red-600"
                                    }`}
                            >
                                {member.paymentStatus || "unpaid"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Start Date</span>
                            <span className="text-white font-semibold">{formatDate(member.startDate)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">End Date</span>
                            <span className="text-white font-semibold">{formatDate(member.endDate)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Days Remaining</span>
                            <span className={`font-bold ${getDaysRemaining(member.endDate) <= 7 ? "text-red-400" : "text-white"
                                }`}>
                                {getDaysRemaining(member.endDate)} days
                            </span>
                        </div>
                    </div>

                    {/* WhatsApp / Action Buttons */}
                    {(member.phone || member.paymentStatus === 'unpaid') && (
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="text-white font-bold mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                {member.paymentStatus === "unpaid" && (
                                    <button
                                        onClick={() => onSendUnpaidMessage(member)}
                                        className="w-full bg-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-gray-600"
                                    >
                                        <MessageCircle size={18} />
                                        Send Payment Reminder
                                    </button>
                                )}
                                {member.paymentStatus === "paid" &&
                                    getDaysRemaining(member.endDate) <= 30 &&
                                    getDaysRemaining(member.endDate) > 0 && (
                                        <button
                                            onClick={() => onSendExpiringMessage(member)}
                                            className="w-full bg-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-gray-600"
                                        >
                                            <MessageCircle size={18} />
                                            Send Expiry Reminder
                                        </button>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Edit / Delete Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                onClose();
                                onEdit(member);
                            }}
                            className="flex-1 bg-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-gray-600"
                        >
                            <Edit size={18} /> Edit
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onDelete(member.id);
                            }}
                            className="flex-1 bg-red-600 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold hover:bg-red-500"
                        >
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewMemberModal;
