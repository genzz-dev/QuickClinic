import { Stethoscope, Building, MapPin, Phone } from 'lucide-react';

const DoctorClinicInfo = ({ appointment }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
          Doctor Information
        </h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> Dr. {appointment.doctorId?.firstName}{' '}
            {appointment.doctorId?.lastName}
          </p>
          <p>
            <span className="font-medium">Specialization:</span>{' '}
            {appointment.doctorId?.specialization}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="h-5 w-5 mr-2 text-blue-600" />
          Clinic Information
        </h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Clinic:</span> {appointment.clinicId?.name}
          </p>
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
            <span className="text-sm text-gray-600">
              {appointment.clinicId.address.formattedAddress ||
                `${appointment.clinicId.address.city}, ${appointment.clinicId.address.state}`}
            </span>
          </div>
          {appointment.clinicId.phoneNumber && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">{appointment.clinicId.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorClinicInfo;