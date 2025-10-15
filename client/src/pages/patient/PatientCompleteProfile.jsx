import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	createPatientProfile,
	uploadHealthRecord,
	checkPatientProfileExists,
} from "../../service/patientApiService";

const PatientCompleteProfile = () => {
	const navigate = useNavigate();

	// State management
	const [currentStep, setCurrentStep] = useState(1);
	const [hasProfile, setHasProfile] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [successMessage, setSuccessMessage] = useState("");

	// Patient Profile Form Data
	const [profileData, setProfileData] = useState({
		firstName: "",
		lastName: "",
		dateOfBirth: "",
		gender: "",
		phoneNumber: "",
		address: {
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "India",
		},
		emergencyContact: {
			name: "",
			relationship: "",
			phoneNumber: "",
		},
	});

	const [profilePicture, setProfilePicture] = useState(null);
	const [profilePreview, setProfilePreview] = useState("");

	// Health Record Form Data
	const [healthRecord, setHealthRecord] = useState({
		recordType: "",
		title: "",
		date: "",
		description: "",
	});

	const [healthFile, setHealthFile] = useState(null);
	const [filePreview, setFilePreview] = useState("");

	// Constants
	const recordTypes = [
		{ value: "allergy", label: "Allergy" },
		{ value: "condition", label: "Medical Condition" },
		{ value: "immunization", label: "Immunization" },
		{ value: "lab-result", label: "Lab Result" },
		{ value: "medication", label: "Medication" },
		{ value: "procedure", label: "Medical Procedure" },
		{ value: "vital-sign", label: "Vital Signs" },
	];

	const relationships = [
		"Spouse",
		"Parent",
		"Child",
		"Sibling",
		"Friend",
		"Guardian",
		"Other",
	];

	const genderOptions = [
		{ value: "male", label: "Male" },
		{ value: "female", label: "Female" },
		{ value: "other", label: "Other" },
	];

	// Initialize component
	useEffect(() => {
		initializeComponent();
		return () => {
			// Cleanup preview URLs
			if (profilePreview) URL.revokeObjectURL(profilePreview);
		};
	}, []);

	const initializeComponent = async () => {
		await checkProfileStatus();
	};

	// API Methods
	const checkProfileStatus = async () => {
		try {
			setLoading(true);
			const response = await checkPatientProfileExists();

			if (response.hasProfile) {
				setHasProfile(true);
				setCurrentStep(2);
			}
		} catch (error) {
			console.error("Profile check failed:", error);
			setErrors((prev) => ({
				...prev,
				general: "Failed to check profile status",
			}));
		} finally {
			setLoading(false);
		}
	};

	const submitPatientProfile = async () => {
		if (!validateProfileForm()) return false;

		try {
			setLoading(true);
			const response = await createPatientProfile(profileData, profilePicture);

			setSuccessMessage("Patient profile created successfully!");
			setHasProfile(true);
			setCurrentStep(2);
			clearErrors();

			setTimeout(() => setSuccessMessage(""), 3000);
			return true;
		} catch (error) {
			handleApiError(error, "Failed to create patient profile");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const submitHealthRecord = async () => {
		if (!validateHealthRecordForm()) return false;

		try {
			setLoading(true);
			const response = await uploadHealthRecord(healthRecord, healthFile);

			setSuccessMessage("Health record uploaded successfully!");
			resetHealthRecordForm();
			clearErrors();

			setTimeout(() => {
				setSuccessMessage("");
				navigate("/patient/dashboard");
			}, 2000);

			return true;
		} catch (error) {
			handleApiError(error, "Failed to upload health record");
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Form Handlers
	const handleProfileChange = (e) => {
		const { name, value } = e.target;

		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setProfileData((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));
		} else {
			setProfileData((prev) => ({
				...prev,
				[name]: value,
			}));
		}

		clearFieldError(name);
	};

	const handleHealthRecordChange = (e) => {
		const { name, value } = e.target;
		setHealthRecord((prev) => ({
			...prev,
			[name]: value,
		}));

		clearFieldError(name);
	};

	const handleProfilePictureChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const validationError = validateFile(file, 5);
		if (validationError) {
			setErrors((prev) => ({ ...prev, profilePicture: validationError }));
			return;
		}

		// Cleanup previous preview
		if (profilePreview) URL.revokeObjectURL(profilePreview);

		setProfilePicture(file);
		setProfilePreview(URL.createObjectURL(file));
		clearFieldError("profilePicture");
	};

	const handleHealthFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const validationError = validateFile(file, 10);
		if (validationError) {
			setErrors((prev) => ({ ...prev, healthFile: validationError }));
			return;
		}

		setHealthFile(file);
		setFilePreview(file.name);
		clearFieldError("healthFile");
	};

	// Form Submissions
	const handleProfileSubmit = async (e) => {
		e.preventDefault();
		await submitPatientProfile();
	};

	const handleHealthRecordSubmit = async (e) => {
		e.preventDefault();
		await submitHealthRecord();
	};

	// Validation Methods
	const validateProfileForm = () => {
		const newErrors = {};

		// Required field validations
		if (!profileData.firstName?.trim()) {
			newErrors.firstName = "First name is required";
		}

		if (!profileData.lastName?.trim()) {
			newErrors.lastName = "Last name is required";
		}

		if (!profileData.dateOfBirth) {
			newErrors.dateOfBirth = "Date of birth is required";
		} else {
			const birthDate = new Date(profileData.dateOfBirth);
			const today = new Date();
			const age = today.getFullYear() - birthDate.getFullYear();

			if (birthDate > today) {
				newErrors.dateOfBirth = "Birth date cannot be in the future";
			} else if (age > 150) {
				newErrors.dateOfBirth = "Please enter a valid birth date";
			}
		}

		if (!profileData.gender) {
			newErrors.gender = "Gender selection is required";
		}

		if (!profileData.phoneNumber?.trim()) {
			newErrors.phoneNumber = "Phone number is required";
		} else if (!isValidPhoneNumber(profileData.phoneNumber)) {
			newErrors.phoneNumber = "Please enter a valid phone number";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateHealthRecordForm = () => {
		const newErrors = {};

		if (!healthRecord.recordType) {
			newErrors.recordType = "Record type is required";
		}

		if (!healthRecord.title?.trim()) {
			newErrors.title = "Record title is required";
		}

		if (!healthFile) {
			newErrors.healthFile = "Health record file is required";
		}

		if (healthRecord.date) {
			const recordDate = new Date(healthRecord.date);
			const today = new Date();

			if (recordDate > today) {
				newErrors.date = "Record date cannot be in the future";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateFile = (file, maxSizeMB) => {
		const maxSize = maxSizeMB * 1024 * 1024;

		if (file.size > maxSize) {
			return `File size must be less than ${maxSizeMB}MB`;
		}

		return null;
	};

	const isValidPhoneNumber = (phone) => {
		const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
		const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
		return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
	};

	// Utility Methods
	const handleApiError = (error, defaultMessage) => {
		console.error("API Error:", error);

		const errorMessage =
			error?.response?.data?.message || error?.message || defaultMessage;

		setErrors((prev) => ({
			...prev,
			submit: errorMessage,
		}));
	};

	const clearErrors = () => {
		setErrors({});
	};

	const clearFieldError = (fieldName) => {
		if (errors[fieldName]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[fieldName];
				return newErrors;
			});
		}
	};

	const resetHealthRecordForm = () => {
		setHealthRecord({
			recordType: "",
			title: "",
			date: "",
			description: "",
		});
		setHealthFile(null);
		setFilePreview("");
	};

	const goToNextStep = () => {
		setCurrentStep(2);
	};

	const goToPreviousStep = () => {
		if (hasProfile) return; // Don't allow going back if profile exists
		setCurrentStep(1);
	};

	// Render Methods
	const renderStepIndicator = () => (
		<div className="flex items-center justify-center mb-8">
			<div className="flex items-center">
				{/* Step 1 */}
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
						currentStep >= 1
							? "bg-blue-600 border-blue-600 text-white"
							: "border-gray-300 text-gray-300"
					}`}
				>
					{hasProfile || currentStep > 1 ? "✓" : "1"}
				</div>
				<div
					className={`w-16 h-1 mx-2 ${
						currentStep > 1 ? "bg-blue-600" : "bg-gray-300"
					}`}
				></div>

				{/* Step 2 */}
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
						currentStep >= 2
							? "bg-blue-600 border-blue-600 text-white"
							: "border-gray-300 text-gray-300"
					}`}
				>
					2
				</div>
			</div>

			<div className="mt-4 text-center">
				<p className="text-sm font-medium text-gray-900">
					{currentStep === 1 ? "Create Profile" : "Upload Health Records"}
				</p>
				<p className="text-xs text-gray-500">
					{currentStep === 1
						? "Set up your patient profile"
						: "Add your medical documents"}
				</p>
			</div>
		</div>
	);

	const renderAlert = (message, type = "success") => {
		if (!message) return null;

		const bgColor =
			type === "success"
				? "bg-green-50 border-green-200"
				: "bg-red-50 border-red-200";
		const textColor = type === "success" ? "text-green-800" : "text-red-800";

		return (
			<div className={`p-4 mb-6 border rounded-lg ${bgColor}`}>
				<p className={`text-sm font-medium ${textColor}`}>{message}</p>
			</div>
		);
	};

	const renderInput = (
		name,
		label,
		type = "text",
		required = false,
		placeholder = "",
	) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			<input
				type={type}
				name={name}
				value={
					name.includes(".")
						? name.split(".").reduce((obj, key) => obj?.[key], profileData) ||
							""
						: profileData[name] || ""
				}
				onChange={handleProfileChange}
				placeholder={placeholder}
				className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
					errors[name] ? "border-red-500" : "border-gray-300"
				}`}
				disabled={loading}
			/>
			{errors[name] && (
				<p className="mt-1 text-sm text-red-600">{errors[name]}</p>
			)}
		</div>
	);

	const renderSelect = (
		name,
		label,
		options,
		required = false,
		isObject = false,
	) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			<select
				name={name}
				value={profileData[name] || ""}
				onChange={handleProfileChange}
				className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
					errors[name] ? "border-red-500" : "border-gray-300"
				}`}
				disabled={loading}
			>
				<option value="">Select {label.toLowerCase()}</option>
				{options.map((option) => (
					<option
						key={isObject ? option.value : option}
						value={isObject ? option.value : option}
					>
						{isObject ? option.label : option}
					</option>
				))}
			</select>
			{errors[name] && (
				<p className="mt-1 text-sm text-red-600">{errors[name]}</p>
			)}
		</div>
	);

	const renderHealthRecordInput = (
		name,
		label,
		type = "text",
		required = false,
	) => (
		<div className="mb-4">
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			{type === "textarea" ? (
				<textarea
					name={name}
					value={healthRecord[name] || ""}
					onChange={handleHealthRecordChange}
					rows="3"
					className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
						errors[name] ? "border-red-500" : "border-gray-300"
					}`}
					disabled={loading}
				/>
			) : (
				<input
					type={type}
					name={name}
					value={healthRecord[name] || ""}
					onChange={handleHealthRecordChange}
					className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
						errors[name] ? "border-red-500" : "border-gray-300"
					}`}
					disabled={loading}
				/>
			)}
			{errors[name] && (
				<p className="mt-1 text-sm text-red-600">{errors[name]}</p>
			)}
		</div>
	);

	const renderProfileForm = () => (
		<form onSubmit={handleProfileSubmit} className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Personal Information
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{renderInput(
						"firstName",
						"First Name",
						"text",
						true,
						"Enter your first name",
					)}
					{renderInput(
						"lastName",
						"Last Name",
						"text",
						true,
						"Enter your last name",
					)}
					{renderInput("dateOfBirth", "Date of Birth", "date", true)}
					{renderSelect("gender", "Gender", genderOptions, true, true)}
					{renderInput(
						"phoneNumber",
						"Phone Number",
						"tel",
						true,
						"+91 98765 43210",
					)}
				</div>

				{/* Profile Picture Upload */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Profile Picture
					</label>
					<div className="flex items-center space-x-4">
						<div className="flex-shrink-0">
							{profilePreview ? (
								<img
									src={profilePreview}
									alt="Profile preview"
									className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
								/>
							) : (
								<div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center">
									<svg
										className="w-8 h-8 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
								</div>
							)}
						</div>
						<div className="flex-1">
							<input
								type="file"
								accept="image/*"
								onChange={handleProfilePictureChange}
								className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
								disabled={loading}
							/>
							<p className="text-xs text-gray-500 mt-1">
								Max file size: 5MB. Supports: JPG, PNG, GIF
							</p>
						</div>
					</div>
					{errors.profilePicture && (
						<p className="mt-1 text-sm text-red-600">{errors.profilePicture}</p>
					)}
				</div>
			</div>

			{/* Address Information */}
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Address Information
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{renderInput(
						"address.street",
						"Street Address",
						"text",
						false,
						"Enter street address",
					)}
					{renderInput("address.city", "City", "text", false, "Enter city")}
					{renderInput("address.state", "State", "text", false, "Enter state")}
					{renderInput(
						"address.zipCode",
						"ZIP Code",
						"text",
						false,
						"Enter ZIP code",
					)}
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Country
					</label>
					<input
						type="text"
						name="address.country"
						value="India"
						readOnly
						className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
					/>
				</div>
			</div>

			{/* Emergency Contact */}
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Emergency Contact
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{renderInput(
						"emergencyContact.name",
						"Contact Name",
						"text",
						false,
						"Enter contact name",
					)}

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Relationship
						</label>
						<select
							name="emergencyContact.relationship"
							value={profileData.emergencyContact?.relationship || ""}
							onChange={handleProfileChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
							disabled={loading}
						>
							<option value="">Select relationship</option>
							{relationships.map((rel) => (
								<option key={rel} value={rel}>
									{rel}
								</option>
							))}
						</select>
					</div>

					{renderInput(
						"emergencyContact.phoneNumber",
						"Contact Phone",
						"tel",
						false,
						"+91 98765 43210",
					)}
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex justify-between items-center pt-6">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
					disabled={loading}
				>
					Cancel
				</button>

				<button
					type="submit"
					disabled={loading}
					className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
				>
					{loading && (
						<svg
							className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					)}
					Create Profile
				</button>
			</div>
		</form>
	);

	const renderHealthRecordForm = () => (
		<form onSubmit={handleHealthRecordSubmit} className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Health Record Details
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Record Type
							<span className="text-red-500 ml-1">*</span>
						</label>
						<select
							name="recordType"
							value={healthRecord.recordType}
							onChange={handleHealthRecordChange}
							className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
								errors.recordType ? "border-red-500" : "border-gray-300"
							}`}
							disabled={loading}
						>
							<option value="">Select record type</option>
							{recordTypes.map((type) => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
						{errors.recordType && (
							<p className="mt-1 text-sm text-red-600">{errors.recordType}</p>
						)}
					</div>

					{renderHealthRecordInput("title", "Record Title", "text", true)}
					{renderHealthRecordInput("date", "Record Date", "date")}
				</div>

				{renderHealthRecordInput("description", "Description", "textarea")}

				{/* File Upload */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Upload File
						<span className="text-red-500 ml-1">*</span>
					</label>
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
						<input
							type="file"
							onChange={handleHealthFileChange}
							className="hidden"
							id="health-file-upload"
							accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
							disabled={loading}
						/>
						<label
							htmlFor="health-file-upload"
							className="cursor-pointer flex flex-col items-center"
						>
							<svg
								className="w-12 h-12 text-gray-400 mb-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
								/>
							</svg>
							<p className="text-sm text-gray-600">
								{filePreview || "Click to upload or drag and drop"}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								PDF, JPG, PNG, DOC up to 10MB
							</p>
						</label>
					</div>
					{errors.healthFile && (
						<p className="mt-1 text-sm text-red-600">{errors.healthFile}</p>
					)}
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex justify-between items-center pt-6">
				<button
					type="button"
					onClick={() => navigate("/patient/dashboard")}
					className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
					disabled={loading}
				>
					Skip for Now
				</button>

				<button
					type="submit"
					disabled={loading}
					className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
				>
					{loading && (
						<svg
							className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					)}
					Upload Record
				</button>
			</div>
		</form>
	);

	// Main Render
	if (loading && currentStep === 1 && !hasProfile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						{hasProfile ? "Upload Health Records" : "Complete Your Profile"}
					</h1>
					<p className="text-gray-600">
						{hasProfile
							? "Upload your medical documents and health records for better healthcare management"
							: "Create your patient profile to get started with comprehensive healthcare management"}
					</p>
				</div>

				{/* Step Indicator */}
				{renderStepIndicator()}

				{/* Alerts */}
				{successMessage && renderAlert(successMessage, "success")}
				{errors.submit && renderAlert(errors.submit, "error")}
				{errors.general && renderAlert(errors.general, "error")}

				{/* Form Content */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					<div className="p-8">
						{currentStep === 1 && !hasProfile
							? renderProfileForm()
							: renderHealthRecordForm()}
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8">
					<p className="text-sm text-gray-500">
						Your data is secure and encrypted. We follow HIPAA compliance
						standards.
					</p>
				</div>
			</div>
		</div>
	);
};

export default PatientCompleteProfile;
