import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Stethoscope } from 'lucide-react';
import Header from './Header';
import StatusCard from './StatusCard';
import PrescriptionSection from './PrescriptionSection';
import DoctorClinicInfo from './DoctorClinicInfo';
import RatingComponent from '../RatingComponent';

const AppointmentDetailsLayout = ({
  appointment,
  prescription,
  existingRating,
  appointmentId,
  onRatingUpdate,
  navigate,
}) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header navigate={navigate} />

      {/* Tab Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {/* Details Tab */}
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'details' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Appointment Details</span>
              {activeTab === 'details' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>

            {/* Prescription Tab */}
            <button
              onClick={() => setActiveTab('prescription')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors relative ${
                activeTab === 'prescription' ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Prescription</span>
              {activeTab === 'prescription' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'details' ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Appointment Details Section */}
              <StatusCard appointment={appointment} />

              {/* Doctor & Clinic Info Section */}
              <DoctorClinicInfo appointment={appointment} navigate={navigate} />

              {/* Rating Component - Fixed Container */}
              {appointment.status === 'completed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6"
                >
                  <h3 className="text-gray-900 font-semibold text-base sm:text-lg mb-4">
                    Rate Your Experience
                  </h3>
                  <RatingComponent
                    appointmentId={appointmentId}
                    doctorId={appointment.doctorId?._id}
                    clinicId={appointment.clinicId?._id}
                    onRatingUpdate={onRatingUpdate}
                  />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="prescription"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Prescription Section */}
              {prescription ? (
                <PrescriptionSection prescription={prescription} appointment={appointment} />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-semibold text-lg mb-2">
                    No Prescription Available
                  </h3>
                  <p className="text-gray-500 text-sm">
                    The prescription will be available after your appointment is completed.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppointmentDetailsLayout;
