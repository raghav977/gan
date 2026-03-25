import React, { useMemo, useState } from "react";
import EvidenceModal from "../modals/EvidenceModal";

/*
  TodosList
  - Improved UI with Tailwind
  - Search + status filter
  - Custom date range filter (from / to)
  - Responsive list and badges
  - "View Evidence" opens EvidenceModal (uses mock evidence if present)
*/

const MOCK_TODOS = [
  {
    id: 1,
    title: "Complete workout plan",
    description: "Finish the full-body workout plan for the week.",
    dueDate: "2024-07-10",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Nutrition assessment",
    description: "Review client's nutrition log and provide feedback.",
    dueDate: "2024-07-12",
    status: "Pending",
  },
  {
    id: 3,
    title: "Schedule follow-up session",
    description: "Set up a follow-up training session with the client.",
    dueDate: "2024-07-15",
    status: "Completed",
    evidence: {
      images: [
        "https://images.unsplash.com/photo-1517960413843-0aee8e2b8a7d?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
      ],
      note: "Client showed great progress in strength and endurance.",
      timestamp: "2024-07-15 09:43",
    },
  },
  {
    id: 4,
    title: "Mobility session",
    description: "50% mobility work focusing on shoulders and hips.",
    dueDate: "2024-07-12",
    status: "Pending",
  },
];

const statusColors = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

const TodosList = () => {
  const [todos] = useState(MOCK_TODOS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // status
      if (statusFilter !== "All" && todo.status !== statusFilter) return false;

      // search
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = todo.title.toLowerCase().includes(q);
        const inDesc = (todo.description || "").toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
      }

      // date range filter
      if (dateFrom) {
        const from = new Date(dateFrom);
        const due = new Date(todo.dueDate);
        if (due < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        // include the entire To day by setting time to end of day
        to.setHours(23, 59, 59, 999);
        const due = new Date(todo.dueDate);
        if (due > to) return false;
      }

      return true;
    });
  }, [todos, statusFilter, search, dateFrom, dateTo]);

  const resetFilters = () => {
    setStatusFilter("All");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Client To‑dos</h2>
          <p className="text-sm text-slate-500">Track daily tasks, evidence and completion status</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetFilters}
            className="text-sm text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md hover:bg-slate-50"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 bg-white p-4 rounded-xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:ring-emerald-200 focus:border-emerald-400"
            />
          </div>

          {/* Status */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-1">
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Todo List */}
      <ul className="mt-4 grid grid-cols-1 gap-4">
        {filteredTodos.length === 0 && (
          <div className="p-6 bg-white rounded-xl shadow text-center text-sm text-slate-500">
            No todos match your filters.
          </div>
        )}

        {filteredTodos.map((todo) => (
          <li key={todo.id} className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{todo.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{todo.description}</p>
                  </div>

                  <div className="text-sm text-slate-400 text-right">
                    <div>Due</div>
                    <div className="mt-1 font-medium text-slate-700">{todo.dueDate}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${statusColors[todo.status] || "bg-slate-100 text-slate-700"}`}
                  >
                    {todo.status}
                  </span>

                  {todo.status === "Completed" && todo.evidence && (
                    <button
                      onClick={() => setSelectedEvidence(todo.evidence)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Evidence
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  className="bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-full text-sm hover:bg-slate-50"
                  onClick={() => alert("Open edit UI (not implemented)")}
                >
                  Edit
                </button>

                <button
                  className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm hover:bg-emerald-700"
                  onClick={() => alert("Mark complete / API call")}
                >
                  Mark Done
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Evidence modal */}
      {selectedEvidence && (
        <EvidenceModal evidence={selectedEvidence} onClose={() => setSelectedEvidence(null)} />
      )}
    </div>
  );
};

export default TodosList;