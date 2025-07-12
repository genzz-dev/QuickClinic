import { useEffect } from 'react';

const LocationPrompt = ({ onSuccess, onError }) => {
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
      onError();
    }
  }, [onSuccess, onError]);

  return (
    <div className="bg-white shadow rounded-lg p-6 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">Finding clinics near you</h3>
      <p className="mt-1 text-sm text-gray-500">We're accessing your location to show nearby clinics.</p>
      <p className="mt-2 text-sm text-gray-500">If you don't see a permission request, please check your browser settings.</p>
    </div>
  );
};

export default LocationPrompt;