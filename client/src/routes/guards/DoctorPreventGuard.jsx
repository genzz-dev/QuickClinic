// src/routes/guards/DoctorPreventGuard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDoctorProfile } from "../../service/doctorApiService";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/ui/Loading";

const DoctorPreventGuard = ({ preventProfile = false, preventClinic = false, children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    // Prevent multiple runs with a more robust check
    if (hasRun || !isAuthenticated || user?.role !== "doctor") {
      if (!isAuthenticated || user?.role !== "doctor") {
        navigate("/", { replace: true });
      }
      return;
    }

    let mounted = true;
    setHasRun(true); // Set this immediately to prevent re-runs

    const runChecks = async () => {
      try {
        const profileRes = await getDoctorProfile();
        
        if (!mounted) return;

        const doctorProfile = profileRes.data;

        // Check if profile is complete
        const isProfileComplete = doctorProfile && 
          doctorProfile.name && 
          doctorProfile.email && 
          doctorProfile.phone && 
          doctorProfile.specialization && 
          doctorProfile.qualifications?.length > 0;

        // Check if doctor has clinic
        const hasClinic = doctorProfile?.clinicId || 
          (doctorProfile?.clinics && doctorProfile.clinics.length > 0);

        // Prevent access based on conditions
        if (preventProfile && isProfileComplete) {
          toast.info("Profile already completed.");
          if (hasClinic) {
            navigate("/doctor/dashboard", { replace: true });
          } else {
            navigate("/doctor/share-id", { replace: true });
          }
          return;
        }

        if (preventClinic && hasClinic) {
          toast.info("You are already part of a clinic.");
          navigate("/doctor/dashboard", { replace: true });
          return;
        }

        // If no prevention rules triggered, allow access
        if (mounted) {
          setLoading(false);
        }

      } catch (err) {
        console.error("DoctorPreventGuard check failed:", err);
        
        if (!mounted) return;

        // Handle 404 - profile doesn't exist
        if (err.response?.status === 404) {
          // Profile doesn't exist, allow access (this is what prevent guard wants)
          setLoading(false);
        } else {
          // Handle other errors
          toast.error("Something went wrong. Please try again.");
          navigate("/", { replace: true });
        }
      }
    };

    runChecks();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role]); // Keep minimal dependencies

  // Reset hasRun when auth state changes
  useEffect(() => {
    setHasRun(false);
    setLoading(true);
  }, [isAuthenticated, user?.role]);

  if (loading) return <Loading />;

  return children;
};

export default DoctorPreventGuard;
