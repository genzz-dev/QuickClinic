import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminProfileExists } from '../../service/adminApiService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      setCheckingProfile(true);
      try {
        const res = await checkAdminProfileExists();
        console.log(res);
        if (mounted && !res.exists) {
          navigate('/admin/complete-profile', { replace: true });
        } else {
          setCheckingProfile(false);
        }
      } catch (error) {
        if (mounted) setCheckingProfile(false);
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checkingProfile) {
    return <p>Loading profile check...</p>;
  }

  return (
    <div>
      <h2>Welcome, Admin!</h2>
      <p>Manage users, view analytics, and oversee system activities here.</p>
    </div>
  );
}
