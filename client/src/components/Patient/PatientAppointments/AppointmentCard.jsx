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
        color: 'bg-blue-50 text-blue-700 border-blue-100',
        icon: <Clock className="w-3 h-3" strokeWidth={2} />,
        label: 'Pending',
      },
      confirmed: {
        color: 'bg-blue-600 text-white border-blue-600',
        icon: <CheckCircle className="w-3 h-3" strokeWidth={2} />,
        label: 'Confirmed',
      },
      completed: {
        color: 'bg-gray-100 text-black border-gray-200',
        icon: <CheckCircle className="w-3 h-3" strokeWidth={2} />,
        label: 'Completed',
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: <XCircle className="w-3 h-3" strokeWidth={2} />,
        label: 'Cancelled',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-light border ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const { date, time } = formatDateTime(appointment.date, appointment.startTime);
  const hasPrescription = prescriptionStatus[appointment._id];

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
              {appointment.doctorId?.profilePicture ? (
                <img
                  src={appointment.doctorId.profilePicture}
                  alt={`${appointment.doctorId?.firstName} ${appointment.doctorId?.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-normal text-black mb-0.5 truncate">
                Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
              </h3>
              <p className="text-xs text-gray-500 font-light mb-2">
                {appointment.doctorId?.specialization}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                <span className="font-light truncate">{appointment.reason}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-start gap-2">
            {getStatusBadge(appointment.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-gray-600 font-light">{date}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock3 className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-gray-600 font-light">
              {time} - {format(new Date(`2000-01-01T${appointment.endTime}`), 'hh:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {appointment.appointmentType === 'virtual' ? (
              <>
                <Video className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-gray-600 font-light">Virtual</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-gray-600 font-light truncate">
                  {appointment.clinicId?.name || 'In-Person'}
                </span>
              </>
            )}
          </div>

          {hasPrescription && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-blue-600 font-light">Prescription Available</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onAppointmentClick(appointment._id)}
          className="w-full py-2.5 px-4 text-sm font-light text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" strokeWidth={1.5} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default AppointmentCard;
