import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Phone } from 'lucide-react';
import Loading from '../../components/ui/Loading';
import { createLabAdminProfile } from '../../service/labAdminService';
import '../../quicklab.css';

export default function LabAdminProfileComplete() {
  const navigate = useNavigate();

  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    profilePicture: null,
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture' && files && files[0]) {
      setFields((f) => ({
        ...f,
        profilePicture: files[0],
      }));
      setProfilePreview(URL.createObjectURL(files[0]));
    } else {
      setFields((f) => ({
        ...f,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { firstName, lastName, phoneNumber } = fields;
      if (!firstName || !lastName || !phoneNumber) {
        setError('Please fill out all required fields');
        setLoading(false);
        return;
      }

      const profileData = { firstName, lastName, phoneNumber };
      await createLabAdminProfile(profileData);
      navigate('/quick-lab/add-lab', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lab-yellow-100 mb-4">
            <User className="w-6 h-6 text-lab-yellow-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-lab-black-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-lab-black-600 text-base max-w-lg mx-auto">
            Help us get to know you better. Your profile information will help us serve you best.
          </p>
        </div>

        {/* Main Card */}
        <div className="card-quicklab bg-white shadow-lg border border-lab-black-100 max-w-xl mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-700 text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-lab-black-800"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={fields.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent transition-all"
                    placeholder="John"
                    autoFocus
                  />
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-lab-black-800"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={fields.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent transition-all"
                    placeholder="Doe"
                  />
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-semibold text-lab-black-800"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={fields.phoneNumber}
                  onChange={handleChange}
                  required
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent transition-all"
                  placeholder="+1 (555) 000-0000"
                />
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
              </div>
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <label
                htmlFor="profilePicture"
                className="block text-sm font-semibold text-lab-black-800"
              >
                Profile Picture{' '}
                <span className="text-lab-black-500 font-normal text-xs">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
                <label
                  htmlFor="profilePicture"
                  className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-lab-yellow-400 rounded-lg cursor-pointer hover:bg-lab-yellow-50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-lab-yellow-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-lab-black-800">Click to upload image</p>
                    <p className="text-xs text-lab-black-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </label>
              </div>

              {profilePreview && (
                <div className="flex items-center gap-4 mt-4 p-4 rounded-lg bg-lab-black-50 border border-lab-black-200">
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-lab-yellow-400"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-lab-black-900">Preview</p>
                    <p className="text-xs text-lab-black-500">Click upload button to change</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFields((f) => ({ ...f, profilePicture: null }));
                      setProfilePreview(null);
                    }}
                    className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-quicklab-primary py-3 font-semibold rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loading />
                  Saving Profile...
                </span>
              ) : (
                'Complete Profile & Continue'
              )}
            </button>

            {/* Help Text */}
            <p className="text-xs text-lab-black-500 text-center">
              This information will help us manage your lab more effectively.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
