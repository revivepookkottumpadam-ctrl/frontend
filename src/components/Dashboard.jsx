import React from "react";
import { Users, DollarSign, AlertTriangle, Calendar, MessageCircle, Eye } from "lucide-react";

// Helper function to replicate the logic
const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const Dashboard = ({
    stats,
    expiringMembers,
    // refreshing,
    // onRefresh,
    onCardClick,
    onViewMember,
    onSendExpiringMessage,
    onImagePress,
}) => {
    const cards = [
        {
            key: "total",
            icon: Users,
            title: "Total Members",
            value: stats.totalMembers,
            color: "bg-gray-800",
        },
        {
            key: "active",
            icon: DollarSign,
            title: "Active Members",
            value: stats.activeMembers,
            color: "bg-gray-700",
        },
        {
            key: "expiring",
            icon: AlertTriangle,
            title: "Expiring Soon",
            value: stats.expiringMembers,
            color: "bg-gray-800",
        },
        {
            key: "unpaid",
            icon: Calendar,
            title: "Unpaid",
            value: stats.unpaidMembers,
            color: "bg-gray-700",
        },
    ];

    return (
        <div className="h-full overflow-y-auto pb-24">
            <div className="p-4 pt-6 space-y-4">
                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                    {cards.map((card) => (
                        <button
                            key={card.key}
                            className={`${card.color} p-4 rounded-xl flex flex-col items-center justify-center min-h-[100px] md:min-h-[120px] shadow-lg transition-transform active:scale-95`}
                            onClick={() => onCardClick(card.key)}
                        >
                            <card.icon size={24} className="text-white mb-2" />
                            <div className="text-center">
                                <p className="text-xs text-gray-300 md:text-sm">{card.title}</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                                    {card.value}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Expiring Members Alert */}
                {expiringMembers.length > 0 && (
                    <div className="mt-2">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <AlertTriangle size={20} className="text-white" />
                            <h2 className="text-lg font-bold text-white">Members Expiring Soon</h2>
                        </div>

                        <div className="space-y-3">
                            {expiringMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-gray-700 rounded-lg p-4 flex items-center gap-4"
                                >
                                    {/* Profile Image */}
                                    <button
                                        onClick={() => member.photo && onImagePress(member.photo)}
                                        className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0"
                                    >
                                        {member.photo ? (
                                            <img
                                                src={member.photo}
                                                alt={member.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-white">
                                                {(member.name || "N").charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </button>

                                    {/* Member Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white text-sm">{member.name}</p>
                                        <p className="text-xs text-gray-300 truncate">
                                            {member.email || "member@revivefitness.com"}
                                        </p>
                                        <p className="text-xs text-white font-semibold mt-1">
                                            Expires: {formatDate(member.endDate)}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => onViewMember(member)}
                                            className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                                        >
                                            <Eye size={20} className="text-white" />
                                        </button>
                                        {member.paymentStatus === "paid" && (
                                            <button 
                                                onClick={() => onSendExpiringMessage(member)}
                                                className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                                            >
                                                <MessageCircle size={20} className="text-white" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;