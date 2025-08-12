// src/routes/AdminPreventGuard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { checkAdminProfileExists, checkClinicExists } from "../service/adminApiService";
import { useAuth } from "../context/authContext";

const AdminPreventGuard = ({ preventProfile = false, preventClinic = false, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const runChecks = async () => {
      if (!isAuthenticated || user?.role !== "admin") {
        navigate("/", { replace: true });
        return;
      }

      try {
        const [profileRes, clinicRes] = await Promise.all([
          preventProfile ? checkAdminProfileExists() : {},
          preventClinic ? checkClinicExists() : {},
        ]);

        if (!mounted) return;

        if (preventProfile && profileRes.exists) {
          toast.info("Profile already completed.");
          navigate("/admin/add-clinic", { replace: true, state: { from: location } });
          return;
        }

        if (preventClinic && clinicRes.exists) {
          toast.info("Clinic already added.");
          navigate("/admin/dashboard", { replace: true, state: { from: location } });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("AdminPreventGuard check failed:", err);
        navigate("/", { replace: true });
      }
    };

    runChecks();
    return () => {
      mounted = false;
    };
  }, [preventProfile, preventClinic, isAuthenticated, user, navigate, location]);

  if (loading) return <div>Checking...</div>;
  return children;
};

export default AdminPreventGuard;
