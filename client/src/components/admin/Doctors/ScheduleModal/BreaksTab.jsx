import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const BreaksTab = ({ breaks, addBreak, updateBreak, removeBreak }) => {
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900">Breaks</h3>
        <button
          onClick={addBreak}
          className="flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          <FiPlus className="mr-1" /> Add Break
        </button>
      </div>
      {breaks.length === 0 ? (
        <p className="text-gray-500">No breaks added.</p>
      ) : (
        <div className="space-y-3">
          {breaks.map((b, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <select
                  value={b.day}
                  onChange={(e) => updateBreak(idx, "day", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={b.startTime}
                  onChange={(e) => updateBreak(idx, "startTime", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                />
                <input
                  type="time"
                  value={b.endTime}
                  onChange={(e) => updateBreak(idx, "endTime", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={b.reason || ""}
                  onChange={(e) => updateBreak(idx, "reason", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => removeBreak(idx)}
                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                    title="Remove"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BreaksTab;