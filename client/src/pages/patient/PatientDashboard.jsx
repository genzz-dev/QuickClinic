import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientAppointments } from '../../service/appointmentApiService';
import { getPatientProfile } from '../../service/patientApiService';
import Loading from '../../components/ui/Loading';
import HeroSection from '../../components/Patient/PatientDashboard/HeroSection';
import FeatureCards from '../../components/Patient/PatientDashboard/FeatureCards';
import QuickActions from '../../components/Patient/PatientDashboard/QuickActions';
import RecentActivity from '../../components/Patient/PatientDashboard/RecentActivity';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileResponse, appointmentsResponse] = await Promise.all([
        getPatientProfile(),
        getPatientAppointments(),
      ]);
      setPatientData(profileResponse);
      setAppointments(appointmentsResponse.appointments || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/patient/appointment/${appointmentId}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <HeroSection patientData={patientData} />
      <QuickActions navigate={navigate} />
      <FeatureCards />
      <RecentActivity appointments={appointments} onAppointmentClick={handleAppointmentClick} />
    </div>
  );
};

export default PatientDashboard;
