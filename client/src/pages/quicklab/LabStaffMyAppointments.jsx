import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Home,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  RefreshCw,
  ChevronRight,
  TestTube,
  Upload,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getMyAssignments,
  updateMyAssignmentStatus,
  uploadReportAndComplete,
} from '../../service/labStaffService';
import '../../quicklab.css';

export default function LabStaffMyAppointments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadNotes, setUploadNotes] = useState('');

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
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await getMyAssignments();
      const data = response.data || response;
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getNextAllowedStatuses = (currentStatus) => {
    const statusOrder = ['pending', 'confirmed', 'sample_collected', 'processing', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'cancelled' || currentStatus === 'completed') {
      return [];
    }

    // Staff can move forward or stay in same status
    return statusOrder.slice(currentIndex + 1, currentIndex + 3).filter((s) => s !== 'completed');
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateMyAssignmentStatus(appointmentId, newStatus);
      toast.success('Status updated successfully');
      fetchAssignments();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleUploadReport = async (appointmentId) => {
    if (!reportFile) {
      toast.error('Please select a PDF file');
      return;
    }

    if (!reportFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }

    try {
      setUploadingReport(true);
      await uploadReportAndComplete(appointmentId, reportFile, uploadNotes);
      toast.success('Report uploaded and appointment marked as completed');
      fetchAssignments();
      setShowUploadModal(false);
      setShowDetailModal(false);
      setReportFile(null);
      setUploadNotes('');
    } catch (error) {
      console.error('Failed to upload report:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload report');
    } finally {
      setUploadingReport(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 flex items-center justify-center">
        <div className="card-quicklab p-6 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-lab-yellow-600" />
          <p className="text-lab-black-800 dark:text-lab-black-100">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 p-4 md:p-8 pt-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-lab-black-500 dark:text-lab-black-300">
                Lab Staff
              </p>
              <h1 className="text-3xl font-bold text-lab-black-900 dark:text-lab-black-50">
                My Appointments
              </h1>
              <p className="text-lab-black-600 dark:text-lab-black-300">
                View and manage your assigned appointments
              </p>
            </div>
            <button
              onClick={fetchAssignments}
              className="btn-quicklab-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card-quicklab p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-lab-black-500 dark:text-lab-black-300">Total</p>
                  <p className="text-2xl font-bold text-lab-black-900 dark:text-lab-black-50">
                    {assignments.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-quicklab p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-lab-black-500 dark:text-lab-black-300">Pending</p>
                  <p className="text-2xl font-bold text-lab-black-900 dark:text-lab-black-50">
                    {assignments.filter((a) => a.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-quicklab p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-lab-black-500 dark:text-lab-black-300">Collected</p>
                  <p className="text-2xl font-bold text-lab-black-900 dark:text-lab-black-50">
                    {
                      assignments.filter(
                        (a) => a.status === 'sample_collected' || a.status === 'processing'
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="card-quicklab p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-lab-black-500 dark:text-lab-black-300">Completed</p>
                  <p className="text-2xl font-bold text-lab-black-900 dark:text-lab-black-50">
                    {assignments.filter((a) => a.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="card-quicklab p-4 md:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
              All Assignments
            </h2>

            {assignments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-lab-black-300 dark:text-lab-black-600 mb-4" />
                <p className="text-lab-black-600 dark:text-lab-black-300">
                  No assignments found. Check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="card-quicklab border border-lab-black-200 dark:border-lab-black-700 hover:border-lab-yellow-400 transition-all p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-lab-yellow-100 dark:bg-lab-yellow-900/30 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-lab-yellow-700" />
                            </div>
                            <div>
                              <p className="font-semibold text-lab-black-900 dark:text-lab-black-50">
                                {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                              </p>
                              <p className="text-sm text-lab-black-600 dark:text-lab-black-400">
                                {appointment.patientId?.phoneNumber}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}
                          >
                            {statusLabels[appointment.status]}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-lab-black-700 dark:text-lab-black-200">
                            <Calendar className="w-4 h-4 text-lab-black-500" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-lab-black-700 dark:text-lab-black-200">
                            <Clock className="w-4 h-4 text-lab-black-500" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-lab-black-700 dark:text-lab-black-200">
                            {appointment.collectionType === 'home_collection' ? (
                              <Home className="w-4 h-4 text-lab-black-500" />
                            ) : (
                              <Building2 className="w-4 h-4 text-lab-black-500" />
                            )}
                            <span>
                              {appointment.collectionType === 'home_collection'
                                ? 'Home Collection'
                                : 'Visit Lab'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-lab-black-700 dark:text-lab-black-200">
                            <TestTube className="w-4 h-4 text-lab-black-500" />
                            <span>{appointment.tests?.length || 0} test(s)</span>
                          </div>
                        </div>

                        {/* Address for home collection */}
                        {appointment.collectionType === 'home_collection' &&
                          appointment.collectionAddress && (
                            <div className="flex items-start gap-2 text-sm bg-lab-yellow-50 dark:bg-lab-yellow-900/20 p-3 rounded-lg">
                              <MapPin className="w-4 h-4 text-lab-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-lab-black-700 dark:text-lab-black-200">
                                {appointment.collectionAddress.street},{' '}
                                {appointment.collectionAddress.city},{' '}
                                {appointment.collectionAddress.state}{' '}
                                {appointment.collectionAddress.zipCode}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        className="btn-quicklab-secondary px-3 py-2 text-sm rounded-lg flex items-center gap-2"
                      >
                        Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-lab-black-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-lab-black-800 border-b border-lab-black-200 dark:border-lab-black-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                Appointment Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-lab-black-500 hover:text-lab-black-700 dark:hover:text-lab-black-300"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                  <User className="w-5 h-5" /> Patient Information
                </h4>
                <div className="bg-lab-black-50 dark:bg-lab-black-900 p-4 rounded-lg space-y-2 text-sm">
                  <p className="text-lab-black-700 dark:text-lab-black-200">
                    <strong>Name:</strong> {selectedAppointment.patientId?.firstName}{' '}
                    {selectedAppointment.patientId?.lastName}
                  </p>
                  <p className="text-lab-black-700 dark:text-lab-black-200">
                    <strong>Phone:</strong> {selectedAppointment.patientId?.phoneNumber}
                  </p>
                  {selectedAppointment.patientId?.address && (
                    <p className="text-lab-black-700 dark:text-lab-black-200">
                      <strong>Address:</strong> {selectedAppointment.patientId.address.street},{' '}
                      {selectedAppointment.patientId.address.city}
                    </p>
                  )}
                </div>
              </div>

              {/* Tests */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                  <TestTube className="w-5 h-5" /> Tests
                </h4>
                <div className="space-y-2">
                  {selectedAppointment.tests?.map((test, idx) => (
                    <div
                      key={idx}
                      className="bg-lab-black-50 dark:bg-lab-black-900 p-3 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-lab-black-900 dark:text-lab-black-50">
                          {test.testName}
                        </p>
                        {test.testCode && (
                          <p className="text-sm text-lab-black-600 dark:text-lab-black-400">
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

              {/* Appointment Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Appointment Details
                </h4>
                <div className="bg-lab-black-50 dark:bg-lab-black-900 p-4 rounded-lg space-y-2 text-sm">
                  <p className="text-lab-black-700 dark:text-lab-black-200">
                    <strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}
                  </p>
                  <p className="text-lab-black-700 dark:text-lab-black-200">
                    <strong>Time:</strong> {selectedAppointment.appointmentTime}
                  </p>
                  <p className="text-lab-black-700 dark:text-lab-black-200">
                    <strong>Type:</strong>{' '}
                    {selectedAppointment.collectionType === 'home_collection'
                      ? 'Home Collection'
                      : 'Visit Lab'}
                  </p>
                  <p className="text-lab-black-700 dark:text-lab-black-200">
                    <strong>Status:</strong>{' '}
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[selectedAppointment.status]}`}
                    >
                      {statusLabels[selectedAppointment.status]}
                    </span>
                  </p>
                </div>
              </div>

              {/* Collection Address */}
              {selectedAppointment.collectionType === 'home_collection' &&
                selectedAppointment.collectionAddress && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                      <MapPin className="w-5 h-5" /> Collection Address
                    </h4>
                    <div className="bg-lab-yellow-50 dark:bg-lab-yellow-900/20 p-4 rounded-lg text-sm text-lab-black-700 dark:text-lab-black-200">
                      <p>{selectedAppointment.collectionAddress.street}</p>
                      <p>
                        {selectedAppointment.collectionAddress.city},{' '}
                        {selectedAppointment.collectionAddress.state}{' '}
                        {selectedAppointment.collectionAddress.zipCode}
                      </p>
                      <p>{selectedAppointment.collectionAddress.country}</p>
                    </div>
                  </div>
                )}

              {/* Status Update Actions */}
              {selectedAppointment.status !== 'completed' &&
                selectedAppointment.status !== 'cancelled' && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Update Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getNextAllowedStatuses(selectedAppointment.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(selectedAppointment._id, status)}
                          disabled={updatingStatus}
                          className="btn-quicklab-primary px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          {updatingStatus ? 'Updating...' : `Mark as ${statusLabels[status]}`}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-lab-black-500 dark:text-lab-black-400">
                      Note: You cannot move back to a previous status once updated.
                    </p>
                  </div>
                )}

              {/* Upload Report and Complete */}
              {selectedAppointment.status === 'processing' && (
                <div className="space-y-3 border-t border-lab-black-200 dark:border-lab-black-700 pt-4">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Complete Appointment
                  </h4>
                  <p className="text-sm text-lab-black-600 dark:text-lab-black-400">
                    Upload the lab report PDF to mark this appointment as completed.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-quicklab-primary px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Report & Complete
                  </button>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lab-black-900 dark:text-lab-black-50">Notes</h4>
                  <p className="text-sm text-lab-black-700 dark:text-lab-black-200 bg-lab-black-50 dark:bg-lab-black-900 p-4 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-lab-black-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-lab-black-900 dark:text-lab-black-50">
                Upload Lab Report
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setReportFile(null);
                  setUploadNotes('');
                }}
                className="text-lab-black-500 hover:text-lab-black-700 dark:text-lab-black-400 dark:hover:text-lab-black-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-lab-black-700 dark:text-lab-black-300 mb-2">
                  Select PDF Report
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setReportFile(e.target.files[0])}
                  className="block w-full text-sm text-lab-black-900 dark:text-lab-black-100
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-lab-yellow-500 file:text-white
                    hover:file:bg-lab-yellow-600
                    file:cursor-pointer cursor-pointer
                    border border-lab-black-300 dark:border-lab-black-600 rounded-lg p-2
                    bg-lab-black-50 dark:bg-lab-black-700"
                />
                {reportFile && (
                  <p className="mt-2 text-sm text-lab-black-600 dark:text-lab-black-400">
                    Selected: {reportFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-lab-black-700 dark:text-lab-black-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Add any notes about the report..."
                  className="w-full px-3 py-2 border border-lab-black-300 dark:border-lab-black-600 rounded-lg
                    bg-lab-black-50 dark:bg-lab-black-700
                    text-lab-black-900 dark:text-lab-black-100
                    placeholder-lab-black-400 dark:placeholder-lab-black-500
                    focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                  rows="3"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-lab-black-200 dark:border-lab-black-700">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setReportFile(null);
                  setUploadNotes('');
                }}
                className="flex-1 px-4 py-2 border border-lab-black-300 dark:border-lab-black-600 
                  text-lab-black-700 dark:text-lab-black-300 rounded-lg hover:bg-lab-black-50 dark:hover:bg-lab-black-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadReport(selectedAppointment?._id)}
                disabled={!reportFile || uploadingReport}
                className="flex-1 btn-quicklab-primary px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload & Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
