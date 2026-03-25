import React from "react";
import { formatTimestamp } from "../../utils/date";

export default function TodoItem({ todo, onToggle, onViewEvidence }) {
  return (
    <li className="flex items-start gap-3">
      <label className="flex items-center gap-3 flex-1 bg-slate-50 p-3 rounded-lg">
        <input
          type="checkbox"
          checked={!!todo.completed}
          onChange={onToggle}
          className="w-4 h-4 text-emerald-600"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className={todo.completed ? "line-through text-slate-400" : "text-slate-900 font-medium"}>
              {todo.title}
            </div>
            <div className="text-xs text-slate-400">{todo.date}</div>
          </div>
          {todo.evidence && (
            <div className="mt-2 flex items-center gap-2">
              <button onClick={onViewEvidence} className="text-xs text-blue-600 hover:underline">
                View Evidence
              </button>
              {todo.completed && todo.completedAt && (
                <span className="text-xs text-slate-400">• {formatTimestamp(todo.completedAt)}</span>
              )}
            </div>
          )}
        </div>
      </label>
    </li>
  );
}