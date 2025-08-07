import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminProfile, checkAdminProfileExists } from '../../service/adminApiService'

export default function AdminProfileComplete() {
  const navigate = useNavigate();

  // Form state
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState('');

  // Check if admin profile exists (redirect if yes)
useEffect(() => {
  let mounted = true;
  const checkProfile = async () => {
    setCheckingProfile(true);
    try {
      const res = await checkAdminProfileExists();
      console.log(res);
      if (mounted && res.exists) {
        navigate('/', { replace: true });
      } else {
        setCheckingProfile(false);
      }
    } catch (error) {
      if (mounted) setCheckingProfile(false);
    }
  };

  checkProfile();

  return () => { mounted = false };
  // eslint-disable-next-line
}, []);


  const handleChange = e => {
    const { name, value, files } = e.target;
    setFields(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Prepare data
      const { firstName, lastName, phone, profilePicture } = fields;
      if (!firstName || !lastName || !phone) {
        setError('Please fill out all fields');
        setLoading(false);
        return;
      }
      // Prepare payload (excluding file)
      const profileData = { firstName, lastName, phone };
      await createAdminProfile(profileData, profilePicture);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <span className="text-lg font-medium text-gray-500">Checking profile...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-100/60 via-white to-indigo-100/70 px-2">
      <div className="w-full max-w-lg rounded-xl bg-white px-8 py-10 shadow-lg md:px-16">
        <h1 className="mb-6 text-3xl font-bold text-indigo-700">Complete Your Admin Profile</h1>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={fields.firstName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-indigo-400 focus:outline-none"
              placeholder="Jane"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={fields.lastName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-indigo-400 focus:outline-none"
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
              Mobile Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={fields.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-800 shadow-sm focus:border-indigo-400 focus:outline-none"
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="profilePicture">
              Profile Picture <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="text-gray-700"
            />
          </div>
          {error && (
            <div className="rounded bg-red-50 px-4 py-2 text-red-700 border border-red-200 mb-2 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold shadow hover:bg-indigo-700 transition disabled:bg-gray-300"
          >
            {loading ? 'Submitting...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
