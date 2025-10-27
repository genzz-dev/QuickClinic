import { Calendar, AlertCircle } from 'lucide-react';

const DateSelection = ({ selectedDate, setSelectedDate, schedule, dateAvailability }) => {
  // Generate next 30 days for date selection
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Check if a date is a working day
  const isWorkingDay = (date) => {
    if (!schedule?.workingDays) return false;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const workingDay = schedule.workingDays.find((day) => day.day === dayName && day.isWorking);

    return !!workingDay;
  };

  // Check if doctor is on vacation
  const isOnVacation = (date) => {
    if (!schedule?.vacations) return false;

    return schedule.vacations.some((vacation) => {
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      return date >= vacationStart && date <= vacationEnd;
    });
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <Calendar className="h-4 w-4 inline mr-1" />
        Select Date
      </label>
      <div className="grid grid-cols-7 gap-2">
        {generateAvailableDates()
          .slice(0, 21)
          .map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isWorking = isWorkingDay(date);
            const onVacation = isOnVacation(date);
            const isDisabled = !isWorking || onVacation;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => !isDisabled && setSelectedDate(dateStr)}
                disabled={isDisabled}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  selectedDate === dateStr
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isDisabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">
                  {date.toLocaleDateString('en-US', {
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                  })}
                </div>
              </button>
            );
          })}
      </div>

      {selectedDate && dateAvailability && !dateAvailability.available && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            {dateAvailability.reason}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateSelection;
