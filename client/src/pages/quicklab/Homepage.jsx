// QuickLabHomepage.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import getDashboardPath from '../../utility/getDashboardPath';
import '../../quicklab.css';
import HeroSection from '../../components/quicklab/HomePage/HeroSection';
import FeaturesSection from '../../components/quicklab/HomePage/FeaturesSection';
import EcosystemSection from '../../components/quicklab/HomePage/EcosystemSection';
import InsuranceSection from '../../components/quicklab/HomePage/InsuranceSection';
import PromiseSection from '../../components/quicklab/HomePage/PromiseSection';
import DesktopFooter from '../../components/quicklab/DesktopFooter';

const QuickLabHomepage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect lab_admin and lab_staff to their dashboards
      if (user.role === 'lab_admin' || user.role === 'lab_staff') {
        const dashboardPath = getDashboardPath(user.role);
        navigate(dashboardPath, { replace: true });
      }
      // For other roles (patient, doctor, admin), stay on homepage
    }
  }, [isAuthenticated, user, navigate]);

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
