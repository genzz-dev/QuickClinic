import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { bookAppointment } from '../../service/appointmentApiService';
import { getDoctorAvailability, getDoctorById, getDoctorSchedule } from '../../service/publicapi';
import DoctorInfoCard from '../../components/Patient/BookAppointment/DoctorInfoCard';
import BookingForm from '../../components/Patient/BookAppointment/BookingForm';
import Loading from '../../components/ui/Loading';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [isTeleconsultation, setIsTeleconsultation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateAvailability, setDateAvailability] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const [doctorResponse, scheduleResponse] = await Promise.all([
          getDoctorById(doctorId),
          getDoctorSchedule(doctorId),
        ]);

        if (doctorResponse.success) {
          setDoctor(doctorResponse.data);
        }

        if (scheduleResponse.success) {
          setSchedule(scheduleResponse.data);
        }
      } catch (err) {
        setError('Failed to load doctor information');
        console.error('Error fetching doctor data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorData();
    }
  }, [doctorId]);

  useEffect(() => {
    const checkDateAvailability = async () => {
      if (selectedDate && doctor) {
        try {
          const response = await getDoctorAvailability(doctorId, selectedDate);

          if (response.success) {
            setDateAvailability(response.data);
            if (response.data.available) {
              setAvailableSlots(response.data.slots || []);
            } else {
              setAvailableSlots([]);
            }
          }
        } catch (err) {
          console.error('Error checking availability:', err);
          setDateAvailability({
            available: false,
            reason: 'Error checking availability',
          });
          setAvailableSlots([]);
        }
      }
    };

    checkDateAvailability();
  }, [selectedDate, doctorId, doctor]);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const appointmentDuration = schedule?.appointmentDuration || 30;
      const [hours, minutes] = selectedSlot.split(':');
      const startTime = new Date();
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + appointmentDuration);

      const bookingData = {
        doctorId,
        date: selectedDate,
        startTime: selectedSlot,
        endTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(
          endTime.getMinutes()
        ).padStart(2, '0')}`,
        reason,
        isTeleconsultation,
      };

      const response = await bookAppointment(bookingData);

      if (response.appointment) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !doctor) {
    return <Loading />;
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Doctor not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-sm lg:text-xl font-bold text-gray-900">Book Appointment</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="text-xs lg:text-sm font-medium">Close</span>
          </button>
        </div>
      </div>

      {/* Vertical Layout - Both Mobile & Desktop */}
      <div className="h-[calc(100vh-68px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
          {/* Doctor Info Card - Top */}
          <div className="mb-4 lg:mb-6">
            <DoctorInfoCard doctor={doctor} schedule={schedule} />
          </div>

          {/* Booking Form - Bottom */}
          <div>
            <BookingForm
              schedule={schedule}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              availableSlots={availableSlots}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              reason={reason}
              setReason={setReason}
              isTeleconsultation={isTeleconsultation}
              setIsTeleconsultation={setIsTeleconsultation}
              loading={loading}
              error={error}
              success={success}
              dateAvailability={dateAvailability}
              doctor={doctor}
              onBooking={handleBooking}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
