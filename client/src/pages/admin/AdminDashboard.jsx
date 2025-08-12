import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminProfileExists, getClinicInfo } from '../../service/adminApiService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const runChecks = async () => {
      try {
        // Run both checks in parallel
        const [profileRes, clinicRes] = await Promise.all([
          checkAdminProfileExists(),
          getClinicInfo()
        ]);

        if (!isMounted) return;

        // Profile check
        if (!profileRes.exists) {
          navigate('/admin/complete-profile', { replace: true });
          return;
        }

        // Clinic check
        if (!clinicRes.clinic) {
          navigate('/admin/add-clinic', { replace: true });
          return;
        }

        // If both pass
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin setup:", error);
        if (isMounted) {
          navigate('/admin/add-clinic', { replace: true });
        }
      }
    };

    runChecks();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return <p>Loading admin dashboard...</p>;
  }

  return (
    <div>
      <h2>Welcome, Admin!</h2>
      <p>Manage users, view analytics, and oversee system activities here.</p>
    </div>
  );
}
