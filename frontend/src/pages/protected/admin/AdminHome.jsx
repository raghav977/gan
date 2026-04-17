import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdAssignment,
  MdPendingActions,
  MdCheckCircle,
  MdPeople,
  MdTrendingUp,
  MdRefresh,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
  MdPlayCircle,
  MdHistory
} from "react-icons/md";
import { getAdminStats, getAllAssignmentsAdmin } from "../../../api/clientTrainer.api";

const statusDisplay = {
  pending: { label: "Pending", badge: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "In Progress", badge: "bg-blue-100 text-blue-700" },
  submitted: { label: "Submitted", badge: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", badge: "bg-green-100 text-green-700" },
  revision_needed: { label: "Needs Revision", badge: "bg-red-100 text-red-600" }
};

const distributionConfig = [
  { key: "pending", label: "Pending", bar: "bg-yellow-400" },
  { key: "inProgress", label: "In Progress", bar: "bg-blue-500" },
  { key: "submitted", label: "Submitted", bar: "bg-purple-500" },
  { key: "completed", label: "Completed", bar: "bg-green-500" },
  { key: "revisionNeeded", label: "Needs Revision", bar: "bg-red-500" }
];

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, total: 0 });

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getAdminStats();
      setStats(response.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async () => {
    setAssignmentsLoading(true);
    try {
      const response = await getAllAssignmentsAdmin({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status,
        search: filters.search
      });
      const payload = response.data || {};
      setAssignments(payload.assignments || []);
      setPagination((prev) => ({
        ...prev,
        total: payload.total || 0,
        totalPages: payload.totalPages || 1
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [filters.search, filters.status, pagination.limit, pagination.page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const handleStatusChange = (status) => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilters((prev) => ({ ...prev, status }));
  };

  const handlePageChange = (direction) => {
    setPagination((prev) => {
      const next = direction === "next" ? prev.page + 1 : prev.page - 1;
      if (next < 1 || next > prev.totalPages) return prev;
      return { ...prev, page: next };
    });
  };

  const handleRefresh = () => {
    fetchStats();
    fetchAssignments();
  };

  const completionRate = useMemo(() => {
    const total = stats?.assignments?.total || 0;
    if (!total) return 0;
    return Math.round(((stats?.assignments?.completed || 0) / total) * 100);
  }, [stats]);

  const statusDistribution = useMemo(() => {
    const total = stats?.assignments?.total || 0;
    return distributionConfig.map((item) => {
      const value = stats?.assignments?.[item.key] || 0;
      const percentage = total ? Math.round((value / total) * 100) : 0;
      return { ...item, value, percentage };
    });
  }, [stats]);

  const recentActivity = useMemo(() => assignments.slice(0, 5), [assignments]);

  const formatDateTime = (value) => {
    if (!value) return "-";
    try {
      const date = new Date(value);
      return date.toLocaleString();
    } catch (err) {
      return value;
    }
  };

  const formatRelativeTime = (value) => {
    if (!value) return "just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "just now";
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  const statCards = [
    {
      label: "Total Assignments",
      value: stats?.assignments?.total || 0,
      icon: <MdAssignment className="text-blue-600" size={28} />,
      accent: "bg-blue-100"
    },
    {
      label: "Pending Review",
      value: stats?.assignments?.pending || 0,
      icon: <MdPendingActions className="text-yellow-600" size={28} />,
      accent: "bg-yellow-100"
    },
    {
      label: "Completed",
      value: stats?.assignments?.completed || 0,
      icon: <MdCheckCircle className="text-green-600" size={28} />,
      accent: "bg-green-100"
    },
    {
      label: "Active Enrollments",
      value: stats?.enrollments?.total || 0,
      icon: <MdPeople className="text-purple-600" size={28} />,
      accent: "bg-purple-100"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Control Center</h1>
          <p className="text-gray-500">Track assignments, enrollments, and trainer productivity in one place.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600"
          >
            View Orders
          </Link>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow p-5">
            <div className={`inline-flex p-3 rounded-xl ${card.accent} mb-4`}>
              {card.icon}
            </div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold mt-1">
              {statsLoading ? <span className="text-gray-300">•••</span> : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <MdTrendingUp size={28} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Completed assignments out of total assigned tasks across all trainers.
          </p>
          <div className="space-y-4">
            {statusDistribution.map((item) => (
              <div key={item.key}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{item.label}</span>
                  <span>{item.value} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${item.bar}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Enrollment Overview</p>
              <p className="text-3xl font-bold">{stats?.enrollments?.total || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <MdPeople size={28} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Clients actively paired with trainers vs pending approvals.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold">{stats?.enrollments?.total || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-yellow-50">
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats?.enrollments?.pending || 0}</p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="mt-6 inline-flex items-center gap-2 text-sm text-purple-600 hover:underline"
          >
            Review Trainer Approvals <MdHistory size={16} />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Assignments Monitor</h2>
            <p className="text-sm text-gray-500">
              {pagination.total} total assignments across all trainers
            </p>
          </div>
          <div className="flex-1" />
          <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-3">
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by trainer, user, or todo..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setFilters((prev) => ({ ...prev, search: "" }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </form>
          <div className="flex gap-2">
            {[
              { label: "All", value: "" },
              { label: "Pending", value: "pending" },
              { label: "In Progress", value: "in_progress" },
              { label: "Submitted", value: "submitted" },
              { label: "Completed", value: "completed" }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-3 py-2 rounded-lg text-sm border ${
                  filters.status === option.value
                    ? "bg-yellow-500 text-white border-yellow-500"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {assignmentsLoading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="animate-spin w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
            <p className="text-gray-500">Fetching assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No assignments match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left">
              <thead>
                <tr className="bg-gray-50 border-b text-sm text-gray-500">
                  <th className="px-4 py-3 font-semibold">Assignment</th>
                  <th className="px-4 py-3 font-semibold">Trainer</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b last:border-0">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{assignment.todo?.title || "Untitled"}</p>
                      <p className="text-xs text-gray-500">Assigned: {formatDateTime(assignment.assignedAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.todo?.trainer?.username || "-"}
                      </div>
                      <div className="text-xs text-gray-500">{assignment.todo?.trainer?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{assignment.user?.username || "-"}</div>
                      <div className="text-xs text-gray-500">{assignment.user?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        statusDisplay[assignment.status]?.badge || "bg-gray-100 text-gray-600"
                      }`}>
                        {statusDisplay[assignment.status]?.label || assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDateTime(assignment.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={pagination.page === 1}
              className={`p-2 rounded-lg border ${
                pagination.page === 1 ? "text-gray-400 bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <MdChevronLeft />
            </button>
            <button
              onClick={() => handlePageChange("next")}
              disabled={pagination.page === pagination.totalPages}
              className={`p-2 rounded-lg border ${
                pagination.page === pagination.totalPages
                  ? "text-gray-400 bg-gray-100"
                  : "hover:bg-gray-50"
              }`}
            >
              <MdChevronRight />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <MdHistory className="text-gray-400" />
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">No recent activity recorded.</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <MdPlayCircle className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.todo?.title || "Untitled task"}</p>
                    <p className="text-sm text-gray-500">
                      {activity.user?.username || "Unknown user"} → {activity.todo?.trainer?.username || "Trainer"}
                    </p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(activity.updatedAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    statusDisplay[activity.status]?.badge || "bg-gray-100 text-gray-600"
                  }`}>
                    {statusDisplay[activity.status]?.label || activity.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/admin/products"
              className="flex items-center gap-3 p-4 rounded-xl border hover:bg-gray-50"
            >
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdAssignment className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Manage Products</p>
                <p className="text-sm text-gray-500">Add, edit, or publish marketplace products.</p>
              </div>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl border hover:bg-gray-50"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <MdPeople className="text-green-600" />
              </div>
              <div>
                <p className="font-medium">Review Trainers</p>
                <p className="text-sm text-gray-500">Approve or reject trainer applications.</p>
              </div>
            </Link>
            <Link
              to="/admin/client-todos"
              className="flex items-center gap-3 p-4 rounded-xl border hover:bg-gray-50"
            >
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MdPendingActions className="text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Audit Client Todos</p>
                <p className="text-sm text-gray-500">Spot-check assignments and progress.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;