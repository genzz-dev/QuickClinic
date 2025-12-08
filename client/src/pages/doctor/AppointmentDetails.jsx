import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  PhoneIcon,
  PlusIcon,
  UserIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAppointmentDetails,
  getPatientInfoForAppointment,
  updateAppointmentStatus,
} from '../../service/appointmentApiService';
import {
  createPrescription,
  getAppointmentPrescription,
  updatePrescription,
} from '../../service/prescriptionApiSevice';
import { getMedicineSuggestions } from '../../service/medicineApiService';

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    tests: [{ name: '', instructions: '' }],
    notes: '',
    followUpDate: '',
  });
  const [savingPrescription, setSavingPrescription] = useState(false);
  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);

    return useCallback(
      (...args) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => callback(...args), delay);
      },
      [callback, delay]
    );
  };
  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);
  const fetchSuggestions = useDebounce(async (query) => {
    if (query.length >= 2) {
      try {
        const suggestions = await getMedicineSuggestions(query);
        setMedicineSuggestions(suggestions.suggestions);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Suggestion fetch failed', err);
      }
    } else {
      setShowSuggestions(false);
      setMedicineSuggestions([]);
    }
  }, 300);
  // Update medicine name input onChange
  const handleMedicineNameChange = (index, value) => {
    updateMedication(index, 'name', value);
    fetchSuggestions(value);
  };
  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      const [appointmentRes, patientRes] = await Promise.all([
        getAppointmentDetails(appointmentId),
        getPatientInfoForAppointment(appointmentId),
      ]);

      setAppointment(appointmentRes.appointment);
      setPatientInfo(patientRes.patient);

      // Fetch prescription if exists
      try {
        const prescriptionRes = await getAppointmentPrescription(appointmentId);
        setPrescription(prescriptionRes.prescription);
      } catch (err) {
        // No prescription exists yet
        setPrescription(null);
        console.log(err);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch appointment details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, { status: newStatus });
      setAppointment({ ...appointment, status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date('1970-01-01T' + time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status] || statusStyles.pending}`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1).replace('-', ' ')}
      </span>
    );
  };

  // Prescription form handlers
  const addMedication = () => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
    }));
  };

  const removeMedication = (index) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index, field, value) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const addTest = () => {
    setPrescriptionData((prev) => ({
      ...prev,
      tests: [...prev.tests, { name: '', instructions: '' }],
    }));
  };

  const removeTest = (index) => {
    setPrescriptionData((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  };

  const updateTest = (index, field, value) => {
    setPrescriptionData((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) => (i === index ? { ...test, [field]: value } : test)),
    }));
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingPrescription(true);

      // Filter out empty medications and tests
      const filteredData = {
        ...prescriptionData,
        medications: prescriptionData.medications.filter((med) => med.name.trim() !== ''),
        tests: prescriptionData.tests.filter((test) => test.name.trim() !== ''),
      };

      if (prescription) {
        await updatePrescription(prescription._id, filteredData);
      } else {
        await createPrescription(appointmentId, filteredData);
      }

      setShowPrescriptionForm(false);
      fetchAppointmentData(); // Refresh to show updated prescription
    } catch (err) {
      console.error('Error saving prescription:', err);
      alert('Failed to save prescription. Please try again.');
    } finally {
      setSavingPrescription(false);
    }
  };

  const startEditPrescription = () => {
    if (prescription) {
      setPrescriptionData({
        diagnosis: prescription.diagnosis || '',
        medications:
          prescription.medications && prescription.medications.length > 0
            ? prescription.medications
            : [
                {
                  name: '',
                  dosage: '',
                  frequency: '',
                  duration: '',
                  instructions: '',
                },
              ],
        tests:
          prescription.tests && prescription.tests.length > 0
            ? prescription.tests
            : [{ name: '', instructions: '' }],
        notes: prescription.notes || '',
        followUpDate: prescription.followUpDate ? prescription.followUpDate.split('T')[0] : '',
      });
    }
    setShowPrescriptionForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Appointment not found'}</p>
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/doctor/appointments')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
                <p className="text-gray-600">
                  {formatDate(appointment.date)} at {formatTime(appointment.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge status={appointment.status} />
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(appointment.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {appointment.isTeleconsultation ? (
                      <VideoCameraIcon className="w-5 h-5 text-purple-500" />
                    ) : (
                      <PhoneIcon className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">
                        {appointment.isTeleconsultation ? 'Teleconsultation' : 'In-person'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                </div>
              </div>

              {appointment.reason && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Reason for Visit</h3>
                  <p className="text-gray-700">{appointment.reason}</p>
                </div>
              )}

              {appointment.notes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700">{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', name: 'Patient Overview' },
                    { id: 'health-records', name: 'Health Records' },
                    { id: 'prescription', name: 'Prescription' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Patient Overview Tab */}
                {activeTab === 'overview' && patientInfo && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Age</p>
                          <p className="font-medium">
                            {calculateAge(patientInfo.dateOfBirth)} years
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="font-medium capitalize">
                            {patientInfo.gender || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Blood Group</p>
                          <p className="font-medium">{patientInfo.bloodGroup || 'Not available'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">
                            {patientInfo.phoneNumber || 'Not available'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{patientInfo.email || 'Not available'}</p>
                        </div>
                        <div>
                          <div className="flex items-start space-x-3">
                            <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Emergency Contact</p>
                              {patientInfo.emergencyContact && patientInfo.emergencyContact.name ? (
                                <div>
                                  <p className="text-gray-600">
                                    {patientInfo.emergencyContact.name}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    {patientInfo.emergencyContact.relationship} •{' '}
                                    {patientInfo.emergencyContact.phoneNumber}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-600">Not available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Records Tab */}
                {activeTab === 'health-records' && (
                  <div className="space-y-4">
                    {patientInfo?.healthRecords && patientInfo.healthRecords.length > 0 ? (
                      patientInfo.healthRecords.map((record, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{record.title}</h4>
                              <p className="text-sm text-gray-600 capitalize">
                                {record.recordType.replace('-', ' ')}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                              {record.description && (
                                <p className="text-gray-700 mt-2">{record.description}</p>
                              )}
                            </div>
                            <div className="ml-4">
                              {record.files && record.files.length > 0 && (
                                <a
                                  href={record.files[0].url}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                  <DocumentArrowDownIcon className="w-4 h-4" />
                                  <span>Download</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No health records available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Prescription Tab */}
                {activeTab === 'prescription' && (
                  <div className="space-y-6">
                    {prescription && !showPrescriptionForm ? (
                      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Prescription</h4>
                          <button
                            onClick={startEditPrescription}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Edit Prescription
                          </button>
                        </div>

                        {prescription.diagnosis && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-1">Diagnosis</h5>
                            <p className="text-gray-700">{prescription.diagnosis}</p>
                          </div>
                        )}

                        {prescription.medications && prescription.medications.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Medications</h5>
                            <div className="space-y-2">
                              {prescription.medications.map((med, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border">
                                  <p className="font-medium">{med.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </p>
                                  {med.instructions && (
                                    <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prescription.tests && prescription.tests.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Recommended Tests</h5>
                            <div className="space-y-2">
                              {prescription.tests.map((test, idx) => (
                                <div key={idx} className="bg-white p-3 rounded border">
                                  <p className="font-medium">{test.name}</p>
                                  {test.instructions && (
                                    <p className="text-sm text-gray-600">{test.instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prescription.notes && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-1">Additional Notes</h5>
                            <p className="text-gray-700">{prescription.notes}</p>
                          </div>
                        )}

                        {prescription.followUpDate && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Follow-up Date</h5>
                            <p className="text-gray-700">
                              {new Date(prescription.followUpDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : !prescription && !showPrescriptionForm ? (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No prescription created yet</p>
                        <button
                          onClick={() => setShowPrescriptionForm(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Create Prescription</span>
                        </button>
                      </div>
                    ) : (
                      // Prescription Form
                      <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
                        {/* Diagnosis */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Diagnosis
                          </label>
                          <textarea
                            value={prescriptionData.diagnosis}
                            onChange={(e) =>
                              setPrescriptionData((prev) => ({
                                ...prev,
                                diagnosis: e.target.value,
                              }))
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Enter diagnosis..."
                          />
                        </div>

                        {/* Medications */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Medications
                            </label>
                            <button
                              type="button"
                              onClick={addMedication}
                              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1 text-sm"
                            >
                              <PlusIcon className="w-4 h-4" />
                              <span>Add</span>
                            </button>
                          </div>

                          {prescriptionData.medications.map((medication, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                            >
                              <div>
                                <input
                                  type="text"
                                  placeholder="Medicine name"
                                  value={medication.name}
                                  onChange={(e) => handleMedicineNameChange(index, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                                {showSuggestions && medicineSuggestions.length > 0 && (
                                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                                    {medicineSuggestions.map((suggestion, sugIndex) => (
                                      <button
                                        key={sugIndex}
                                        type="button"
                                        onClick={() => {
                                          updateMedication(index, 'name', suggestion);
                                          updateMedication(index, 'quickmed', true);
                                          setShowSuggestions(false);
                                          setMedicineSuggestions([]);
                                        }}
                                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                      >
                                        <div className="font-medium">{suggestion}</div>
                                        <div className="text-sm text-gray-600">
                                          {suggestion.dosage} - {suggestion.frequency}
                                        </div>
                                        <div className="text-xs text-gray-500">QuickMed ✓</div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Dosage (e.g., 500mg)"
                                  value={medication.dosage}
                                  onChange={(e) =>
                                    updateMedication(index, 'dosage', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="Frequency (e.g., 2x daily)"
                                  value={medication.frequency}
                                  onChange={(e) =>
                                    updateMedication(index, 'frequency', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Duration (e.g., 7 days)"
                                  value={medication.duration}
                                  onChange={(e) =>
                                    updateMedication(index, 'duration', e.target.value)
                                  }
                                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                                {prescriptionData.medications.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeMedication(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="md:col-span-2 lg:col-span-4">
                                <input
                                  type="text"
                                  placeholder="Instructions (optional)"
                                  value={medication.instructions}
                                  onChange={(e) =>
                                    updateMedication(index, 'instructions', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tests */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Recommended Tests
                            </label>
                            <button
                              type="button"
                              onClick={addTest}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm"
                            >
                              <PlusIcon className="w-4 h-4" />
                              <span>Add</span>
                            </button>
                          </div>

                          {prescriptionData.tests.map((test, index) => (
                            <div
                              key={index}
                              className="flex space-x-4 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                            >
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Test name"
                                  value={test.name}
                                  onChange={(e) => updateTest(index, 'name', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Instructions (optional)"
                                  value={test.instructions}
                                  onChange={(e) =>
                                    updateTest(index, 'instructions', e.target.value)
                                  }
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              {prescriptionData.tests.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTest(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                          </label>
                          <textarea
                            value={prescriptionData.notes}
                            onChange={(e) =>
                              setPrescriptionData((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Additional notes or instructions..."
                          />
                        </div>

                        {/* Follow-up Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Follow-up Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={prescriptionData.followUpDate}
                            onChange={(e) =>
                              setPrescriptionData((prev) => ({
                                ...prev,
                                followUpDate: e.target.value,
                              }))
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => setShowPrescriptionForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingPrescription}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                          >
                            {savingPrescription ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <CheckIcon className="w-4 h-4" />
                                <span>Save Prescription</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Patient Info Card Only */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="flex items-center space-x-4 mb-4">
                {appointment.patientId?.profilePicture ? (
                  <img
                    src={appointment.patientId.profilePicture}
                    alt="Patient"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                  </h4>
                  {patientInfo && (
                    <p className="text-sm text-gray-600">
                      {calculateAge(patientInfo.dateOfBirth)} years •{' '}
                      {patientInfo.gender || 'Gender not specified'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {appointment.patientId?.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {appointment.patientId.phoneNumber}
                    </span>
                  </div>
                )}
                {appointment.patientId?.email && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{appointment.patientId.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
