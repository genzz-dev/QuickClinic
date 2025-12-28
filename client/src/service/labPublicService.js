import apiService from './apiservice';

export const searchLabs = (params = {}) => apiService.get('/lab/search', { params });
export const getLabDetails = (labId) => apiService.get(`/lab/${labId}`);
export const getLabTests = (labId) => apiService.get(`/lab/${labId}/tests`);

export default {
  searchLabs,
  getLabDetails,
  getLabTests,
};
