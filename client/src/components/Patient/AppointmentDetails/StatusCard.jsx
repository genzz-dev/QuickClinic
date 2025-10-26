import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, Video, User } from 'lucide-react';
import StatusIcon from './StatusIcon';
import { formatDate, formatTime } from './utils/formatters';

const StatusCard = ({ appointment }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <StatusIcon status={appointment.status} />
            <div className="min-w-0">
              <h3 className="text-gray-900 font-semibold text-base sm:text-lg truncate">
                Appointment Status
              </h3>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-lg border font-medium text-xs whitespace-nowrap ${getStatusColor(appointment.status)}`}
          >
            {getStatusText(appointment.status)}
          </div>
        </div>
      </div>

      {/* Compact Content */}
      <div className="p-4 sm:p-6">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Date Card */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex flex-col space-y-2">
              <div className="bg-blue-600 rounded-lg p-2 w-fit">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Date
                </p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {formatDate(appointment.date)}
                </p>
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex flex-col space-y-2">
              <div className="bg-gray-900 rounded-lg p-2 w-fit">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Time
                </p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {formatTime(appointment.startTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Mode & Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Consultation Mode */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 rounded-lg p-2 flex-shrink-0">
                {appointment.isTeleconsultation ? (
                  <Video className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Mode
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {appointment.isTeleconsultation ? 'Video Call' : 'In-Person'}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-900 rounded-lg p-2 flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                  Reason
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">{appointment.reason}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusCard;
