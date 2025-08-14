import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClinicInfo, getClinicDoctors, sendVerificationOTP, verifyOtp, updateClinic } from '../../service/adminApiService';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PencilSquareIcon,
  ArrowRightIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '../../components/ui/Loading';
import ClinicProfile from '../../components/admin/dashboard/ClinicProfile';

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className="bg-indigo-50 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
        <p className="mt-0.5 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ActionButton = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
  >
    {icon}
    {label}
  </button>
);

const VerificationBanner = ({ clinicData, onVerify, onSetup }) => {
  if (!clinicData) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div className="flex items-start gap-3">
          <BuildingOfficeIcon className="h-7 w-7 text-gray-500" />
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Set up clinic</h4>
            <p className="text-sm text-gray-600 mt-0.5">Add your clinic details to unlock verification and management features.</p>
          </div>
        </div>
        <ActionButton
          label="Setup Clinic"
          icon={<ArrowRightIcon className="h-4 w-4" />}
          onClick={onSetup}
        />
      </div>
    );
  }

  // Lockout state
  if ((clinicData.verificationAttempts || 0) >= 3) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-start gap-3 shadow-sm">
        <ShieldExclamationIcon className="h-6 w-6 text-yellow-700 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-800">Manual review pending</h4>
          <p className="text-sm text-yellow-700">Max attempts exceeded. Our team will review your clinic details.</p>
        </div>
      </div>
    );
  }

  if (clinicData.isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3 shadow-sm">
        <CheckCircleIcon className="h-6 w-6 text-green-700 mt-0.5" />
        <div>
          <h4 className="font-semibold text-green-800">Clinic verified</h4>
          <p className="text-sm text-green-700">All features unlocked and listing is active for patients.</p>
        </div>
      </div>
    );
  }

  const attemptsMade = clinicData.verificationAttempts || 0;
  const attemptsRemaining = Math.max(0, 3 - attemptsMade);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="h-6 w-6 text-blue-700 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800">Verification required</h4>
          <p className="text-sm text-blue-700">Complete verification to unlock full admin capabilities.</p>
          <p className="text-xs text-blue-800/70 mt-1">Attempts remaining: {attemptsRemaining} (used: {attemptsMade})</p>
        </div>
      </div>
      <ActionButton
        label="Verify now"
        icon={<CheckCircleIcon className="h-4 w-4" />}
        onClick={onVerify}
      />
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [clinicData, setClinicData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showGoogleMapsModal, setShowGoogleMapsModal] = useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isUpdatingClinic, setIsUpdatingClinic] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const clinicResponse = await getClinicInfo();
      const doctorsResponse = await getClinicDoctors();
      if (clinicResponse?.clinic) {
        setClinicData(clinicResponse.clinic);
        setGoogleMapsUrl(clinicResponse.clinic.googleMapsLink || '');
      } else {
        setClinicData(null);
      }
      setDoctors(doctorsResponse?.doctors || []);
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Failed to load dashboard data');
      setClinicData(null);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationProcessStart = () => {
    if (!clinicData?.googleMapsLink) {
      setShowGoogleMapsModal(true);
    } else {
      handleSendVerificationOTP();
    }
  };

  const handleUpdateGoogleMapsLink = async (e) => {
    e.preventDefault();
    if (!googleMapsUrl.trim()) {
      toast.error('Please enter a valid Google Maps link.');
      return;
    }
    setIsUpdatingClinic(true);
    try {
      await updateClinic({ googleMapsLink: googleMapsUrl });
      toast.success('Google Maps link saved!');
      setShowGoogleMapsModal(false);
      await fetchDashboardData();
      handleSendVerificationOTP();
    } catch (err) {
      toast.error('Failed to save the link. Please try again.');
    } finally {
      setIsUpdatingClinic(false);
    }
  };

  const handleSendVerificationOTP = async () => {
    setSendingOTP(true);
    try {
      await sendVerificationOTP();
      toast.success("Verification code sent to your clinic's phone number!");
      setShowVerificationModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error('Enter the verification code');
      return;
    }
    setVerifyingOTP(true);
    try {
      await verifyOtp(verificationCode);
      toast.success('Clinic verified successfully!');
      setShowVerificationModal(false);
      setVerificationCode('');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP.');
      fetchDashboardData();
    } finally {
      setVerifyingOTP(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinic Admin</h1>
            <p className="text-gray-600 mt-1">{clinicData ? `Manage ${clinicData.name}` : 'Set up and manage clinic data'}</p>
          </div>
          <div className="flex items-center gap-3">
            <ActionButton
              label="Edit Clinic"
              icon={<PencilSquareIcon className="h-4 w-4" />}
              onClick={() => navigate('/admin/update-clinic')}
            />
            <ActionButton
              label="Add & Manage Doctors"
              icon={<PlusCircleIcon className="h-4 w-4" />}
              onClick={() => navigate('/admin/manage-doctor')}
            />
          </div>
        </div>

        {/* Verification */}
        <div className="mb-8">
          <VerificationBanner
            clinicData={clinicData}
            onVerify={handleVerificationProcessStart}
            onSetup={() => navigate('/admin/update-clinic')}
          />
        </div>

        {/* Stats */}
        {clinicData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            <StatCard
              title="Verification"
              value={clinicData.isVerified ? 'Verified' : 'Pending'}
              icon={<CheckCircleIcon className="h-6 w-6 text-indigo-600" />}
            />
            <StatCard
              title="Doctors"
              value={doctors.length}
              icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
            />
            <StatCard
              title="Clinic"
              value={clinicData.name || 'Not set'}
              icon={<BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />}
            />
          </div>
        )}

        {/* Profile */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <ClinicProfile clinicData={clinicData} doctors={doctors} />
        </div>
      </div>

      {/* Google Maps Modal */}
      {showGoogleMapsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Provide Google Maps Link</h3>
            <p className="text-sm text-gray-600 mt-1">Add a valid Maps URL to continue verification.</p>
            <form onSubmit={handleUpdateGoogleMapsLink} className="mt-4">
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowGoogleMapsModal(false)} className="px-4 py-2 text-sm rounded-lg border">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdatingClinic} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:bg-indigo-300">
                  {isUpdatingClinic ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Enter verification code</h3>
            <p className="text-sm text-gray-600 mt-1">A 6-digit code was sent to your registered phone.</p>
            <form onSubmit={handleVerifyOTP} className="mt-4">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full p-2.5 border rounded-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="mt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowVerificationModal(false)} className="px-4 py-2 text-sm rounded-lg border">
                  Cancel
                </button>
                <button type="submit" disabled={verifyingOTP || sendingOTP} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white disabled:bg-indigo-300">
                  {verifyingOTP ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;