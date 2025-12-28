// Geolocation service to detect user's city
import apiService from './apiservice';

/**
 * Get user's city from browser geolocation API
 */
export const getCityFromGeolocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding to get city from coordinates
          const city = await reversGeocode(latitude, longitude);
          resolve(city);
        } catch (err) {
          reject(err);
        }
      },
      (error) => {
        reject(error);
      },
      { timeout: 10000 }
    );
  });
};

/**
 * Reverse geocode coordinates to city name using a free API
 */
const reversGeocode = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || null;
  } catch (err) {
    console.error('Reverse geocoding failed:', err);
    return null;
  }
};

/**
 * Get user's city from IP-based geolocation (fallback)
 */
export const getCityFromIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.city || null;
  } catch (err) {
    console.error('IP-based geolocation failed:', err);
    return null;
  }
};

/**
 * Get user's city with fallback mechanism
 * First tries browser geolocation, then falls back to IP
 */
export const detectUserCity = async () => {
  try {
    // Try localStorage first for cached city
    const cachedCity = localStorage.getItem('userCity');
    if (cachedCity) {
      return cachedCity;
    }

    // Try browser geolocation
    try {
      const city = await getCityFromGeolocation();
      if (city) {
        localStorage.setItem('userCity', city);
        return city;
      }
    } catch (err) {
      console.log('Browser geolocation failed, falling back to IP');
    }

    // Fallback to IP-based geolocation
    const city = await getCityFromIP();
    if (city) {
      localStorage.setItem('userCity', city);
      return city;
    }

    return null;
  } catch (err) {
    console.error('City detection failed:', err);
    return null;
  }
};

/**
 * Clear cached city
 */
export const clearCachedCity = () => {
  localStorage.removeItem('userCity');
};

export default {
  detectUserCity,
  getCityFromGeolocation,
  getCityFromIP,
  clearCachedCity,
};
