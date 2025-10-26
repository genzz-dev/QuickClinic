import { motion } from 'framer-motion';
import { Stethoscope, Building, ChevronRight } from 'lucide-react';

const DoctorClinicInfo = ({ appointment, navigate }) => {
  const handleDoctorClick = () => {
    navigate(`/doctor/${appointment.doctorId?._id}`);
  };

  const handleClinicClick = () => {
    navigate(`/clinic/${appointment.clinicId?._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Content - 2 column grid on all screens */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Doctor Section */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={handleDoctorClick}
            className="text-left group"
          >
            {/* Title with underline */}
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-900 mb-3">
              <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Doctor
              </h3>
            </div>

            {/* Doctor Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                  Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                  {' ('}
                  {appointment.doctorId?.specialization}
                  {')'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform group-active:translate-x-0.5" />
            </div>
          </motion.button>

          {/* Clinic Section */}
          <motion.button
            whileTap={{ scale: 0.99 }}
            onClick={handleClinicClick}
            className="text-left group"
          >
            {/* Title with underline */}
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-900 mb-3">
              <Building className="w-4 h-4 text-gray-900 flex-shrink-0" />
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Clinic
              </h3>
            </div>

            {/* Clinic Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {appointment.clinicId?.name}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform group-active:translate-x-0.5" />
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorClinicInfo;
