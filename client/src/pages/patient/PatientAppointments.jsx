import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatientAppointments } from '../../service/appointmentApiService';
import { getPatientAppointmentPrescription } from '../../service/prescriptionApiSevice';
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getPatientAppointments();
      if (response && response.appointments) {
        setAppointments(response.appointments);
        await checkPrescriptionStatus(response.appointments);
      }
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

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

    if (filterStatus !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === filterStatus);
    }

    return filtered;
  }, [appointments, searchTerm, filterStatus]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAppointments} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AppointmentHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        <AppointmentTabs
          appointments={filteredAppointments}
          prescriptionStatus={prescriptionStatus}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAppointmentClick={(id) => navigate(`/patient/appointment/${id}`)}
        />
      </div>
    </div>
  );
};

export default PatientAppointments;
