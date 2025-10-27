import { Clock } from 'lucide-react';

const TimeSlotSelection = ({ availableSlots, selectedSlot, setSelectedSlot }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <Clock className="h-4 w-4 inline mr-1" />
        Available Time Slots
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {availableSlots?.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setSelectedSlot(slot)}
            className={`p-3 text-sm rounded-lg border transition-colors ${
              selectedSlot === slot
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-900 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotSelection;
