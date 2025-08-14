import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex-shrink-0">
            <div className="p-3 rounded-lg bg-gray-50">
              <Icon className="h-8 w-8 text-gray-700" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
