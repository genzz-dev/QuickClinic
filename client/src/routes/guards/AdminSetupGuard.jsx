// src/routes/AdminSetupGuard.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkAdminProfileExists, checkClinicExists } from '../../service/adminApiService';

const AdminSetupGuard = ({ requireProfile = true, requireClinic = true, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const runChecks = async () => {
      if (!isAuthenticated || user?.role !== 'admin') {
        navigate('/', { replace: true });
        return;
      }

      try {
        const [profileRes, clinicRes] = await Promise.all([
          requireProfile || requireClinic ? checkAdminProfileExists() : {},
          requireClinic || requireProfile ? checkClinicExists() : {},
        ]);

        if (!mounted) return;

        if (requireProfile && !profileRes.exists) {
          toast.warning('Please complete your profile first.');
          navigate('/admin/complete-profile', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        if (requireClinic && !clinicRes.exists) {
          toast.warning('Please add your clinic first.');
          navigate('/admin/add-clinic', {
            replace: true,
            state: { from: location },
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('AdminSetupGuard check failed:', err);
        navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [requireProfile, requireClinic, isAuthenticated, user, navigate, location]);

  if (loading) return <Loading />;
  return children;
};

export default AdminSetupGuard;
