// src/routes/guards/LabAdminSetupGuard.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkLabAdminProfileExists, checkLabExists } from '../../service/labAdminService';

const LabAdminSetupGuard = ({ requireProfile = true, requireLab = true, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const runChecks = async () => {
      if (!isAuthenticated || (user?.role !== 'lab_admin' && user?.role !== 'lab_staff')) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const [profileRes, labRes] = await Promise.all([
          requireProfile ? checkLabAdminProfileExists() : {},
          requireLab && user?.role === 'lab_admin' ? checkLabExists() : {},
        ]);

        if (!mounted) return;

        if (requireProfile && !profileRes.exists) {
          toast.warning('Please complete your profile first.');
          navigate('/quick-lab/complete-profile', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        if (requireLab && user?.role === 'lab_admin' && !labRes.exists) {
          toast.warning('Please add your lab details first.');
          navigate('/quick-lab/add-lab', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('LabAdminSetupGuard check failed:', err);
        navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [requireProfile, requireLab, isAuthenticated, user, navigate, location]);

  if (loading) return <Loading />;

  return children;
};

export default LabAdminSetupGuard;
