import React from 'react';
import { Heart, Stethoscope, Activity, UserPlus } from 'lucide-react';

const FloatingIcon = ({ Icon, className, color = 'blue' }) => (
  <div className={`absolute opacity-10 animate-pulse ${className}`}>
    <Icon size={24} className={`text-${color}-300`} />
  </div>
);

export const AuthLayout = ({ 
  children, 
  title, 
  subtitle, 
  gradientFrom, 
  gradientTo, 
  bgFrom, 
  bgTo, 
  floatingIcons = [],
  logoColorFrom,
  logoColorTo
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-${bgFrom}-50 via-white to-${bgTo}-50 flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Floating Medical Icons Background */}
      {floatingIcons.map((icon, index) => (
        <FloatingIcon 
          key={index}
          Icon={icon.Icon} 
          className={icon.className} 
          color={icon.color}
        />
      ))}
      
      {/* Animated Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-80 h-80 bg-${bgFrom}-100 rounded-full opacity-20 animate-pulse`}></div>
        <div className={`absolute -bottom-40 -right-40 w-96 h-96 bg-${bgTo}-100 rounded-full opacity-20 animate-pulse animation-delay-1000`}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-${logoColorFrom}-500 to-${logoColorTo}-500 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <div className="relative">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-${logoColorFrom}-600 to-${logoColorTo}-600 bg-clip-text text-transparent">
            Quick Clinic
          </h1>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        {children}
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};