import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const AppointmentList = ({ appointments, activeTab, onAppointmentClick }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
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

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-green-700',
      pending: 'text-amber-700',
      completed: 'text-blue-700',
      cancelled: 'text-red-700',
      'no-show': 'text-gray-700',
    };
    return colors[status] || 'text-gray-700';
  };

  // Empty State - Ultra Minimal
  if (appointments.length === 0) {
    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-24"
      >
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-slate-400" />
        </div>

        <h3 className="text-xl font-medium text-slate-900 mb-2">
          {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
        </h3>
        <p className="text-slate-600 text-sm">
          {activeTab === 'upcoming' ? 'Your schedule is clear' : 'No appointment history'}
        </p>
      </motion.div>
    );
  }

  // Premium Appointment Cards
  return (
    <div className="space-y-3">
      {appointments.map((appointment, index) => (
        <motion.div
          key={appointment._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
          onClick={() => onAppointmentClick(appointment._id)}
          className="group bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-5">
            {/* Minimal Doctor Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                {appointment.doctorId?.profilePicture ? (
                  <img
                    src={appointment.doctorId.profilePicture}
                    alt={`Dr. ${appointment.doctorId.firstName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-medium text-lg">
                    {appointment.doctorId?.firstName?.[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 truncate">
                    Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">
                    {appointment.doctorId?.specialization}
                  </p>
                </div>

                <span
                  className={`flex-shrink-0 text-xs font-medium ${getStatusColor(appointment.status)} capitalize`}
                >
                  {appointment.status}
                </span>
              </div>

              {/* Minimal Details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(appointment.date)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(appointment.startTime)}</span>
                </div>

                {appointment.isTeleconsultation ? (
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[120px]">
                      {appointment.clinicId?.name || 'In-person'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle Arrow Indicator */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AppointmentList;
