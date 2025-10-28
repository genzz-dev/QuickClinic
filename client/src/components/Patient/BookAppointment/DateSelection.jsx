import { Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const DateSelection = ({ selectedDate, setSelectedDate, schedule, dateAvailability }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const scrollContainerRef = useRef(null);

  // HELPER FUNCTION TO FORMAT DATE WITHOUT TIMEZONE ISSUES
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate 14 days starting from current week
  const generateDates = () => {
    const dates = [];
    const startDate = new Date(currentWeekStart);

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
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

  // Check if doctor is on vacation - FIXED VERSION
  const isOnVacation = (date) => {
    if (!schedule?.vacations) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return schedule.vacations.some((vacation) => {
      const vacationStart = new Date(vacation.startDate);
      vacationStart.setHours(0, 0, 0, 0);

      const vacationEnd = new Date(vacation.endDate);
      vacationEnd.setHours(23, 59, 59, 999);

      return checkDate >= vacationStart && checkDate <= vacationEnd;
    });
  };

  const dates = generateDates();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    if (newStart >= today) {
      setCurrentWeekStart(newStart);
    }
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const isPrevDisabled = currentWeekStart <= today;

  const formatSelectedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone shift
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
        </div>
      </div>

      {/* Selected Date Display - Sticky */}
      {selectedDate && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                Selected Date
              </p>
              <p className="text-lg font-bold text-gray-800">{formatSelectedDate(selectedDate)}</p>
              {isOnVacation(new Date(selectedDate + 'T00:00:00')) && (
                <div className="mt-2 flex items-center gap-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Doctor on Vacation</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePrevWeek}
          disabled={isPrevDisabled}
          className={`p-2 rounded-lg transition-all ${
            isPrevDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400 shadow-sm'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-semibold text-gray-600">
          {dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400 shadow-sm transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Horizontal Scrolling Date Picker */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {dates.map((date, index) => {
          // FIX: Use timezone-safe date formatting
          const dateString = formatDateToString(date);

          const isPast = date < today;
          const isSelected = selectedDate === dateString;
          const isWorking = isWorkingDay(date);
          const onVacation = isOnVacation(date);
          const isDisabled = isPast || !isWorking || onVacation;

          return (
            <button
              key={index}
              onClick={() => !isDisabled && setSelectedDate(dateString)}
              disabled={isDisabled}
              className={`
                flex-shrink-0 w-20 sm:w-24 p-3 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-600 shadow-lg scale-105'
                    : isDisabled
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md hover:scale-105'
                }
              `}
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`text-xs font-medium uppercase ${
                    isSelected ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className={`text-2xl font-bold ${
                    isSelected ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-800'
                  }`}
                >
                  {date.getDate()}
                </span>
                <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </span>

                {/* Status Indicator */}
                {!isPast && (
                  <div className="mt-1">
                    {onVacation ? (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        🏖️
                      </span>
                    ) : isWorking ? (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-green-500'
                        }`}
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🏖️</span>
          <span>On Vacation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span>Not Working</span>
        </div>
      </div>

      {/* Error Message */}
      {dateAvailability && !dateAvailability.available && selectedDate && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {dateAvailability.reason || 'No slots available for this date'}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default DateSelection;
