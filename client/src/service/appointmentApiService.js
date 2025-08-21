import apiService from './apiservice.js';

/**
 * Appointment API Service - All appointment-related API calls
 */


export const bookAppointment = async (appointmentData) => {
  return await apiService.post('/appointments', appointmentData, {
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * Get Patient Appointments
 */
export const getPatientAppointments = async (filters = {}) => {
  return await apiService.get('/appointments/patient', { params: filters });
};

/**
 * Get Doctor Appointments
 */
export const getDoctorAppointments = async (filters = {}) => {
  return await apiService.get('/appointments/doctor', { params: filters });
};

/**
 * Get Clinic Appointments
 */
export const getClinicAppointments = async (filters = {}) => {
  return await apiService.get('/appointments/clinic', { params: filters });
};

/**
 * Update Appointment

 */
export const updateAppointment = async (appointmentId, updateData) => {
  return await apiService.put(`/appointments/${appointmentId}`, updateData, {
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * Update Appointment Status

 */
export const updateAppointmentStatus = async (appointmentId, statusData) => {
  return await apiService.put(`/appointments/${appointmentId}/status`, statusData, {
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * Get Appointment Details

 */
export const getAppointmentDetails = async (appointmentId) => {
  return await apiService.get(`/appointments/${appointmentId}`);
};

/**
 * Cancel Appointment

 */
export const cancelAppointment = async (appointmentId) => {
  return await apiService.put(`/appointments/${appointmentId}/cancel`);
};
/**
 * Get patient info for appointment
 */
export const getPatientInfoForAppointment = async (appointmentId) => {
  return await apiService.get(`/appointments/${appointmentId}/patient-info`);
};

// Export all functions as default object
export default {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getClinicAppointments,
  updateAppointment,
  updateAppointmentStatus,
  getAppointmentDetails,
  cancelAppointment,
  getPatientInfoForAppointment 
};
