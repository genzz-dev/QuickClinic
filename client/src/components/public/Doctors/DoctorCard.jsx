import { MapPin, Star, Award, Heart } from 'lucide-react';
import StarRating from '../StarRating';
const DoctorCard = ({ doctor, handleDoctorClick, formatCurrency }) => {
  return (
    <div
      key={doctor._id}
      onClick={() => handleDoctorClick(doctor._id)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group hover:scale-105"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 relative">
            <img
              src={doctor.profilePicture || '/api/placeholder/80/80'}
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1 rounded-full">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              Dr. {doctor.firstName} {doctor.lastName}
            </h3>
            <p className="text-blue-600 text-sm font-semibold mb-2 bg-blue-50 px-3 py-1 rounded-full inline-block">
              {doctor.specialization}
            </p>
              <StarRating 
              type="doctor" 
              id={doctor._id} 
              size="small" 
              inline={true}
              />

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              {doctor.averageRating > 0 && (
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-yellow-700">
                    {doctor.averageRating.toFixed(1)}
                  </span>
                </div>
              )}
              
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                  <Award className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {doctor.yearsOfExperience} years
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl">
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(doctor.consultationFee)}
            </span>
            <span className="text-sm text-green-600 ml-1">consultation</span>
          </div>
          
          {doctor.availableForTeleconsultation && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-2 rounded-full font-medium shadow-lg">
              🎥 Online Available
            </div>
          )}
        </div>
        
        {doctor.clinicId && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="truncate font-medium">
                {doctor.clinicId?.address?.formattedAddress || 'Clinic Address'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;