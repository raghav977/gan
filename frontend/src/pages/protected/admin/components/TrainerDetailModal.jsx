import React from 'react';

const TrainerDetailModal = ({ trainer, onClose, onApprove, onReject, loading }) => {
    if (!trainer) return null;

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:5001/${url}`;
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-2xl rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">Trainer Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-500">Username</label>
                            <p className="font-medium">{trainer.User?.username || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <p className="font-medium">{trainer.User?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Contact</label>
                            <p className="font-medium">{trainer.User?.contact || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Status</label>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                trainer.is_verified
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {trainer.is_verified ? 'Approved' : 'Pending'}
                            </span>
                        </div>
                    </div>

                    {/* Trainer Info */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Trainer Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500">Specialization</label>
                                <p className="font-medium">{trainer.specialization || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Type</label>
                                <p className="font-medium">{trainer.type || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Service Radius</label>
                                <p className="font-medium">{trainer.radius ? `${trainer.radius} km` : 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Joined</label>
                                <p className="font-medium">
                                    {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    {trainer.TrainerDocuments && trainer.TrainerDocuments.length > 0 && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Uploaded Documents</h3>
                            <div className="grid gap-3">
                                {trainer.TrainerDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{doc.documentType}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={getImageUrl(doc.documentURL)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {!trainer.is_verified && (
                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onReject(trainer.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Reject'}
                        </button>
                        <button
                            onClick={() => onApprove(trainer.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Approve'}
                        </button>
                    </div>
                )}

                {trainer.is_verified && (
                    <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainerDetailModal;
