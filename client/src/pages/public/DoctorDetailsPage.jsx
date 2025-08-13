import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getDoctorById, 
  getDoctorSchedule, 
  getClinicById 
} from "../../service/publicapi";
import { Star, User } from 'lucide-react';
import DoctorHeader from '../../components/public/DoctorDetailsPage/DoctorHeader';
import AboutSection from '../../components/public/DoctorDetailsPage/AboutSection';
import QualificationsSection from '../../components/public/DoctorDetailsPage/QualificationsSection';
import ScheduleSection from '../../components/public/DoctorDetailsPage/ScheduleSection';
import ClinicInfoSection from '../../components/public/DoctorDetailsPage/ClinicInfoSection';
import TeleconsultationBanner from '../../components/public/DoctorDetailsPage/TeleconsultationBanner';
import LoadingState from '../../components/public/DoctorDetailsPage/LoadingState';
import ErrorState from '../../components/public/DoctorDetailsPage/ErrorState';
import NotFoundState from '../../components/public/DoctorDetailsPage/NotFoundState';
import Loading from '../../components/ui/Loading';

const DoctorDetailsPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        setError(null);

        const doctorData = await getDoctorById(doctorId);
        if (!doctorData) {
          throw new Error('Doctor not found');
        }
        setDoctor(doctorData.data);

        const schedulePromise = getDoctorSchedule(doctorId)
          .then(scheduleData => {
            if (scheduleData) {
              setSchedule(scheduleData.data);
            }
          })
          .catch(err => {
            console.error('Error fetching schedule:', err);
          });

        if (doctorData.data.clinicId) {
          setClinic(doctorData.data.clinicId);
        }

      } catch (err) {
        setError(err.message || 'Failed to fetch doctor details. Please try again.');
        console.error('Error fetching doctor data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorData();
    }
  }, [doctorId]);

  const handleClinicClick = () => {
    if (clinic?._id) {
      navigate(`/clinic/${clinic._id}`);
    }
  };

  if (loading) return <Loading/>
  if (error) return <ErrorState error={error} />;
  if (!doctor) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <DoctorHeader doctor={doctor} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AboutSection doctor={doctor} />
            <QualificationsSection doctor={doctor} />
            <ScheduleSection schedule={schedule} />
          </div>

          <div className="space-y-8">
            <ClinicInfoSection clinic={clinic} handleClinicClick={handleClinicClick} />
            <TeleconsultationBanner available={doctor.availableForTeleconsultation} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
