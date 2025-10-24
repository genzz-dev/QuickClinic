import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';

const Header = ({ navigate }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/appointments')}
            className="flex items-center space-x-2 text-gray-700 font-medium transition-colors group"
          >
            <div className="bg-gray-100 rounded-lg p-2 transition-colors group-hover:bg-gray-200">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline text-sm">Back to Appointments</span>
          </motion.button>

          {/* Center: Title */}
          <div className="flex-1 flex justify-center px-4">
            <div className="flex items-center space-x-3">
              {/* Mobile title */}
              <h1 className="text-base font-semibold text-gray-900 sm:hidden">
                Appointment
              </h1>
            </div>
          </div>

          {/* Right: Placeholder for symmetry */}
          <div className="w-[140px] sm:w-[180px]"></div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
