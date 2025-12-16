import apiService from './apiservice';

export const uploadLabReport = (appointmentId, file, testResults) => {
  const formData = new FormData();
  if (file) {
    formData.append('reportFile', file);
  }
  if (testResults) {
    formData.append('testResults', JSON.stringify(testResults));
  }
  return apiService.post(`/lab-report/upload/${appointmentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPatientLabReports = () => apiService.get('/lab-report/patient');
export const getDoctorPatientReports = () => apiService.get('/lab-report/doctor');
export const addDoctorRemarks = (reportId, remarks) =>
  apiService.put(`/lab-report/${reportId}/remarks`, { remarks });
export const getReportDetails = (reportId) => apiService.get(`/lab-report/${reportId}`);

export default {
  uploadLabReport,
  getPatientLabReports,
  getDoctorPatientReports,
  addDoctorRemarks,
  getReportDetails,
};
