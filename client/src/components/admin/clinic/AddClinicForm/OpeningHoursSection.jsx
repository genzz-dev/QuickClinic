import React from 'react';
import { Clock } from 'lucide-react';

const OpeningHoursSection = ({ openingHours, handleOpeningHoursChange }) => {
  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Clock className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Opening Hours</h3>
      </div>
      
      <div className="space-y-4">
        {days.map(({ key, label }) => (
          <div key={key} className="flex items-center space-x-4">
            <div className="w-24">
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={openingHours[key].isClosed}
                onChange={(e) => handleOpeningHoursChange(key, 'isClosed', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Closed</span>
            </div>
            
            {!openingHours[key].isClosed && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={openingHours[key].open}
                    onChange={(e) => handleOpeningHoursChange(key, 'open', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">to</span>
                  <input
                    type="time"
                    value={openingHours[key].close}
                    onChange={(e) => handleOpeningHoursChange(key, 'close', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpeningHoursSection;
