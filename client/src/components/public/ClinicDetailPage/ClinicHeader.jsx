import { Building, MapPin, Phone, Mail, Globe } from 'lucide-react';

const ClinicHeader = ({ clinic }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Logo and Basic Info */}
      <div className="flex-shrink-0">
        {clinic.logo ? (
          <img 
            src={clinic.logo} 
            alt={`${clinic.name} logo`}
            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-blue-100 flex items-center justify-center">
            <Building className="w-12 h-12 text-blue-600" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{clinic.name}</h1>
        
        {clinic.description && (
          <p className="text-gray-600 mb-4">{clinic.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-900 font-medium">Address</p>
              <p className="text-gray-600">{clinic.address.formattedAddress}</p>
              <p className="text-gray-600">{clinic.address.city}, {clinic.address.state} {clinic.address.zipCode}</p>
              <p className="text-gray-600">{clinic.address.country}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{clinic.contact.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{clinic.contact.email}</span>
            </div>
            {clinic.contact.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <a 
                  href={clinic.contact.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {clinic.contact.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicHeader;