import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiCalendar, FiClock, FiUser, FiPhone, FiMapPin, FiVideo, 
  FiInfo, FiClipboard, FiCheckCircle, FiArrowLeft, FiChevronDown, FiRefreshCw
} from 'react-icons/fi';
import { getAppointmentDetails, updateAppointmentStatus, cancelAppointment } from '../../service/appointmentApiService'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'no-show', label: 'No Show', color: 'bg-gray-100 text-gray-800' }
];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return '-';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const statusBadge = (status) => {
  const opt = STATUS_OPTIONS.find(o => o.value === status);
  const classes = opt?.color || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AdminAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchAppointment();
    // eslint-disable-next-line
  }, [appointmentId]);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await getAppointmentDetails(appointmentId);
      setAppointment(res.appointment);
    } catch (err) {
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await updateAppointmentStatus(appointmentId, { status: newStatus });
      setAppointment((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status');
    }
    setUpdatingStatus(false);
  };

  const handleCancelAppointment = async () => {
    if (!window.confirm("Cancel this appointment?")) return;
    setCanceling(true);
    try {
      await cancelAppointment(appointmentId);
      setAppointment((prev) => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      alert('Failed to cancel appointment');
    }
    setCanceling(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <FiRefreshCw className="animate-spin text-blue-600 h-8 w-8 mr-2" />
        <div>Loading appointment details...</div>
      </main>
    );
  }
  if (!appointment) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow text-center">
          <FiInfo className="text-red-400 h-10 w-10 mx-auto mb-3" />
          <div className="text-lg font-medium text-gray-900 mb-2">Appointment not found</div>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            <FiArrowLeft className="inline mr-2" /> Go Back
          </button>
        </div>
      </main>
    );
  }

  const {
    status, reason, notes, isTeleconsultation, meetingLink,
    date, startTime, endTime, createdAt, updatedAt,
    doctorId, patientId, clinicId
  } = appointment;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 px-3 py-2 rounded-full hover:bg-blue-50"
            title="Back to appointments"
          >
            <FiArrowLeft className="h-6 w-6 text-blue-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Appointment Details
          </h1>
          <div className="ml-auto">{statusBadge(status)}</div>
        </div>
        
        {/* Patient & Doctor Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex space-x-4 items-center">
            {patientId?.profilePicture ? (
              <img src={patientId.profilePicture} alt="Patient" className="h-14 w-14 rounded-full object-cover border" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center"><FiUser className="h-6 w-6 text-blue-600" /></div>
            )}
            <div>
              <div className="font-semibold text-lg text-gray-900">{patientId?.firstName} {patientId?.lastName}</div>
              {patientId?.phoneNumber &&
                <div className="text-sm text-gray-500 flex items-center"><FiPhone className="h-4 w-4 mr-1" />{patientId.phoneNumber}</div>
              }
              {patientId?.gender && <div className="text-xs text-gray-400 capitalize">{patientId.gender}</div>}
            </div>
          </div>
          <div className="flex space-x-4 items-center">
            {doctorId?.profilePicture ? (
              <img src={doctorId.profilePicture} alt="Doctor" className="h-14 w-14 rounded-full object-cover border" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center"><FiUser className="h-6 w-6 text-green-700" /></div>
            )}
            <div>
              <div className="font-semibold text-lg text-gray-900">Dr. {doctorId?.firstName} {doctorId?.lastName}</div>
              <div className="text-xs text-gray-400">
                {doctorId?.specialization}
              </div>
            </div>
          </div>
        </section>

        {/* Appointment Timing */}
        <section className="mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-gray-700 text-sm"><FiCalendar className="h-4 w-4 mr-2" />{formatDate(date)}</div>
            <div className="flex items-center text-gray-700 text-sm"><FiClock className="h-4 w-4 mr-2" />{formatTime(startTime)} - {formatTime(endTime)}</div>
            {isTeleconsultation && (
              <span className="inline-flex items-center bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full ml-2">
                <FiVideo className="h-4 w-4 mr-1" />
                Teleconsultation
              </span>
            )}
          </div>
          {meetingLink && (
            <div className="mt-2 flex items-center text-blue-600">
              <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="underline flex items-center">
                <FiVideo className="h-4 w-4 mr-1" />Join Meeting
              </a>
            </div>
          )}
        </section>

        {/* Clinic Info */}
        <section className="mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-semibold text-gray-900 flex items-center mb-2">
              <FiMapPin className="h-4 w-4 mr-2" />{clinicId?.name}
            </div>
            <div className="text-sm text-gray-700">{clinicId?.address?.formattedAddress}</div>
            {clinicId?.contact?.phone && (
              <div className="text-xs text-gray-400 mt-1">Clinic Phone: {clinicId.contact.phone}</div>
            )}
          </div>
        </section>

        {/* Reason/Notes */}
        {(reason || notes) && (
          <section className="mb-8">
            <div className="flex gap-3">
              {reason && (
                <div className="flex flex-col flex-1 bg-yellow-50 border-l-4 border-yellow-400 rounded-md p-4">
                  <div className="flex items-center text-sm text-yellow-800 font-semibold mb-1"><FiClipboard className="h-4 w-4 mr-2" />Reason</div>
                  <div className="text-gray-800">{reason}</div>
                </div>
              )}
              {notes && (
                <div className="flex flex-col flex-1 bg-blue-50 border-l-4 border-blue-400 rounded-md p-4">
                  <div className="flex items-center text-sm text-blue-800 font-semibold mb-1"><FiInfo className="h-4 w-4 mr-2" />Notes</div>
                  <div className="text-gray-800">{notes}</div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Status & Actions */}
        <section className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="status" className="font-medium text-gray-700">Status:</label>
              <div className="relative">
                <select
                  id="status"
                  value={status}
                  disabled={updatingStatus || status === 'completed' || status === 'cancelled'}
                  onChange={handleStatusChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white min-w-[120px]"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                {updatingStatus && <FiRefreshCw className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 animate-spin" />}
              </div>
            </div>
            {status !== 'cancelled' && status !== 'completed' && (
              <button
                onClick={handleCancelAppointment}
                disabled={canceling}
                className="px-5 py-2 bg-red-600 text-white font-medium rounded-md shadow hover:bg-red-700 transition-colors"
              >
                {canceling ? (
                  <FiRefreshCw className="inline animate-spin mr-1" />
                ) : (
                  <FiCheckCircle className="inline mr-1" />
                )}
                Cancel Appointment
              </button>
            )}
          </div>
        </section>

        {/* Metadata */}
        <section className="flex justify-between text-xs text-gray-500 mt-6">
          <div>
            Created: {formatDate(createdAt)}
          </div>
          <div>
            Last Updated: {formatDate(updatedAt)}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminAppointmentDetails;
