// src/routes/guards/LabStaffPreventGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { checkStaffProfileExists } from '../../service/labStaffService';
import Loading from '../../components/ui/Loading';

const LabStaffPreventGuard = ({ preventProfile = false, preventWaiting = false, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (checked) return; // Prevent re-running if already checked

    const runChecks = async () => {
      if (!isAuthenticated || user?.role !== 'lab_staff') {
        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
        return;
      }

      try {
        const staffStatus = await checkStaffProfileExists();

        if (!mounted) return;

        // Prevent re-doing profile if already complete
        if (preventProfile && staffStatus.exists) {
          navigate('/quick-lab/staff-waiting', { replace: true });
          return;
        }

        // Prevent accessing waiting page if already assigned to lab
        if (preventWaiting && staffStatus.isAssignedToLab) {
          navigate('/quick-lab/staff-dashboard', { replace: true });
          return;
        }

        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
      } catch (err) {
        console.error('LabStaffPreventGuard check failed:', err);
        if (mounted) {
          setLoading(false);
          setChecked(true);
        }
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role, preventProfile, preventWaiting, navigate, checked]);

  if (loading) {
    return <Loading />;
  }

  return children;
};

export default LabStaffPreventGuard;
