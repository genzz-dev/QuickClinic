import apiService from './apiservice';

/**
 * Rating API Service - All rating-related API calls
 */

/**
 * Create Rating
 */
export const createRating = async (ratingData) => {
	return await apiService.post("/ratings", ratingData);
};

/**
 * Get Doctor Ratings
 */
export const getDoctorRatings = async (doctorId, queryParams = {}) => {
	const params = new URLSearchParams(queryParams);
	return await apiService.get(`/ratings/doctor/${doctorId}?${params}`);
};

/**
 * Get Clinic Ratings
 */
export const getClinicRatings = async (clinicId, queryParams = {}) => {
	const params = new URLSearchParams(queryParams);
	return await apiService.get(`/ratings/clinic/${clinicId}?${params}`);
};

/**
 * Get Eligible Appointments
 */
export const getEligibleAppointments = async () => {
	return await apiService.get("/ratings/eligible-appointments");
};

/**
 * Update Rating
 */
export const updateRating = async (ratingId, updateData) => {
	return await apiService.put(`/ratings/${ratingId}`, updateData);
};

/**
 * Delete Rating
 */
export const deleteRating = async (ratingId) => {
	return await apiService.delete(`/ratings/${ratingId}`);
};

/**
 * Get Rating Stats
 */
export const getRatingStats = async (type, id) => {
	return await apiService.get(`/ratings/stats/${type}/${id}`);
};
