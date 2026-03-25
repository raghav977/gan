import React from "react";
import { createPortal } from "react-dom";

export default function EvidenceModal({ evidence, onClose }) {
  if (!evidence) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Evidence</h3>
          <button onClick={onClose} className="text-slate-500">Close</button>
        </div>

        <div className="p-4 space-y-4">
          {evidence.images?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {evidence.images.map((src, idx) => (
                <img key={idx} src={src} alt={`evidence-${idx}`} className="w-full h-40 object-cover rounded" />
              ))}
            </div>
          )}

          {evidence.note && <div className="text-sm text-slate-700">{evidence.note}</div>}

          {evidence.timestamp && (
            <div className="text-xs text-slate-400">Completed at: {evidence.timestamp}</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}