// src/routes/guards/DoctorPreventGuard.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkDoctorProfileStatus } from '../../service/doctorApiService';

const DoctorPreventGuard = ({ preventProfile = false, preventClinic = false, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const hasShownToast = useRef(false); // Add this ref

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || user?.role !== 'doctor') {
        navigate('/', { replace: true });
        return;
      }

      try {
        const response = await checkDoctorProfileStatus();
        const { profileExists, isProfileComplete, hasClinic } = response;

        if (preventProfile && profileExists && isProfileComplete) {
          if (!hasShownToast.current) {
            // Check before showing toast
            toast.info('Profile already completed.');
            hasShownToast.current = true;
          }
          if (hasClinic) {
            navigate('/doctor/dashboard', { replace: true });
          } else {
            navigate('/doctor/share-id', { replace: true });
          }
          return;
        }

        if (preventClinic && hasClinic) {
          if (!hasShownToast.current) {
            // Check before showing toast
            toast.info('You are already part of a clinic.');
            hasShownToast.current = true;
          }
          navigate('/doctor/dashboard', { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('DoctorPreventGuard error:', error);
        setLoading(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, user?.role, navigate, preventProfile, preventClinic]);

  if (loading) return <Loading />;
  return children;
};

export default DoctorPreventGuard;
