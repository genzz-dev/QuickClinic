import { Clock } from 'lucide-react';

const OpeningHours = ({ openingHours }) => {
  if (!openingHours) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Opening Hours
      </h2>
      <div className="space-y-2">
        {openingHours.map((schedule, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600">{schedule.day}</span>
            <span className="text-gray-900 font-medium">{schedule.hours}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpeningHours;
