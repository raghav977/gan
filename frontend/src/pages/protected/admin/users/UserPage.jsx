import React, { useEffect, useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import UserList from "../components/UserList";
import TrainerDetailModal from "../components/TrainerDetailModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { getAllTrainers, getTrainerDetail, approveTrainer, rejectTrainer } from "../../../../api/admin.user";

const UserPage = () => {
    const [trainers, setTrainers] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(""); // "", "approved", "pending"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    // Modal states
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [trainerToReject, setTrainerToReject] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAllTrainers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getAllTrainers({
                page: currentPage,
                limit,
                search,
                status
            });

            console.log("API result:", result);

            setTrainers(result?.data || []);
            setTotalPages(result?.totalPages || 1);
            setTotal(result?.total || 0);
        } catch (err) {
            console.log(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [currentPage, search, status]);

    useEffect(() => {
        fetchAllTrainers();
    }, [fetchAllTrainers]);

    // Auto-hide success message
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchAllTrainers();
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        setCurrentPage(1);
    };

    const handleViewDetails = async (trainer) => {
        try {
            setActionLoading(true);
            const result = await getTrainerDetail(trainer.id);
            setSelectedTrainer(result.data);
            setShowDetailModal(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (trainerId) => {
        try {
            setActionLoading(true);
            await approveTrainer(trainerId);
            setSuccessMessage("Trainer approved successfully!");
            setShowDetailModal(false);
            setSelectedTrainer(null);
            fetchAllTrainers();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectClick = (trainerId) => {
        setTrainerToReject(trainerId);
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        try {
            setActionLoading(true);
            await rejectTrainer(trainerToReject);
            setSuccessMessage("Trainer rejected and removed successfully!");
            setShowRejectModal(false);
            setShowDetailModal(false);
            setTrainerToReject(null);
            setSelectedTrainer(null);
            fetchAllTrainers();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedTrainer(null);
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Trainers</h1>
                    <p className="text-gray-500">
                        Total: {total} trainers
                    </p>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex justify-between">
                    {successMessage}
                    <button onClick={() => setSuccessMessage("")} className="font-bold">×</button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by name or email..."
                    onSearch={handleSearch}
                />

                {/* Status Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStatusChange("")}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            status === ""
                                ? "bg-yellow-500 text-white border-yellow-500"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => handleStatusChange("approved")}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            status === "approved"
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => handleStatusChange("pending")}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            status === "pending"
                                ? "bg-yellow-500 text-white border-yellow-500"
                                : "bg-white border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        Pending
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading trainers...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                    <button onClick={() => setError("")} className="ml-2 font-bold">×</button>
                </div>
            )}

            {/* Trainer List */}
            {!loading && (
                <UserList
                    user={trainers}
                    onViewDetails={handleViewDetails}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                />
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg ${
                            currentPage === 1
                                ? 'bg-gray-200 text-gray-400'
                                : 'bg-white border hover:bg-gray-50'
                        }`}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg ${
                            currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400'
                                : 'bg-white border hover:bg-gray-50'
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Trainer Detail Modal */}
            {showDetailModal && selectedTrainer && (
                <TrainerDetailModal
                    trainer={selectedTrainer}
                    onClose={closeDetailModal}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                    loading={actionLoading}
                />
            )}

            {/* Reject Confirmation Modal */}
            {showRejectModal && (
                <DeleteConfirmModal
                    title="Reject Trainer"
                    message="Are you sure you want to reject this trainer? This will permanently delete their account and all associated data."
                    onConfirm={handleConfirmReject}
                    onCancel={() => { setShowRejectModal(false); setTrainerToReject(null); }}
                    loading={actionLoading}
                />
            )}
        </div>
    );
};

export default UserPage;