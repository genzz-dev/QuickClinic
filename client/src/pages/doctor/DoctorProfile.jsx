import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit3, 
  LogOut, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';
import { 
  getDoctorProfile, 
  updateDoctorProfile, 
  getDoctorClinicInfo,
  leaveCurrentClinic 
} from '../../service/doctorApiService'

const DoctorProfilePage = () => {
  const [doctor, setDoctor] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    qualifications: [],
    yearsOfExperience: '',
    bio: '',
    phoneNumber: '',
    consultationFee: '',
    availableForTeleconsultation: false
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, clinicResponse] = await Promise.all([
        getDoctorProfile(),
        getDoctorClinicInfo().catch(() => ({ data: { clinic: null } }))
      ]);

      const doctorData = profileResponse;
      setDoctor(doctorData);
      setClinic(clinicResponse?.clinic || null);

      setFormData({
        firstName: doctorData.firstName || '',
        lastName: doctorData.lastName || '',
        specialization: doctorData.specialization || '',
        qualifications: doctorData.qualifications || [],
        yearsOfExperience: doctorData.yearsOfExperience || '',
        bio: doctorData.bio || '',
        phoneNumber: doctorData.phoneNumber || '',
        consultationFee: doctorData.consultationFee || '',
        availableForTeleconsultation: doctorData.availableForTeleconsultation || false
      });
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQualificationChange = (index, value) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = value;
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, '']
    }));
  };

  const removeQualification = (index) => {
    const newQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
       setProfilePicture(e.target.files[0]); 
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const response = await updateDoctorProfile(formData, profilePicture);
      setDoctor(response.doctor);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setProfilePicture(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleLeaveClinic = async () => {
    if (window.confirm('Are you sure you want to leave the current clinic?')) {
      try {
        await leaveCurrentClinic();
        setClinic(null);
        setSuccess('Successfully left the clinic');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to leave clinic');
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={doctor?.profilePicture || '/api/placeholder/100/100'}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                {doctor?.isVerified && (
                  <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-green-500 bg-white rounded-full" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </h1>
                <p className="text-lg text-blue-600 font-medium">{doctor?.specialization}</p>
                <p className="text-gray-600">{doctor?.yearsOfExperience || 0} years experience</p>
                {doctor?.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified Doctor
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              {isEditing ? (
                <div className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={doctor?.profilePicture || '/api/placeholder/80/80'}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {profilePicture && (
                      <span className="text-sm text-green-600">New image selected</span>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (₹)</label>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee.$numberDecimal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                    {formData.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={qual}
                          onChange={(e) => handleQualificationChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter qualification"
                        />
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQualification}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add Qualification
                    </button>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell patients about yourself..."
                    />
                  </div>

                  {/* Teleconsultation */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="teleconsultation"
                      name="availableForTeleconsultation"
                      checked={formData.availableForTeleconsultation}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="teleconsultation" className="text-sm font-medium text-gray-700">
                      Available for Teleconsultation
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={updating}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Display Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium">Dr. {doctor?.firstName} {doctor?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{doctor?.phoneNumber || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Consultation Fee</p>
                          <p className="font-medium">₹{doctor?.consultationFee.$numberDecimal}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Teleconsultation</p>
                          <p className="font-medium">
                            {doctor?.availableForTeleconsultation ? 'Available' : 'Not Available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Qualifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor?.qualifications?.map((qual, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  {doctor?.bio && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">About</h3>
                      <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clinic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Clinic</h3>
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              
{clinic ? (
  <div className="space-y-3">
    <div>
      <p className="font-medium text-gray-900">{clinic.name}</p>
      <p className="text-sm text-gray-600 flex items-start mt-1">
        <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
        {clinic.address?.formattedAddress || 
         `${clinic.address?.city}, ${clinic.address?.state} ${clinic.address?.zipCode}`}
      </p>
    </div>
    
    {clinic.contact && (
      <div className="space-y-2">
        {clinic.contact.phone && (
          <p className="text-sm text-gray-600 flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            {clinic.contact.phone}
          </p>
        )}
        {clinic.contact.email && (
          <p className="text-sm text-gray-600 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            {clinic.contact.email}
          </p>
        )}
        {clinic.contact.website && (
          <p className="text-sm text-gray-600 flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <a href={clinic.contact.website} target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 hover:underline">
              {clinic.contact.website}
            </a>
          </p>
        )}
      </div>
    )}
    
    <button
      onClick={handleLeaveClinic}
      className="w-full mt-4 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
    >
      Leave Clinic
    </button>
  </div>
) : (
  <div className="text-center py-4">
    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 text-sm mb-3">No clinic associated</p>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
      Join Clinic
    </button>
  </div>
)}

            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Appointments Today
                  </span>
                  <span className="font-semibold">{doctor?.appointments?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Average Rating
                  </span>
                  <span className="font-semibold">
                    {doctor?.averageRating ? `${doctor.averageRating.toFixed(1)}/5` : 'No ratings'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
