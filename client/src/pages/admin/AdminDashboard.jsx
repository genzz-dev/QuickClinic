import {
	ArrowRightIcon,
	BuildingOfficeIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	PencilSquareIcon,
	PlusCircleIcon,
	ShieldExclamationIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ActionButton from "../../components/admin/dashboard/ActionButton";
import ClinicProfile from "../../components/admin/dashboard/ClinicProfile";
import VerificationBanner from "../../components/admin/dashboard/VerificationBanner";
import Loading from "../../components/ui/Loading";
import {
	getClinicDoctors,
	getClinicInfo,
	sendVerificationOTP,
	updateClinic,
	verifyOtp,
} from "../../service/adminApiService";

const AdminDashboard = () => {
	const navigate = useNavigate();
	const [clinicData, setClinicData] = useState(null);
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(true);

	const [showGoogleMapsModal, setShowGoogleMapsModal] = useState(false);
	const [googleMapsUrl, setGoogleMapsUrl] = useState("");
	const [isUpdatingClinic, setIsUpdatingClinic] = useState(false);

	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [verificationCode, setVerificationCode] = useState("");
	const [sendingOTP, setSendingOTP] = useState(false);
	const [verifyingOTP, setVerifyingOTP] = useState(false);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			const clinicResponse = await getClinicInfo();
			const doctorsResponse = await getClinicDoctors();
			if (clinicResponse?.clinic) {
				setClinicData(clinicResponse.clinic);
				setGoogleMapsUrl(clinicResponse.clinic.googleMapsLink || "");
			} else {
				setClinicData(null);
			}
			setDoctors(doctorsResponse?.doctors || []);
		} catch (err) {
			if (err.response?.status !== 404)
				toast.error("Failed to load dashboard data");
			setClinicData(null);
			setDoctors([]);
		} finally {
			setLoading(false);
		}
	};

	const handleVerificationProcessStart = () => {
		if (!clinicData?.googleMapsLink) {
			setShowGoogleMapsModal(true);
		} else {
			handleSendVerificationOTP();
		}
	};

	const handleUpdateGoogleMapsLink = async (e) => {
		e.preventDefault();
		if (!googleMapsUrl.trim()) {
			toast.error("Please enter a valid Google Maps link.");
			return;
		}
		setIsUpdatingClinic(true);
		try {
			await updateClinic({ googleMapsLink: googleMapsUrl });
			toast.success("Google Maps link saved!");
			setShowGoogleMapsModal(false);
			await fetchDashboardData();
			handleSendVerificationOTP();
		} catch (err) {
			toast.error("Failed to save the link. Please try again.");
		} finally {
			setIsUpdatingClinic(false);
		}
	};

	const handleSendVerificationOTP = async () => {
		setSendingOTP(true);
		try {
			await sendVerificationOTP();
			toast.success("Verification code sent to your clinic's phone number!");
			setShowVerificationModal(true);
		} catch (err) {
			toast.error(
				err.response?.data?.message || "Failed to send verification code.",
			);
		} finally {
			setSendingOTP(false);
		}
	};

	const handleVerifyOTP = async (e) => {
		e.preventDefault();
		if (!verificationCode.trim()) {
			toast.error("Enter the verification code");
			return;
		}
		setVerifyingOTP(true);
		try {
			await verifyOtp(verificationCode);
			toast.success("Clinic verified successfully!");
			setShowVerificationModal(false);
			setVerificationCode("");
			fetchDashboardData();
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to verify OTP.");
			fetchDashboardData();
		} finally {
			setVerifyingOTP(false);
		}
	};

	if (loading) return <Loading />;
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
			<div className="w-full  px-4 sm:px-6 lg:px-8 py-8">
				{/* Verification Banner */}
				<div className="mb-8">
					<VerificationBanner
						clinicData={clinicData}
						onVerify={handleVerificationProcessStart}
						onSetup={() => navigate("/admin/update-clinic")}
					/>
				</div>
				<div className="mb-12">
					<h2 className="text-xl font-semibold text-gray-900 mb-6">
						Quick Actions
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="transform hover:translate-y-[-4px] transition-transform duration-200">
							<ActionButton
								title="Manage Clinic Profile"
								description="Update clinic information, contact details, and settings"
								icon={BuildingOfficeIcon}
								onClick={() => navigate("/admin/update-clinic")}
								variant="secondary"
							/>
						</div>

						<div className="transform hover:translate-y-[-4px] transition-transform duration-200">
							<ActionButton
								title="Doctor Management"
								description="Add, edit, or remove doctors from your clinic"
								icon={UserGroupIcon}
								onClick={() => navigate("/admin/doctors")}
								variant="secondary"
							/>
						</div>

						<div className="transform hover:translate-y-[-4px] transition-transform duration-200">
							<ActionButton
								title="Edit Profile"
								description="Modify clinic details and preferences"
								icon={PencilSquareIcon}
								onClick={() => navigate("/admin/update-clinic")}
								variant="secondary"
							/>
						</div>
					</div>
				</div>

				{/* Row 3: Clinic Overview - Full Width */}
				<div className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-6">
						Clinic Overview
					</h2>
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
						<ClinicProfile clinicData={clinicData} doctors={doctors} />
					</div>
				</div>

				{/* Modals */}
				{showGoogleMapsModal && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
							<h3 className="text-xl font-semibold text-gray-900 mb-6">
								Add Google Maps Link
							</h3>
							<form onSubmit={handleUpdateGoogleMapsLink}>
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Google Maps URL
									</label>
									<input
										type="url"
										value={googleMapsUrl}
										onChange={(e) => setGoogleMapsUrl(e.target.value)}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
										placeholder="https://maps.google.com/..."
										required
									/>
									<p className="text-xs text-gray-500 mt-2">
										Add a valid Maps URL to continue verification.
									</p>
								</div>
								<div className="flex space-x-3">
									<button
										type="button"
										onClick={() => setShowGoogleMapsModal(false)}
										className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={isUpdatingClinic}
										className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
									>
										{isUpdatingClinic ? "Saving..." : "Save & Continue"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{showVerificationModal && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
							<div className="text-center mb-6">
								<div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
									<CheckCircleIcon className="h-8 w-8 text-emerald-600" />
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Enter Verification Code
								</h3>
								<p className="text-gray-600">
									A 6-digit code was sent to your registered phone.
								</p>
							</div>
							<form onSubmit={handleVerifyOTP}>
								<div className="mb-6">
									<input
										type="text"
										value={verificationCode}
										onChange={(e) => setVerificationCode(e.target.value)}
										className="w-full px-4 py-4 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent tracking-wider"
										placeholder="000000"
										maxLength="6"
										required
									/>
								</div>
								<div className="flex space-x-3">
									<button
										type="button"
										onClick={() => {
											setShowVerificationModal(false);
											setVerificationCode("");
										}}
										className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={verifyingOTP}
										className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200"
									>
										{verifyingOTP ? "Verifying..." : "Verify"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminDashboard;
