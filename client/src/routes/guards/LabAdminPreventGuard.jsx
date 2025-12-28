// src/routes/guards/LabAdminPreventGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkLabAdminProfileExists, checkLabExists } from '../../service/labAdminService';

const LabAdminPreventGuard = ({ preventProfile = false, preventLab = false, children }) => {
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
          preventProfile ? checkLabAdminProfileExists() : Promise.resolve({}),
          preventLab && user?.role === 'lab_admin' ? checkLabExists() : Promise.resolve({}),
        ]);

        if (!mounted) return;

        if (preventProfile && profileRes.exists) {
          toast.info('Profile already completed.');
          navigate('/quick-lab/add-lab', { replace: true });
          return;
        }

        if (preventLab && user?.role === 'lab_admin' && labRes.exists) {
          toast.info('Lab already added.');
          navigate('/quick-lab/dashboard', { replace: true });
          return;
        }

        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
      } catch (err) {
        console.error('LabAdminPreventGuard check failed:', err);
        if (mounted) navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role, preventProfile, preventLab, navigate, checked]);

  if (loading) return <Loading />;

  return children;
};

export default LabAdminPreventGuard;
