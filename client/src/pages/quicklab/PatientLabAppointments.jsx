import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Home,
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  TestTube,
  FileText,
  User,
  Download,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getPatientLabAppointments } from '../../service/labAppointmentService';
import '../../quicklab.css';

export default function PatientLabAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'all', collectionType: 'all' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    sample_collected: 'Sample Collected',
    processing: 'Processing',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getPatientLabAppointments();
      const data = response.data || response;
      setAppointments(data.appointments || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch lab appointments:', err);
      setError('Failed to load lab appointments');
      toast.error('Failed to load lab appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return appointments.filter((appt) => {
      if (filters.status !== 'all' && appt.status !== filters.status) return false;
      if (filters.collectionType !== 'all' && appt.collectionType !== filters.collectionType)
        return false;

      if (term) {
        const matchesLab = appt.labId?.name?.toLowerCase().includes(term);
        const matchesTest = appt.tests?.some((t) => t.testName?.toLowerCase().includes(term));
        return matchesLab || matchesTest;
      }
      return true;
    });
  }, [appointments, filters, searchTerm]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const upcomingCount = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed' || a.status === 'sample_collected'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 flex items-center justify-center">
        <div className="card-quicklab p-6 flex items-center gap-3">
          <Clock className="w-5 h-5 animate-spin text-lab-yellow-600" />
          <p className="text-lab-black-800 dark:text-lab-black-100">
            Loading your lab appointments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 flex items-center justify-center">
        <div className="card-quicklab p-6 space-y-3 text-center">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
          <p className="text-lab-black-800 dark:text-lab-black-50">{error}</p>
          <button onClick={fetchAppointments} className="btn-quicklab-primary px-4 py-2 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-lab-black-500 dark:text-lab-black-300">
              My Lab Appointments
            </p>
            <h1 className="text-3xl font-bold text-lab-black-900 dark:text-lab-black-50">
              Track tests & reports
            </h1>
            <p className="text-lab-black-600 dark:text-lab-black-300">
              View collection details, assigned staff, and download your reports.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="card-quicklab p-3 text-center">
              <p className="text-xs text-lab-black-500 dark:text-lab-black-400">Total</p>
              <p className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                {appointments.length}
              </p>
            </div>
            <div className="card-quicklab p-3 text-center">
              <p className="text-xs text-lab-black-500 dark:text-lab-black-400">Upcoming</p>
              <p className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                {upcomingCount}
              </p>
            </div>
            <div className="card-quicklab p-3 text-center">
              <p className="text-xs text-lab-black-500 dark:text-lab-black-400">Completed</p>
              <p className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                {appointments.filter((a) => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-quicklab p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by lab name or test"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-lab-black-200 dark:border-lab-black-700 bg-white dark:bg-lab-black-800 text-lab-black-900 dark:text-lab-black-50 focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-lab-black-200 dark:border-lab-black-700 bg-white dark:bg-lab-black-800 text-lab-black-900 dark:text-lab-black-50 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="sample_collected">Sample Collected</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.collectionType}
              onChange={(e) => setFilters((prev) => ({ ...prev, collectionType: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-lab-black-200 dark:border-lab-black-700 bg-white dark:bg-lab-black-800 text-lab-black-900 dark:text-lab-black-50 focus:outline-none"
            >
              <option value="all">All collection types</option>
              <option value="home_collection">Home Collection</option>
              <option value="visit_lab">Visit Lab</option>
            </select>
          </div>
        </div>

        {/* Appointments list */}
        {filteredAppointments.length === 0 ? (
          <div className="card-quicklab p-8 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-lab-black-400 dark:text-lab-black-500 mx-auto" />
            <p className="text-lab-black-700 dark:text-lab-black-200">No lab appointments found</p>
            <p className="text-sm text-lab-black-500 dark:text-lab-black-400">
              Try clearing filters or book a new test.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="card-quicklab border border-lab-black-200 dark:border-lab-black-700 hover:border-lab-yellow-400 transition-all p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                        {appointment.labId?.name || 'Lab'}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-lab-black-100 dark:bg-lab-black-800 text-lab-black-700 dark:text-lab-black-200">
                        {appointment.collectionType === 'home_collection'
                          ? 'Home collection'
                          : 'Visit lab'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-lab-black-700 dark:text-lab-black-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-lab-black-500" />
                        <span>{formatDate(appointment.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-lab-black-500" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-lab-black-500" />
                        <span>{appointment.tests?.length || 0} test(s)</span>
                      </div>
                    </div>

                    {appointment.collectionType === 'home_collection' &&
                      appointment.collectionAddress && (
                        <div className="flex items-start gap-2 text-sm text-lab-black-700 dark:text-lab-black-300">
                          <MapPin className="w-4 h-4 text-lab-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>
                            {appointment.collectionAddress.street},{' '}
                            {appointment.collectionAddress.city},
                            {appointment.collectionAddress.state}{' '}
                            {appointment.collectionAddress.zipCode}
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm text-lab-black-600 dark:text-lab-black-400">
                      Total: <span className="font-semibold">₹{appointment.totalAmount}</span>
                    </p>
                    <p className="text-xs text-lab-black-500 dark:text-lab-black-400">
                      Payment: {appointment.paymentStatus || 'pending'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowDetailModal(true);
                      }}
                      className="btn-quicklab-secondary px-3 py-2 text-sm rounded-lg"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-lab-black-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-lab-black-800 border-b border-lab-black-200 dark:border-lab-black-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                {selectedAppointment.labId?.name || 'Lab Appointment'}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-lab-black-500 hover:text-lab-black-700 dark:hover:text-lab-black-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[selectedAppointment.status]}`}
                >
                  {statusLabels[selectedAppointment.status]}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-lab-black-100 dark:bg-lab-black-800 text-lab-black-700 dark:text-lab-black-200">
                  {selectedAppointment.collectionType === 'home_collection'
                    ? 'Home collection'
                    : 'Visit lab'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-lab-black-100 dark:bg-lab-black-800 text-lab-black-700 dark:text-lab-black-200">
                  Payment: {selectedAppointment.paymentStatus || 'pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-quicklab p-4 space-y-2">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Schedule
                  </h4>
                  <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lab-black-500" />{' '}
                    {formatDate(selectedAppointment.appointmentDate)}
                  </p>
                  <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-lab-black-500" />{' '}
                    {selectedAppointment.appointmentTime}
                  </p>
                  <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-lab-black-500" />{' '}
                    {selectedAppointment.tests?.length || 0} tests
                  </p>
                </div>

                <div className="card-quicklab p-4 space-y-2">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Lab details
                  </h4>
                  <p className="text-sm text-lab-black-700 dark:text-lab-black-200">
                    {selectedAppointment.labId?.name}
                  </p>
                  {selectedAppointment.labId?.address && (
                    <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-lab-yellow-600 mt-0.5" />
                      <span>
                        {selectedAppointment.labId.address.street},{' '}
                        {selectedAppointment.labId.address.city},
                        {selectedAppointment.labId.address.state}{' '}
                        {selectedAppointment.labId.address.zipCode}
                      </span>
                    </p>
                  )}
                  {selectedAppointment.labId?.contact?.phone && (
                    <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-lab-yellow-600" />{' '}
                      {selectedAppointment.labId.contact.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Collection Address / Staff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-quicklab p-4 space-y-2">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    {selectedAppointment.collectionType === 'home_collection' ? (
                      <Home className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                    {selectedAppointment.collectionType === 'home_collection'
                      ? 'Home collection address'
                      : 'Visit lab'}
                  </h4>
                  {selectedAppointment.collectionType === 'home_collection' &&
                  selectedAppointment.collectionAddress ? (
                    <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-lab-yellow-600 mt-0.5" />
                      <span>
                        {selectedAppointment.collectionAddress.street},{' '}
                        {selectedAppointment.collectionAddress.city},
                        {selectedAppointment.collectionAddress.state}{' '}
                        {selectedAppointment.collectionAddress.zipCode}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-lab-black-700 dark:text-lab-black-200">
                      Please arrive 10 minutes before the scheduled time.
                    </p>
                  )}
                </div>

                <div className="card-quicklab p-4 space-y-2">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    <User className="w-5 h-5" /> Assigned staff
                  </h4>
                  {selectedAppointment.assignedStaffId ? (
                    <>
                      <p className="text-sm text-lab-black-700 dark:text-lab-black-200 font-medium">
                        {selectedAppointment.assignedStaffId.firstName}{' '}
                        {selectedAppointment.assignedStaffId.lastName}
                      </p>
                      {selectedAppointment.assignedStaffId.phoneNumber && (
                        <p className="text-sm text-lab-black-700 dark:text-lab-black-200 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-lab-yellow-600" />
                          {selectedAppointment.assignedStaffId.phoneNumber}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-lab-black-600 dark:text-lab-black-300">
                      Staff assignment will appear once confirmed.
                    </p>
                  )}
                </div>
              </div>

              {/* Tests list */}
              <div className="card-quicklab p-4 space-y-3">
                <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                  <TestTube className="w-5 h-5" /> Tests
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAppointment.tests?.map((test, idx) => (
                    <div
                      key={idx}
                      className="bg-lab-black-50 dark:bg-lab-black-900 p-3 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-lab-black-900 dark:text-lab-black-50">
                          {test.testName}
                        </p>
                        {test.testCode && (
                          <p className="text-xs text-lab-black-600 dark:text-lab-black-400">
                            Code: {test.testCode}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-lab-black-900 dark:text-lab-black-50">
                        ₹{test.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Report */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-quicklab p-4 space-y-2">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Notes
                  </h4>
                  <p className="text-sm text-lab-black-700 dark:text-lab-black-200">
                    {selectedAppointment.notes || 'No additional notes'}
                  </p>
                </div>

                <div className="card-quicklab p-4 space-y-2">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Report
                  </h4>
                  {selectedAppointment.reportId?.reportFile?.url ? (
                    <a
                      href={selectedAppointment.reportId.reportFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-quicklab-primary"
                    >
                      <Download className="w-4 h-4" /> Download report
                    </a>
                  ) : (
                    <p className="text-sm text-lab-black-700 dark:text-lab-black-200">
                      Report will be available after completion.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
