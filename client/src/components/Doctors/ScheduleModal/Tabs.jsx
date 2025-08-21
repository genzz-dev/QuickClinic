import React from "react";

const classNames = (...c) => c.filter(Boolean).join(" ");

const Tabs = ({ tabs, current, onChange }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={classNames(
            current === t.key
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300",
            "whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium"
          )}
        >
          {t.label}
        </button>
      ))}
    </nav>
  </div>
);

export default Tabs;