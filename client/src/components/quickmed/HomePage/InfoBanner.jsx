// client/src/components/quickmed/HomePage/InfoBanner.jsx
import React from 'react';

const InfoBanner = ({ navigateToQuickclinic }) => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-med-green-600 to-med-blue-600 p-8 sm:p-12">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Part of QuickClinic Ecosystem
              </h4>
              <p className="text-white/80 max-w-lg">
                QuickMed integrates seamlessly with QuickClinic's suite of healthcare tools for a
                complete medical information experience.
              </p>
            </div>
            <button
              className="flex-shrink-0 px-6 py-3 bg-white text-med-green-600 font-semibold rounded-xl hover:bg-med-green-50 transition-colors duration-200 shadow-lg"
              onClick={navigateToQuickclinic}
            >
              Explore QuickClinic
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoBanner;
