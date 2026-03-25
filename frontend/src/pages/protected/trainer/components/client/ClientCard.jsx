import React from "react";

export default function ClientCard({ client, onView }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
          {client.name[0]}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900">{client.name}</div>
          <div className="text-xs text-slate-400">{client.email}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {/* <div className="text-sm text-slate-500">{client.phone}</div> */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700"
          >
            View Track
          </button>
        </div>
      </div>
    </div>
  );
}