import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdAssignment, MdFilterList, MdSearch } from "react-icons/md";
import { getUserAssignedTodos } from "../../../../api/clientTrainer.api";

export default function UserTodoList() {
    const [todos, setTodos] = useState([]);
    const [filteredTodos, setFilteredTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        fetchTodos();
    }, []);

    useEffect(() => {
        filterTodos();
    }, [todos, search, statusFilter]);

    const fetchTodos = async () => {
        try {
            const res = await getUserAssignedTodos();
            setTodos(res.data || []);
        } catch (err) {
            console.error("Error fetching todos:", err);
        } finally {
            setLoading(false);
        }
    };

    const filterTodos = () => {
        let filtered = [...todos];
        
        if (search) {
            filtered = filtered.filter(t => 
                t.todo?.title?.toLowerCase().includes(search.toLowerCase()) ||
                t.todo?.description?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (statusFilter) {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        
        setFilteredTodos(filtered);
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'border-l-red-500';
            case 'medium': return 'border-l-yellow-500';
            case 'low': return 'border-l-green-500';
            default: return 'border-l-gray-300';
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tasks..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                            <option value="revision_needed">Revision Needed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredTodos.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-gray-400">
                        <MdAssignment size={48} className="mx-auto mb-4" />
                        <p>No tasks found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTodos.map((assignment) => (
                            <Link
                                key={assignment.id}
                                to={`/user/todos/${assignment.id}`}
                                className={`block bg-white rounded-lg shadow p-4 border-l-4 hover:shadow-md transition ${getPriorityColor(assignment.todo?.priority)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{assignment.todo?.title}</h3>
                                        {assignment.todo?.description && (
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                {assignment.todo.description}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                                            <span>From: {assignment.todo?.trainer?.user?.username || assignment.todo?.trainer?.username}</span>
                                            {assignment.todo?.dueDate && (
                                                <span>
                                                    Due: {new Date(assignment.todo.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                            <span>
                                                {assignment.todo?.resources?.length || 0} resources
                                            </span>
                                        </div>
                                        {assignment.trainerRemarks && (
                                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                                <span className="font-medium">Trainer remarks: </span>
                                                {assignment.trainerRemarks}
                                            </div>
                                        )}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ml-4 ${getStatusColor(assignment.status)}`}>
                                        {assignment.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
        </div>
    );
}
