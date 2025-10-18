import apiService from "./apiservice";

/**
 * Patient API Service - All patient-related API calls
 */

/**
 * Create Patient Profile
 */
export const createPatientProfile = async (profileData, file) => {
	const formData = new FormData();

	// Handle nested objects like address and emergencyContact
	Object.entries(profileData).forEach(([key, value]) => {
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			// For nested objects like address, emergencyContact
			Object.entries(value).forEach(([nestedKey, nestedValue]) => {
				if (
					nestedValue !== undefined &&
					nestedValue !== null &&
					nestedValue !== ""
				) {
					formData.append(`${key}.${nestedKey}`, nestedValue);
				}
			});
		} else if (value !== undefined && value !== null && value !== "") {
			formData.append(key, value);
		}
	});

	if (file) {
		formData.append("profilePicture", file);
	}

	return await apiService.post("/patients/profile", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/**
 * Update Patient Profile
 */
export const updatePatientProfile = async (profileData, file) => {
	const formData = new FormData();

	// Handle nested objects like address and emergencyContact
	Object.entries(profileData).forEach(([key, value]) => {
		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			// For nested objects like address, emergencyContact
			Object.entries(value).forEach(([nestedKey, nestedValue]) => {
				if (
					nestedValue !== undefined &&
					nestedValue !== null &&
					nestedValue !== ""
				) {
					formData.append(`${key}.${nestedKey}`, nestedValue);
				}
			});
		} else if (value !== undefined && value !== null && value !== "") {
			formData.append(key, value);
		}
	});

	if (file) {
		formData.append("profilePicture", file);
	}

	return await apiService.put("/patients/profile", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/**
 * Get Patient Profile
 */
export const getPatientProfile = async () => {
	return await apiService.get("/patients/profile");
};

/**
 * Upload Health Record
 */
export const uploadHealthRecord = async (recordData, file) => {
	const formData = new FormData();

	// Add record data fields
	Object.entries(recordData).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			formData.append(key, value);
		}
	});

	if (file) {
		formData.append("file", file);
	}

	return await apiService.post("/patients/health-records", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};

/**
 * Get Patient Health Records
 */
export const getPatientHealthRecords = async () => {
	return await apiService.get("/patients/health-records");
};

/**
 * Delete Health Record
 */
export const deleteHealthRecord = async (recordId) => {
	return await apiService.delete(`/patients/health-records/${recordId}`);
};

/**
 * Get Patient Appointments
 */
export const getPatientAppointments = async () => {
	return await apiService.get("/patients/appointments");
};

/**
 * Book Appointment
 */
export const bookAppointment = async (appointmentData) => {
	return await apiService.post("/appointments", appointmentData, {
		headers: { "Content-Type": "application/json" },
	});
};

/**
 * Cancel Appointment
 */
export const cancelAppointment = async (appointmentId) => {
	return await apiService.put(
		`/appointments/${appointmentId}/cancel`,
		{},
		{
			headers: { "Content-Type": "application/json" },
		},
	);
};

/**
 * Reschedule Appointment
 */
export const rescheduleAppointment = async (appointmentId, newDateTime) => {
	return await apiService.put(
		`/appointments/${appointmentId}/reschedule`,
		{
			date: newDateTime.date,
			startTime: newDateTime.startTime,
			endTime: newDateTime.endTime,
		},
		{
			headers: { "Content-Type": "application/json" },
		},
	);
};

/**
 * Get Patient Prescriptions
 */
export const getPatientPrescriptions = async () => {
	return await apiService.get("/patients/prescriptions");
};

/**
 * Get Prescription by ID
 */
export const getPrescriptionById = async (prescriptionId) => {
	return await apiService.get(`/prescriptions/${prescriptionId}`);
};

/**
 * Check if Patient Profile Exists
 */
export const checkPatientProfileExists = async () => {
	return await apiService.get("/patients/profile/status");
};
export const updateProfilePicture = async (file) => {
	return await updatePatientProfile({}, file); // Empty data, just file
};

// For deleting profile picture, just use existing updatePatientProfile
export const deleteProfilePicture = async () => {
	const formData = new FormData();
	formData.append("profilePicture", ""); // Set empty string
	return await apiService.put("/patients/profile", formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
};
