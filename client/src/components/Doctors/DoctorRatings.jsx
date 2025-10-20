import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoctorRatings, getRatingStats } from '../../service/ratingApiService';

const DoctorRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('');
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const fetchRatings = async (page = 1, sort = 'newest', rating = '') => {
    try {
      setLoading(true);

      if (!doctorId) {
        console.error('Doctor ID not found');
        return;
      }

      const queryParams = {
        page: page.toString(),
        limit: '10',
        sort: sort,
      };

      if (rating) {
        queryParams.rating = rating;
      }

      const response = await getDoctorRatings(doctorId, queryParams);
      setRatings(response.ratings || []);
      setPagination(response.pagination);

      // Fetch stats
      const statsResponse = await getRatingStats('doctor', doctorId);
      setStats(statsResponse);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings(currentPage, sortBy, filterRating);
  }, [currentPage, sortBy, filterRating]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleFilterChange = (rating) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-2xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 text-blue-600 hover:text-blue-800">
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Doctor Ratings & Reviews</h1>
      </div>

      {/* Stats Summary - WITHOUT DISTRIBUTION */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{stats?.entityInfo?.name}</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {renderStars(Math.round(stats?.averageRating || 0))}
                <span className="ml-2 text-lg font-semibold text-gray-700">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-gray-600">({stats?.totalRatings || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex space-x-4">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>

          <select
            value={filterRating}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <span className="text-gray-600">
          Showing {ratings.length} of {pagination?.totalRatings || 0} reviews
        </span>
      </div>

      {/* Ratings List */}
      <div className="space-y-6">
        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to leave a review for this doctor!</p>
          </div>
        ) : (
          ratings.map((rating) => (
            <div
              key={rating._id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {rating.patientId?.firstName?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {rating.patientId?.firstName} {rating.patientId?.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{formatDate(rating.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {renderStars(rating.rating)}
                  <span className="ml-2 font-semibold text-gray-700">{rating.rating}</span>
                </div>
              </div>

              {rating.comment && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700 italic">"{rating.comment}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className={`px-4 py-2 rounded-lg ${
              pagination.hasPrev
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            className={`px-4 py-2 rounded-lg ${
              pagination.hasNext
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorRatings;
