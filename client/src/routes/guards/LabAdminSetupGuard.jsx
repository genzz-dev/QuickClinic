// src/routes/guards/LabAdminSetupGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkLabAdminProfileExists, checkLabExists } from '../../service/labAdminService';

const LabAdminSetupGuard = ({ requireProfile = true, requireLab = true, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (checked) return; // Prevent re-running if already checked

    const runChecks = async () => {
      if (!isAuthenticated || (user?.role !== 'lab_admin' && user?.role !== 'lab_staff')) {
        if (mounted) navigate('/', { replace: true });
        return;
      }

      try {
        const [profileRes, labRes] = await Promise.all([
          requireProfile ? checkLabAdminProfileExists() : Promise.resolve({}),
          requireLab && user?.role === 'lab_admin' ? checkLabExists() : Promise.resolve({}),
        ]);

        if (!mounted) return;

        if (requireProfile && !profileRes.exists) {
          toast.warning('Please complete your profile first.');
          navigate('/quick-lab/complete-profile', { replace: true });
          return;
        }

        if (requireLab && user?.role === 'lab_admin' && !labRes.exists) {
          toast.warning('Please add your lab details first.');
          navigate('/quick-lab/add-lab', { replace: true });
          return;
        }

        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
      } catch (err) {
        console.error('LabAdminSetupGuard check failed:', err);
        if (mounted) navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role, requireProfile, requireLab, navigate, checked]);

  if (loading) return <Loading />;

  return children;
};

export default LabAdminSetupGuard;
