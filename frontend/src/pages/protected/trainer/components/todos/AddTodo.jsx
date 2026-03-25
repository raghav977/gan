import React, { useState } from "react";

export default function AddTodoForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!open && (
        <button onClick={() => setOpen(true)} className="text-sm text-slate-600 hover:underline">
          + Add
        </button>
      )}

      {open && (
        <form onSubmit={submit} className="flex gap-2 items-center">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-1 rounded-full border border-slate-200 text-sm"
            placeholder="New to-do title"
            autoFocus
          />
          <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm">
            Add
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500">
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}