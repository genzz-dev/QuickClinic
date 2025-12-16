import apiService from './apiservice';
import { createFormDataFromObject } from '../utility/formDataHelper';

export const createLabAdminProfile = (data) => apiService.post('/lab-admin/profile', data);

export const createLab = (labData, logoFile, photoFiles = []) => {
  const formData = createFormDataFromObject(labData, { logo: logoFile, photos: photoFiles });
  return apiService.post('/lab-admin/lab', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const searchLabStaff = (query) =>
  apiService.get('/lab-admin/staff/search', { params: query });
export const addStaffToLab = (staffId) => apiService.post('/lab-admin/staff/add', { staffId });
export const removeStaffFromLab = (staffId) => apiService.delete(`/lab-admin/staff/${staffId}`);
export const getLabStaff = () => apiService.get('/lab-admin/staff');

export const addLabTest = (testData) => apiService.post('/lab-admin/tests', testData);
export const updateLabTest = (testId, updates) =>
  apiService.put(`/lab-admin/tests/${testId}`, updates);
export const getLabInfo = () => apiService.get('/lab-admin/lab/info');

/**
 * Check if Lab Exists for current lab admin
 */
export const checkLabExists = async () => {
  return await apiService.get('/lab-admin/lab/status');
};

/**
 * Check if Lab Admin Profile Exists
 */
export const checkLabAdminProfileExists = async () => {
  return await apiService.get('/lab-admin/profile/status');
};

export default {
  createLabAdminProfile,
  createLab,
  searchLabStaff,
  addStaffToLab,
  removeStaffFromLab,
  getLabStaff,
  addLabTest,
  updateLabTest,
  getLabInfo,
  checkLabExists,
  checkLabAdminProfileExists,
};
