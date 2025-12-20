import apiService from './apiservice';

/**
 * Search labs with filters
 */
export const searchLabs = async (params) => {
  return await apiService.get('/public/labs/search', { params });
};

/**
 * Get lab details by ID
 */
export const getLabById = async (labId) => {
  return await apiService.get(`/public/labs/${labId}`);
};

/**
 * Get nearby labs by city
 */
export const getNearbyLabs = async (city) => {
  return await apiService.get('/public/labs/nearby', { params: { city } });
};

/**
 * Book lab appointment (requires authentication)
 */
export const bookLabAppointment = async (appointmentData) => {
  return await apiService.post('/lab-appointment/book', appointmentData);
};

/**
 * Get patient's lab appointments
 */
export const getPatientLabAppointments = async () => {
  return await apiService.get('/lab-appointment/patient');
};

export default {
  searchLabs,
  getLabById,
  getNearbyLabs,
  bookLabAppointment,
  getPatientLabAppointments,
};
