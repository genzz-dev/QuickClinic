import { Calendar, Clock, FileText } from 'lucide-react';
import StatusIcon from './StatusIcon';
import { formatDate, formatTime } from './utils/formatters';

const StatusCard = ({ appointment }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Appointment Status</h2>
        <div className="flex items-center">
          <StatusIcon status={appointment.status} />
          <span className="ml-2 capitalize font-medium">{appointment.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium">Date & Time</span>
          </div>
          <p className="text-gray-600 ml-7">{formatDate(appointment.date)}</p>
          <p className="text-gray-600 ml-7">
            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
          </p>
        </div>

        <div>
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium">Consultation Type</span>
          </div>
          <p className="text-gray-600 ml-7">
            {appointment.isTeleconsultation ? 'Video Consultation' : 'In-Person Visit'}
          </p>
        </div>
      </div>

      {appointment.reason && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium">Reason for Visit</span>
          </div>
          <p className="text-gray-600 ml-7">{appointment.reason}</p>
        </div>
      )}
    </div>
  );
};

export default StatusCard;