import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDoctorProfile, updateDoctorProfile } from '../../service/doctorApiService'

function DoctorShareIdPage() {
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await getDoctorProfile();
      setDoctorProfile(response.data);
      setFormData({
        name: response.data?.name || '',
        email: response.data?.email || '',
        phone: response.data?.phone || '',
        specialization: response.data?.specialization || '',
        experience: response.data?.experience || '',
        bio: response.data?.bio || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    
    try {
      await updateDoctorProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      await fetchDoctorProfile();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(doctorProfile._id);
    setMessage({ type: 'success', text: 'Doctor ID copied to clipboard!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome, Dr. {doctorProfile?.name}
            </h1>
            <p className="text-lg text-gray-600">
              Your profile is complete! Share your ID with clinics to get added.
            </p>
          </div>

          {/* Doctor ID Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Doctor ID</h2>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 mb-4">
                <div className="text-4xl md:text-6xl font-mono font-bold tracking-wider break-all">
                  {doctorProfile?._id}
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                📋 Copy ID
              </button>
            </div>

            {/* Important Note */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-red-600 text-xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-semibold mb-1">Important Security Note</h3>
                  <p className="text-red-700">
                    <strong>Do not publicly share your ID or other details.</strong> Only share your Doctor ID with trusted clinic administrators who need to add you to their system.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-800 font-semibold mb-2">How to get added to a clinic:</h3>
              <ol className="text-blue-700 list-decimal list-inside space-y-1">
                <li>Contact the clinic administration</li>
                <li>Share your Doctor ID with them securely</li>
                <li>Wait for them to add you to their system</li>
                <li>Once added, you'll gain access to the doctor dashboard</li>
              </ol>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Your Profile Details</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {isEditing ? '📖 View Mode' : '✏️ Edit Profile'}
              </button>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about yourself and your medical practice..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    {updateLoading ? '⏳ Updating...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700">Full Name</h3>
                  <p className="text-gray-900">{doctorProfile?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Email</h3>
                  <p className="text-gray-900">{doctorProfile?.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Phone</h3>
                  <p className="text-gray-900">{doctorProfile?.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Specialization</h3>
                  <p className="text-gray-900">{doctorProfile?.specialization}</p>
                </div>
                {doctorProfile?.experience && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Experience</h3>
                    <p className="text-gray-900">{doctorProfile.experience} years</p>
                  </div>
                )}
                {doctorProfile?.bio && (
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-700">Bio</h3>
                    <p className="text-gray-900">{doctorProfile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <Link
              to="/doctor/profile"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 inline-block"
            >
              🔧 Update Profile Setup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorShareIdPage;
