import React from 'react';
import { Clock } from 'lucide-react';

const ScheduleSection = ({ schedule }) => {
  const formatScheduleDay = (daySchedule) => {
    if (!daySchedule || !daySchedule.isWorking) {
      return 'Closed';
    }
    return `${daySchedule.startTime} - ${daySchedule.endTime}`;
  };

  const getDayName = (day) => {
    const days = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return days[day] || day;
  };

  return (
    schedule && schedule.workingDays && schedule.workingDays.length > 0 && (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Schedule
        </h2>
        <div className="space-y-3">
          {schedule.workingDays.map((daySchedule, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="font-medium text-gray-900 capitalize">
                {getDayName(daySchedule.day)}
              </span>
              <span className={`font-medium ${daySchedule.isWorking ? 'text-green-600' : 'text-red-500'}`}>
                {formatScheduleDay(daySchedule)}
              </span>
            </div>
          ))}
        </div>
        {schedule.appointmentDuration && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Appointment Duration:</strong> {schedule.appointmentDuration} minutes
            </p>
          </div>
        )}
      </div>
    )
  );
};

export default ScheduleSection;