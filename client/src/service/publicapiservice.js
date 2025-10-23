// Base API service with axios configuration
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/public`;

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper method for GET requests
const get = async (endpoint, params = {}) => {
  try {
    const response = await apiService.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

export { get };
