import React, { useRef, useEffect } from "react";
import { Search, Loader as LoaderIcon } from "lucide-react";
import Loader from "./Loader";
import MemberItem from "./MemberItem";

const MembersList = React.memo(({
    members,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    loading,
    loadingMore,
    error,
    // refreshing,
    hasMore,
    // onRefresh,
    onLoadMore,
    onViewMember,
    onEditMember,
    onDeleteMember,
    onSendUnpaidMessage,
    onSendExpiringMessage,
    onImagePress,
}) => {
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading, loadingMore, onLoadMore]);

    return (
        <div className="h-full overflow-y-auto">
            {/* Search and Filter */}
            <div className="p-4 flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={20}
                    />
                </div>

                {/* Filter Status Picker */}
                <div className="bg-gray-800 rounded-xl border border-gray-600 overflow-hidden flex flex-row">
                    {["all", "paid", "unpaid"].map((status) => (
                        <button
                            key={status}
                            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${filterStatus === status
                                ? "bg-gray-600 text-white"
                                : "bg-transparent text-gray-400 hover:text-white"
                                }`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mb-4 p-4 bg-red-600 rounded-lg text-white font-semibold text-sm">
                    {error}
                </div>
            )}

            {/* Members List */}
            <div className="px-4 pb-24">
                {members.length === 0 && !loading ? (
                    <div className="bg-gray-800 rounded-xl p-8 mt-8 flex flex-col items-center">
                        <p className="text-gray-300 text-center text-base">
                            No members found. Add your first member to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {members.map((member) => (
                            <MemberItem
                                key={member.id}
                                member={member}
                                onViewMember={onViewMember}
                                onEditMember={onEditMember}
                                onDeleteMember={onDeleteMember}
                                onSendUnpaidMessage={onSendUnpaidMessage}
                                onSendExpiringMessage={onSendExpiringMessage}
                                onImagePress={onImagePress}
                            />
                        ))}

                        {loadingMore && (
                            <div className="py-5 flex justify-center">
                                <LoaderIcon className="animate-spin text-white" size={24} />
                            </div>
                        )}

                        {/* Intersection Observer Trigger */}
                        <div ref={observerTarget} className="h-4 w-full" />
                    </div>
                )}
            </div>
        </div>
    );
});

export default MembersList;
