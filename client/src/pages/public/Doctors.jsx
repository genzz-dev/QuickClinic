import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Users, Award } from 'lucide-react';
import { searchDoctors } from '../../service/publicapi';
import HeaderSection from '../../components/public/Doctors/HeaderSection';
import FiltersPanel from '../../components/public/Doctors/FiltersPanel';
import DoctorCard from '../../components/public/Doctors/DoctorCard';
import LoadingState from '../../components/public/Doctors/LoadingState';
import ErrorState from '../../components/public/Doctors/ErrorState';
import NoResults from '../../components/public/Doctors/NoResults';
import Loading from '../../components/ui/Loading';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    specialization: '',
    priceRange: [0, 0],
    teleconsultation: false,
    minRating: 0,
    minExperience: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Dynamic filter options
  const [filterOptions, setFilterOptions] = useState({
    specializations: [],
    priceRange: { min: 0, max: 0 },
    experienceRange: { min: 0, max: 0 }
  });

  // Get user location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationError('Unable to get your location. Showing all doctors.');
            setUserLocation({ lat: 0, lng: 0 });
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 600000 
          }
        );
      } else {
        setLocationError('Geolocation is not supported by this browser.');
        setUserLocation({ lat: 0, lng: 0 });
      }
    };

    getUserLocation();
  }, []);

  // Fetch doctors based on location
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!userLocation) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 50, // 50km radius
          limit: 100
        };
        
        const response = await searchDoctors(params);
        setDoctors(response.data || []);
        setFilteredDoctors(response.data || []);
        
        // Generate dynamic filter options
        generateFilterOptions(response.data || []);
        
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [userLocation]);

  // Generate dynamic filter options based on fetched doctors
  const generateFilterOptions = (doctorsData) => {
    const specializations = [...new Set(doctorsData.map(doctor => doctor.specialization))];
    const fees = doctorsData.map(doctor => doctor.consultationFee).filter(fee => fee != null);
    const experiences = doctorsData.map(doctor => doctor.yearsOfExperience).filter(exp => exp != null);
    
    const minFee = fees.length > 0 ? Math.min(...fees) : 0;
    const maxFee = fees.length > 0 ? Math.max(...fees) : 0;
    
    setFilterOptions({
      specializations: specializations.sort(),
      priceRange: {
        min: minFee,
        max: maxFee
      },
      experienceRange: {
        min: experiences.length > 0 ? Math.min(...experiences) : 0,
        max: experiences.length > 0 ? Math.max(...experiences) : 0
      }
    });
    
    // Set initial price range in filters
    setFilters(prev => ({
      ...prev,
      priceRange: [minFee, maxFee]
    }));
  };

  // Apply filters
  useEffect(() => {
    let filtered = doctors;

    // Specialization filter
    if (filters.specialization) {
      filtered = filtered.filter(doctor => doctor.specialization === filters.specialization);
    }

    // Price filters
    filtered = filtered.filter(doctor => 
      doctor.consultationFee >= filters.priceRange[0] && 
      doctor.consultationFee <= filters.priceRange[1]
    );

    // Teleconsultation filter
    if (filters.teleconsultation) {
      filtered = filtered.filter(doctor => doctor.availableForTeleconsultation);
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(doctor => doctor.averageRating >= filters.minRating);
    }

    // Experience filter
    if (filters.minExperience > 0) {
      filtered = filtered.filter(doctor => doctor.yearsOfExperience >= filters.minExperience);
    }

    setFilteredDoctors(filtered);
  }, [filters, doctors]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      priceRange: [filterOptions.priceRange.min, filterOptions.priceRange.max],
      teleconsultation: false,
      minRating: 0,
      minExperience: 0
    });
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <Loading/>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <HeaderSection 
        userLocation={userLocation} 
        showFilters={showFilters} 
        setShowFilters={setShowFilters} 
        locationError={locationError} 
      />

      <FiltersPanel
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        handleFilterChange={handleFilterChange}
        filterOptions={filterOptions}
        formatCurrency={formatCurrency}
        clearFilters={clearFilters}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {userLocation ? 'Healthcare Professionals Near You' : 'All Healthcare Professionals'}
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">Within 50km radius</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorState error={error} />}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              handleDoctorClick={handleDoctorClick}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>

        {filteredDoctors.length === 0 && !loading && (
          <NoResults clearFilters={clearFilters} />
        )}
      </div>
    </div>
  );
};

export default Doctors;