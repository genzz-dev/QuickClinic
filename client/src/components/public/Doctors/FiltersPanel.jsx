import { Star, X } from 'lucide-react';

const FiltersPanel = ({
  showFilters,
  setShowFilters,
  filters,
  handleFilterChange,
  filterOptions,
  formatCurrency,
  clearFilters,
}) => {
  return (
    showFilters && (
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Refine Your Search</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Specialization Filter */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="">All Specializations</option>
                {filterOptions.specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Price Range</label>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {formatCurrency(filters.priceRange[0])}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatCurrency(filters.priceRange[1])}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      handleFilterChange('priceRange', [
                        parseInt(e.target.value),
                        filters.priceRange[1],
                      ])
                    }
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handleFilterChange('priceRange', [
                        filters.priceRange[0],
                        parseInt(e.target.value),
                      ])
                    }
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{formatCurrency(filterOptions.priceRange.min)}</span>
                  <span>{formatCurrency(filterOptions.priceRange.max)}</span>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleFilterChange('minRating', star)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      filters.minRating >= star
                        ? 'text-yellow-400 bg-yellow-50 scale-110'
                        : 'text-gray-300 hover:text-yellow-300 hover:bg-yellow-50'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
                {filters.minRating > 0 && (
                  <button
                    onClick={() => handleFilterChange('minRating', 0)}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Experience Filter */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Minimum Experience
              </label>
              <select
                value={filters.minExperience}
                onChange={(e) => handleFilterChange('minExperience', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
                <option value="0">Any Experience</option>
                <option value="1">1+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="15">15+ Years</option>
                <option value="20">20+ Years</option>
              </select>
            </div>

            {/* Teleconsultation Filter */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.teleconsultation}
                  onChange={(e) => handleFilterChange('teleconsultation', e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-800">
                    Teleconsultation Available
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Online video consultation</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default FiltersPanel;
