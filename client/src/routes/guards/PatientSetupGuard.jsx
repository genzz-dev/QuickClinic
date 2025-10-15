// src/routes/guards/PatientSetupGuard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { checkPatientProfileExists } from "../../service/patientApiService";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/ui/Loading";

const PatientSetupGuard = ({ requireProfile = true, children }) => {
	const { isAuthenticated, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		const runChecks = async () => {
			if (!isAuthenticated || user?.role !== "patient") {
				navigate("/", { replace: true });
				return;
			}

			try {
				const profileRes = requireProfile
					? await checkPatientProfileExists()
					: {};

				if (!mounted) return;

				if (requireProfile && !profileRes?.hasProfile) {
					toast.warning("Please complete your patient profile first.");
					navigate("/patient/complete-profile", {
						replace: true,
						state: { from: location },
					});
					return;
				}

				setLoading(false);
			} catch (err) {
				console.error("PatientSetupGuard check failed:", err);
				navigate("/", { replace: true });
			}
		};

		runChecks();
		return () => {
			mounted = false;
		};
	}, [requireProfile, isAuthenticated, user, navigate, location]);

	if (loading) return <Loading />;

	return children;
};

export default PatientSetupGuard;
