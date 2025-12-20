import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, X, Star, Phone, Mail, Clock, Home } from 'lucide-react';
import { searchLabs } from '../../service/labService';
import { detectUserCity } from '../../service/geolocationService';
import '../../quicklab.css';

export default function LabSearchResults() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detectedCity, setDetectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [newCity, setNewCity] = useState('');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    testCategory: searchParams.get('testCategory') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    homeCollection: searchParams.get('homeCollection') || '',
    sort: searchParams.get('sort') || 'rating_desc',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Extract unique test categories from current lab results
  const availableTestCategories = () => {
    const categoriesSet = new Set();
    labs.forEach((lab) => {
      if (lab.tests && Array.isArray(lab.tests)) {
        lab.tests.forEach((test) => {
          if (test.category) {
            categoriesSet.add(test.category);
          }
        });
      }
    });
    return Array.from(categoriesSet).sort();
  };

  useEffect(() => {
    initializeSearch();
  }, []);

  useEffect(() => {
    if (filters.city) {
      performSearch();
    }
  }, [filters, searchQuery, pagination.page]);

  const initializeSearch = async () => {
    try {
      // Get user's city if not already set
      let city = filters.city;
      if (!city) {
        setLoading(true);
        city = await detectUserCity();
        if (city) {
          setDetectedCity(city);
          setFilters((prev) => ({ ...prev, city }));
        } else {
          setLoading(false);
        }
      } else {
        setDetectedCity(city);
      }
    } catch (err) {
      console.error('Failed to detect city:', err);
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const params = {
        query: searchQuery,
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await searchLabs(params);
      setLabs(response.data || []);
      setPagination((prev) => ({ ...prev, ...response.pagination }));
    } catch (err) {
      console.error('Search failed:', err);
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    updateURLParams();
  };

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (filters.city) params.set('city', filters.city);
    if (filters.testCategory) params.set('testCategory', filters.testCategory);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.homeCollection) params.set('homeCollection', filters.homeCollection);
    if (filters.sort) params.set('sort', filters.sort);
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      city: detectedCity,
      testCategory: '',
      minPrice: '',
      maxPrice: '',
      homeCollection: '',
      sort: 'rating_desc',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleLabClick = (labId) => {
    navigate(`/quick-lab/lab/${labId}`);
  };
  const handleChangeLocation = () => {
    setNewCity(filters.city || '');
    setShowCityModal(true);
  };

  const handleSaveCity = () => {
    if (newCity.trim()) {
      setDetectedCity(newCity.trim());
      setFilters((prev) => ({ ...prev, city: newCity.trim() }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      setShowCityModal(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white">
      {/* Search Header */}
      <div className="bg-white dark:bg-black border-b border-lab-black-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lab-black-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for labs or tests..."
                className="w-full pl-10 pr-4 py-3 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-quicklab-secondary px-4 py-3 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button type="submit" className="btn-quicklab-primary px-6 py-3">
              Search
            </button>
          </form>

          {/* Location Display */}
          {detectedCity && (
            <div className="flex items-center gap-2 mt-3 text-lab-black-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                Showing results in <strong>{detectedCity}</strong>
              </span>
              <button
                onClick={handleChangeLocation}
                className="text-sm text-lab-yellow-600 hover:underline ml-2"
              >
                Change location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* City Change Modal */}
      {showCityModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCityModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-lab-black-900">Change Location</h3>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-lab-black-500 hover:text-lab-black-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-lab-black-700 mb-2">
                Enter City Name
              </label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveCity()}
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                className="w-full px-4 py-2 border border-lab-black-300 rounded-lg focus:ring-2 focus:ring-lab-yellow-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCityModal(false)}
                className="flex-1 px-4 py-2 border border-lab-black-300 rounded-lg text-lab-black-700 hover:bg-lab-black-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCity}
                className="flex-1 px-4 py-2 btn-quicklab-primary"
                disabled={!newCity.trim()}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-black shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-lab-black-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-lab-black-500 hover:text-lab-black-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-lab-black-900 mb-2">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                />
              </div>

              {/* Test Category */}
              <div>
                <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                  Test Category
                </label>
                <select
                  value={filters.testCategory}
                  onChange={(e) => handleFilterChange('testCategory', e.target.value)}
                  className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                >
                  <option value="">All Categories</option>
                  {availableTestCategories().map((category) => (
                    <option key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                  />
                </div>
              </div>

              {/* Home Collection */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.homeCollection === 'true'}
                    onChange={(e) =>
                      handleFilterChange('homeCollection', e.target.checked ? 'true' : '')
                    }
                    className="w-4 h-4 text-lab-yellow-600 border-lab-black-300 rounded focus:ring-lab-yellow-500"
                  />
                  <span className="text-sm font-medium text-lab-black-900">
                    Home Collection Available
                  </span>
                </label>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-lab-black-900 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full p-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500"
                >
                  <option value="rating_desc">Highest Rated</option>
                  <option value="rating_asc">Lowest Rated</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button onClick={clearFilters} className="w-full btn-quicklab-secondary py-2">
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-lab-yellow-600" />
            <p className="mt-4 text-lab-black-600">Searching labs...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-lab-black-600">No labs found</p>
            <p className="text-lab-black-500 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-lab-black-700">
                Found <strong>{pagination.total}</strong> labs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab) => (
                <div
                  key={lab._id}
                  onClick={() => handleLabClick(lab._id)}
                  className="card-quicklab bg-white border border-lab-black-100 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Lab Logo */}
                  {lab.logo && (
                    <img
                      src={lab.logo}
                      alt={lab.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-lab-black-900 mb-2">{lab.name}</h3>

                    {/* Rating */}
                    {lab.ratings?.average > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-lab-yellow-500 text-lab-yellow-500" />
                          <span className="text-sm font-semibold text-lab-black-900">
                            {lab.ratings.average.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-lab-black-600">
                          ({lab.ratings.count} reviews)
                        </span>
                      </div>
                    )}

                    {/* Address */}
                    {lab.address && (
                      <div className="flex items-start gap-2 mb-2 text-sm text-lab-black-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {lab.address.city && `${lab.address.city}, `}
                          {lab.address.state}
                        </span>
                      </div>
                    )}

                    {/* Contact */}
                    {lab.contact?.phone && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-lab-black-600">
                        <Phone className="w-4 h-4" />
                        <span>{lab.contact.phone}</span>
                      </div>
                    )}

                    {/* Tests Count */}
                    {lab.tests && lab.tests.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-lab-black-100">
                        <p className="text-sm text-lab-black-700">
                          <strong>{lab.tests.length}</strong> tests available
                        </p>
                      </div>
                    )}

                    {/* Home Collection Badge */}
                    {lab.generalHomeCollectionFee !== undefined && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-lab-yellow-100 text-lab-yellow-800 text-xs font-medium rounded">
                          <Home className="w-3 h-3" />
                          Home Collection
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                  }
                  disabled={pagination.page === 1}
                  className="btn-quicklab-secondary px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-lab-black-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.pages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="btn-quicklab-secondary px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
