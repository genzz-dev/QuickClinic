// client/src/components/quickmed/HomePage/Footer.jsx
import React from 'react';
import Icons from './Icons';

const Footer = ({ navigateToQuickclinic }) => {
  return (
    <footer className="py-12 bg-med-surface border-t border-med-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Column */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-med-green-500 to-med-green-600 flex items-center justify-center text-white">
                <Icons.Pill />
              </div>
              <span className="font-bold text-lg">QuickMed</span>
            </div>
            <p className="text-sm text-med-text-muted">Part of the QuickClinic ecosystem</p>
          </div>

          {/* Disclaimer Column */}
          <div className="text-center">
            <h5 className="font-semibold mb-2 text-sm uppercase tracking-wide text-med-text-muted">
              Disclaimer
            </h5>
            <p className="text-sm text-med-text-muted leading-relaxed">
              Data sourced from OpenFDA. For educational purposes only and should not replace
              professional medical advice.
            </p>
          </div>

          {/* CTA Column */}
          <div className="text-center md:text-right">
            <h5 className="font-semibold mb-2 text-sm uppercase tracking-wide text-med-text-muted">
              Need Medical Advice?
            </h5>
            <p className="text-sm text-med-text-muted mb-3">
              Book an appointment with top doctors near you.
            </p>
            <button
              onClick={navigateToQuickclinic}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-med-green-500 to-med-green-600 hover:from-med-green-600 hover:to-med-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Visit QuickClinic</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
