import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
  PhoneIcon, MapPinIcon, GlobeAltIcon, EnvelopeIcon, ClockIcon,
  BuildingStorefrontIcon, PhotoIcon, UserGroupIcon, CheckBadgeIcon,
  ExclamationTriangleIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';

const ClinicProfile = ({ clinicData, doctors }) => {
  const navigate = useNavigate(); 

  if (!clinicData) {
    return (
      <div className="flex items-center justify-center p-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No clinic data available to display.</p>
      </div>
    );
  }

  const {
    name, description, logo, photos, contact, address, openingHours,
    facilities, isVerified, googleMapsLink, gstNumber, gstName
  } = clinicData;

  const handleUpdateClick = () => {
    navigate('/admin/update-clinic'); // Step 3: Navigate on click
  };
  
  const VerificationBadge = () => {
    if (isVerified) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
          <CheckBadgeIcon className="w-5 h-5" />
          Verified
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
        <ExclamationTriangleIcon className="w-5 h-5" />
        Verification Required
      </span>
    );
  };

  const renderOpeningHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const hours = openingHours?.[day];
      const displayDay = day.charAt(0).toUpperCase() + day.slice(1);
      
      return (
        <li key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="text-gray-600">{displayDay}</span>
          {hours?.isClosed || !hours?.open ? (
            <span className="font-semibold text-red-500">Closed</span>
          ) : (
            <span className="font-semibold text-gray-800">{hours.open} – {hours.close}</span>
          )}
        </li>
      );
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-6 bg-white rounded-xl shadow-md">
          <div className="flex items-center gap-6">
            <img
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-lg"
              src={logo || 'https://via.placeholder.com/150'}
              alt={`${name} Logo`}
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">{name}</h1>
              <p className="text-gray-500 mt-1">{description || 'No description provided.'}</p>
            </div>
          </div>
          {/* --- MODIFICATION START --- */}
          <div className="flex-shrink-0 flex items-center gap-4">
             <VerificationBadge />
             <button 
                onClick={handleUpdateClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
             >
                <PencilSquareIcon className="w-5 h-5" />
                Update Clinic
             </button>
          </div>
          {/* --- MODIFICATION END --- */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact & Address Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact & Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-500 mb-2">Contact Details</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center gap-3">
                      <PhoneIcon className="w-5 h-5 text-indigo-500" />
                      <span>{contact?.phone || 'Not available'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                      <span>{contact?.email || 'Not available'}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <GlobeAltIcon className="w-5 h-5 text-indigo-500" />
                      {contact?.website ? (
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{contact.website}</a>
                      ) : 'Not available'}
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500 mb-2">Address</h3>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPinIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
                    <div>
                      <p>{address?.formattedAddress || 'Address not provided'}</p>
                      {googleMapsLink && (
                        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline font-semibold mt-1 inline-block">
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                   <div className="mt-4 pt-4 border-t border-gray-200">
                     <h3 className="font-semibold text-gray-500 mb-2">GST Information</h3>
                     <p className="text-gray-700"><span className="font-medium">Number:</span> {gstNumber || 'N/A'}</p>
                     <p className="text-gray-700"><span className="font-medium">Name:</span> {gstName || 'N/A'}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Photo Gallery */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><PhotoIcon className="w-6 h-6" /> Gallery</h2>
              {photos && photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Clinic Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-sm hover:scale-105 transition-transform duration-300" />
                  ))}
                </div>
              ) : <p className="text-gray-500">No photos have been uploaded.</p>}
            </div>

             {/* Doctors Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><UserGroupIcon className="w-6 h-6" /> Our Doctors</h2>
                {doctors && doctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {doctors.map(doctor => (
                            <div key={doctor._id} className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                                <h4 className="font-bold text-gray-800">{`Dr. ${doctor.firstName} ${doctor.lastName}`}</h4>
                                <p className="text-sm text-indigo-600">{doctor.specialization || 'General Practice'}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500">No doctors are associated with this clinic yet.</p>}
            </div>
          </div>

          <div className="space-y-8">
            {/* Opening Hours Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><ClockIcon className="w-6 h-6" /> Opening Hours</h2>
              <ul className="space-y-1">
                {renderOpeningHours()}
              </ul>
            </div>

            {/* Facilities Card */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3"><BuildingStorefrontIcon className="w-6 h-6" /> Facilities</h2>
              {facilities && facilities.length > 0 ? (
                <ul className="space-y-2 list-disc list-inside text-gray-700">
                  {facilities.map((facility, index) => <li key={index}>{facility}</li>)}
                </ul>
              ) : <p className="text-gray-500">No facilities listed.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicProfile;
