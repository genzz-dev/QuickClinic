import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import { getClinicAppointments, updateAppointmentStatus } from '../../service/appointmentApiService';
import { getClinicDoctors } from '../../service/adminApiService'

const AdminAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    doctorId: '',
    date: ''
  });

  // Status options for dropdown
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'no-show', label: 'No Show', color: 'bg-gray-100 text-gray-800' }
  ];

  const tabs = [
    { id: 'all', label: 'All Appointments', count: appointments.length },
    { id: 'upcoming', label: 'Upcoming', count: getUpcomingCount() },
    { id: 'current', label: 'Today', count: getCurrentCount() },
    { id: 'past', label: 'Past', count: getPastCount() }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, filters]);

  const fetchInitialData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        getClinicAppointments(),
        getClinicDoctors()
      ]);
      
      setAppointments(appointmentsRes.appointments || []);
      setDoctors(doctorsRes.doctors || []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const queryParams = { ...filters };
      
      // Add tab-specific filters
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (activeTab) {
        case 'upcoming':
          queryParams.upcoming = 'true';
          break;
        case 'current':
          queryParams.date = today.toISOString().split('T')[0];
          break;
        case 'past':
          queryParams.past = 'true';
          break;
        default:
          break;
      }

      const response = await getClinicAppointments(queryParams);
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [appointmentId]: true }));
      
      await updateAppointmentStatus(appointmentId, { status: newStatus });
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
      alert('Failed to update appointment status');
    } finally {
      setUpdating(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/admin/appointments/${appointmentId}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', doctorId: '', date: '' });
    setSearchTerm('');
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const patientName = `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`.toLowerCase();
    const doctorName = `${appointment.doctorId?.firstName} ${appointment.doctorId?.lastName}`.toLowerCase();
    const reason = appointment.reason?.toLowerCase() || '';
    
    return patientName.includes(searchLower) || 
           doctorName.includes(searchLower) || 
           reason.includes(searchLower);
  });

  function getUpcomingCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter(apt => new Date(apt.date) > today).length;
  }

  function getCurrentCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && aptDate < tomorrow;
    }).length;
  }

  function getPastCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter(apt => new Date(apt.date) < today).length;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinic Appointments</h1>
          <p className="text-gray-600">Manage and track all appointments in your clinic</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search patients, doctors, or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            {/* Doctor Filter */}
            <div className="relative">
              <select
                value={filters.doctorId}
                onChange={(e) => handleFilterChange('doctorId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Doctors</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleAppointmentClick(appointment._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4 mb-3">
                        {/* Patient Info */}
                        <div className="flex items-center space-x-3">
                          {appointment.patientId?.profilePicture ? (
                            <img
                              src={appointment.patientId.profilePicture}
                              alt="Patient"
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiUser className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                            </h3>
                            {appointment.patientId?.phoneNumber && (
                              <p className="text-sm text-gray-500 flex items-center">
                                <FiPhone className="h-4 w-4 mr-1" />
                                {appointment.patientId.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date & Time */}
                        <div className="flex items-center text-sm text-gray-600">
                          <FiCalendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiClock className="h-4 w-4 mr-2" />
                          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                        </div>

                        {/* Doctor */}
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            {appointment.doctorId?.profilePicture ? (
                              <img
                                src={appointment.doctorId.profilePicture}
                                alt="Doctor"
                                className="h-6 w-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                                <FiUser className="h-3 w-3 text-green-600" />
                              </div>
                            )}
                            <span>
                              Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {appointment.reason && (
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      )}

                      {/* Teleconsultation Badge */}
                      {appointment.isTeleconsultation && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                          Teleconsultation
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 ml-4">
                      {/* Status Dropdown */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                          disabled={updating[appointment._id]}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white min-w-[120px]"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updating[appointment._id] && (
                          <FiRefreshCw className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 animate-spin" />
                        )}
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAppointmentClick(appointment._id);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && appointments.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <FiRefreshCw className="animate-spin h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Updating appointments...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
