import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Star, Clock, DollarSign, Filter, X, User, Building } from 'lucide-react';
import { searchDoctors,
  getDoctorById,
  getDoctorSchedule,
  getDoctorAvailability,
  checkDoctorAvailability,
  searchClinics,
  getClinicById,
  getClinicDoctors,
  getSearchSuggestions } from '../service/publicapi';

const SearchBar = ({ onSearch, isExpanded, onToggle }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const result = await getSearchSuggestions(query);
          if (result.success) {
            setSuggestions(result.data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    
    if (suggestion.type === 'doctor') {
      navigate(`/doctor/${suggestion.id}`);
    } else {
      navigate(`/clinic/${suggestion.id}`);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors, clinics, or specializations..."
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isExpanded ? 'w-80' : 'w-64'
            } transition-all duration-300`}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
          />
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <div
                key={`${suggestion.type}-${suggestion.id}`}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center space-x-3">
                  {suggestion.type === 'doctor' ? (
                    <User className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Building className="w-4 h-4 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">
                      {suggestion.type === 'doctor' ? suggestion.specialization : suggestion.location}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No suggestions found</div>
          )}
        </div>
      )}
    </div>
  );
};

const FilterPanel = ({ filters, onFilterChange, onClose }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
          <select
            value={filters.searchType}
            onChange={(e) => onFilterChange('searchType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="doctors">Doctors</option>
            <option value="clinics">Clinics</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
          <input
            type="text"
            value={filters.specialization}
            onChange={(e) => onFilterChange('specialization', e.target.value)}
            placeholder="e.g., Cardiology"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => onFilterChange('city', e.target.value)}
            placeholder="e.g., Mumbai"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={filters.state}
            onChange={(e) => onFilterChange('state', e.target.value)}
            placeholder="e.g., Maharashtra"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
          <select
            value={filters.minRating}
            onChange={(e) => onFilterChange('minRating', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Fee (₹)</label>
          <input
            type="number"
            value={filters.maxFee}
            onChange={(e) => onFilterChange('maxFee', e.target.value)}
            placeholder="e.g., 1000"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating_desc">Rating (High to Low)</option>
            <option value="rating_asc">Rating (Low to High)</option>
            <option value="fee_asc">Fee (Low to High)</option>
            <option value="fee_desc">Fee (High to Low)</option>
            <option value="name_asc">Name (A to Z)</option>
            <option value="name_desc">Name (Z to A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor, onClick }) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(doctor)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          {doctor.profilePicture ? (
            <img 
              src={doctor.profilePicture} 
              alt={`${doctor.firstName} ${doctor.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-blue-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-blue-600 font-medium">{doctor.specialization}</p>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{doctor.averageRating || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>₹{doctor.consultationFee}</span>
            </div>
          </div>
          
          {doctor.clinicId && (
            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{doctor.clinicId.name}</span>
              {doctor.clinicId.address && (
                <span className="text-gray-500">
                  • {doctor.clinicId.address.city}, {doctor.clinicId.address.state}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ClinicCard = ({ clinic, onClick }) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(clinic)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Building className="w-8 h-8 text-green-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
          
          <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{clinic.address.formattedAddress}</span>
          </div>
          
          {clinic.contact && (
            <div className="flex items-center space-x-1 mt-2 text-sm text-gray-600">
              <span>📞 {clinic.contact.phone}</span>
            </div>
          )}
          
          {clinic.facilities && clinic.facilities.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ searchQuery, doctors, clinics, isLoading, onDoctorClick, onClinicClick }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalResults = doctors.length + clinics.length;

  if (totalResults === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No results found for "{searchQuery}"</div>
        <p className="text-gray-400 mt-2">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchQuery && (
        <div className="text-gray-600">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
        </div>
      )}
      
      {doctors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => (
              <DoctorCard 
                key={doctor._id} 
                doctor={doctor} 
                onClick={onDoctorClick}
              />
            ))}
          </div>
        </div>
      )}
      
      {clinics.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Clinics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clinics.map((clinic) => (
              <ClinicCard 
                key={clinic._id} 
                clinic={clinic} 
                onClick={onClinicClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MedicalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    searchType: 'all',
    specialization: '',
    city: '',
    state: '',
    minRating: '',
    maxFee: '',
    sort: 'rating_desc'
  });
  
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    try {
      const searchPromises = [];
      
      if (filters.searchType === 'all' || filters.searchType === 'doctors') {
        const doctorParams = {
          name: query,
          specialization: filters.specialization,
          city: filters.city,
          state: filters.state,
          minRating: filters.minRating,
          maxFee: filters.maxFee,
          sort: filters.sort
        };
        searchPromises.push(searchDoctors(doctorParams));
      }
      
      if (filters.searchType === 'all' || filters.searchType === 'clinics') {
        const clinicParams = {
          city: filters.city,
          state: filters.state
        };
        searchPromises.push(searchClinics(clinicParams));
      }
      
      const results = await Promise.all(searchPromises);
      
      if (filters.searchType === 'all') {
        setDoctors(results[0]?.data || []);
        setClinics(results[1]?.data || []);
      } else if (filters.searchType === 'doctors') {
        setDoctors(results[0]?.data || []);
        setClinics([]);
      } else if (filters.searchType === 'clinics') {
        setDoctors([]);
        setClinics(results[0]?.data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDoctorClick = (doctor) => {
    navigate(`/doctor/${doctor._id}`);
  };

  const handleClinicClick = (clinic) => {
    navigate(`/clinic/${clinic._id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <SearchBar onSearch={handleSearch} />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>
      
      <SearchResults
        searchQuery={searchQuery}
        doctors={doctors}
        clinics={clinics}
        isLoading={isLoading}
        onDoctorClick={handleDoctorClick}
        onClinicClick={handleClinicClick}
      />
    </div>
  );
};

export default MedicalSearch;