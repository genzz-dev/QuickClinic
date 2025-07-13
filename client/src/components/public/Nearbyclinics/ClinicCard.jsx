import React from 'react';
import { MapPin, ChevronRight, User ,Clock} from 'lucide-react';
import ClinicImage from './ClinicImage';
import ClinicContactInfo from './ClinicContactInfo';
import ClinicFacilities from './ClinicFacilities';
import ClinicDoctorsPopup from './ClinicDoctorsPopup';
const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(); // e.g., 'monday'
const ClinicCard = ({ 
  clinic, 
  hoveredClinic, 
  handleClinicHover, 
  handleClinicClick, 
  clinicDoctors 
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
      <ClinicImage clinic={clinic} />
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {clinic.name}
        </h3>
        
        {clinic.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {clinic.description}
          </p>
        )}

        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <div>{clinic.address.formattedAddress}</div>
            <div>{clinic.address.city}, {clinic.address.state} {clinic.address.zipCode}</div>
          </div>
        </div>

        <ClinicContactInfo clinic={clinic} />
        


      {hours && (
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {hours.isClosed ? "Today: Closed" : `Today: ${hours.open} - ${hours.close}`}
          </span>
        </div>
      )}


        <ClinicFacilities facilities={clinic.facilities} />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Click to view details
          </span>
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