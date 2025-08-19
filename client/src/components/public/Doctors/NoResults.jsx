import { AlertCircle } from 'lucide-react';

const NoResults = ({ clearFilters }) => {
  return (
    <div className="text-center py-16">
      <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md mx-auto">
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No doctors found</h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your filters or search criteria to find more doctors
        </p>
        <button
          onClick={clearFilters}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};

export default NoResults;