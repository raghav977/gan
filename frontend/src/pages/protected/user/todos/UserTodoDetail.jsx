import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MdArrowBack,
    MdDownload,
    MdPlayCircle,
    MdImage,
    MdPictureAsPdf,
    MdUpload,
    MdSend,
    MdClose
} from "react-icons/md";
import { getUserAssignment, submitProgress, updateAssignmentStatus } from "../../../../api/clientTrainer.api";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export default function UserTodoDetail() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitData, setSubmitData] = useState({
        file: null,
        notes: "",
        content: ""
    });
    const [submitType, setSubmitType] = useState("file"); // file or text

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const fetchAssignment = async () => {
        try {
            const res = await getUserAssignment(assignmentId);
            setAssignment(res.data);
        } catch (err) {
            console.error("Error fetching assignment:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartProgress = async () => {
        try {
            await updateAssignmentStatus(assignmentId, "in_progress");
            await fetchAssignment();
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const handleSubmit = async () => {
        if (submitType === "file" && !submitData.file) {
            alert("Please select a file");
            return;
        }
        if (submitType === "text" && !submitData.content.trim()) {
            alert("Please enter your progress update");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            if (submitType === "file") {
                formData.append("file", submitData.file);
            } else {
                formData.append("content", submitData.content);
            }
            formData.append("notes", submitData.notes);

            await submitProgress(assignmentId, formData);
            await fetchAssignment();
            setShowSubmitModal(false);
            setSubmitData({ file: null, notes: "", content: "" });
        } catch (err) {
            console.error("Error submitting:", err);
            alert(err.response?.data?.message || "Failed to submit progress");
        } finally {
            setSubmitting(false);
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

    if (!assignment) {
        return (
            <div className="p-6 text-center text-gray-500">
                Task not found
            </div>
        );
    }

    const todo = assignment.todo;
    const canSubmit = ['pending', 'in_progress', 'revision_needed'].includes(assignment.status);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-lg"
                    >
                        <MdArrowBack size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{todo?.title}</h1>
                        <p className="text-gray-600">From: {todo?.trainer?.user?.username || todo?.trainer?.username}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full ${getStatusColor(assignment.status)}`}>
                        {assignment.status.replace('_', ' ')}
                    </span>
                </div>

                {/* Task Details */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    {todo?.description && (
                        <div className="mb-4">
                            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{todo.description}</p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {todo?.dueDate && (
                            <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                        )}
                        <span className="capitalize">Priority: {todo?.priority}</span>
                        <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Trainer Remarks */}
                    {assignment.trainerRemarks && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="font-medium text-yellow-800">Trainer Remarks:</p>
                            <p className="text-yellow-700">{assignment.trainerRemarks}</p>
                        </div>
                    )}
                </div>

                {/* Resources */}
                {todo?.resources?.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <div className="grid md:grid-cols-2 gap-3">
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

                {/* Action Buttons */}
                {canSubmit && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex flex-wrap gap-4">
                            {assignment.status === 'pending' && (
                                <button
                                    onClick={handleStartProgress}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <MdPlayCircle size={20} />
                                    Start Working
                                </button>
                            )}
                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                            >
                                <MdUpload size={20} />
                                Submit Progress
                            </button>
                        </div>
                    </div>
                )}

                {/* My Submissions */}
                {assignment.submissions?.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-semibold mb-4">My Submissions</h3>
                        <div className="space-y-4">
                            {assignment.submissions.map((sub) => (
                                <div key={sub.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            {sub.submissionType === 'text' ? (
                                                <p className="text-gray-800">{sub.content}</p>
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
                                                <p className="text-sm text-gray-600 mt-2 italic">
                                                    Note: {sub.notes}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                Submitted: {new Date(sub.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {sub.trainerFeedback && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded">
                                            <p className="text-sm font-medium text-blue-600">Trainer Feedback:</p>
                                            <p className="text-sm text-blue-800">{sub.trainerFeedback}</p>
                                            {sub.feedbackAt && (
                                                <p className="text-xs text-blue-500 mt-1">
                                                    {new Date(sub.feedbackAt).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Submit Progress</h3>
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <MdClose size={24} />
                            </button>
                        </div>

                        {/* Submission Type Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setSubmitType("file")}
                                className={`flex-1 py-2 rounded-lg transition ${
                                    submitType === "file" 
                                        ? "bg-yellow-500 text-white" 
                                        : "bg-gray-100 hover:bg-gray-200"
                                }`}
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => setSubmitType("text")}
                                className={`flex-1 py-2 rounded-lg transition ${
                                    submitType === "text" 
                                        ? "bg-yellow-500 text-white" 
                                        : "bg-gray-100 hover:bg-gray-200"
                                }`}
                            >
                                Text Update
                            </button>
                        </div>

                        {submitType === "file" ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Video or Photo
                                </label>
                                <input
                                    type="file"
                                    accept="video/*,image/*"
                                    onChange={(e) => setSubmitData(prev => ({ ...prev, file: e.target.files[0] }))}
                                    className="w-full p-2 border rounded-lg"
                                />
                                {submitData.file && (
                                    <p className="text-sm text-green-600 mt-2">
                                        Selected: {submitData.file.name}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Progress Update
                                </label>
                                <textarea
                                    value={submitData.content}
                                    onChange={(e) => setSubmitData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Describe your progress..."
                                    rows={4}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes (optional)
                            </label>
                            <textarea
                                value={submitData.notes}
                                onChange={(e) => setSubmitData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Any additional notes..."
                                rows={2}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <MdSend size={18} />
                                        Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
