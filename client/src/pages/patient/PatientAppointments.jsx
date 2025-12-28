import { useEffect, useMemo, useState } from 'react';
import {
  Home,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  TestTube,
  AlertCircle,
  XCircle,
  CheckCircle,
  User,
  Download,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatientAppointments } from '../../service/appointmentApiService';
import { getPatientAppointmentPrescription } from '../../service/prescriptionApiSevice';
import { getPatientLabAppointments } from '../../service/labAppointmentService';
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
  const [labAppointments, setLabAppointments] = useState([]);
  const [labLoading, setLabLoading] = useState(true);
  const [labError, setLabError] = useState(null);
  const [activeSection, setActiveSection] = useState('doctor');
  const [labSearchTerm, setLabSearchTerm] = useState('');
  const [labStatusFilter, setLabStatusFilter] = useState('all');
  const [labCollectionFilter, setLabCollectionFilter] = useState('all');
  const [selectedLabAppointment, setSelectedLabAppointment] = useState(null);
  const [showLabModal, setShowLabModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
    fetchLabAppointments();
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

  const labStatusColors = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    sample_collected: 'bg-purple-100 text-purple-800',
    processing: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const labFilteredAppointments = useMemo(() => {
    const term = labSearchTerm.trim().toLowerCase();
    return labAppointments.filter((appt) => {
      if (labStatusFilter !== 'all' && appt.status !== labStatusFilter) return false;
      if (labCollectionFilter !== 'all' && appt.collectionType !== labCollectionFilter)
        return false;

      if (term) {
        const matchLab = appt.labId?.name?.toLowerCase().includes(term);
        const matchTest = appt.tests?.some((t) => t.testName?.toLowerCase().includes(term));
        return matchLab || matchTest;
      }
      return true;
    });
  }, [labAppointments, labCollectionFilter, labSearchTerm, labStatusFilter]);

  const labUpcomingCount = labAppointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed' || a.status === 'sample_collected'
  ).length;

  const fetchLabAppointments = async () => {
    try {
      setLabLoading(true);
      const response = await getPatientLabAppointments();
      const data = response.data || response;
      setLabAppointments(data.appointments || []);
      setLabError(null);
    } catch (err) {
      setLabError('Failed to fetch lab appointments.');
      console.error('Error fetching lab appointments:', err);
    } finally {
      setLabLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchAppointments} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 space-y-4">
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">My Appointments</h3>
              <button
                onClick={() => setActiveSection('doctor')}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition ${
                  activeSection === 'doctor'
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                    : 'border-gray-200 bg-gray-50 hover:border-yellow-300 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Doctor</span>
                </div>
                <span className="text-xs text-gray-600">{filteredAppointments.length}</span>
              </button>
              <button
                onClick={() => setActiveSection('lab')}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition ${
                  activeSection === 'lab'
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                    : 'border-gray-200 bg-gray-50 hover:border-yellow-300 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  <span className="text-sm font-medium">Lab</span>
                </div>
                <span className="text-xs text-gray-600">{labAppointments.length}</span>
              </button>
            </div>
            <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-4">
              <p className="text-sm text-gray-700 font-semibold">Upcoming</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>
                  Doctor: {filteredAppointments.filter((a) => a.status !== 'completed').length}
                </span>
                <span>Lab: {labUpcomingCount}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {activeSection === 'doctor' && (
              <div className="space-y-4">
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
            )}

            {activeSection === 'lab' && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Lab Appointments</h2>
                    <p className="text-sm text-gray-600">
                      Search, filter, and open any lab appointment to view full details.
                    </p>
                  </div>
                </div>

                <div className="card-quicklab p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Search by lab name or test"
                      value={labSearchTerm}
                      onChange={(e) => setLabSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <select
                      value={labStatusFilter}
                      onChange={(e) => setLabStatusFilter(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none"
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
                      value={labCollectionFilter}
                      onChange={(e) => setLabCollectionFilter(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none"
                    >
                      <option value="all">All collection types</option>
                      <option value="home_collection">Home Collection</option>
                      <option value="visit_lab">Visit Lab</option>
                    </select>
                  </div>
                </div>

                {labLoading ? (
                  <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white text-sm text-gray-700">
                    Loading lab appointments...
                  </div>
                ) : labError ? (
                  <ErrorState message={labError} onRetry={fetchLabAppointments} />
                ) : labFilteredAppointments.length === 0 ? (
                  <div className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-700">No lab appointments match your filters.</p>
                    <p className="text-xs text-gray-500">Try adjusting filters or search.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {labFilteredAppointments.map((labAppt) => (
                      <button
                        key={labAppt._id}
                        onClick={() => {
                          setSelectedLabAppointment(labAppt);
                          setShowLabModal(true);
                        }}
                        className="w-full text-left border border-gray-200 rounded-xl p-4 shadow-sm bg-white hover:border-yellow-400 transition flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-semibold text-gray-900">
                              {labAppt.labId?.name || 'Lab'}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {new Date(labAppt.appointmentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                              <span className="text-gray-400">•</span>
                              {labAppt.appointmentTime}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              labStatusColors[labAppt.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {labAppt.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {labAppt.collectionType === 'home_collection' ? (
                            <Home className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Building2 className="w-4 h-4 text-gray-500" />
                          )}
                          <span>
                            {labAppt.collectionType === 'home_collection'
                              ? 'Home collection'
                              : 'Visit lab'}{' '}
                            • {labAppt.tests?.length || 0} tests
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            Payment: {labAppt.paymentStatus || 'pending'}
                          </span>
                          {labAppt.reportId?.reportFile?.url && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Report ready
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showLabModal && selectedLabAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedLabAppointment.labId?.name || 'Lab Appointment'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      labStatusColors[selectedLabAppointment.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedLabAppointment.status.replace('_', ' ')}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    {selectedLabAppointment.collectionType === 'home_collection'
                      ? 'Home collection'
                      : 'Visit lab'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    Payment: {selectedLabAppointment.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowLabModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Schedule
                  </h4>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(selectedLabAppointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />{' '}
                    {selectedLabAppointment.appointmentTime}
                  </p>
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <TestTube className="w-4 h-4 text-gray-500" />{' '}
                    {selectedLabAppointment.tests?.length || 0} tests
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Lab details
                  </h4>
                  <p className="text-sm text-gray-700">{selectedLabAppointment.labId?.name}</p>
                  {selectedLabAppointment.labId?.address && (
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span>
                        {selectedLabAppointment.labId.address.street},{' '}
                        {selectedLabAppointment.labId.address.city},{' '}
                        {selectedLabAppointment.labId.address.state}{' '}
                        {selectedLabAppointment.labId.address.zipCode}
                      </span>
                    </p>
                  )}
                  {selectedLabAppointment.labId?.contact?.phone && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-yellow-600" />{' '}
                      {selectedLabAppointment.labId.contact.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {selectedLabAppointment.collectionType === 'home_collection' ? (
                      <Home className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                    {selectedLabAppointment.collectionType === 'home_collection'
                      ? 'Home collection address'
                      : 'Visit lab'}
                  </h4>
                  {selectedLabAppointment.collectionType === 'home_collection' &&
                  selectedLabAppointment.collectionAddress ? (
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span>
                        {selectedLabAppointment.collectionAddress.street},{' '}
                        {selectedLabAppointment.collectionAddress.city},{' '}
                        {selectedLabAppointment.collectionAddress.state}{' '}
                        {selectedLabAppointment.collectionAddress.zipCode}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">Please arrive 10 minutes early.</p>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" /> Assigned staff
                  </h4>
                  {selectedLabAppointment.assignedStaffId ? (
                    <>
                      <p className="text-sm text-gray-800 font-medium">
                        {selectedLabAppointment.assignedStaffId.firstName}{' '}
                        {selectedLabAppointment.assignedStaffId.lastName}
                      </p>
                      {selectedLabAppointment.assignedStaffId.phoneNumber && (
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-yellow-600" />
                          {selectedLabAppointment.assignedStaffId.phoneNumber}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-700">
                      Staff assignment will show once confirmed.
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TestTube className="w-5 h-5" /> Tests
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedLabAppointment.tests?.map((test, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{test.testName}</p>
                        {test.testCode && (
                          <p className="text-xs text-gray-600">Code: {test.testCode}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">₹{test.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Notes
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedLabAppointment.notes || 'No additional notes'}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Report
                  </h4>
                  {selectedLabAppointment.reportId?.reportFile?.url ? (
                    <a
                      href={selectedLabAppointment.reportId.reportFile.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      <Download className="w-4 h-4" /> Download report
                    </a>
                  ) : (
                    <p className="text-sm text-gray-700">
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
};

export default PatientAppointments;
