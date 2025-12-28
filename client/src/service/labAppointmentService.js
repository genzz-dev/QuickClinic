import apiService from './apiservice';

export const bookLabAppointment = (payload) => apiService.post('/lab-appointment/book', payload);
export const getPatientLabAppointments = (params = {}) =>
  apiService.get('/lab-appointment/patient', { params });
export const getLabAppointments = (params = {}) =>
  apiService.get('/lab-appointment/lab', { params });
export const assignStaffForCollection = (appointmentId, staffId) =>
  apiService.put(`/lab-appointment/${appointmentId}/assign-staff`, { staffId });
export const updateLabAppointmentStatus = (appointmentId, status) =>
  apiService.put(`/lab-appointment/${appointmentId}/status`, { status });

export default {
  bookLabAppointment,
  getPatientLabAppointments,
  getLabAppointments,
  assignStaffForCollection,
  updateLabAppointmentStatus,
};
