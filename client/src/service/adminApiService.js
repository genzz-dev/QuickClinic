import apiService from "./apiservice";

/**
 * Admin API Service - All admin-related API calls
 */
/**
 * Create Admin Profile
 */
export const createAdminProfile = async (profileData, file) => {
  const formData = new FormData();
  Object.entries(profileData).forEach(([key, value]) => formData.append(key, value));
  if (file) {
    formData.append('profilePicture', file);
  }
  return await apiService.post('/admin/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/**
 * Add Clinic
 */
export const addClinic = async (clinicData, logo, files = []) => {
  const formData = new FormData();
  
  Object.entries(clinicData).forEach(([key, value]) => {
    if (key === 'address' && typeof value === 'object' && value !== null) {
      // Append address fields individually
      Object.entries(value).forEach(([addressKey, addressValue]) => {
        if (addressKey !== 'coordinates') {
          formData.append(`address.${addressKey}`, addressValue);
        } else if (addressValue) {
          formData.append(`address.coordinates.lat`, addressValue.lat);
          formData.append(`address.coordinates.lng`, addressValue.lng);
        }
      });
    } else if (key === 'contact' && typeof value === 'object' && value !== null) {
      // Append contact fields individually
      Object.entries(value).forEach(([contactKey, contactValue]) => {
        formData.append(`contact.${contactKey}`, contactValue);
      });
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  console.log('Form data entries:', [...formData.entries()]);

  if (logo) {
    formData.append("logo", logo);
  }
  if (files) {
    files.forEach((file) => {
      formData.append("photos", file);
    });
  }
  
  return await apiService.post('/admin/clinics', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
};


/**
 * Update Clinic 
 */
export const updateClinic = async (clinicData, logo, files = []) => {
  const formData = new FormData();
  Object.entries(clinicData).forEach(([key, value]) => { formData.append(key, value) });
  if (logo) {
    formData.append("logo", logo);
  }
  if (files) {
    files.forEach((file) => {
      formData.append("photos", file);
    });
  }
  return await apiService.put('/admin/clinics', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

/**
 * Add Docotor To the Clinic 
 */
export const addDoctor = async (doctorId) => {
  const formData = new FormData();
  formData.append("doctorId", doctorId);
  return await apiService.post('/admin/clinics/doctors', formData);
};

/**
 * Get All Clinic's Doctors
 */
export const getClinicDoctors = async () => {
  return await apiService.get('/admin/clinics/doctors');
};

/**
 * Delete Doctor from Clinic
 */
export const deleteDoctorFromClinic = async (doctorId) => {
  return await apiService.delete(`/admin/clinics/doctors/${doctorId}`);
};

/**
 * Set Doctor Schedule 
 */
export const setDoctorSchedule = async (doctorId, scheduleData) => {
  const formData = new FormData();
  Object.entries(scheduleData).forEach(([key, value]) => { formData.append(key, value) });
  return await apiService.post(`/admin/doctors/${doctorId}/schedule`, formData);
};

/**
 * Get Doctor Schedule
 */
export const getDoctorSchedule = async (doctorId) => {
  return await apiService.get(`/admin/doctors/${doctorId}/schedule`);
};

/**
 * Send Code for Google Verification 
 */
export const sendVerificationOTP = async () => {
  return await apiService.post('/admin/clinics/verify/send-otp');
};

/**
 * Verify code for google verify 
 */
export const verifyOtp = async (code) => {
  const formData = new FormData();
  formData.append("code", code);
  return await apiService.post('/clinics/verify/confirm-otp', formData);
};
/**
 * Check if Admin Profile Exists
 */
export const checkAdminProfileExists = async () => {
  return await apiService.get('/admin/profile/status');
};

/**
 * Check if Admin Has Clinic
 */
export const checkClinicExists = async () => {
  return await apiService.get('/admin/clinic/status');
};
/**
 * Get Clinic Info
 */
export const getClinicInfo = async () => {
  return await apiService.get('/admin/getClinic');
};