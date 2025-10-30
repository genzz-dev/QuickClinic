import { format } from 'date-fns';
import {
  Calendar,
  CheckCircle,
  Clock,
  Clock3,
  Eye,
  FileText,
  MapPin,
  User,
  Video,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const AppointmentCard = ({ appointment, prescriptionStatus, onAppointmentClick }) => {
  const formatDateTime = (date, time) => {
    try {
      const appointmentDate = new Date(date);
      const formattedDate = format(appointmentDate, 'MMM dd, yyyy');
      const formattedTime = format(new Date(`2000-01-01T${time}`), 'hh:mm a');
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.log(error);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock3 className="w-3 h-3" />,
        text: 'Pending',
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Confirmed',
      },
      completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />,
        text: 'Completed',
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-3 h-3" />,
        text: 'Cancelled',
      },
      'no-show': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'No Show',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  const { date: formattedDate, time: formattedTime } = formatDateTime(
    appointment.date,
    appointment.startTime
  );
  const hasPrescription = prescriptionStatus[appointment._id];

  return (
    <div
      onClick={() => onAppointmentClick(appointment._id)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            <img
              src={appointment.doctorId?.profilePicture}
              alt={appointment.doctorId?.firstName?.[0]}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{appointment.doctorId?.specialization}</p>
          </div>
        </div>
        {getStatusBadge(appointment.status)}
      </div>

      {/* Appointment Details */}
      <div className="space-y-3">
        {/* Date and Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formattedTime}</span>
          </div>
        </div>

        {/* Clinic */}
        <div className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{appointment.clinicId?.name}</span>
        </div>

        {/* Consultation Type */}
        <div className="flex items-center gap-2">
          {appointment.isTeleconsultation ? (
            <>
              <Video className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Video Consultation</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">In-Person Visit</span>
            </>
          )}
        </div>

        {/* Reason */}
        {appointment.reason && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Reason: </span>
              {appointment.reason}
            </p>
          </div>
        )}

        {/* Prescription Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="text-sm text-gray-600">Prescription:</span>
            {hasPrescription ? (
              <span className="text-sm text-green-600 font-medium">Available</span>
            ) : (
              <span className="text-sm text-gray-400">Not available</span>
            )}
          </div>
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
