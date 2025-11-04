// client/src/components/Patient/PatientProfile/ProfileContent.jsx
import BasicInformation from './BasicInformation';
import AddressInformation from './AddressInformation';
import EmergencyContact from './EmergencyContact';
import HealthRecords from './HealthRecords';

const ProfileContent = ({
  profile,
  isEditing,
  editFormData,
  setEditFormData,
  profilePictureFile,
  setProfilePictureFile,
  setShowHealthRecordForm,
  handleDownloadFile,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <BasicInformation
          profile={profile}
          isEditing={isEditing}
          editFormData={editFormData}
          handleInputChange={handleInputChange}
          profilePictureFile={profilePictureFile}
          handleProfilePictureChange={handleProfilePictureChange}
        />

        <AddressInformation
          profile={profile}
          isEditing={isEditing}
          editFormData={editFormData}
          handleInputChange={handleInputChange}
        />

        <EmergencyContact
          profile={profile}
          isEditing={isEditing}
          editFormData={editFormData}
          handleInputChange={handleInputChange}
        />
      </div>

      <HealthRecords
        profile={profile}
        setShowHealthRecordForm={setShowHealthRecordForm}
        handleDownloadFile={handleDownloadFile}
      />
    </div>
  );
};

export default ProfileContent;
