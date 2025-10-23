import { Shield, Database, ClipboardList, Heart } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Doctor from '../../../assets/Jeet_Krupali.png';
const HeroSection = ({ onPillHover }) => {
  const [hoveredPill, setHoveredPill] = useState(null);

  const features = [
    { icon: Shield, text: 'Google Verified Clinics', id: 'verified' },
    { icon: Database, text: 'Centralized Medical Records', id: 'records' },
    { icon: ClipboardList, text: 'Smart Prescription Management', id: 'prescription' },
  ];

  const handlePillHover = (id) => {
    setHoveredPill(id);
    onPillHover?.(id);
  };

  return (
    <div className="relative min-h-[550px] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-8 py-12 md:py-16 lg:py-20">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-500/70 to-cyan-500/80" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-12">
          {/* Left Side - Main Welcome Section */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <motion.div
                className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-4 py-2 shadow-md backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Heart size={16} className="text-white" fill="currentColor" />
                <span className="text-sm font-medium text-white">Healthcare Reimagined</span>
              </motion.div>

              <h1 className="mb-5 text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                Welcome to{' '}
                <span className="block mt-2 bg-gradient-to-r from-white to-blue-50 bg-clip-text text-transparent">
                  Quick Clinic
                </span>
              </h1>
              <p className="text-lg md:text-xl font-light text-white/95 max-w-xl leading-relaxed">
                Your health, in one place — <span className="font-semibold">effortless</span>,{' '}
                <span className="font-semibold">secure</span>, and{' '}
                <span className="font-semibold">modern</span>.
              </p>

              {/* Interactive Feature Pills */}
              <div className="mt-8 flex flex-wrap gap-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.id}
                      className={`group relative flex items-center gap-2.5 rounded-lg border px-5 py-3 backdrop-blur-md transition-all duration-300 ${
                        hoveredPill === feature.id
                          ? 'border-white/50 bg-white/30 shadow-xl'
                          : 'border-white/30 bg-white/15 shadow-lg'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onMouseEnter={() => handlePillHover(feature.id)}
                      onMouseLeave={() => handlePillHover(null)}
                    >
                      <div
                        className={`rounded-md p-1.5 transition-colors ${
                          hoveredPill === feature.id ? 'bg-white/30' : 'bg-white/15'
                        }`}
                      >
                        <Icon size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{feature.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Side - Decorative Image */}
          <motion.div
            className="hidden lg:block w-[400px] h-[400px]"
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative h-[600px] w-full flex justify-center items-center">
              <img
                src={Doctor}
                alt="Healthcare illustration"
                className="max-h-full w-auto object-contain drop-shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
