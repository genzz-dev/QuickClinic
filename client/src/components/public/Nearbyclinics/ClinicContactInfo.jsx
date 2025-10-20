import { Globe, Mail, Phone } from 'lucide-react';

const ClinicContactInfo = ({ clinic }) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center space-x-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{clinic.contact.phone}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Mail className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{clinic.contact.email}</span>
      </div>
      {clinic.contact.website && (
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <a
            href={clinic.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
};

export default ClinicContactInfo;
