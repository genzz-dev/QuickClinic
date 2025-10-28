import { Clock, MapPin, Briefcase } from 'lucide-react';

const DoctorInfoCard = ({ doctor, schedule }) => {
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
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <img
            src={doctor?.profilePicture || '/placeholder-doctor.jpg'}
            alt={doctor?.firstName + ' ' + doctor?.lastName || 'Doctor'}
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg object-cover"
          />
        </div>

        {/* Doctor Information - All in one column */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Doctor Name */}
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            {doctor?.firstName + ' ' + doctor?.lastName || 'Doctor Name'}
          </h2>

          {/* Specialization and Experience inline */}
          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-600">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {doctor?.specialization || 'Specialization'}
            </span>
            {/* Consultation Fee - Visible beside specialization on mobile */}
            {doctor?.consultationFee && (
              <span className="md:hidden font-semibold text-green-600">
                ₹{doctor.consultationFee}
              </span>
            )}
            {doctor?.experience && (
              <>
                <span>Experience:{doctor.experience} Years</span>
              </>
            )}
            {schedule?.duration && (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {schedule.duration}
                </span>
              </>
            )}
          </div>

          {/* Clinic/Work Name */}
          {doctor?.clinicId?.name && (
            <p className="text-sm sm:text-base font-semibold text-gray-900">
              {doctor.clinicId.name}
            </p>
          )}
          {console.log(doctor)}
          {/* Address */}
          <div className="flex items-start gap-1 text-xs sm:text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{renderAddress(doctor.clinicId)}</p>
          </div>
        </div>

        {/* Consultation Fee - Visible in top right on laptop/desktop */}
        {doctor?.consultationFee && (
          <div className="hidden md:block flex-shrink-0">
            <p className="text-lg font-bold text-green-600">₹{doctor.consultationFee}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorInfoCard;
