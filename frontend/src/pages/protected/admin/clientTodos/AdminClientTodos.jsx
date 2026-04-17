import React, { useEffect, useState } from "react";
import {
    MdSearch,
    MdFilterList,
    MdChevronLeft,
    MdChevronRight,
    MdRefresh,
    MdAssignment
} from "react-icons/md";
import { getAllAssignmentsAdmin, getAdminStats } from "../../../../api/clientTrainer.api";

export default function AdminClientTodos() {
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        fromDate: "",
        toDate: ""
    });
    const [showFilters, setShowFilters] = useState(false);

    const updateFilterField = (field, value) => {
        setPagination(prev => ({ ...prev, page: 1 }));
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const fetchStats = async () => {
        try {
            const res = await getAdminStats();
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadAssignments = async () => {
            setLoading(true);
            try {
                const params = {
                    page: pagination.page,
                    limit: pagination.limit
                };

                if (filters.search) params.search = filters.search;
                if (filters.status) params.status = filters.status;
                if (filters.fromDate) params.fromDate = filters.fromDate;
                if (filters.toDate) params.toDate = filters.toDate;

                const res = await getAllAssignmentsAdmin(params);
                const data = res.data || {};

                if (!isMounted) return;

                setAssignments(data.assignments || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.total || 0,
                    totalPages: data.totalPages || 0
                }));
            } catch (err) {
                console.error("Error fetching assignments:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadAssignments();

        return () => {
            isMounted = false;
        };
    }, [filters.fromDate, filters.search, filters.status, filters.toDate, pagination.limit, pagination.page]);

    const handleSearch = () => {
        updateFilterField("search", searchInput.trim());
    };

    const handleReset = () => {
        setFilters({
            search: "",
            status: "",
            fromDate: "",
            toDate: ""
        });
        setPagination(prev => ({ ...prev, page: 1 }));
        setSearchInput("");
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

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Client Todo Assignments</h1>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-gray-800">{stats.assignments?.total || 0}</p>
                        <p className="text-sm text-gray-500">Total</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.assignments?.pending || 0}</p>
                        <p className="text-sm text-gray-500">Pending</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.assignments?.inProgress || 0}</p>
                        <p className="text-sm text-gray-500">In Progress</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.assignments?.submitted || 0}</p>
                        <p className="text-sm text-gray-500">Submitted</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.assignments?.completed || 0}</p>
                        <p className="text-sm text-gray-500">Completed</p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 border-b">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by title, user, or trainer..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filters.status}
                            onChange={(e) => updateFilterField("status", e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                            <option value="revision_needed">Revision Needed</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            <MdFilterList size={20} />
                            More Filters
                        </button>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                            Search
                        </button>
                    </div>

                    {/* Extended Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.fromDate}
                                        onChange={(e) => updateFilterField("fromDate", e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.toDate}
                                        onChange={(e) => updateFilterField("toDate", e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        <MdRefresh size={18} />
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <MdAssignment size={48} className="mx-auto mb-4" />
                        <p>No assignments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Task</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trainer</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Assigned</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Submissions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {assignments.map((assignment) => {
                                    const trainerProfile = assignment.todo?.trainer;
                                    const trainerUser = trainerProfile?.User || trainerProfile?.user || trainerProfile;

                                    return (
                                    <tr key={assignment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{assignment.todo?.title}</p>
                                            {assignment.todo?.priority && (
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    assignment.todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                    assignment.todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {assignment.todo.priority}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{assignment.user?.username}</p>
                                            <p className="text-sm text-gray-500">{assignment.user?.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{trainerUser?.username || 'Unknown Trainer'}</p>
                                            {trainerUser?.email && (
                                                <p className="text-sm text-gray-500">{trainerUser.email}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(assignment.assignedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-gray-100 rounded">
                                                {assignment.submissions?.length || 0}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 0 && (
                    <div className="p-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={pagination.limit}
                                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                                className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                            
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MdChevronLeft size={20} />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                            className={`w-8 h-8 rounded ${
                                                pagination.page === pageNum
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <MdChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
