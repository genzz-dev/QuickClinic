import React from "react";
const classNames = (...c) => c.filter(Boolean).join(" ");

const WorkingDaysTab = ({ workingDays, onToggleDay, onTimeChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {workingDays.map(({ day, isWorking, startTime, endTime }) => (
        <div key={day} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="capitalize font-medium text-gray-900">{day}</div>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isWorking} onChange={() => onToggleDay(day)} />
              <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full relative transition">
                <span
                  className={classNames(
                    "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition",
                    isWorking ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </div>
            </label>
          </div>
          {isWorking && (
            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => onTimeChange(day, "startTime", e.target.value)}
                className="w-1/2 border border-gray-300 rounded px-2 py-1 text-gray-900"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => onTimeChange(day, "endTime", e.target.value)}
                className="w-1/2 border border-gray-300 rounded px-2 py-1 text-gray-900"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WorkingDaysTab;