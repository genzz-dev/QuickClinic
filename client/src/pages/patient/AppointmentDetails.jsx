import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAppointmentDetails } from '../../service/appointmentApiService';
import { getPatientAppointmentPrescription } from '../../service/prescriptionApiSevice';
import AppointmentDetailsLayout from '../../components/Patient/AppointmentDetails/AppointmentDetailsLayout.jsx';
import LoadingState from '../../components/Patient/AppointmentDetails/LoadingState';
import ErrorState from '../../components/Patient/AppointmentDetails/ErrorState';
import NotFoundState from '../../components/public/DoctorDetailsPage/NotFoundState.jsx';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [existingRating, setExistingRating] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);

  const handleRatingUpdate = (updatedRating) => {
    setExistingRating(updatedRating);
  };

  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appointmentResponse = await getAppointmentDetails(appointmentId);
      setAppointment(appointmentResponse.appointment || appointmentResponse.data);

      try {
        const prescriptionResponse = await getPatientAppointmentPrescription(appointmentId);
        setPrescription(prescriptionResponse.prescription || prescriptionResponse.data);
      } catch (prescriptionError) {
        console.log('No prescription found or access denied', prescriptionError);
        setPrescription(null);
      }
    } catch (err) {
      setError('Failed to load appointment details');
      console.error('Appointment details fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} navigate={navigate} />;
  }

  if (!appointment) {
    return <NotFoundState />;
  }

  return (
    <AppointmentDetailsLayout
      appointment={appointment}
      prescription={prescription}
      existingRating={existingRating}
      appointmentId={appointmentId}
      onRatingUpdate={handleRatingUpdate}
      navigate={navigate}
    />
  );
};

export default AppointmentDetails;