import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  FileText,
  Pill,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building,
  Stethoscope
} from 'lucide-react';
import { getAppointmentDetails } from '../../service/appointmentApiService'
import { getPatientAppointmentPrescription } from '../../service/prescriptionApiSevice'

const AppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);

  const fetchAppointmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch appointment details
      const appointmentResponse = await getAppointmentDetails(appointmentId);
      setAppointment(appointmentResponse.appointment || appointmentResponse.data);

      // Try to fetch prescription (it may not exist for all appointments)
      try {
        const prescriptionResponse = await getPatientAppointmentPrescription(appointmentId);
        console.log(prescriptionResponse)
        setPrescription(prescriptionResponse.prescription || prescriptionResponse.data);
      } catch (prescriptionError) {
        // Prescription doesn't exist or user doesn't have access - this is okay
        console.log('No prescription found or access denied');
        setPrescription(null);
      }

    } catch (err) {
      setError('Failed to load appointment details');
      console.error('Appointment details fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-green-700 bg-green-100 border-green-300',
      pending: 'text-yellow-700 bg-yellow-100 border-yellow-300',
      completed: 'text-blue-700 bg-blue-100 border-blue-300',
      cancelled: 'text-red-700 bg-red-100 border-red-300',
      'no-show': 'text-gray-700 bg-gray-100 border-gray-300',
    };
    return colors[status] || 'text-gray-700 bg-gray-100 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error || 'Appointment not found'}</div>
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
              <p className="text-gray-600 mt-1">View appointment information and prescription details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Info Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-6 w-6 text-indigo-600 mr-3" />
                  Appointment Information
                </h2>
                <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-2 text-sm font-medium capitalize">{appointment.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDate(appointment.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Consultation Type</label>
                    <p className="text-lg font-medium text-gray-900">
                      {appointment.isTeleconsultation ? 'Video Consultation' : 'In-Person Visit'}
                    </p>
                  </div>

                  {appointment.reason && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reason for Visit</label>
                      <p className="text-lg font-medium text-gray-900">{appointment.reason}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Appointment ID</label>
                    <p className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {appointment._id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Created On</label>
                    <p className="text-sm text-gray-900">
                      {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {appointment.meetingLink && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Meeting Link</label>
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 underline block truncate"
                      >
                        Join Video Call
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg">{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Prescription Card */}
            {prescription && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                  <Pill className="h-6 w-6 text-green-600 mr-3" />
                  Prescription Details
                </h2>

                <div className="space-y-6">
                  {prescription.diagnosis && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                      <p className="text-lg text-gray-900 mt-1">{prescription.diagnosis}</p>
                    </div>
                  )}

                  {prescription.medications && prescription.medications.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Medications</label>
                      <div className="mt-3 space-y-3">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="font-semibold text-gray-900">{medication.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Dosage:</span> {medication.dosage} |{' '}
                              <span className="font-medium">Frequency:</span> {medication.frequency} |{' '}
                              <span className="font-medium">Duration:</span> {medication.duration}
                            </div>
                            {medication.instructions && (
                              <div className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Instructions:</span> {medication.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.tests && prescription.tests.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Recommended Tests</label>
                      <div className="mt-3 space-y-2">
                        {prescription.tests.map((test, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="font-semibold text-gray-900">{test.name}</div>
                            {test.instructions && (
                              <div className="text-sm text-gray-600 mt-1">{test.instructions}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prescription.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Additional Notes</label>
                      <p className="text-gray-900 mt-2 p-3 bg-gray-50 rounded-lg">{prescription.notes}</p>
                    </div>
                  )}

                  {prescription.followUpDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Follow-up Date</label>
                      <p className="text-lg text-gray-900 mt-1">
                        {formatDate(prescription.followUpDate)}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                    <p>Prescription Date: {formatDate(prescription.date)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
                Doctor Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  {appointment.doctorId?.profilePicture ? (
                    <img
                      src={appointment.doctorId.profilePicture}
                      alt="Doctor"
                      className="h-12 w-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{appointment.doctorId?.specialization}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinic Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Building className="h-5 w-5 text-green-600 mr-2" />
                Clinic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">{appointment.clinicId?.name}</p>
                </div>
                {appointment.clinicId?.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      {appointment.clinicId.address.formattedAddress ||
                        `${appointment.clinicId.address.city}, ${appointment.clinicId.address.state}`}
                    </p>
                  </div>
                )}
                {appointment.clinicId?.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-600">{appointment.clinicId.phoneNumber}</p>
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
