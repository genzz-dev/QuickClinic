import { Calendar, Clock, Star, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AboutSection from '../../components/public/DoctorDetailsPage/AboutSection';
import ClinicInfoSection from '../../components/public/DoctorDetailsPage/ClinicInfoSection';
import DoctorHeader from '../../components/public/DoctorDetailsPage/DoctorHeader';
import ErrorState from '../../components/public/DoctorDetailsPage/ErrorState';
import NotFoundState from '../../components/public/DoctorDetailsPage/NotFoundState';
import QualificationsSection from '../../components/public/DoctorDetailsPage/QualificationsSection';
import ScheduleSection from '../../components/public/DoctorDetailsPage/ScheduleSection';
import TeleconsultationBanner from '../../components/public/DoctorDetailsPage/TeleconsultationBanner';
import StarRating from '../../components/public/StarRating';
import Loading from '../../components/ui/Loading';
import authService from '../../service/authservice'; // Import auth service
import { getDoctorById, getDoctorSchedule } from '../../service/publicapi';

const DoctorDetailsPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();

      setIsAuthenticated(authenticated && !authService.isTokenExpired());
      setUser(currentUser);
    };

    checkAuth();
  }, []);

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

        const schedulePromise = getDoctorSchedule(doctorId);
        schedulePromise
          .then((scheduleData) => {
            if (scheduleData) {
              setSchedule(scheduleData.data);
            }
          })
          .catch((err) => {
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

  const handleBookAppointment = () => {
    if (isAuthenticated && user?.role === 'patient') {
      navigate(`/patient/book-appointment/${doctorId}`);
    } else {
      // Redirect to login/register
      navigate('/auth/login', {
        state: {
          redirectTo: `/patient/book-appointment/${doctorId}`,
          message: 'Please login as a patient to book an appointment',
        },
      });
    }
  };

  // Book Appointment Button Component
  const BookAppointmentButton = () => {
    if (isAuthenticated && user?.role === 'patient') {
      return (
        <button
          onClick={handleBookAppointment}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Book Appointment
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <button
          disabled
          className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          Book Appointment
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Please register or login as a patient to book an appointment
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
            >
              Register
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  if (!doctor) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <DoctorHeader doctor={doctor} clinic={clinic} />
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Reviews</h3>
              <StarRating type="doctor" id={doctorId} size="large" detailed={true} inline={false} />
            </div>
            <AboutSection doctor={doctor} />
            <QualificationsSection doctor={doctor} />
            <ScheduleSection schedule={schedule} />
            <ClinicInfoSection clinic={clinic} onClinicClick={handleClinicClick} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <BookAppointmentButton />
            </div>
            <TeleconsultationBanner />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailsPage;
