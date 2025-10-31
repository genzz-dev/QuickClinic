import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Filter,
  Clock,
  CheckCircle,
  FileText,
  MapPin,
  User,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { getPatientAppointments } from '../../service/appointmentApiService';
import { getPatientAppointmentPrescription } from '../../service/prescriptionApiSevice';
import AppointmentStats from '../../components/Patient/PatientAppointments/AppointmentStats';
import AppointmentTabs from '../../components/Patient/PatientAppointments/AppointmentTabs';
import AppointmentHeader from '../../components/Patient/PatientAppointments/AppointmentHeader';
import ErrorState from '../../components/Patient/PatientAppointments/ErrorState';
import Loading from '../../components/ui/Loading';

/**
 * PatientAppointments Component
 * Main component for displaying and managing patient appointments
 *
 * Features:
 * - View upcoming, today's, and past appointments
 * - Search and filter appointments
 * - Check prescription status
 * - Navigate to appointment details
 *
 * @returns {JSX.Element} Patient appointments page
 */
const PatientAppointments = () => {
  // State management
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptionStatus, setPrescriptionStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');

  const navigate = useNavigate();

  /**
   * Fetch appointments from API
   * Loads all appointments and checks prescription status
   */
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPatientAppointments();

      if (response?.appointments && Array.isArray(response.appointments)) {
        setAppointments(response.appointments);
        await checkPrescriptionStatus(response.appointments);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err?.message || 'Failed to fetch appointments. Please try again.';
      setError(errorMessage);
      console.error('[PatientAppointments] Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check prescription availability for each appointment
   * @param {Array} appointmentList - List of appointments to check
   */
  const checkPrescriptionStatus = async (appointmentList) => {
    if (!Array.isArray(appointmentList) || appointmentList.length === 0) {
      return;
    }

    const prescriptionStatusMap = {};

    const statusChecks = appointmentList.map(async (appointment) => {
      if (!appointment?._id) {
        console.warn('[PatientAppointments] Invalid appointment object:', appointment);
        return;
      }

      try {
        await getPatientAppointmentPrescription(appointment._id);
        prescriptionStatusMap[appointment._id] = true;
      } catch (err) {
        prescriptionStatusMap[appointment._id] = false;
        // Only log if it's not a 404 (prescription not found is expected)
        if (err?.response?.status !== 404) {
          console.warn(
            `[PatientAppointments] Error checking prescription for appointment ${appointment._id}:`,
            err
          );
        }
      }
    });

    await Promise.all(statusChecks);
    setPrescriptionStatus(prescriptionStatusMap);
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /**
   * Filter and search appointments based on search term and status
   * Memoized for performance optimization
   */
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((appointment) => {
        const doctorFirstName = appointment.doctorId?.firstName?.toLowerCase() || '';
        const doctorLastName = appointment.doctorId?.lastName?.toLowerCase() || '';
        const specialization = appointment.doctorId?.specialization?.toLowerCase() || '';
        const clinicName = appointment.clinicId?.name?.toLowerCase() || '';
        const reason = appointment.reason?.toLowerCase() || '';

        return (
          doctorFirstName.includes(term) ||
          doctorLastName.includes(term) ||
          specialization.includes(term) ||
          clinicName.includes(term) ||
          reason.includes(term)
        );
      });
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((appointment) => appointment.status === filterStatus);
    }

    return filtered;
  }, [appointments, searchTerm, filterStatus]);

  /**
   * Calculate appointment statistics
   * Memoized for performance optimization
   */
  const stats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((a) => a.status === 'scheduled').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const withPrescription = Object.values(prescriptionStatus).filter(Boolean).length;

    return { total, upcoming, completed, withPrescription };
  }, [appointments, prescriptionStatus]);

  /**
   * Get appointments filtered by active tab
   * Filters by date and status based on tab selection
   */
  const tabAppointments = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.date);

      if (activeTab === 'upcoming') {
        return aptDate >= today && apt.status === 'scheduled';
      } else if (activeTab === 'today') {
        return aptDate.toDateString() === today.toDateString();
      } else if (activeTab === 'past') {
        return aptDate < today || apt.status === 'completed';
      }
      return true;
    });
  }, [filteredAppointments, activeTab]);

  /**
   * Handle appointment card click
   * @param {string} appointmentId - ID of the appointment to view
   */
  const handleAppointmentClick = useCallback(
    (appointmentId) => {
      if (!appointmentId) {
        console.error('[PatientAppointments] Invalid appointment ID');
        return;
      }
      navigate(`/patient/appointment/${appointmentId}`);
    },
    [navigate]
  );

  /**
   * Handle search input change
   * @param {Event} e - Input change event
   */
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  /**
   * Handle filter status change
   * @param {Event} e - Select change event
   */
  const handleFilterChange = useCallback((e) => {
    setFilterStatus(e.target.value);
  }, []);

  /**
   * Handle tab change
   * @param {string} tab - Tab identifier
   */
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Loading state
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage and view your medical appointments
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search by doctor, clinic..."
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Search appointments"
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm"
              />
            </div>

            <div className="relative sm:w-44">
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={filterStatus}
                onChange={handleFilterChange}
                aria-label="Filter by status"
                className="w-full h-11 pl-10 pr-8 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none bg-white cursor-pointer text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchAppointments}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              aria-label="Retry fetching appointments"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8" role="tablist">
              {[
                  { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
                { id: 'today', label: 'Today', count: tabCounts.today },
                { id: 'past', label: 'Past', count: tabCounts.past },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      aria-label={`${tab.count} ${tab.label.toLowerCase()} appointments`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 min-h-96"
          role="tabpanel"
          id={`${activeTab}-panel`}
          aria-labelledby={`${activeTab}-tab`}
        >
          {tabAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No {activeTab} appointments
              </h3>
              <p className="text-gray-600 mb-6 max-w-md text-sm">
                {searchTerm || filterStatus !== 'all'
                  ? 'No appointments match your search criteria.'
                  : `You have no ${activeTab} appointments.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tabAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  hasPrescription={prescriptionStatus[appointment._id]}
                  onClick={() => handleAppointmentClick(appointment._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<Calendar className="w-5 h-5" />}
            iconBg="bg-gray-100"
            iconColor="text-gray-600"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={<Clock className="w-5 h-5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-5 h-5" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            label="With Prescription"
            value={stats.withPrescription}
            icon={<FileText className="w-5 h-5" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * AppointmentCard Component
 * Displays individual appointment information
 *
 * @param {Object} props - Component props
 * @param {Object} props.appointment - Appointment data
 * @param {boolean} props.hasPrescription - Whether prescription is available
 * @param {Function} props.onClick - Click handler
 */
const AppointmentCard = ({ appointment, hasPrescription, onClick }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        label: 'Pending',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
      },
      completed: {
        label: 'Completed',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
      },
      cancelled: {
        label: 'Cancelled',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      },
    };

    const config = statusConfig[status] || statusConfig.scheduled;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 ${config.bg} ${config.text} rounded text-xs font-medium border ${config.border}`}
      >
        ⏱ {config.label}
      </span>
    );
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'NA';
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer bg-white"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-label={`View appointment with Dr. ${appointment.doctorId?.firstName} ${appointment.doctorId?.lastName}`}
    >
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(appointment.doctorId?.firstName, appointment.doctorId?.lastName)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              Dr. {appointment.doctorId?.firstName || 'N/A'} {appointment.doctorId?.lastName || ''}
            </h3>
            <p className="text-gray-600 text-xs capitalize">
              {appointment.doctorId?.specialization || 'General'}
            </p>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      {/* Date and Time */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <span className="text-sm">{appointment.date || 'N/A'}</span>
          <Clock className="w-4 h-4 text-gray-400 ml-1" aria-hidden="true" />
          <span className="text-sm">{appointment.time || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <span className="text-sm">{appointment.clinicId?.name || 'N/A'}</span>
        </div>
        {appointment.visitType && (
          <div className="flex items-center gap-2 text-blue-600">
            <User className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">{appointment.visitType}</span>
          </div>
        )}
      </div>

      {/* Reason */}
      {appointment.reason && (
        <div className="mb-3 pb-3 border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Reason:</p>
          <p className="text-sm text-gray-900">{appointment.reason}</p>
        </div>
      )}

      {/* Prescription Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
          <span className="text-xs text-gray-600">
            Prescription: {hasPrescription ? 'Available' : 'Not available'}
          </span>
        </div>
        {hasPrescription && (
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="View prescription"
            onClick={(e) => {
              e.stopPropagation();
              // Handle prescription view
            }}
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * StatCard Component
 * Displays appointment statistics
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Stat label
 * @param {number} props.value - Stat value
 * @param {JSX.Element} props.icon - Icon component
 * @param {string} props.iconBg - Icon background color class
 * @param {string} props.iconColor - Icon color class
 */
const StatCard = ({ label, value, icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${iconBg} ${iconColor} rounded-lg p-2.5`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;
