// client/src/components/Patient/PatientProfile/BasicInformation.jsx
import { User, Upload } from 'lucide-react';

const BasicInformation = ({
  profile,
  isEditing,
  editFormData,
  handleInputChange,
  profilePictureFile,
  handleProfilePictureChange
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-200">
            {profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
                {profile?.firstName?.[0]}
                {profile?.lastName?.[0]}
              </div>
            )}
          </div>
          {isEditing && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
                id="profile-picture"
              />
              <label
                htmlFor="profile-picture"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                {profile?.profilePicture ? 'Change Picture' : 'Add Picture'}
              </label>
              {profilePictureFile && (
                <p className="text-xs text-green-600 mt-1">
                  New picture selected: {profilePictureFile.name}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          {isEditing ? (
            <input
              type="text"
              name="firstName"
              value={editFormData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.firstName || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          {isEditing ? (
            <input
              type="text"
              name="lastName"
              value={editFormData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.lastName || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <p className="text-gray-900">{profile?.email || 'Not specified'}</p>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <p className="text-gray-900">{formatDate(profile?.dateOfBirth)}</p>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">Date of birth cannot be changed</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          {isEditing ? (
            <select
              name="gender"
              value={editFormData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <p className="text-gray-900">{profile?.gender || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              name="phoneNumber"
              value={editFormData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="text-gray-900">{profile?.phoneNumber || 'Not specified'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;