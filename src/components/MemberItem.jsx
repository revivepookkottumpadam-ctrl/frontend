import React from "react";
import { Edit2, Eye, Trash2, MessageCircle } from "lucide-react";

const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const calculateDaysUnpaid = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = today - end;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const MemberItem = React.memo(({
    member,
    onViewMember,
    onEditMember,
    onDeleteMember,
    onSendUnpaidMessage,
    onSendExpiringMessage,
    onImagePress,
}) => {
    const daysUnpaid = member.paymentStatus === "unpaid"
        ? calculateDaysUnpaid(member.endDate)
        : 0;

    const daysRemaining = calculateDaysRemaining(member.endDate);
    const isExpiring = member.paymentStatus === "paid" && daysRemaining <= 5 && daysRemaining >= 0;

    return (
        <div className="bg-gray-900 rounded-xl p-4 mb-4 relative shadow-lg border border-gray-800">
            {/* Days Unpaid Badge - Top Right Corner */}
            {member.paymentStatus === "unpaid" && daysUnpaid > 0 && (
                <div className="absolute top-3 right-3 bg-red-500 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-10">
                    <span className="text-white font-bold text-xs">{daysUnpaid}d</span>
                </div>
            )}

            {/* Main Content */}
            <div className="flex items-start gap-4">
                {/* Left Side - Image and Payment Badge */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {/* Profile Image */}
                    <button
                        onClick={() => member.photo && onImagePress(member.photo)}
                        className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden"
                    >
                        {member.photo ? (
                            <img
                                src={member.photo}
                                alt={member.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-lg md:text-xl font-bold text-white">
                                {(member.name || "N").charAt(0).toUpperCase()}
                            </span>
                        )}
                    </button>

                    {/* Payment Status Badge below image */}
                    <div
                        className={`px-3 py-1 rounded-full ${
                            member.paymentStatus === "paid" 
                                ? "bg-green-600" 
                                : "bg-red-500"
                        }`}
                    >
                        <span className="text-xs font-bold text-white capitalize">
                            {member.paymentStatus}
                        </span>
                    </div>
                </div>

                {/* Right Side - Member Info */}
                <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="font-bold text-white text-base md:text-lg mb-1 truncate">
                        {member.name}
                    </h3>
                    
                    {/* Email */}
                    <p className="text-gray-300 text-sm mb-0.5 truncate">
                        {member.email || "member@revivefitness.com"}
                    </p>
                    
                    {/* Phone */}
                    <p className="text-gray-300 text-sm mb-2">
                        {member.phone}
                    </p>

                    {/* Membership Type and End Date */}
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-300">
                        <span className="capitalize">
                            {member.membershipType}
                        </span>
                        <span>
                            {formatDate(member.endDate)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-gray-700">
                <button
                    onClick={() => onViewMember(member)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    title="View"
                >
                    <Eye size={20} className="text-white" />
                </button>

                <button
                    onClick={() => onEditMember(member)}
                    className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
                    title="Edit"
                >
                    <Edit2 size={20} className="text-white" />
                </button>

                <button
                    onClick={() => onDeleteMember(member.id)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors group"
                    title="Delete"
                >
                    <Trash2 size={20} className="text-white group-hover:text-red-400" />
                </button>

                {member.paymentStatus === "unpaid" && (
                    <button
                        onClick={() => onSendUnpaidMessage(member)}
                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
                        title="Send Unpaid Message"
                    >
                        <MessageCircle size={20} className="text-white" />
                    </button>
                )}

                {isExpiring && (
                    <button
                        onClick={() => onSendExpiringMessage(member)}
                        className="p-2 bg-amber-600 hover:bg-amber-500 rounded-full transition-colors"
                        title="Send Expiry Reminder"
                    >
                        <MessageCircle size={20} className="text-white" />
                    </button>
                )}
            </div>
        </div>
    );
});

export default MemberItem;