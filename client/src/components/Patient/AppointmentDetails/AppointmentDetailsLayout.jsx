import Header from './Header';
import StatusCard from './StatusCard';
import PrescriptionSection from './PrescriptionSection';
import DoctorClinicInfo from './DoctorClinicInfo';
import RatingComponent from '../RatingComponent';

const AppointmentDetailsLayout = ({
  appointment,
  prescription,
  existingRating,
  appointmentId,
  onRatingUpdate,
  navigate
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Header navigate={navigate} />
        
        <StatusCard appointment={appointment} />
        
        {prescription && (
          <PrescriptionSection 
            prescription={prescription} 
            appointment={appointment} 
          />
        )}

        <DoctorClinicInfo appointment={appointment} />
        
        {appointment.status === 'completed' && (
          <div className="mt-6">
            <RatingComponent
              appointmentId={appointmentId}
              doctorId={appointment.doctorId?._id || appointment.doctorId}
              clinicId={appointment.clinicId?._id || appointment.clinicId}
              existingRating={existingRating}
              onRatingUpdate={onRatingUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailsLayout;