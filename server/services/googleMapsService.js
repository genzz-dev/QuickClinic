import axios from 'axios';

// Extract place ID from Google Maps URL
export const extractPlaceIdFromUrl = async (url) => {
  try {
    console.log('Original URL:', url);

    // Step 1: Extract business name from /place/<name>
    const match = url.match(/\/place\/([^/]+)/);
    if (!match || !match[1]) {
      throw new Error('Business name not found in URL');
    }

    // Convert from URL format to readable name
    const businessName = decodeURIComponent(match[1].replace(/\+/g, ' '));
    console.log('Extracted business name:', businessName);

    // Step 2: Call Google Find Place API to get place_id
    const { data } = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: businessName,
          inputtype: 'textquery',
          fields: 'place_id',
          key: process.env.GOOGLE_API_KEY
        }
      }
    );

    if (data.status !== 'OK' || !data.candidates.length) {
      throw new Error(data.error_message || 'No place_id found');
    }

    const placeId = data.candidates[0].place_id;
    console.log('Fetched Place ID:', placeId);

    return placeId;
  } catch (error) {
    console.error('Error extracting place ID:', error);
    throw new Error('Could not extract valid place ID from URL');
  }
};


// Fetch place details from Google Places API
export const fetchPlaceDetails = async (placeId) => {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    console.log('Fetching details for place ID:', placeId);
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'name,address_component,geometry,adr_address',
          key: process.env.GOOGLE_API_KEY
        },
        timeout: 5000 // 5 second timeout
      }
    );
    
    console.log('Google API response:', response.data);
    
    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || `API status: ${response.data.status}`);
    }
    
    return response.data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw new Error(`Failed to fetch place details: ${error.message}`);
  }
};

// Fetch photos from Google Places API (max 3)
export const fetchPlacePhotos = async (placeId) => {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    // First get photo references
    const detailsResponse = await axios.get(
      `${process.env.GOOGLE_PLACES_ENDPOINT || 'https://maps.googleapis.com/maps/api/place'}/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'photo',
          key: process.env.GOOGLE_API_KEY
        }
      }
    );

    if (detailsResponse.data.status !== 'OK' || !detailsResponse.data.result.photos) {
      return []; // Return empty if no photos
    }

    // Get max 3 photo references
    const photoReferences = detailsResponse.data.result.photos.slice(0, 3);

    // Construct and return photo URLs only
    const photoUrls = photoReferences.map((photoRef) => {
      return `${process.env.GOOGLE_PLACES_ENDPOINT || 'https://maps.googleapis.com/maps/api/place'}/photo?maxwidth=800&photoreference=${photoRef.photo_reference}&key=${process.env.GOOGLE_API_KEY}`;
    });

    return photoUrls;
  } catch (error) {
    console.error('Error fetching place photos:', error);
    return []; // Return empty array if photo fetch fails
  }
};


// Parse address components from Google response
export const parseAddressComponents = (components) => {
  const address = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };

  components.forEach(component => {
    if (component.types.includes('street_number') || component.types.includes('route')) {
      address.street = (address.street ? address.street + ' ' : '') + component.long_name;
    } else if (component.types.includes('locality')) {
      address.city = component.long_name;
    } else if (component.types.includes('administrative_area_level_1')) {
      address.state = component.long_name;
    } else if (component.types.includes('postal_code')) {
      address.zipCode = component.long_name;
    } else if (component.types.includes('country')) {
      address.country = component.long_name;
    }
  });

  return address;
};

// Rate limiting utility to stay within free tier
let lastApiCallTime = 0;
const API_CALL_INTERVAL = 200; // ms between calls

export const withRateLimit = async (fn) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  
  if (timeSinceLastCall < API_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, API_CALL_INTERVAL - timeSinceLastCall));
  }
  
  lastApiCallTime = Date.now();
  return fn();
};

export  const cleanFormattedAddress=(formattedAddress)=> {
  if (!formattedAddress) return '';
  
  // Replace HTML entities with their character equivalents
  let cleanAddress = formattedAddress
    .replace(/&#39;/g, "'")  // Handle apostrophe
    .replace(/&amp;/g, "&") // Handle ampersand if present
    .replace(/&quot;/g, '"') // Handle quotes if present
    .replace(/&lt;/g, '<')   // Handle less-than if present
    .replace(/&gt;/g, '>');  // Handle greater-than if present
  
  // Remove all HTML tags
  cleanAddress = cleanAddress.replace(/<[^>]*>/g, '');
  
  // Remove any remaining HTML encoded characters (catch-all)
  cleanAddress = cleanAddress.replace(/&[^;]+;/g, '');
  
  // Trim whitespace and clean up any resulting double spaces
  cleanAddress = cleanAddress.trim().replace(/\s{2,}/g, ' ');
  
  return cleanAddress;
}
export const fetchPlacePhone = async (placeId) => {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    console.log('Fetching phone for place ID:', placeId);
    
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'formatted_phone_number,international_phone_number',
          key: process.env.GOOGLE_API_KEY
        },
        timeout: 5000
      }
    );
    
    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || `API status: ${response.data.status}`);
    }
    
    const result = response.data.result;
    return {
      formattedPhone: result.formatted_phone_number || null,
      internationalPhone: result.international_phone_number || null
    };
  } catch (error) {
    console.error('Error fetching place phone:', error);
    return { formattedPhone: null, internationalPhone: null };
  }
};
