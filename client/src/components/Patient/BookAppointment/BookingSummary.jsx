import { Calendar, Clock, FileText, Video, DollarSign } from 'lucide-react';

const BookingSummary = ({
  selectedDate,
  selectedSlot,
  reason,
  isTeleconsultation,
  consultationFee,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border-2 border-gray-200">
        <div className="space-y-3">
          <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
            <Calendar className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">
                Appointment Date
              </div>
              <div className="text-sm lg:text-base text-gray-900 font-bold">
                {formatDate(selectedDate)}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
            <Clock className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">Time Slot</div>
              <div className="text-sm lg:text-base text-gray-900 font-bold">{selectedSlot}</div>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
            <Video className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">
                Consultation Type
              </div>
              <div className="text-sm lg:text-base text-gray-900 font-bold">
                {isTeleconsultation ? '📹 Teleconsultation (Video Call)' : '🏥 In-Person Visit'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
            <FileText className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">
                Reason for Visit
              </div>
              <div className="text-xs lg:text-sm text-gray-900 leading-relaxed">{reason}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-700" />
              <span className="text-xs lg:text-sm font-semibold text-gray-700">
                Consultation Fee
              </span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">₹{consultationFee}</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
        <p className="text-xs lg:text-sm text-blue-900 leading-relaxed">
          ✓ Please review all details carefully. You'll receive a confirmation after booking.
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
