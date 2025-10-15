import React, { useState, useEffect } from 'react';
import { 
  getDoctorRatings, 
  getClinicRatings, 
  getRatingStats 
} from '../../service/ratingApiService'
import { 
  getClinicDoctors, 
  getClinicInfo 
} from '../../service/adminApiService'

const AdminRatingsPage = () => {
  const [clinicInfo, setClinicInfo] = useState(null);
  const [clinicRatings, setClinicRatings] = useState([]);
  const [doctorRatings, setDoctorRatings] = useState({});
  const [clinicStats, setClinicStats] = useState(null);
  const [doctorStats, setDoctorStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    sort: 'newest',
    rating: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchAllRatingsData();
  }, []);

  const fetchAllRatingsData = async () => {
    try {
      setLoading(true);
      
      // Get clinic info and doctors
      const clinicResponse = await getClinicInfo();
      setClinicInfo(clinicResponse.clinic);
      
      const clinicId = clinicResponse.clinic._id;
      const doctors = clinicResponse.clinic.doctors || [];
      
      // Fetch clinic ratings and stats
      const [clinicRatingsResponse, clinicStatsResponse] = await Promise.all([
        getClinicRatings(clinicId, filters),
        getRatingStats('clinic', clinicId)
      ]);
      
      setClinicRatings(clinicRatingsResponse.ratings || []);
      setClinicStats(clinicStatsResponse);
      
      // Fetch ratings and stats for each doctor
      const doctorRatingsData = {};
      const doctorStatsData = {};
      
      for (const doctor of doctors) {
        try {
          const [ratingsResponse, statsResponse] = await Promise.all([
            getDoctorRatings(doctor._id, { ...filters, limit: 5 }),
            getRatingStats('doctor', doctor._id)
          ]);
          
          doctorRatingsData[doctor._id] = ratingsResponse.ratings || [];
          doctorStatsData[doctor._id] = statsResponse;
        } catch (error) {
          console.error(`Error fetching data for doctor ${doctor._id}:`, error);
          doctorRatingsData[doctor._id] = [];
          doctorStatsData[doctor._id] = { averageRating: 0, totalRatings: 0 };
        }
      }
      
      setDoctorRatings(doctorRatingsData);
      setDoctorStats(doctorStatsData);
      
    } catch (error) {
      console.error('Error fetching ratings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, size = 'sm' }) => {
    const stars = [];
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`${sizeClasses[size]} ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const RatingCard = ({ rating }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {rating.patientId?.firstName?.charAt(0) || 'P'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {rating.patientId?.firstName} {rating.patientId?.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(rating.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StarRating rating={rating.rating} />
      </div>
      
      {rating.comment && (
        <p className="text-gray-700 text-sm leading-relaxed">
          {rating.comment}
        </p>
      )}
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Clinic Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Clinic Overview</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            clinicInfo?.isVerified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {clinicInfo?.isVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {clinicStats?.averageRating?.toFixed(1) || '0.0'}
            </p>
            <p className="text-sm text-gray-600">Average Rating</p>
            <StarRating rating={Math.round(clinicStats?.averageRating || 0)} size="sm" />
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {clinicStats?.totalRatings || 0}
            </p>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {clinicInfo?.doctors?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Total Doctors</p>
          </div>
        </div>
      </div>

      {/* Doctors Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctors Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinicInfo?.doctors?.map((doctor) => (
            <div key={doctor._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {doctor.profilePicture ? (
                  <img 
                    src={doctor.profilePicture} 
                    alt={doctor.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{doctor.fullName}</h4>
                  <p className="text-sm text-gray-500">{doctor.specialization}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StarRating rating={Math.round(doctorStats[doctor._id]?.averageRating || 0)} />
                  <span className="text-sm text-gray-600">
                    {doctorStats[doctor._id]?.averageRating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {doctorStats[doctor._id]?.totalRatings || 0} reviews
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ClinicRatingsTab = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Clinic Ratings</h3>
        <div className="flex items-center space-x-4">
          <select 
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
          
          <select 
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: e.target.value})}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {clinicRatings.length > 0 ? (
          clinicRatings.map((rating) => (
            <RatingCard key={rating._id} rating={rating} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1.586l-4.707 4.707z" />
              </svg>
            </div>
            <p className="text-gray-500">No clinic ratings yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const DoctorRatingsTab = () => (
    <div className="space-y-6">
      {clinicInfo?.doctors?.map((doctor) => (
        <div key={doctor._id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-6">
            {doctor.profilePicture ? (
              <img 
                src={doctor.profilePicture} 
                alt={doctor.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-lg">
                  {doctor.firstName?.charAt(0)}{doctor.lastName?.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{doctor.fullName}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={Math.round(doctorStats[doctor._id]?.averageRating || 0)} />
                <span className="text-sm text-gray-600">
                  {doctorStats[doctor._id]?.averageRating?.toFixed(1) || '0.0'} 
                  ({doctorStats[doctor._id]?.totalRatings || 0} reviews)
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {doctorRatings[doctor._id]?.length > 0 ? (
              doctorRatings[doctor._id].map((rating) => (
                <RatingCard key={rating._id} rating={rating} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No ratings for this doctor yet</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ratings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ratings Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all ratings for {clinicInfo?.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'clinic', name: 'Clinic Ratings' },
              { id: 'doctors', name: 'Doctor Ratings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'clinic' && <ClinicRatingsTab />}
        {activeTab === 'doctors' && <DoctorRatingsTab />}
      </div>
    </div>
  );
};

export default AdminRatingsPage;
