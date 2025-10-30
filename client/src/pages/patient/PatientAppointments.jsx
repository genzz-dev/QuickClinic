import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientAppointments } from '../../service/appointmentApiService';
import { getPatientAppointmentPrescription } from '../../service/prescriptionApiSevice';
import AppointmentStats from '../../components/Patient/PatientAppointments/AppointmentStats';
import AppointmentTabs from '../../components/Patient/PatientAppointments/AppointmentTabs';
import AppointmentHeader from '../../components/Patient/PatientAppointments/AppointmentHeader';
import ErrorState from '../../components/Patient/PatientAppointments/ErrorState';
import Loading from '../../components/ui/Loading';
const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptionStatus, setPrescriptionStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  const navigate = useNavigate();

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch appointments function
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getPatientAppointments();

      if (response && response.appointments) {
        setAppointments(response.appointments);
        // Check prescription status for each appointment
        await checkPrescriptionStatus(response.appointments);
      }
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check prescription status for appointments
  const checkPrescriptionStatus = async (appointmentList) => {
    const prescriptionStatusMap = {};

    const statusChecks = appointmentList.map(async (appointment) => {
      try {
        await getPatientAppointmentPrescription(appointment._id);
        prescriptionStatusMap[appointment._id] = true;
      } catch (err) {
        prescriptionStatusMap[appointment._id] = false;
        console.log(err);
      }
    });

    await Promise.all(statusChecks);
    setPrescriptionStatus(prescriptionStatusMap);
  };

  // Filter and search appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.doctorId?.firstName?.toLowerCase().includes(term) ||
          appointment.doctorId?.lastName?.toLowerCase().includes(term) ||
          appointment.doctorId?.specialization?.toLowerCase().includes(term) ||
          appointment.clinicId?.name?.toLowerCase().includes(term) ||
          appointment.reason?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === filterStatus);
    }

    return filtered;
  }, [appointments, searchTerm, filterStatus]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <AppointmentHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {/* Error State */}
        {error && <ErrorState error={error} />}

        {/* Main Content */}
        <AppointmentTabs
          appointments={filteredAppointments}
          prescriptionStatus={prescriptionStatus}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAppointmentClick={(appointmentId) => navigate(`/patient/appointment/${appointmentId}`)}
        />

        {/* Quick Stats */}
        <AppointmentStats
          appointments={appointments}
          filteredAppointments={filteredAppointments}
          prescriptionStatus={prescriptionStatus}
        />
      </div>
    </div>
  );
};

export default PatientAppointments;
