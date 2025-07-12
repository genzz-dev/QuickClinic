import { useState } from 'react';
import DoctorList from './DoctorList';

const ClinicCard = ({ clinic }) => {
  const [showDoctors, setShowDoctors] = useState(false);

  const toggleDoctors = () => {
    setShowDoctors(!showDoctors);
  };

  return (
    <div 
      className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
      onClick={toggleDoctors}
    >
      <div className="px-4 py-5 sm:p-6 cursor-pointer">
        <div className="flex items-center">
          {clinic.logo && (
            <img className="h-12 w-12 rounded-full object-cover mr-4" src={clinic.logo} alt={clinic.name} />
          )}
          <h3 className="text-lg leading-6 font-medium text-gray-900">{clinic.name}</h3>
        </div>
        
        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">{clinic.address.formattedAddress}</p>
            </div>
          </div>
          
          <div className="mt-2 flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">{clinic.contact.phone}</p>
            </div>
          </div>
        </div>
        
        {clinic.description && (
          <p className="mt-3 text-sm text-gray-500">{clinic.description}</p>
        )}
        
        {showDoctors && <DoctorList clinicId={clinic._id} />}
      </div>
    </div>
  );
};

export default ClinicCard;