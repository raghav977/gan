import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdPerson, MdMessage, MdAssignment, MdPending } from "react-icons/md";
import { getUserEnrollments } from "../../../../api/clientTrainer.api";

export default function MyTrainers() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("accepted");

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const res = await getUserEnrollments();
            setEnrollments(res.data || []);
        } catch (err) {
            console.error("Error fetching enrollments:", err);
        } finally {
            setLoading(false);
        }
    };

    const acceptedTrainers = enrollments.filter(e => e.status === 'accepted');
    const pendingRequests = enrollments.filter(e => e.status === 'pending');

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Trainers</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab("accepted")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                        activeTab === "accepted"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <MdPerson size={20} />
                    My Trainers ({acceptedTrainers.length})
                </button>
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
                        activeTab === "pending"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                    <MdPending size={20} />
                    Pending Requests ({pendingRequests.length})
                </button>
            </div>

            {activeTab === "accepted" ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {acceptedTrainers.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <MdPerson size={48} className="mx-auto mb-4" />
                            <p>No trainers yet</p>
                            <Link
                                to="/trainers"
                                className="text-yellow-600 hover:underline mt-2 inline-block"
                            >
                                Find Trainers
                            </Link>
                        </div>
                    ) : (
                        acceptedTrainers.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-white rounded-lg shadow p-4"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-yellow-600 text-xl">
                                            {enrollment.trainer?.user?.username?.[0]?.toUpperCase() || "T"}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {enrollment.trainer?.user?.username}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {enrollment.trainer?.specialization || "Trainer"}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 mb-4">
                                    <p>Email: {enrollment.trainer?.user?.email}</p>
                                    <p>Enrolled: {new Date(enrollment.acceptedAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        to={`/user/trainers/${enrollment.trainerId}/tasks`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                                    >
                                        <MdAssignment size={18} />
                                        View Tasks
                                    </Link>
                                    <Link
                                        to={`/user/messages?trainerId=${enrollment.trainer?.userId}`}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <MdMessage size={18} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <MdPending size={48} className="mx-auto mb-4" />
                            <p>No pending requests</p>
                        </div>
                    ) : (
                        pendingRequests.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="font-bold text-yellow-600">
                                            {enrollment.trainer?.user?.username?.[0]?.toUpperCase() || "T"}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{enrollment.trainer?.user?.username}</h3>
                                        <p className="text-sm text-gray-500">
                                            {enrollment.trainer?.specialization || "Trainer"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Requested: {new Date(enrollment.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm">
                                    Awaiting Response
                                </span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
