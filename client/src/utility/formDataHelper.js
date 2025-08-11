// utility/formDataHelper.js
export const createFormDataFromObject = (data, files = {}) => {
  const formData = new FormData();
  
  const appendToFormData = (key, value, prefix = '') => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      return;
    }
    
    // Handle arrays (like facilities)
    if (Array.isArray(value)) {
      value.forEach(item => {
        formData.append(key, item);
      });
      return;
    }
    
    // Handle nested objects
    if (typeof value === 'object') {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        appendToFormData(nestedKey, nestedValue, fullKey);
      });
      return;
    }
    
    // Handle primitive values
    formData.append(fullKey, value);
  };
  
  // Process main data
  Object.entries(data).forEach(([key, value]) => {
    appendToFormData(key, value);
  });
  
  // Handle file uploads
  if (files.logo) {
    formData.append('logo', files.logo);
  }
  
  if (files.photos && files.photos.length > 0) {
    files.photos.forEach(photo => {
      formData.append('photos', photo);
    });
  }
  
  return formData;
};
