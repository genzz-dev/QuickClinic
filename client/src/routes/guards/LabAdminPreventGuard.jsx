// src/routes/guards/LabAdminPreventGuard.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkLabAdminProfileExists, checkLabExists } from '../../service/labAdminService';

const LabAdminPreventGuard = ({ preventProfile = false, preventLab = false, children }) => {
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
          preventProfile ? checkLabAdminProfileExists() : {},
          preventLab && user?.role === 'lab_admin' ? checkLabExists() : {},
        ]);

        if (!mounted) return;

        if (preventProfile && profileRes.exists) {
          toast.info('Profile already completed.');
          navigate('/quick-lab/add-lab', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        if (preventLab && user?.role === 'lab_admin' && labRes.exists) {
          toast.info('Lab already added.');
          navigate('/quick-lab/dashboard', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('LabAdminPreventGuard check failed:', err);
        navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [preventProfile, preventLab, isAuthenticated, user, navigate, location]);

  if (loading) return <Loading />;

  return children;
};

export default LabAdminPreventGuard;
