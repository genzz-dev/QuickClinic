import { useState, useEffect } from 'react';
import { getPatientProfile } from '../../service/patientApiService';
import Loading from '../../components/ui/Loading';
import ProfileHeader from '../../components/Patient/PatientProfile/ProfileHeader';
import MessageAlerts from '../../components/Patient/PatientProfile/MessageAlerts';
import ProfileContent from '../../components/Patient/PatientProfile/ProfileContent';
import HealthRecordModal from '../../components/Patient/PatientProfile/HealthRecordModal';
import { updatePatientProfile } from '../../service/patientApiService';
const PatientProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [healthRecordForm, setHealthRecordForm] = useState({
    recordType: '',
    title: '',
    date: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getPatientProfile();
      setProfile(response);
      setEditFormData({
        firstName: response?.firstName || '',
        lastName: response?.lastName || '',
        gender: response?.gender || '',
        phoneNumber: response?.phoneNumber || '',
        address: {
          street: response?.address?.street || '',
          city: response?.address?.city || '',
          state: response?.address?.state || '',
          zipCode: response?.address?.zipCode || '',
          country: response?.address?.country || '',
        },
        emergencyContact: {
          name: response?.emergencyContact?.name || '',
          relationship: response?.emergencyContact?.relationship || '',
          phoneNumber: response?.emergencyContact?.phoneNumber || '',
        },
      });
    } catch (error) {
      setError('Failed to fetch profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isLoading={isLoading}
          handleSaveProfile={async () => {
            try {
              setIsLoading(true);
              setError('');
              await updatePatientProfile(editFormData, profilePictureFile);
              setSuccess('Profile updated successfully!');
              setIsEditing(false);
              setProfilePictureFile(null);
              await fetchProfile();
            } catch (error) {
              setError('Failed to update profile');
              console.error('Error updating profile:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          fetchProfile={fetchProfile}
        />

        <MessageAlerts error={error} success={success} />

        <ProfileContent
          profile={profile}
          isEditing={isEditing}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          profilePictureFile={profilePictureFile}
          setProfilePictureFile={setProfilePictureFile}
          setShowHealthRecordForm={setShowHealthRecordForm}
          handleDownloadFile={async (file) => {
            try {
              if (file.url) {
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.originalName || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else if (file.fileId || file._id) {
                const response = await fetch(
                  `/api/health-records/download/${file.fileId || file._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                  }
                );

                if (response.ok) {
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = file.originalName || 'download';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } else {
                  setError('Failed to download file');
                }
              }
            } catch (error) {
              console.error('Error downloading file:', error);
              setError('Failed to download file');
            }
          }}
        />

        {showHealthRecordForm && (
          <HealthRecordModal
            healthRecordForm={healthRecordForm}
            setHealthRecordForm={setHealthRecordForm}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isLoading={isLoading}
            setShowHealthRecordForm={setShowHealthRecordForm}
            setError={setError}
            setSuccess={setSuccess}
            fetchProfile={fetchProfile}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
    </div>
  );
};

export default PatientProfilePage;
