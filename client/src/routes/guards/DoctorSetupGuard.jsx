// src/routes/guards/DoctorSetupGuard.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkDoctorProfileStatus } from '../../service/doctorApiService';

const DoctorSetupGuard = ({ requireProfile = true, requireClinic = true, children }) => {
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

        if (requireProfile && (!profileExists || !isProfileComplete)) {
          if (!hasShownToast.current) {
            // Check before showing toast
            toast.warning('Please complete your profile first.');
            hasShownToast.current = true;
          }
          navigate('/doctor/complete-profile', { replace: true });
          return;
        }

        if (requireClinic && !hasClinic) {
          if (!hasShownToast.current) {
            // Check before showing toast
            toast.warning('You need to be added to a clinic to access this page.');
            hasShownToast.current = true;
          }
          navigate('/doctor/share-id', { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('DoctorSetupGuard error:', error);
        if (!hasShownToast.current) {
          // Check before showing toast
          toast.error('Something went wrong. Please try again.');
          hasShownToast.current = true;
        }
        navigate('/', { replace: true });
      }
    };

    checkAccess();
  }, [isAuthenticated, user?.role, navigate, requireProfile, requireClinic]);

  if (loading) return <Loading />;
  return children;
};

export default DoctorSetupGuard;
