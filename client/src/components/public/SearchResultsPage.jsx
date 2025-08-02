import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star, DollarSign, Filter, X, User, Building, ArrowLeft, Clock } from 'lucide-react';
import { searchDoctors, searchClinics } from '../../service/publicapi';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    searchType: 'all',
    specialization: '',
    city: '',
    state: '',
    minRating: '',
    maxFee: '',
    sort: 'rating_desc'
  });

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
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
          name: query,
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

  const handleNewSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  const FilterPanel = () => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          Filters
        </h3>
        <button 
          onClick={() => setShowFilters(false)} 
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Type</label>
          <select
            value={filters.searchType}
            onChange={(e) => handleFilterChange('searchType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            placeholder="e.g., Cardiology"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="e.g., Mumbai"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            placeholder="e.g., Maharashtra"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
          <select
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            onChange={(e) => handleFilterChange('maxFee', e.target.value)}
            placeholder="e.g., 1000"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      
      <div className="flex justify-end mt-6">
        <button
          onClick={() => handleSearch(searchQuery)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  const DoctorCard = ({ doctor }) => (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
      onClick={() => handleDoctorClick(doctor)}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-100">
            {doctor.profilePicture ? (
              <img 
                src={doctor.profilePicture} 
                alt={`${doctor.firstName} ${doctor.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-blue-600" />
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Dr. {doctor.firstName} {doctor.lastName}
          </h3>
          <p className="text-blue-600 font-medium mb-3">{doctor.specialization}</p>
          
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{doctor.averageRating || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">₹{doctor.consultationFee}</span>
            </div>
          </div>
          
          {doctor.clinicId && (
            <div className="flex items-start space-x-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">{doctor.clinicId.name}</span>
                {doctor.clinicId.address && (
                  <span className="text-gray-500 ml-1">
                    • {doctor.clinicId.address.city}, {doctor.clinicId.address.state}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

const ClinicCard = ({ clinic }) => (
 
  <div 
    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300 cursor-pointer"
    onClick={() => handleClinicClick(clinic)}
  >
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center border-2 border-green-100">
          <Building className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{clinic.name}</h3>
        
        <div className="flex items-start space-x-1 mb-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{clinic.address?.formattedAddress}</span>
        </div>
        
        {clinic.contact && (
          <div className="flex items-center space-x-1 mb-3 text-sm text-gray-600">
            <span>📞 {clinic.contact.phone}</span>
          </div>
        )}        
        {clinic.facilities && clinic.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {clinic.facilities.slice(0, 3).map((facility, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
              >
                {facility}
              </span>
            ))}
            {clinic.facilities.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                +{clinic.facilities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);



  const totalResults = doctors.length + clinics.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleNewSearch} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors, clinics, or specializations..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </form>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showFilters && <FilterPanel />}
        
        {/* Results Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Search Results
            </h1>
            <div className="text-sm text-gray-500">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </div>
          </div>
          
          {searchQuery && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                Showing results for: <span className="font-semibold">"{searchQuery}"</span>
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'doctors'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('clinics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'clinics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Clinics ({clinics.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Searching...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalResults === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="text-gray-500 text-xl mb-2">
              No results found for "{searchQuery}"
            </div>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Results */}
        {!isLoading && totalResults > 0 && (
          <div className="space-y-8">
            {/* Doctors */}
            {(activeTab === 'all' || activeTab === 'doctors') && doctors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Doctors
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} />
                  ))}
                </div>
              </div>
            )}

            {/* Clinics */}
            {(activeTab === 'all' || activeTab === 'clinics') && clinics.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-green-600" />
                  Clinics
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {clinics.map((clinic) => (
                    <ClinicCard key={clinic._id} clinic={clinic} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;