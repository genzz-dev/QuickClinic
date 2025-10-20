// src/routes/guards/PatientPreventGuard.jsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkPatientProfileExists } from '../../service/patientApiService';

const PatientPreventGuard = ({ preventProfile = false, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const runChecks = async () => {
      if (!isAuthenticated || user?.role !== 'patient') {
        navigate('/', { replace: true });
        return;
      }

      try {
        const profileRes = preventProfile ? await checkPatientProfileExists() : {};

        if (!mounted) return;

        if (preventProfile && profileRes?.hasProfile) {
          toast.info('Patient profile already completed.');
          navigate('/patient/dashboard', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('PatientPreventGuard check failed:', err);
        navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [preventProfile, isAuthenticated, user, navigate, location]);

  if (loading) return <Loading />;

  return children;
};

export default PatientPreventGuard;
