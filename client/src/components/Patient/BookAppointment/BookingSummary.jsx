
const BookingSummary = ({ selectedDate, selectedSlot, isTeleconsultation, consultationFee }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{selectedSlot}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span>{isTeleconsultation ? 'Teleconsultation' : 'In-person'}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Fee:</span>
          <span>₹{consultationFee}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;