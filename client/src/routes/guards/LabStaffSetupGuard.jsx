// src/routes/guards/LabStaffSetupGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/authContext';
import { checkStaffProfileExists } from '../../service/labStaffService';

const LabStaffSetupGuard = ({ requireProfile = true, requireLabAssignment = true, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (checked) return; // Prevent re-running if already checked

    const runChecks = async () => {
      if (!isAuthenticated || user?.role !== 'lab_staff') {
        if (mounted) navigate('/', { replace: true });
        return;
      }

      try {
        const staffStatus = await checkStaffProfileExists();

        if (!mounted) return;

        if (requireProfile && !staffStatus.exists) {
          toast.warning('Please complete your profile first.');
          navigate('/quick-lab/staff-profile', { replace: true });
          return;
        }

        if (requireLabAssignment && staffStatus.exists && !staffStatus.isAssignedToLab) {
          toast.info('Waiting for lab assignment from your admin.');
          navigate('/quick-lab/staff-waiting', { replace: true });
          return;
        }

        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
      } catch (err) {
        console.error('LabStaffSetupGuard check failed:', err);
        if (mounted) navigate('/', { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role, requireProfile, requireLabAssignment, navigate, checked]);

  if (loading) {
    return <Loading />;
  }

  return children;
};

export default LabStaffSetupGuard;
