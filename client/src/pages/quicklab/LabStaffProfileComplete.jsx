import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createStaffProfile } from '../../service/labStaffService';
import '../../quicklab.css';
import { Upload } from 'lucide-react';

export default function LabStaffProfileComplete() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'assistant',
    qualifications: [],
    experience: 0,
  });
  const [qualificationInput, setQualificationInput] = useState('');

  const roles = ['technician', 'phlebotomist', 'assistant', 'sample_collector'];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const file = e.target.files[0];
      if (file) {
        setProfilePicture(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    } else if (name === 'experience') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, qualificationInput.trim()],
      });
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // The createStaffProfile expects individual parameters: formData and profilePicture
      await createStaffProfile(formData, profilePicture);
      toast.success('Profile created successfully!');
      navigate('/quick-lab/staff-waiting', { replace: true });
    } catch (error) {
      console.error('Error creating staff profile:', error);
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white p-4 md:p-8 pt-20">
      <div className="max-w-2xl mx-auto">
        <div className="card-quicklab bg-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-lab-black-900 mb-2">Complete Your Profile</h1>
            <p className="text-lab-black-600">Help us get to know you better</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label
                htmlFor="profilePicture"
                className="block text-sm font-semibold text-lab-black-900 mb-3"
              >
                Profile Picture
              </label>
              <div className="border-2 border-dashed border-lab-yellow-300 rounded-lg p-6 bg-lab-yellow-50">
                {previewUrl ? (
                  <div className="text-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePicture(null);
                        setPreviewUrl(null);
                      }}
                      className="btn-quicklab-secondary"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="profilePicture"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload size={32} className="text-lab-yellow-600 mb-2" />
                    <span className="text-lab-black-900 font-medium">Click to upload photo</span>
                    <input
                      id="profilePicture"
                      type="file"
                      name="profilePicture"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-lab-black-900 mb-2"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Your first name"
                  className="w-full px-4 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-lab-black-900 mb-2"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Your last name"
                  className="w-full px-4 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-semibold text-lab-black-900 mb-2"
              >
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Your phone number"
                className="w-full px-4 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-lab-black-900 mb-2">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, ' ').charAt(0).toUpperCase() + r.slice(1).replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-semibold text-lab-black-900 mb-2"
              >
                Years of Experience
              </label>
              <input
                id="experience"
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label
                htmlFor="qualifications"
                className="block text-sm font-semibold text-lab-black-900 mb-2"
              >
                Qualifications
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  id="qualifications"
                  type="text"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  placeholder="Add a qualification"
                  className="flex-1 px-4 py-2 border border-lab-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lab-yellow-500 text-lab-black-900"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQualification();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddQualification}
                  className="btn-quicklab-secondary px-4 py-2"
                >
                  Add
                </button>
              </div>
              {formData.qualifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="badge-quicklab flex items-center gap-2">
                      <span>{qual}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="font-bold hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-quicklab-primary py-3 font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
