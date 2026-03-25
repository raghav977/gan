import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MdArrowBack,
    MdPeople,
    MdCheckCircle,
    MdRefresh,
    MdMessage,
    MdDownload,
    MdPlayCircle,
    MdImage,
    MdPictureAsPdf
} from "react-icons/md";
import {
    getTodoById,
    markAssignmentComplete,
    requestRevision,
    giveFeedback
} from "../../../../api/clientTrainer.api";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function TodoDetail() {
    const { todoId } = useParams();
    const navigate = useNavigate();
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [feedbackModal, setFeedbackModal] = useState({ show: false, submissionId: null });
    const [feedback, setFeedback] = useState("");
    const [remarksModal, setRemarksModal] = useState({ show: false, assignmentId: null, type: null });
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        fetchTodo();
    }, [todoId]);

    const fetchTodo = async () => {
        try {
            const res = await getTodoById(todoId);
            setTodo(res.data);
        } catch (err) {
            console.error("Error fetching todo:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        setActionLoading(remarksModal.assignmentId);
        try {
            await markAssignmentComplete(remarksModal.assignmentId, remarks);
            await fetchTodo();
            setRemarksModal({ show: false, assignmentId: null, type: null });
            setRemarks("");
        } catch (err) {
            console.error("Error:", err);
            alert(err.response?.data?.message || "Failed to mark complete");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestRevision = async () => {
        if (!remarks.trim()) {
            alert("Please provide feedback for revision");
            return;
        }
        setActionLoading(remarksModal.assignmentId);
        try {
            await requestRevision(remarksModal.assignmentId, remarks);
            await fetchTodo();
            setRemarksModal({ show: false, assignmentId: null, type: null });
            setRemarks("");
        } catch (err) {
            console.error("Error:", err);
            alert(err.response?.data?.message || "Failed to request revision");
        } finally {
            setActionLoading(null);
        }
    };

    const handleGiveFeedback = async () => {
        if (!feedback.trim()) return;
        setActionLoading(feedbackModal.submissionId);
        try {
            await giveFeedback(feedbackModal.submissionId, feedback);
            await fetchTodo();
            setFeedbackModal({ show: false, submissionId: null });
            setFeedback("");
        } catch (err) {
            console.error("Error:", err);
            alert(err.response?.data?.message || "Failed to give feedback");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-100 text-gray-600';
            case 'in_progress': return 'bg-blue-100 text-blue-600';
            case 'submitted': return 'bg-orange-100 text-orange-600';
            case 'completed': return 'bg-green-100 text-green-600';
            case 'revision_needed': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'pdf': return <MdPictureAsPdf className="text-red-500" size={24} />;
            case 'video': return <MdPlayCircle className="text-blue-500" size={24} />;
            case 'image': return <MdImage className="text-green-500" size={24} />;
            default: return <MdDownload className="text-gray-500" size={24} />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!todo) {
        return (
            <div className="p-6 text-center text-gray-500">
                Todo not found
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <MdArrowBack size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{todo.title}</h1>
                    {todo.description && (
                        <p className="text-gray-600 mt-1">{todo.description}</p>
                    )}
                </div>
                <button
                    onClick={() => navigate(`/trainer/todos/${todoId}/assign`)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                    <MdPeople size={20} />
                    Assign to Users
                </button>
            </div>

            {/* Resources */}
            {todo.resources?.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h2 className="font-semibold mb-3">Resources</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {todo.resources.map((resource) => (
                            <a
                                key={resource.id}
                                href={`${API_URL}/${resource.filePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                {getResourceIcon(resource.resourceType)}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{resource.fileName}</p>
                                    <p className="text-xs text-gray-500 capitalize">{resource.resourceType}</p>
                                </div>
                                <MdDownload size={20} className="text-gray-400" />
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Assignments */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Assignments ({todo.assignments?.length || 0})</h2>
                </div>

                {todo.assignments?.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <MdPeople size={48} className="mx-auto mb-4" />
                        <p>No users assigned yet</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {todo.assignments?.map((assignment) => (
                            <div key={assignment.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-yellow-600">
                                                {assignment.user?.username?.[0]?.toUpperCase() || "?"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{assignment.user?.username}</p>
                                            <p className="text-sm text-gray-500">{assignment.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
                                            {assignment.status.replace('_', ' ')}
                                        </span>
                                        {assignment.status === 'submitted' && (
                                            <>
                                                <button
                                                    onClick={() => setRemarksModal({ show: true, assignmentId: assignment.id, type: 'complete' })}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Mark Complete"
                                                >
                                                    <MdCheckCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => setRemarksModal({ show: true, assignmentId: assignment.id, type: 'revision' })}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                    title="Request Revision"
                                                >
                                                    <MdRefresh size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Trainer Remarks */}
                                {assignment.trainerRemarks && (
                                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                        <p className="text-sm font-medium text-gray-600">Your Remarks:</p>
                                        <p className="text-sm text-gray-800">{assignment.trainerRemarks}</p>
                                    </div>
                                )}

                                {/* Submissions */}
                                {assignment.submissions?.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-gray-600 mb-2">
                                            Submissions ({assignment.submissions.length})
                                        </p>
                                        <div className="space-y-2">
                                            {assignment.submissions.map((sub) => (
                                                <div key={sub.id} className="bg-gray-50 p-3 rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            {sub.submissionType === 'text' ? (
                                                                <p className="text-sm">{sub.content}</p>
                                                            ) : (
                                                                <a
                                                                    href={`${API_URL}/${sub.filePath}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                                >
                                                                    {sub.submissionType === 'video' ? (
                                                                        <MdPlayCircle size={20} />
                                                                    ) : (
                                                                        <MdImage size={20} />
                                                                    )}
                                                                    {sub.fileName || 'View File'}
                                                                </a>
                                                            )}
                                                            {sub.notes && (
                                                                <p className="text-sm text-gray-600 mt-1 italic">
                                                                    "{sub.notes}"
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(sub.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => setFeedbackModal({ show: true, submissionId: sub.id })}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                            title="Give Feedback"
                                                        >
                                                            <MdMessage size={18} />
                                                        </button>
                                                    </div>
                                                    {sub.trainerFeedback && (
                                                        <div className="mt-2 p-2 bg-blue-50 rounded">
                                                            <p className="text-xs font-medium text-blue-600">Your Feedback:</p>
                                                            <p className="text-sm text-blue-800">{sub.trainerFeedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {feedbackModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Give Feedback</h3>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Enter your feedback..."
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            rows={4}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setFeedbackModal({ show: false, submissionId: null });
                                    setFeedback("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGiveFeedback}
                                disabled={actionLoading || !feedback.trim()}
                                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remarks Modal */}
            {remarksModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {remarksModal.type === 'complete' ? 'Mark as Complete' : 'Request Revision'}
                        </h3>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={remarksModal.type === 'complete' 
                                ? "Add remarks (optional)..." 
                                : "Explain what needs to be revised..."}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            rows={4}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setRemarksModal({ show: false, assignmentId: null, type: null });
                                    setRemarks("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={remarksModal.type === 'complete' ? handleMarkComplete : handleRequestRevision}
                                disabled={actionLoading || (remarksModal.type === 'revision' && !remarks.trim())}
                                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                                    remarksModal.type === 'complete' 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-orange-500 hover:bg-orange-600'
                                }`}
                            >
                                {remarksModal.type === 'complete' ? 'Mark Complete' : 'Request Revision'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
