import { AlertCircle, CheckCircle } from 'lucide-react';
import DateSelection from './DateSelection';
import TimeSlotSelection from './TimeSlotSelection';
import BookingSummary from './BookingSummary';

const BookingForm = ({
  schedule,
  selectedDate,
  setSelectedDate,
  availableSlots,
  selectedSlot,
  setSelectedSlot,
  reason,
  setReason,
  isTeleconsultation,
  setIsTeleconsultation,
  loading,
  error,
  success,
  dateAvailability,
  doctor,
  onBooking
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Date & Time</h3>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={onBooking} className="space-y-6">
          {/* Date Selection */}
          <DateSelection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            schedule={schedule}
            dateAvailability={dateAvailability}
          />

          {/* Time Slot Selection */}
          {selectedDate && availableSlots.length > 0 && (
            <TimeSlotSelection
              availableSlots={availableSlots}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
            />
          )}

          {/* Reason for Visit */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Visit *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe your symptoms or reason for consultation..."
              required
            />
          </div>

          {/* Teleconsultation Option */}
          {doctor.availableForTeleconsultation && (
            <div className="flex items-center">
              <input
                id="teleconsultation"
                type="checkbox"
                checked={isTeleconsultation}
                onChange={(e) => setIsTeleconsultation(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="teleconsultation" className="ml-2 text-sm text-gray-700">
                Request Teleconsultation (Video Call)
              </label>
            </div>
          )}

          {/* Booking Summary */}
          {selectedDate && selectedSlot && (
            <BookingSummary
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              isTeleconsultation={isTeleconsultation}
              consultationFee={doctor.consultationFee}
            />
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedSlot || !reason.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Booking Appointment...
              </div>
            ) : (
              'Book Appointment'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;