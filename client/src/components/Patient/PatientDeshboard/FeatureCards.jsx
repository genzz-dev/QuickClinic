import {
  Shield,
  Database,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Verified_Clinics_Image from '../../../assets/Verified_Clinics.png';
const FeatureCards = ({ highlightedFeature }) => {
  const [features, setFeatures] = useState([
    {
      id: 'verified',
      icon: Shield,
      title: 'Verified Healthcare Providers',
      description:
        'Only trusted, authenticated clinics and accredited hospitals. Rigorously verified for your safety.',
      bgGradient: 'from-slate-600 via-slate-500 to-gray-500',
      accentColor: 'text-cyan-400',
      illustration: Verified_Clinics_Image,
    },
    {
      id: 'records',
      icon: Database,
      title: 'Secure Digital Health Records',
      description:
        'Access your complete medical history securely. Bank-grade encryption keeps your data protected.',
      bgGradient: 'from-slate-600 via-slate-500 to-gray-500',
      accentColor: 'text-blue-300',
      illustration: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    },
    {
      id: 'prescription',
      icon: ClipboardList,
      title: 'Intelligent Management',
      description:
        'Automated prescription refills, appointment scheduling, and reminders. Healthcare made simple.',
      bgGradient: 'from-slate-600 via-slate-500 to-gray-500',
      accentColor: 'text-indigo-300',
      illustration: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    },
  ]);

  const [isAutoplay, setIsAutoplay] = useState(true);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);

  // Auto-rotate card order for desktop
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setFeatures((prev) => {
        const newOrder = [...prev];
        const first = newOrder.shift();
        newOrder.push(first);
        return newOrder;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  // Auto-rotate for mobile
  useEffect(() => {
    if (!isAutoplay) return;

    const interval = setInterval(() => {
      setCurrentMobileIndex((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoplay]);

  // Highlight specific feature when pill is hovered
  useEffect(() => {
    if (highlightedFeature) {
      setFeatures((prev) => {
        const newOrder = [...prev];
        const index = newOrder.findIndex((f) => f.id === highlightedFeature);
        if (index > 0) {
          const [item] = newOrder.splice(index, 1);
          newOrder.unshift(item);
        }
        return newOrder;
      });
      setIsAutoplay(false);
    } else {
      setIsAutoplay(true);
    }
  }, [highlightedFeature]);

  const handlePrev = () => {
    setCurrentMobileIndex((prev) => (prev - 1 + 3) % 3);
    setIsAutoplay(false);
  };

  const handleNext = () => {
    setCurrentMobileIndex((prev) => (prev + 1) % 3);
    setIsAutoplay(false);
  };

  const allFeatures = [
    {
      id: 'verified',
      icon: Shield,
      title: 'Verified Healthcare Providers',
      description:
        'Only trusted, authenticated clinics and accredited hospitals. Rigorously verified for your safety.',
      bgGradient: 'from-blue-600 via-blue-500 to-cyan-500',
      accentColor: 'text-cyan-400',
      illustration: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
    },
    {
      id: 'records',
      icon: Database,
      title: 'Secure Digital Health Records',
      description:
        'Access your complete medical history securely. Bank-grade encryption keeps your data protected.',
      bgGradient: 'from-slate-600 via-slate-500 to-gray-500',
      accentColor: 'text-blue-300',
      illustration: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
    },
    {
      id: 'prescription',
      icon: ClipboardList,
      title: 'Intelligent Management',
      description:
        'Automated prescription refills, appointment scheduling, and reminders. Healthcare made simple.',
      bgGradient: 'from-indigo-600 via-blue-600 to-blue-500',
      accentColor: 'text-indigo-300',
      illustration: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    },
  ];

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-gray-50 to-white pt-5 md:pt-0">
      {/* Desktop: All cards visible with auto-rotation */}
      <div className="hidden md:flex w-full gap-0">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              layout
              transition={{
                layout: {
                  duration: 0.6,
                  ease: [0.4, 0, 0.2, 1],
                },
              }}
              className={`group flex w-1/3 flex-col items-center justify-start px-10 py-16 bg-gradient-to-br ${feature.bgGradient} relative overflow-hidden hover:shadow-2xl transition-shadow duration-300`}
              style={{ minHeight: '500px' }}
            >
              {/* Background illustration - centered and larger */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <img src={feature.illustration} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Enhanced dark gradient overlay behind text for better contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Smaller circular icon with accent color */}
                <div
                  className={`mb-6 rounded-full bg-white/25 backdrop-blur-md p-4 shadow-2xl border border-white/40 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={40} className={feature.accentColor} strokeWidth={2.5} />
                </div>

                {/* Main Title with accent color */}
                <h3
                  className={`mb-4 text-center text-2xl font-bold ${feature.accentColor} leading-tight px-2 drop-shadow-lg`}
                >
                  {feature.title}
                </h3>

                {/* Description with improved contrast */}
                <p className="text-center text-sm leading-relaxed text-white px-6 drop-shadow-md mb-6">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: Single card carousel */}
      <div className="md:hidden relative px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMobileIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-start px-8 py-12 bg-gradient-to-br ${allFeatures[currentMobileIndex].bgGradient} relative overflow-hidden rounded-2xl`}
            style={{ minHeight: '450px' }}
          >
            {/* Background illustration with improved opacity */}
            <div className="absolute inset-0 flex items-center justify-center opacity-35">
              <img
                src={allFeatures[currentMobileIndex].illustration}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Enhanced dark gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Smaller circular icon with accent color */}
              <div
                className={`mb-6 rounded-full bg-white/25 backdrop-blur-md p-4 shadow-2xl border border-white/40`}
              >
                {(() => {
                  const Icon = allFeatures[currentMobileIndex].icon;
                  return (
                    <Icon
                      size={40}
                      className={allFeatures[currentMobileIndex].accentColor}
                      strokeWidth={2.5}
                    />
                  );
                })()}
              </div>

              {/* Main Title with accent color */}
              <h3
                className={`mb-4 text-center text-2xl font-bold ${allFeatures[currentMobileIndex].accentColor} leading-tight px-2 drop-shadow-lg`}
              >
                {allFeatures[currentMobileIndex].title}
              </h3>

              {/* Description with improved contrast */}
              <p className="text-center text-sm leading-relaxed text-white px-4 drop-shadow-md mb-6">
                {allFeatures[currentMobileIndex].description}
              </p>

              {/* Call-to-Action Button */}
              <button className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white text-sm font-semibold transition-all duration-300 border border-white/30 shadow-lg">
                Learn More
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors duration-200"
          aria-label="Previous feature"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors duration-200"
          aria-label="Next feature"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>

        {/* Dot Indicators */}
        <div className="mt-6 flex justify-center gap-2">
          {allFeatures.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentMobileIndex(index);
                setIsAutoplay(false);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentMobileIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureCards;
