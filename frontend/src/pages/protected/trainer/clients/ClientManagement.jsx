import React, { useEffect, useState } from "react";
import { MdPersonAdd, MdCheck, MdClose, MdPeople, MdPendingActions } from "react-icons/md";
import { getEnrollmentRequests, acceptEnrollment, rejectEnrollment, getTrainerClients } from "../../../../api/clientTrainer.api";

export default function ClientManagement() {
    const [activeTab, setActiveTab] = useState("requests");
    const [requests, setRequests] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectModal, setRejectModal] = useState({ show: false, id: null });
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "requests") {
                const res = await getEnrollmentRequests("pending");
                setRequests(res.data || []);
            } else {
                const res = await getTrainerClients();
                setClients(res.data || []);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setActionLoading(id);
        try {
            await acceptEnrollment(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error("Error accepting:", err);
            alert(err.response?.data?.message || "Failed to accept");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal.id) return;
        setActionLoading(rejectModal.id);
        try {
            await rejectEnrollment(rejectModal.id, rejectReason);
            setRequests(prev => prev.filter(r => r.id !== rejectModal.id));
            setRejectModal({ show: false, id: null });
            setRejectReason("");
        } catch (err) {
            console.error("Error rejecting:", err);
            alert(err.response?.data?.message || "Failed to reject");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Client Management</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab("requests")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                        activeTab === "requests"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <MdPendingActions size={20} />
                    Pending Requests
                    {requests.length > 0 && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {requests.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("clients")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                        activeTab === "clients"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <MdPeople size={20} />
                    My Clients
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                </div>
            ) : activeTab === "requests" ? (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <MdPersonAdd size={48} className="mx-auto mb-4" />
                            <p>No pending enrollment requests</p>
                        </div>
                    ) : (
                        requests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-yellow-600">
                                            {req.user?.username?.[0]?.toUpperCase() || "?"}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{req.user?.username}</h3>
                                        <p className="text-sm text-gray-500">{req.user?.email}</p>
                                        {req.requestMessage && (
                                            <p className="text-sm text-gray-600 mt-1 italic">
                                                "{req.requestMessage}"
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Requested {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(req.id)}
                                        disabled={actionLoading === req.id}
                                        className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                                    >
                                        <MdCheck size={18} />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => setRejectModal({ show: true, id: req.id })}
                                        disabled={actionLoading === req.id}
                                        className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                    >
                                        <MdClose size={18} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <MdPeople size={48} className="mx-auto mb-4" />
                            <p>No clients yet</p>
                        </div>
                    ) : (
                        clients.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-white rounded-lg shadow p-4"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-yellow-600">
                                            {enrollment.user?.username?.[0]?.toUpperCase() || "?"}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{enrollment.user?.username}</h3>
                                        <p className="text-sm text-gray-500">{enrollment.user?.email}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>Phone: {enrollment.user?.contact || "N/A"}</p>
                                    <p>Enrolled: {new Date(enrollment.acceptedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Reject Enrollment</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (optional)"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            rows={3}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setRejectModal({ show: false, id: null });
                                    setRejectReason("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
