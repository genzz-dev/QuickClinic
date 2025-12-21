import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  FileText,
  Filter,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Building2,
  ChevronDown,
  Search,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getLabAppointments,
  assignStaffForCollection,
  updateLabAppointmentStatus,
} from '../../service/labAppointmentService';
import { getLabStaff } from '../../service/labAdminService';
import '../../quicklab.css';

export default function LabAdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    collectionType: '',
    date: '',
  });

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    homeCollection: 0,
    visitLab: 0,
  });

  const statusColors = {
    pending:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    confirmed:
      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    sample_collected:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    processing:
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    completed:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
    cancelled:
      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: AlertCircle },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { value: 'sample_collected', label: 'Sample Collected', icon: FileText },
    { value: 'processing', label: 'Processing', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  useEffect(() => {
    fetchAppointments();
    fetchStaff();
  }, [filters.status, filters.collectionType, filters.date]);

  useEffect(() => {
    applyFilters();
  }, [appointments, searchQuery]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.collectionType) params.collectionType = filters.collectionType;
      if (filters.date) params.date = filters.date;

      const response = await getLabAppointments(params);
      const data = response.data || response;
      setAppointments(data.appointments || []);
      calculateSummary(data.appointments || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getLabStaff();
      const data = response.data || response;
      setStaff(data.staff || []);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      toast.error('Failed to load staff list');
    }
  };

  const calculateSummary = (appts) => {
    const sum = {
      total: appts.length,
      pending: appts.filter((a) => a.status === 'pending').length,
      confirmed: appts.filter((a) => a.status === 'confirmed').length,
      completed: appts.filter((a) => a.status === 'completed').length,
      cancelled: appts.filter((a) => a.status === 'cancelled').length,
      homeCollection: appts.filter((a) => a.collectionType === 'home_collection').length,
      visitLab: appts.filter((a) => a.collectionType === 'visit_lab').length,
    };
    setSummary(sum);
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patientId?.firstName?.toLowerCase().includes(query) ||
          apt.patientId?.lastName?.toLowerCase().includes(query) ||
          apt.tests?.some((test) => test.testName?.toLowerCase().includes(query)) ||
          apt._id?.toLowerCase().includes(query)
      );
    }

    // Debug: Log first appointment with home collection
    const homeCollectionApt = filtered.find((a) => a.collectionType === 'home_collection');
    if (homeCollectionApt) {
      console.log('Home Collection Appointment:', homeCollectionApt);
      console.log('Collection Address:', homeCollectionApt.collectionAddress);
    }

    setFilteredAppointments(filtered);
  };

  const handleAssignStaff = async (staffId) => {
    try {
      await assignStaffForCollection(selectedAppointment._id, staffId);
      toast.success('Staff assigned successfully');
      setShowAssignModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign staff');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await updateLabAppointmentStatus(selectedAppointment._id, newStatus);
      toast.success('Status updated successfully');
      setShowStatusModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-white to-lab-black-50 dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 pt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-lab-black-900 dark:text-lab-black-50 mb-2">
            Appointment Management
          </h1>
          <p className="text-lab-black-600 dark:text-lab-black-400">
            Manage and track all lab appointments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-lab-black-900 dark:text-lab-black-50">
              {summary.total}
            </div>
            <div className="text-sm text-lab-black-600 dark:text-lab-black-400">Total</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
              {summary.pending}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-500">Pending</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-400">
              {summary.confirmed}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-500">Confirmed</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-green-800 dark:text-green-400">
              {summary.completed}
            </div>
            <div className="text-sm text-green-600 dark:text-green-500">Completed</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-red-800 dark:text-red-400">
              {summary.cancelled}
            </div>
            <div className="text-sm text-red-600 dark:text-red-500">Cancelled</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-400">
              {summary.homeCollection}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-500">Home</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 transition-colors">
            <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-400">
              {summary.visitLab}
            </div>
            <div className="text-sm text-indigo-600 dark:text-indigo-500">Lab Visit</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 rounded-lg p-4 mb-6 transition-colors">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lab-black-400 dark:text-lab-black-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, test name, or appointment ID..."
                className="w-full pl-10 pr-4 py-2 border border-lab-black-300 dark:border-lab-black-600 rounded-lg bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 transition-colors"
              >
                <option value="">All Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.collectionType}
                onChange={(e) => setFilters({ ...filters, collectionType: e.target.value })}
                className="px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 transition-colors"
              >
                <option value="">All Types</option>
                <option value="home_collection">Home Collection</option>
                <option value="visit_lab">Lab Visit</option>
              </select>

              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 transition-colors"
              />

              {(filters.status || filters.collectionType || filters.date) && (
                <button
                  onClick={() => setFilters({ status: '', collectionType: '', date: '' })}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-lab-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lab-black-600 dark:text-lab-black-400">
              Loading appointments...
            </p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 rounded-lg p-12 text-center transition-colors">
            <FileText className="w-16 h-16 text-lab-black-300 dark:text-lab-black-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-lab-black-900 dark:text-lab-black-50 mb-2">
              No appointments found
            </h3>
            <p className="text-lab-black-600 dark:text-lab-black-400">
              {searchQuery || filters.status || filters.collectionType || filters.date
                ? 'Try adjusting your filters'
                : 'No appointments have been booked yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 rounded-lg p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Patient & Appointment Info */}
                  <div className="flex-1 space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[appointment.status]}`}
                      >
                        {appointment.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.collectionType === 'home_collection'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {appointment.collectionType === 'home_collection' ? (
                          <span className="flex items-center gap-1">
                            <Home className="w-4 h-4" /> Home Collection
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" /> Lab Visit
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-lab-black-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-lab-black-900">
                          {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                        </p>
                        <p className="text-sm text-lab-black-600 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {appointment.patientId?.phoneNumber}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-lab-black-700">
                        <Calendar className="w-5 h-5 text-lab-yellow-600" />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-lab-black-700">
                        <Clock className="w-5 h-5 text-lab-yellow-600" />
                        <span>{formatTime(appointment.appointmentTime)}</span>
                      </div>
                    </div>

                    {/* Collection Address (for home collection) */}
                    {appointment.collectionType === 'home_collection' &&
                      appointment.collectionAddress && (
                        <div className="flex items-start gap-2 text-lab-black-700 dark:text-lab-black-300 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-3 rounded-lg transition-colors">
                          <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-purple-900 dark:text-purple-300">
                              Home Collection Address
                            </div>
                            <div className="text-lab-black-700 dark:text-lab-black-300">
                              {formatAddress(appointment.collectionAddress)}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Debug: Show if home collection but no address */}
                    {appointment.collectionType === 'home_collection' &&
                      !appointment.collectionAddress && (
                        <div className="flex items-start gap-2 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg transition-colors">
                          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium">No collection address provided</div>
                            <div className="text-xs">Patient needs to provide their address</div>
                          </div>
                        </div>
                      )}

                    {/* Assigned Staff */}
                    {appointment.assignedStaffId && (
                      <div className="flex items-center gap-2 text-lab-black-700 bg-blue-50 p-3 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">
                          Assigned to: {appointment.assignedStaffId.firstName}{' '}
                          {appointment.assignedStaffId.lastName}
                        </span>
                      </div>
                    )}

                    {/* Tests */}
                    <div>
                      <p className="text-sm font-semibold text-lab-black-900 mb-2">
                        Tests Ordered:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.tests?.map((test, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 bg-lab-yellow-50 border border-lab-yellow-200 rounded-lg text-sm"
                          >
                            <span className="font-medium">{test.testName}</span>
                            <span className="text-lab-black-600 ml-2">₹{test.price}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-lab-black-900 mt-2">
                        Total: ₹{appointment.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex lg:flex-col gap-2 lg:w-48">
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowStatusModal(true);
                      }}
                      className="flex-1 lg:w-full px-4 py-2 bg-lab-yellow-500 hover:bg-lab-yellow-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Update Status
                    </button>

                    {appointment.collectionType === 'home_collection' &&
                      !appointment.assignedStaffId && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowAssignModal(true);
                          }}
                          className="flex-1 lg:w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Assign Staff
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white dark:bg-lab-black-800 rounded-lg shadow-2xl max-w-md w-full p-6 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                Assign Staff Member
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-lab-black-500 dark:text-lab-black-400 hover:text-lab-black-800 dark:hover:text-lab-black-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {staff.filter((s) => s.isAvailableForHomeCollection).length === 0 ? (
                <p className="text-center text-lab-black-600 dark:text-lab-black-400 py-4">
                  No staff available for home collection
                </p>
              ) : (
                staff
                  .filter((s) => s.isAvailableForHomeCollection)
                  .map((staffMember) => (
                    <button
                      key={staffMember._id}
                      onClick={() => handleAssignStaff(staffMember._id)}
                      className="w-full p-4 border border-lab-black-200 dark:border-lab-black-700 bg-white dark:bg-lab-black-900 rounded-lg hover:border-lab-yellow-500 hover:bg-lab-yellow-50 dark:hover:bg-lab-yellow-900/20 transition-all text-left"
                    >
                      <p className="font-semibold text-lab-black-900 dark:text-lab-black-50">
                        {staffMember.firstName} {staffMember.lastName}
                      </p>
                      <p className="text-sm text-lab-black-600 dark:text-lab-black-400">
                        {staffMember.phoneNumber}
                      </p>
                      {staffMember.specialization && (
                        <p className="text-sm text-lab-black-500 dark:text-lab-black-500 mt-1">
                          {staffMember.specialization}
                        </p>
                      )}
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedAppointment && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="bg-white dark:bg-lab-black-800 rounded-lg shadow-2xl max-w-md w-full p-6 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                Update Appointment Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-lab-black-500 dark:text-lab-black-400 hover:text-lab-black-800 dark:hover:text-lab-black-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-lab-black-600 dark:text-lab-black-400 mb-4">
              Current status:{' '}
              <span className="font-semibold">
                {selectedAppointment.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </p>

            <div className="space-y-2">
              {statusOptions
                .filter((opt) => opt.value !== selectedAppointment.status)
                .map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleUpdateStatus(option.value)}
                      className="w-full p-3 border border-lab-black-200 dark:border-lab-black-700 bg-white dark:bg-lab-black-900 rounded-lg hover:border-lab-yellow-500 hover:bg-lab-yellow-50 dark:hover:bg-lab-yellow-900/20 transition-all text-left flex items-center gap-3"
                    >
                      <Icon className="w-5 h-5 text-lab-yellow-600 dark:text-lab-yellow-500" />
                      <span className="font-medium text-lab-black-900 dark:text-lab-black-50">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
