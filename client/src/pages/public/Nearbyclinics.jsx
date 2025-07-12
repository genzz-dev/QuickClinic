import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Globe, Clock, User, Star, ChevronRight } from 'lucide-react';

// Import your public API methods
import { searchClinics, getClinicDoctors } from '../../service/publicapi'
const NearbyClinicsPage = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [hoveredClinic, setHoveredClinic] = useState(null);
  const [clinicDoctors, setClinicDoctors] = useState({});

  // Get user's location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // First try to get precise location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              await fetchNearbyClinics(latitude, longitude);
            },
            async (error) => {
              console.log('Geolocation denied, falling back to IP location');
              await getLocationFromIP();
            }
          );
        } else {
          await getLocationFromIP();
        }
      } catch (error) {
        setLocationError('Unable to get location');
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Fallback to IP-based location
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setUserLocation({ lat: data.latitude, lng: data.longitude, city:data.city});
      
      await fetchNearbyClinics(data.latitude, data.longitude, data.city, data.region);
    } catch (error) {
      setLocationError('Unable to determine location');
      setLoading(false);
    }
  };

  // Fetch nearby clinics
  const fetchNearbyClinics = async (lat, lng, city, state) => {
    try {
      const params = {};
      if (city) params.city = city;
      if (state) params.state = state;
      
      const response = await searchClinics(params);
      if (response.success) {
        setClinics(response.data);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors for a clinic on hover
  const handleClinicHover = async (clinicId) => {
    setHoveredClinic(clinicId);
    
    if (!clinicDoctors[clinicId]) {
      try {
        const response = await getClinicDoctors(clinicId);
        if (response.success) {
          setClinicDoctors(prev => ({
            ...prev,
            [clinicId]: response.data.doctors
          }));
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    }
  };

  const handleClinicClick = (clinicId) => {
    window.location.href = '/';
  };

  const handleDoctorClick = (doctorId) => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding nearby clinics...</p>
        </div>
      </div>
    );
  }
  if (locationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{locationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Nearby Clinics</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Found {clinics.length} clinics in your area
          </p>
        </div>
      </div>

      {/* Clinics List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            
            <div
              key={clinic._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
              onMouseEnter={() => handleClinicHover(clinic._id)}
              onMouseLeave={() => setHoveredClinic(null)}
              onClick={() => handleClinicClick(clinic._id)}
            >
              {/* Clinic Image */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                {clinic.logo ? (
                  <img 
                    src={clinic.logo} 
                    alt={clinic.name}
                    className="h-full w-full object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="text-white text-4xl font-bold">
                    {clinic.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Clinic Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {clinic.name}
                </h3>
                
                {clinic.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {clinic.description}
                  </p>
                )}

                {/* Address */}
                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    <div>{clinic.address.formattedAddress}</div>
                    <div>{clinic.address.city}, {clinic.address.state} {clinic.address.zipCode}</div>
                  </div>
                </div>
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{clinic.contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{clinic.contact.email}</span>
                  </div>
                  {clinic.contact.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-blue-600 hover:underline">
                        Visit Website
                      </span>
                    </div>
                  )}
                </div>

                {/* Opening Hours */}
                {clinic.openingHours && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Today: {clinic.openingHours.monday?.open} - {clinic.openingHours.monday?.close}
                    </span>
                  </div>
                )}

                {/* Facilities */}
                {clinic.facilities && clinic.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {clinic.facilities.slice(0, 3).map((facility, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {facility}
                      </span>
                    ))}
                    {clinic.facilities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{clinic.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* View Details Button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Click to view details
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Doctors Popup on Hover */}
              {hoveredClinic === clinic._id && (
                <div className="absolute top-0 left-full ml-2 w-80 bg-white rounded-lg shadow-xl border z-10 p-4 hidden md:block">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Available Doctors
                  </h4>
                  {clinicDoctors[clinic._id] ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {clinicDoctors[clinic._id].map((doctor) => (
                        <div
                          key={doctor._id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDoctorClick(doctor._id);
                          }}
                        >
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            {doctor.profilePicture ? (
                              <img 
                                src={doctor.profilePicture} 
                                alt={doctor.firstName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-white text-sm font-medium">
                                {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doctor.specialization}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600 ml-1">
                                  {doctor.averageRating || 'N/A'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-600">
                                ₹{doctor.consultationFee}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Loading doctors...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile doctors view */}
              {hoveredClinic === clinic._id && (
                <div className="md:hidden mt-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Available Doctors
                  </h4>
                  {clinicDoctors[clinic._id] ? (
                    <div className="space-y-2">
                      {clinicDoctors[clinic._id].slice(0, 3).map((doctor) => (
                        <div
                          key={doctor._id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDoctorClick(doctor._id);
                          }}
                        >
                          <div>
                            <div className="font-medium text-sm">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {doctor.specialization}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                      {clinicDoctors[clinic._id].length > 3 && (
                        <div className="text-center text-sm text-gray-500">
                          +{clinicDoctors[clinic._id].length - 3} more doctors
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-1"></div>
                      <p className="text-xs text-gray-500">Loading...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No clinics found */}
        {clinics.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clinics found in your area
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your location or search in a different area
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyClinicsPage;