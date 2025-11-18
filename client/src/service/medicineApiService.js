import apiService from './apiservice';

/**
 * Medicine API Service - All medicine-related API calls
 * Uses OpenFDA API endpoints through backend
 */

/**
 * Get Medicine Suggestions (Auto-complete)
 * @param {string} query - Search query (minimum 2 characters)
 * @returns {Promise} - List of medicine suggestions
 */
export const getMedicineSuggestions = async (query) => {
  return await apiService.get('/medicine/suggestions', {
    params: { query },
  });
};

/**
 * Search Medicine by Name
 * @param {string} medicineName - Name of the medicine to search
 * @returns {Promise} - List of medicines matching the search
 */
export const searchMedicine = async (medicineName) => {
  return await apiService.get('/medicine/search', {
    params: { medicineName },
  });
};

/**
 * Get Detailed Medicine Information
 * @param {string} medicineName - Name of the medicine
 * @returns {Promise} - Detailed medicine information including dosage, warnings, etc.
 */
export const getMedicineDetails = async (medicineName) => {
  return await apiService.get(`/medicine/details/${encodeURIComponent(medicineName)}`);
};
