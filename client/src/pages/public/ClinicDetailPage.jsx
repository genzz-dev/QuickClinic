import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star,MapPin,Stethoscope,CheckCircle, Loader } from 'lucide-react';
import { getClinicById, getClinicDoctors } from '../../service/publicapi';
import ClinicHeader from '../../components/public/ClinicDetailPage/ClinicHeader'
import PhotoGallery from '../../components/public/ClinicDetailPage/PhotoGallery';
import DoctorCard from '../../components/public/ClinicDetailPage/DoctorCard';
import OpeningHours from '../../components/public/ClinicDetailPage/OpeningHours';
import QuickStats from '../../components/public/ClinicDetailPage/QuickStats';
import Loading from '../../components/ui/Loading';

const ClinicDetailPage = () => {
  const { clinicId } = useParams();
  console.log(clinicId);
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorsPage, setDoctorsPage] = useState(1);
  const [hasMoreDoctors, setHasMoreDoctors] = useState(true);
  const [loadingMoreDoctors, setLoadingMoreDoctors] = useState(false);

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        setLoading(true);
        
        // Fetch clinic details
        const clinicResponse = await getClinicById(clinicId);
        setClinic(clinicResponse.data);
        
        // Fetch clinic doctors
        const doctorsResponse = await getClinicDoctors(clinicId, 1, 20);
        setDoctors(doctorsResponse.data.doctors || []);
        setHasMoreDoctors(doctorsResponse.data.hasMore || false);
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch clinic data');
        setLoading(false);
      }
    };

    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  const loadMoreDoctors = async () => {
    if (loadingMoreDoctors || !hasMoreDoctors) return;
    
    try {
      setLoadingMoreDoctors(true);
      const nextPage = doctorsPage + 1;
      const response = await getClinicDoctors(clinicId, nextPage, 20);
      
      setDoctors(prev => [...prev, ...(response.data.doctors || [])]);
      setHasMoreDoctors(response.data.hasMore || false);
      setDoctorsPage(nextPage);
    } catch (err) {
      console.error('Failed to load more doctors:', err);
    } finally {
      setLoadingMoreDoctors(false);
    }
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  const formatTime = (time) => {
    if (!time) return 'Closed';
    return time;
  };

  const formatOpeningHours = (hours) => {
    if (!hours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map((day, index) => ({
      day: dayNames[index],
      hours: hours[day] ? `${formatTime(hours[day].open)} - ${formatTime(hours[day].close)}` : 'Closed'
    }));
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 font-medium">Error loading clinic</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Clinic not found</p>
        </div>
      </div>
    );
  }

  const openingHours = formatOpeningHours(clinic.openingHours);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <ClinicHeader clinic={clinic} />
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photos */}
            {clinic.photos && clinic.photos.length > 0 && (
              <PhotoGallery photos={clinic.photos} />
            )}

            {/* Facilities */}
            {clinic.facilities && clinic.facilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Facilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {clinic.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maps Link */}
            {clinic.googleMapsLink && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h2>
                <a 
                  href={clinic.googleMapsLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </a>
              </div>
            )}
            
            {/* Doctors */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Our Doctors ({doctors.length})
              </h2>
              
              {doctors.length > 0 ? (
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <DoctorCard 
                      key={doctor._id}
                      doctor={doctor}
                      onClick={() => handleDoctorClick(doctor._id)}
                    />
                  ))}
                  
                  {hasMoreDoctors && (
                    <div className="text-center pt-4">
                      <button
                        onClick={loadMoreDoctors}
                        disabled={loadingMoreDoctors}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loadingMoreDoctors ? 'Loading...' : 'Load More Doctors'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No doctors found at this clinic.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Opening Hours */}
            {openingHours && <OpeningHours openingHours={openingHours} />}

            {/* Quick Stats */}
            <QuickStats 
              doctors={doctors} 
              facilities={clinic.facilities} 
              createdAt={clinic.createdAt} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicDetailPage;