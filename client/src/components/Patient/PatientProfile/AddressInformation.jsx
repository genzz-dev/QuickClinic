// client/src/components/Patient/PatientProfile/AddressInformation.jsx
import { MapPin } from 'lucide-react';

const AddressInformation = ({ profile, isEditing, editFormData, handleInputChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Address Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address
          </label>
          {isEditing ? (
            <input
              type="text"
              name="address.street"
              value={editFormData.address?.street}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.address?.street || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          {isEditing ? (
            <input
              type="text"
              name="address.city"
              value={editFormData.address?.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.address?.city || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          {isEditing ? (
            <input
              type="text"
              name="address.state"
              value={editFormData.address?.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.address?.state || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
          {isEditing ? (
            <input
              type="text"
              name="address.zipCode"
              value={editFormData.address?.zipCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.address?.zipCode || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          {isEditing ? (
            <input
              type="text"
              name="address.country"
              value={editFormData.address?.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.address?.country || 'Not specified'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressInformation;