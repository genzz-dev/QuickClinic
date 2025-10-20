import apiService from './apiservice.js';

/**
 * Doctor API Service - All doctor-related API calls
 */

/**
 * Create Doctor Profile
 * @param {Object} doctorData - Doctor profile data
 * @param {File} file - Profile picture file (optional)
 */
export const createDoctorProfile = async (doctorData, file) => {
  const formData = new FormData();

  // Append all doctorData fields to formData
  Object.entries(doctorData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle arrays like qualifications
      value.forEach((item) => formData.append(key, item));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  // Add profile picture if provided
  if (file) {
    formData.append('profilePicture', file);
  }

  return await apiService.post('/doctors/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Update Doctor Profile
 * @param {Object} updateData - Data fields to update
 * @param {File} file - Profile picture file (optional)
 */
export const updateDoctorProfile = async (updateData, file) => {
  const formData = new FormData();

  // Append all update fields to formData
  Object.entries(updateData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Handle arrays like qualifications
      value.forEach((item) => formData.append(key, item));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  // Add profile picture if provided
  if (file) {
    formData.append('profilePicture', file);
  }

  return await apiService.put('/doctors/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Get Doctor Profile
 */
export const getDoctorProfile = async () => {
  return await apiService.get('/doctors/profile');
};

/**
 * Get Doctors By Clinic
 * @param {string} clinicId - Clinic ObjectId
 */
export const getDoctorsByClinic = async (clinicId) => {
  return await apiService.get(`/doctors/clinic/${clinicId}`);
};

/**
 * Doctor Leaves Current Clinic
 */
export const leaveCurrentClinic = async () => {
  return await apiService.post('/doctors/leave-clinic');
};

export const checkDoctorProfileStatus = async () => {
  return await apiService.get('/doctors/profile-status');
};

/**
 * Check Doctor Clinic Status
 */
export const checkDoctorClinicStatus = async () => {
  return await apiService.get('/doctors/clinic-status');
};
export const getDoctorClinicInfo = async () => {
  return await apiService.get('/doctors/clinic');
};
/**
 * Get Doctor Schedule
 */
export const getDoctorSchedule = async () => {
  return await apiService.get('/doctors/schedule');
};
// Export all functions as default object for convenience
export default {
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorProfile,
  getDoctorsByClinic,
  leaveCurrentClinic,
  checkDoctorProfileStatus,
  checkDoctorClinicStatus,
  getDoctorSchedule,
};
