// QuickLabHomepage.jsx
import React from 'react';
import '../../quicklab.css';
import HeroSection from '../../components/quicklab/HomePage/HeroSection';
import FeaturesSection from '../../components/quicklab/HomePage/FeaturesSection';
import EcosystemSection from '../../components/quicklab/HomePage/EcosystemSection';
import InsuranceSection from '../../components/quicklab/HomePage/InsuranceSection';
import PromiseSection from '../../components/quicklab/HomePage/PromiseSection';
import DesktopFooter from '../../components/quicklab/DesktopFooter';

const QuickLabHomepage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-lab-black-900 text-lab-black-900 dark:text-lab-black-50 transition-colors duration-300">
      <HeroSection />
      <FeaturesSection />
      <EcosystemSection />
      <InsuranceSection />
      <PromiseSection />
      <DesktopFooter />

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default QuickLabHomepage;
