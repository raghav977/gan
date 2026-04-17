import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdGroup,
  MdPendingActions,
  MdPlaylistAddCheck,
  MdAssignment,
  MdRefresh,
  MdPeopleAlt,
  MdEventNote,
  MdTaskAlt,
  MdChevronRight
} from "react-icons/md";
import {
  getTrainerDashboardStats,
  getTrainerClients,
  getTrainerTodos,
  getEnrollmentRequests
} from "../../../../api/clientTrainer.api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [todos, setTodos] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, clientsRes, todosRes, requestsRes] = await Promise.all([
        getTrainerDashboardStats(),
        getTrainerClients(),
        getTrainerTodos(),
        getEnrollmentRequests("pending")
      ]);

      setStats(statsRes.data || null);
      setClients(clientsRes.data || []);
      setTodos(todosRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const recentTodos = useMemo(() => (todos || []).slice(0, 4), [todos]);
  const activeClients = useMemo(() => (clients || []).slice(0, 4), [clients]);
  const pendingRequests = useMemo(() => (requests || []).slice(0, 4), [requests]);

  const assignmentStats = stats?.assignments || {};
  const formatDate = (value) => {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleDateString();
    } catch (err) {
      return value;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trainer Dashboard</h1>
          <p className="text-gray-500">Monitor your clients, requests, and todos in one place.</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <MdRefresh /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="inline-flex p-3 bg-yellow-100 rounded-xl mb-3">
            <MdGroup className="text-yellow-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Active Clients</p>
          <p className="text-3xl font-bold">{stats?.clients?.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="inline-flex p-3 bg-orange-100 rounded-xl mb-3">
            <MdPendingActions className="text-orange-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold">{stats?.clients?.pendingRequests || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="inline-flex p-3 bg-blue-100 rounded-xl mb-3">
            <MdPlaylistAddCheck className="text-blue-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Todos Created</p>
          <p className="text-3xl font-bold">{stats?.todos || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="inline-flex p-3 bg-green-100 rounded-xl mb-3">
            <MdAssignment className="text-green-600" size={28} />
          </div>
          <p className="text-sm text-gray-500">Assignments Monitored</p>
          <p className="text-3xl font-bold">{assignmentStats.total || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Workload Snapshot</h2>
            <span className="text-sm text-gray-500">Across all assigned tasks</span>
          </div>
          <div className="space-y-4">
            {["pending", "submitted", "completed"].map((key) => {
              const colors = {
                pending: "bg-yellow-400",
                submitted: "bg-purple-500",
                completed: "bg-green-500"
              };
              const value = assignmentStats[key] || 0;
              const total = assignmentStats.total || 0;
              const percent = total ? Math.round((value / total) * 100) : 0;
              const labelMap = {
                pending: "Pending",
                submitted: "Submitted",
                completed: "Completed"
              };
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span>{labelMap[key]}</span>
                    <span>{value} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full ${colors[key]}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-yellow-50">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{assignmentStats.pending || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="text-xl font-bold text-purple-600">{assignmentStats.submitted || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">{assignmentStats.completed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Requests</h2>
            <span className="text-sm text-gray-500">Latest 4</span>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests right now.</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{request.user?.username || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{request.user?.email}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-600">
                      Pending
                    </span>
                  </div>
                  {request.requestMessage && (
                    <p className="text-sm text-gray-600 mt-2">“{request.requestMessage}”</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Requested on {formatDate(request.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/trainer/clients"
            className="mt-4 inline-flex items-center gap-1 text-sm text-yellow-600 hover:underline"
          >
            Manage requests <MdChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Active Clients</h2>
            <Link to="/trainer/clients" className="text-sm text-yellow-600 hover:underline">
              View all
            </Link>
          </div>
          {activeClients.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No clients assigned yet.</div>
          ) : (
            <div className="divide-y">
              {activeClients.map((client) => (
                <div key={client.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-semibold text-yellow-600">
                    {client.user?.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{client.user?.username}</p>
                    <p className="text-xs text-gray-500">{client.user?.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">Since {formatDate(client.acceptedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Todos</h2>
            <Link to="/trainer/todos" className="text-sm text-yellow-600 hover:underline">
              Manage
            </Link>
          </div>
          {recentTodos.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Create your first todo to see it here.</div>
          ) : (
            <div className="divide-y">
              {recentTodos.map((todo) => (
                <div key={todo.id} className="p-4 flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <MdEventNote size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{todo.title}</p>
                    <p className="text-xs text-gray-500">Due {formatDate(todo.dueDate)}</p>
                  </div>
                  <span className="text-xs text-gray-400">{todo.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/trainer/todos/create"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow hover:shadow-md transition"
        >
          <div className="p-3 bg-yellow-100 rounded-lg">
            <MdTaskAlt className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="font-semibold">Create Todo</p>
            <p className="text-sm text-gray-500">Assign structured work to your clients.</p>
          </div>
        </Link>
        <Link
          to="/trainer/client-management"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow hover:shadow-md transition"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <MdPeopleAlt className="text-green-600" size={24} />
          </div>
          <div>
            <p className="font-semibold">Client Management</p>
            <p className="text-sm text-gray-500">Handle requests and assignments.</p>
          </div>
        </Link>
        <Link
          to="/trainer/messages"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow hover:shadow-md transition"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <MdGroup className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="font-semibold">Open Messages</p>
            <p className="text-sm text-gray-500">Stay in sync with every client.</p>
          </div>
        </Link>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/40 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Updating metrics...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;