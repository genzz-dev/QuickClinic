import { Clock } from 'lucide-react';

const TimeSlotSelection = ({ availableSlots, selectedSlot, setSelectedSlot }) => {
  // Group slots by time of day
  const groupSlotsByPeriod = (slots) => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.split(':')[0]);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByPeriod(availableSlots);

  const renderSlotGroup = (title, slots, emoji) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs">{emoji}</span>
          <h4 className="text-[10px] lg:text-xs font-semibold text-gray-700">{title}</h4>
          <span className="text-[9px] lg:text-[10px] text-gray-500">({slots.length})</span>
        </div>
        <div className="grid grid-cols-5 lg:grid-cols-6 gap-1">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`px-1.5 py-1.5 lg:py-2 rounded-md text-[10px] lg:text-xs font-semibold transition-all ${
                selectedSlot === slot
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md scale-105'
                  : 'bg-blue-50 text-gray-900 hover:bg-blue-100 hover:scale-105'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600" />
          <p className="text-xs lg:text-sm font-semibold text-gray-900">Select Time</p>
        </div>
        <span className="text-[10px] lg:text-xs text-gray-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
          {availableSlots.length} slots
        </span>
      </div>

      {availableSlots.length > 0 ? (
        <div className="bg-white rounded-lg p-2 lg:p-2.5 shadow-sm border border-gray-200">
          {renderSlotGroup('Morning', morning, '🌅')}
          {renderSlotGroup('Afternoon', afternoon, '☀️')}
          {renderSlotGroup('Evening', evening, '🌆')}
        </div>
      ) : (
        <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-[10px] lg:text-xs text-gray-600 font-medium">
            No time slots available
          </p>
          <p className="text-[9px] lg:text-[10px] text-gray-500 mt-0.5">
            Please select a different date
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelection;
