import apiService from "./apiservice";

/**
 * Prescription API Service - All prescription-related API calls
 */

/**
 * Create Prescription for an appointment
 */
export const createPrescription = async (appointmentId, prescriptionData) => {
  return await apiService.post(`/prescriptions/${appointmentId}`, prescriptionData, {
    headers: { 'Content-Type': 'application/json' }
  });
};

/**
 * Get all prescriptions for the logged-in patient
 */
export const getPatientPrescriptions = async () => {
  return await apiService.get('/prescriptions/patient');
};

/**
 * Get all prescriptions created by the logged-in doctor
 */
export const getDoctorPrescriptions = async (patientId = null) => {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await apiService.get(`/prescriptions/doctor${query}`);
};

/**
 * Get a specific prescription by ID
 */
export const getPrescription = async (prescriptionId) => {
  return await apiService.get(`/prescriptions/${prescriptionId}`);
};

export default {
  createPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescription
};
