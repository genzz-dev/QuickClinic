// client/src/components/Patient/PatientProfile/EmergencyContact.jsx
import { Phone } from 'lucide-react';

const EmergencyContact = ({ profile, isEditing, editFormData, handleInputChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Phone className="w-5 h-5 text-red-600" />
        <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="emergencyContact.name"
              value={editFormData.emergencyContact?.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">
              {profile?.emergencyContact?.name || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship
          </label>
          {isEditing ? (
            <input
              type="text"
              name="emergencyContact.relationship"
              value={editFormData.emergencyContact?.relationship}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">
              {profile?.emergencyContact?.relationship || 'Not specified'}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="emergencyContact.phoneNumber"
              value={editFormData.emergencyContact?.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">
              {profile?.emergencyContact?.phoneNumber || 'Not specified'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;