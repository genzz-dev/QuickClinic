import {
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  Database,
  FileText,
  HeartPulse,
  MapPin,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientAppointments } from '../../service/appointmentApiService';
import { getPatientProfile } from '../../service/patientApiService';

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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-green-600 bg-green-50 border-green-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      completed: 'text-blue-600 bg-blue-50 border-blue-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
      'no-show': 'text-gray-600 bg-gray-50 border-gray-200',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Split appointments
  const now = new Date();
  const futureAppointments = appointments.filter((a) => new Date(a.date) >= now);
  const pastAppointments = appointments.filter((a) => new Date(a.date) < now);

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/patient/appointment/${appointmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
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
      {/* HERO SECTION */}
      <div className="py-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow">
              Welcome to <span className="text-yellow-300">Quick Clinic</span>
            </h1>
            <p className="text-lg mb-4 font-medium">
              Your health, in one place — effortless, secure, and modern.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full font-medium text-sm">
                <Shield className="h-4 w-4 mr-1 text-yellow-200" /> Google Verified Clinics
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full font-medium text-sm">
                <Database className="h-4 w-4 mr-1 text-green-200" /> All Health Records In One Place
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full font-medium text-sm">
                <ClipboardList className="h-4 w-4 mr-1 text-blue-200" /> Seamless Prescriptions &
                Visits
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {patientData?.profilePicture ? (
              <img
                src={patientData.profilePicture}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover border-4 border-yellow-300 shadow-lg mb-2"
              />
            ) : (
              <User className="h-24 w-24 text-white bg-blue-300 rounded-full p-4 mb-2" />
            )}
            <div className="text-lg font-semibold">
              {patientData?.firstName} {patientData?.lastName}
            </div>
            <div className="text-sm">
              {calculateAge(patientData?.dateOfBirth)} years |{' '}
              {patientData?.gender
                ? patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1)
                : null}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg border flex flex-col items-center text-center transition">
          <Shield className="h-10 w-10 text-indigo-500 mb-2" />
          <h3 className="text-lg font-semibold mb-2">Google Verified Clinics</h3>
          <p className="text-gray-500">
            Only trusted, authenticated clinics and hospitals listed. Your health, our priority.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg border flex flex-col items-center text-center transition">
          <Database className="h-10 w-10 text-green-500 mb-2" />
          <h3 className="text-lg font-semibold mb-2">All Health Records</h3>
          <p className="text-gray-500">
            Access and share all your medical records, lab reports, and prescriptions anytime.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg border flex flex-col items-center text-center transition">
          <ClipboardList className="h-10 w-10 text-blue-500 mb-2" />
          <h3 className="text-lg font-semibold mb-2">Seamless Visits & Rx</h3>
          <p className="text-gray-500">
            Prescriptions and doctor visits are managed and organized for you—fast and safe.
          </p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => navigate('/patient/nearby')}
          className="flex items-center gap-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl px-8 py-6 shadow-lg hover:scale-[1.03] transition"
        >
          <MapPin className="h-10 w-10" />
          <div>
            <div className="text-xl font-bold">Find Nearby Clinics</div>
            <div className="text-sm text-blue-100">
              Locate Google-verified clinics closest to you.
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate('/patient/doctors')}
          className="flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl px-8 py-6 shadow-lg hover:scale-[1.03] transition"
        >
          <Users className="h-10 w-10" />
          <div>
            <div className="text-xl font-bold">Find Top Doctors</div>
            <div className="text-sm text-green-100">
              Browse specialists with transparent ratings and profiles.
            </div>
          </div>
        </button>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <HeartPulse className="h-7 w-7 text-pink-500" /> Recent Appointments & Activity
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Future Appointments */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="mb-3 flex gap-2 items-center">
              <Calendar className="h-6 w-6 text-green-600" />
              <span className="text-lg font-semibold">Upcoming Appointments</span>
              <span className="ml-auto bg-green-100 text-green-800 text-sm px-3 py-0.5 rounded-full">
                {futureAppointments.length}
              </span>
            </div>
            {futureAppointments.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No appointments scheduled.</div>
            ) : (
              <div className="space-y-4">
                {futureAppointments.slice(0, 2).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="p-3 rounded-lg border bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition cursor-pointer group"
                    onClick={() => handleAppointmentClick(appointment._id)}
                  >
                    <div>
                      <div className="font-semibold">
                        Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {appointment.doctorId?.specialization}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(appointment.date)} • {formatTime(appointment.startTime)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(appointment.status)}`}
                      >
                        {appointment.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="mb-3 flex gap-2 items-center">
              <Clock className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold">Past Appointments</span>
              <span className="ml-auto bg-blue-100 text-blue-800 text-sm px-3 py-0.5 rounded-full">
                {pastAppointments.length}
              </span>
            </div>
            {pastAppointments.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No past appointments.</div>
            ) : (
              <div className="space-y-4">
                {pastAppointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="p-3 rounded-lg border bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition cursor-pointer group"
                    onClick={() => handleAppointmentClick(appointment._id)}
                  >
                    <div>
                      <div className="font-semibold">
                        Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {appointment.doctorId?.specialization}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(appointment.date)} • {formatTime(appointment.startTime)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(appointment.status)}`}
                      >
                        {appointment.status}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
