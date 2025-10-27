import { CheckCircle, Clock, MapPin, Phone, Star, User } from 'lucide-react';

const DoctorInfoCard = ({ doctor, schedule }) => {
  // Helper function to safely render address
  const renderAddress = (clinic) => {
    if (!clinic) return 'No clinic information';

    if (clinic.address) {
      if (typeof clinic.address === 'string') {
        return clinic.address;
      }

      if (typeof clinic.address === 'object') {
        const addressParts = [];
        if (clinic.address.formattedAddress) {
          return clinic.address.formattedAddress;
        }
        if (clinic.address.street) addressParts.push(clinic.address.street);
        if (clinic.address.city) addressParts.push(clinic.address.city);
        if (clinic.address.state) addressParts.push(clinic.address.state);
        if (clinic.address.zipCode) addressParts.push(clinic.address.zipCode);

        return addressParts.join(', ') || 'Address not available';
      }
    }

    return 'Address not available';
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          {doctor.profilePicture ? (
            <img
              src={doctor.profilePicture}
              alt={`${doctor.firstName} ${doctor.lastName}`}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
              <User className="h-12 w-12 text-gray-600" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900">
            Dr. {doctor.firstName} {doctor.lastName}
          </h2>
          <p className="text-blue-600">{doctor.specialization}</p>
          {doctor.isVerified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </span>
          )}
        </div>

        {/* Doctor Details */}
        <div className="space-y-3 text-sm">
          {doctor.yearsOfExperience && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span>{doctor.yearsOfExperience} years experience</span>
            </div>
          )}

          {doctor.averageRating > 0 && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-2" />
              <span>{doctor.averageRating.toFixed(1)} rating</span>
            </div>
          )}

          <div className="flex items-center">
            <span className="font-medium">Consultation Fee:</span>
            <span className="ml-2">₹{doctor.consultationFee}</span>
          </div>

          {doctor.clinicId && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">{doctor.clinicId.name}</p>
                  <p className="text-gray-600">{renderAddress(doctor.clinicId)}</p>
                </div>
              </div>
            </div>
          )}

          {doctor.availableForTeleconsultation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Phone className="h-4 w-4 inline mr-1" />
                Teleconsultation available
              </p>
            </div>
          )}
        </div>

        {/* Schedule Overview */}
        {schedule && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Working Hours</h3>
            <div className="space-y-1 text-xs">
              {schedule.workingDays
                ?.filter((day) => day.isWorking)
                .map((day) => (
                  <div key={day.day} className="flex justify-between">
                    <span className="capitalize">{day.day}</span>
                    <span>
                      {day.startTime} - {day.endTime}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Current Vacations */}
        {schedule?.vacations?.filter((vacation) => new Date(vacation.endDate) >= new Date())
          .length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Vacations</h3>
            <div className="space-y-2">
              {schedule.vacations
                .filter((vacation) => new Date(vacation.endDate) >= new Date())
                .map((vacation, index) => (
                  <div key={index} className="bg-red-50 p-2 rounded text-xs">
                    <div className="font-medium text-red-800">
                      {new Date(vacation.startDate).toLocaleDateString()} -{' '}
                      {new Date(vacation.endDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorInfoCard;