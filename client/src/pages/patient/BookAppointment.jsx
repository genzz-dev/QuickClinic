import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bookAppointment } from '../../service/appointmentApiService';
import { getDoctorAvailability, getDoctorById, getDoctorSchedule } from '../../service/publicapi';
import DoctorInfoCard from '../../components/Patient/BookAppointment/DoctorInfoCard';
import BookingForm from '../../components/Patient/BookAppointment/BookingForm';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  // State management
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

  // Fetch doctor details and schedule on component mount
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

  // Check availability when date is selected
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

  // Handle appointment booking
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Calculate end time based on appointment duration
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
        endTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Doctor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <X className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <DoctorInfoCard doctor={doctor} schedule={schedule} />

          {/* Booking Form */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
