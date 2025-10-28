import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  onBooking,
  currentStep,
  setCurrentStep,
}) => {
  const totalSteps = 4;

  const canProceedToStep2 = selectedDate && dateAvailability?.available;
  const canProceedToStep3 = canProceedToStep2 && selectedSlot;
  const canProceedToStep4 = canProceedToStep3 && reason.trim();

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedToStep4) {
      setCurrentStep(4);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Progress Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2.5 lg:px-4 lg:py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold transition-all ${
                    currentStep >= step
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`text-[10px] lg:text-xs font-semibold mt-1 text-center ${
                    currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {step === 1 && 'Date'}
                  {step === 2 && 'Time'}
                  {step === 3 && 'Details'}
                  {step === 4 && 'Review'}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`h-1 flex-1 mx-1 lg:mx-2 rounded-full transition-all ${
                    currentStep > step
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selection Preview (Shows what's been selected) */}
      {currentStep > 1 && (
        <div className="bg-blue-50 border-b border-blue-100 px-3 py-2 lg:px-4 lg:py-2.5">
          <div className="flex items-center gap-3 lg:gap-4 flex-wrap text-xs lg:text-sm">
            {selectedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600" />
                <span className="font-semibold text-gray-900">{formatDate(selectedDate)}</span>
              </div>
            )}
            {selectedSlot && currentStep > 2 && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">{selectedSlot}</span>
                </div>
              </>
            )}
            {reason && currentStep > 3 && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600" />
                  <span className="font-medium text-gray-700 truncate max-w-[150px]">
                    {reason.substring(0, 30)}...
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-b border-red-200"
          >
            <div className="px-3 py-2 lg:px-4 lg:py-2.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs lg:text-sm text-red-700 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <div className="px-3 py-3 lg:px-4 lg:py-4">
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Date Selection */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-sm lg:text-base font-bold text-gray-900 mb-3">
                  When would you like to visit?
                </h2>
                <DateSelection
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  schedule={schedule}
                  dateAvailability={dateAvailability}
                />
              </div>
            )}

            {/* Step 2: Time Slot Selection */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-sm lg:text-base font-bold text-gray-900 mb-3">
                  Choose your preferred time
                </h2>
                <TimeSlotSelection
                  availableSlots={availableSlots}
                  selectedSlot={selectedSlot}
                  setSelectedSlot={setSelectedSlot}
                />
              </div>
            )}

            {/* Step 3: Reason & Consultation Type */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-sm lg:text-base font-bold text-gray-900 mb-3">
                  Tell us about your visit
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  <div>
                    <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-2">
                      Reason for Visit *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe your symptoms or reason for consultation..."
                      rows={4}
                      className="w-full px-3 py-2.5 lg:px-4 lg:py-3 text-xs lg:text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>

                  {doctor?.isTeleconsultationAvailable && (
                    <div>
                      <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-2">
                        Consultation Type
                      </label>
                      <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <button
                          type="button"
                          onClick={() => setIsTeleconsultation(false)}
                          className={`p-3 lg:p-4 rounded-xl transition-all border-2 ${
                            !isTeleconsultation
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-105'
                              : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs lg:text-sm font-bold mb-0.5">🏥 In-Person</div>
                          <div className="text-[10px] lg:text-xs opacity-75">Visit clinic</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsTeleconsultation(true)}
                          className={`p-3 lg:p-4 rounded-xl transition-all border-2 ${
                            isTeleconsultation
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-105'
                              : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xs lg:text-sm font-bold mb-0.5">📹 Video Call</div>
                          <div className="text-[10px] lg:text-xs opacity-75">Online</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-sm lg:text-base font-bold text-gray-900 mb-3">
                  Review your appointment
                </h2>
                <BookingSummary
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  reason={reason}
                  isTeleconsultation={isTeleconsultation}
                  consultationFee={doctor?.consultationFee}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200 px-3 py-2.5 lg:px-4 lg:py-3">
        <div className="flex items-center justify-between gap-2 lg:gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3) ||
                (currentStep === 3 && !canProceedToStep4)
              }
              className={`flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold transition-all ${
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3) ||
                (currentStep === 3 && !canProceedToStep4)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onBooking}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-xs lg:text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
