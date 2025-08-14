import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const ActionButton = ({ title, description, icon: Icon, onClick, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white border-gray-700',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border-gray-200 shadow-sm',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-emerald-600'
  };

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full p-6 rounded-xl border-2 transition-all duration-300 
        hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]
        ${variants[variant]}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-4">
          {Icon && (
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm opacity-80 leading-relaxed">{description}</p>
          </div>
        </div>
        <ArrowRightIcon className="h-5 w-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </button>
  );
};

export default ActionButton;
