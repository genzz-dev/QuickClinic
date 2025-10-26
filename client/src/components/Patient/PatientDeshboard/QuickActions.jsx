import { MapPin, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions = ({ navigate }) => {
  const actions = [
    {
      icon: Stethoscope,
      title: 'Find Doctor Near You',
      subtitle: 'Browse verified doctors and book appointments',
      gradient: 'from-blue-600 to-blue-500',
      route: '/patient/doctors',
    },
    {
      icon: MapPin,
      title: 'Find Clinics Near you',
      subtitle: 'Locate trusted clinics in your area',
      gradient: 'from-gray-700 to-gray-600',
      route: '/patient/nearby',
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-white px-4 py-8 md:py-12">
      {/* Two button-style cards side by side */}
      <div className="max-w-7xl mx-auto flex gap-3 md:gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.route}
              onClick={() => navigate(action.route)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex items-center w-1/2 overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r ${action.gradient} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-white/20`}
              style={{ minHeight: '70px' }}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Content */}
              <div className="relative z-10 flex items-center gap-2 md:gap-4 px-3 md:px-6 py-3 md:py-6 w-full">
                {/* Icon Container */}
                <div className="flex-shrink-0 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm p-2 md:p-3 shadow-lg border border-white/30">
                  <Icon size={20} className="text-white md:w-7 md:h-7" strokeWidth={2.5} />
                </div>

                {/* Text Content */}
                <div className="flex-1 text-left">
                  <h3 className="text-sm md:text-xl font-bold text-white leading-tight">
                    {action.title}
                  </h3>
                  {/* Subtitle only on desktop */}
                  <p className="hidden md:block text-xs md:text-sm text-white/90 leading-snug mt-1">
                    {action.subtitle}
                  </p>
                </div>

                {/* Arrow indicator - hide on mobile */}
                <div className="hidden md:flex flex-shrink-0 w-8 h-8 rounded-full bg-white/20 items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <svg
                    className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Shine effect on hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
