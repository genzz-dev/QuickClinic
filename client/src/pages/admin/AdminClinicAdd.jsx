import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddClinicForm from "../../components/admin/clinic/AddClinicForm/AddClinicForm.jsx";
import ProgressSteps from "../../components/admin/clinic/AddClinicForm/ProgressSteps.jsx";
import VerificationStep from "../../components/admin/clinic/VerificationStep/VerificationStep.jsx";
import { addClinic } from "../../service/adminApiService.js";

const AdminAddClinic = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);
	const [clinicAdded, setClinicAdded] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		gstNumber: "",
		gstName: "",
		googleMapsLink: "",
		address: {
			formattedAddress: "",
			city: "",
			state: "",
			zipCode: "",
			country: "India",
		},
		contact: {
			phone: "",
			email: "",
			website: "",
		},
		facilities: [],
		openingHours: {
			monday: { isClosed: false, open: "09:00", close: "18:00" },
			tuesday: { isClosed: false, open: "09:00", close: "18:00" },
			wednesday: { isClosed: false, open: "09:00", close: "18:00" },
			thursday: { isClosed: false, open: "09:00", close: "18:00" },
			friday: { isClosed: false, open: "09:00", close: "18:00" },
			saturday: { isClosed: false, open: "09:00", close: "15:00" },
			sunday: { isClosed: true, open: "", close: "" },
		},
	});

	const [files, setFiles] = useState({
		logo: null,
		photos: [],
	});

	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);

	const handleFormSubmit = async (formData, files, addressMethod) => {
		setSubmitting(true);
		try {
			const clinicData = { ...formData };

			// If using Google Maps, remove manual address fields
			if (addressMethod === "google") {
				delete clinicData.address;
			} else {
				delete clinicData.googleMapsLink;
			}

			await addClinic(clinicData, files.logo, files.photos);
			setClinicAdded(true);
			setCurrentStep(2); // Move to verification step
		} catch (error) {
			console.error("Error adding clinic:", error);
			setErrors({
				submit: error.response?.data?.message || "Failed to add clinic",
			});
			throw error;
		} finally {
			setSubmitting(false);
		}
	};

	const handleVerificationComplete = () => {
		navigate("/admin/dashboard");
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<ProgressSteps currentStep={currentStep} />

				{currentStep === 1 && (
					<AddClinicForm
						formData={formData}
						setFormData={setFormData}
						files={files}
						setFiles={setFiles}
						errors={errors}
						setErrors={setErrors}
						submitting={submitting}
						onSubmit={handleFormSubmit}
					/>
				)}

				{currentStep === 2 && clinicAdded && (
					<VerificationStep
						onVerificationComplete={handleVerificationComplete}
					/>
				)}
			</div>
		</div>
	);
};

export default AdminAddClinic;
