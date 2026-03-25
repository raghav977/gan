import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    MdAdd,
    MdDelete,
    MdEdit,
    MdAssignment,
    MdPeople,
    MdCheckCircle,
    MdSchedule,
    MdAttachFile
} from "react-icons/md";
import { getTrainerTodos, deleteTodo, getTrainerClients } from "../../../../api/clientTrainer.api";

export default function TodoManagement() {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            const res = await getTrainerTodos();
            setTodos(res.data || []);
        } catch (err) {
            console.error("Error fetching todos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await deleteTodo(deleteModal.id);
            setTodos(prev => prev.filter(t => t.id !== deleteModal.id));
            setDeleteModal({ show: false, id: null });
        } catch (err) {
            console.error("Error deleting todo:", err);
            alert(err.response?.data?.message || "Failed to delete");
        }
    };

    const getStatusCounts = (assignments) => {
        const counts = {
            pending: 0,
            in_progress: 0,
            submitted: 0,
            completed: 0,
            revision_needed: 0
        };
        assignments?.forEach(a => {
            if (counts[a.status] !== undefined) counts[a.status]++;
        });
        return counts;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-600';
            case 'medium': return 'bg-yellow-100 text-yellow-600';
            case 'low': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Todo Management</h1>
                <Link
                    to="/trainer/todos/create"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                    <MdAdd size={20} />
                    Create Todo
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                </div>
            ) : todos.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <MdAssignment size={48} className="mx-auto mb-4" />
                    <p>No todos created yet</p>
                    <Link
                        to="/trainer/todos/create"
                        className="inline-block mt-4 text-yellow-600 hover:underline"
                    >
                        Create your first todo
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {todos.map((todo) => {
                        const statusCounts = getStatusCounts(todo.assignments);
                        const totalAssigned = todo.assignments?.length || 0;

                        return (
                            <div
                                key={todo.id}
                                className="bg-white rounded-lg shadow p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{todo.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                                                {todo.priority}
                                            </span>
                                        </div>
                                        {todo.description && (
                                            <p className="text-gray-600 text-sm mb-3">{todo.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            {todo.dueDate && (
                                                <div className="flex items-center gap-1">
                                                    <MdSchedule size={16} />
                                                    Due: {new Date(todo.dueDate).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <MdAttachFile size={16} />
                                                {todo.resources?.length || 0} resources
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MdPeople size={16} />
                                                {totalAssigned} assigned
                                            </div>
                                        </div>

                                        {/* Status breakdown */}
                                        {totalAssigned > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {statusCounts.pending > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                                        Pending: {statusCounts.pending}
                                                    </span>
                                                )}
                                                {statusCounts.in_progress > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                                                        In Progress: {statusCounts.in_progress}
                                                    </span>
                                                )}
                                                {statusCounts.submitted > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded">
                                                        Submitted: {statusCounts.submitted}
                                                    </span>
                                                )}
                                                {statusCounts.completed > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                                                        Completed: {statusCounts.completed}
                                                    </span>
                                                )}
                                                {statusCounts.revision_needed > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                                                        Revision: {statusCounts.revision_needed}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/trainer/todos/${todo.id}`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="View Details"
                                        >
                                            <MdAssignment size={20} />
                                        </Link>
                                        <Link
                                            to={`/trainer/todos/${todo.id}/assign`}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                            title="Assign to Users"
                                        >
                                            <MdPeople size={20} />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteModal({ show: true, id: todo.id })}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Delete Todo?</h3>
                        <p className="text-gray-600 mb-6">
                            This will also delete all assignments and submissions. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
