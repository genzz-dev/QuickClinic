import apiService from './apiservice';
import { createFormDataFromObject } from '../utility/formDataHelper';

export const createStaffProfile = (profileData, profilePicture) => {
  const formData = createFormDataFromObject(profileData, { photos: [], logo: null });
  if (profilePicture) {
    formData.append('profilePicture', profilePicture);
  }
  return apiService.post('/lab-staff/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateStaffProfile = (updates, profilePicture) => {
  const formData = createFormDataFromObject(updates, { photos: [], logo: null });
  if (profilePicture) {
    formData.append('profilePicture', profilePicture);
  }
  return apiService.put('/lab-staff/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getStaffProfile = () => apiService.get('/lab-staff/profile');
export const checkStaffProfileExists = () => apiService.get('/lab-staff/profile/check');
export const getMyAssignments = (params = {}) =>
  apiService.get('/lab-staff/assignments', { params });
export const getAssignmentDetails = (appointmentId) =>
  apiService.get(`/lab-staff/assignments/${appointmentId}`);
export const updateMyAssignmentStatus = (appointmentId, status, notes) =>
  apiService.put(`/lab-staff/assignments/${appointmentId}/status`, { status, notes });
export const completeAssignment = (appointmentId, notes) =>
  apiService.post(`/lab-staff/assignments/${appointmentId}/complete`, { notes });
export const uploadReportAndComplete = (appointmentId, reportFile, notes) => {
  const formData = new FormData();
  formData.append('reportFile', reportFile);
  if (notes) {
    formData.append('notes', notes);
  }
  return apiService.post(`/lab-staff/assignments/${appointmentId}/upload-report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default {
  createStaffProfile,
  updateStaffProfile,
  getStaffProfile,
  checkStaffProfileExists,
  getMyAssignments,
  getAssignmentDetails,
  updateMyAssignmentStatus,
  completeAssignment,
  uploadReportAndComplete,
};
