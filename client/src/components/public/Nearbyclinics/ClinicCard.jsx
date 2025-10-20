import { CheckCircle, ChevronRight, Clock, MapPin, User, XCircle } from 'lucide-react';

import StarRating from '../StarRating';
import ClinicContactInfo from './ClinicContactInfo';
import ClinicDoctorsPopup from './ClinicDoctorsPopup';
import ClinicFacilities from './ClinicFacilities';
import ClinicImage from './ClinicImage';

const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

const ClinicCard = ({
  clinic,
  hoveredClinic,
  handleClinicHover,
  handleClinicClick,
  clinicDoctors,
}) => {
  const hours = clinic.openingHours?.[today];

  return (
    <div
      key={clinic._id}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
      onMouseEnter={() => handleClinicHover(clinic._id)}
      onMouseLeave={() => handleClinicHover(null)}
      onClick={() => handleClinicClick(clinic._id)}
    >
      {/* Verification Ribbon - positioned absolutely in top-right corner */}
      {clinic.isVerified && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          <span>Verified</span>
        </div>
      )}

      <ClinicImage clinic={clinic} />

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{clinic.name}</h3>
          <StarRating type="clinic" id={clinic._id} size="small" inline={true} />
          {/* Alternative verification badge option (if you prefer it next to the name) */}
          {!clinic.isVerified && (
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              <XCircle className="h-3 w-3" />
              <span>Not Verified</span>
            </div>
          )}
        </div>

        {clinic.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{clinic.description}</p>
        )}

        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <div>{clinic.address.formattedAddress}</div>
            <div>
              {clinic.address.city}, {clinic.address.state} {clinic.address.zipCode}
            </div>
          </div>
        </div>

        <ClinicContactInfo clinic={clinic} />

        {hours && (
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {hours.isClosed ? 'Today: Closed' : `Today: ${hours.open} - ${hours.close}`}
            </span>
          </div>
        )}

        <ClinicFacilities facilities={clinic.facilities} />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Click to view details</span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      <ClinicDoctorsPopup
        clinic={clinic}
        hoveredClinic={hoveredClinic}
        clinicDoctors={clinicDoctors}
      />
    </div>
  );
};

export default ClinicCard;
