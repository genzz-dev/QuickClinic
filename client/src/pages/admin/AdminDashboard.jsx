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
import StatCard from '../../components/admin/dashboard/StatCard';
import ActionButton from '../../components/admin/dashboard/ActionButton';
import VerificationBanner from '../../components/admin/dashboard/VerificationBanner';



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
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          {clinicData ? `Manage ${clinicData.name}` : 'Setup Your Clinic'}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          {clinicData ? 'Monitor and manage your clinic operations with comprehensive tools' : 'Get started with Quick Clinic management and streamline your healthcare operations'}
        </p>
      </div>

      {/* Verification Banner */}
      <div className="mb-8">
        <VerificationBanner 
          clinicData={clinicData}
          onVerify={handleVerificationProcessStart}
          onSetup={() => navigate('/admin/update-clinic')}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Total Doctors"
            value={doctors.length}
            icon={UserGroupIcon}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Verification Status"
            value={clinicData?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
            icon={CheckCircleIcon}
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Profile Completion"
            value="85%"
            icon={BuildingOfficeIcon}
            trend="up"
            trendValue="+5%"
          />
        </div>
        <div className="transform hover:scale-105 transition-transform duration-200">
          <StatCard
            title="Active Features"
            value={clinicData?.verificationStatus === 'verified' ? 'All' : 'Limited'}
            icon={ShieldExclamationIcon}
          />
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="transform hover:translate-x-2 transition-transform duration-200">
              <ActionButton
                title="Manage Clinic Profile"
                description="Update clinic information, contact details, and settings"
                icon={BuildingOfficeIcon}
                onClick={() => navigate('/admin/update-clinic')}
                variant="primary"
              />
            </div>
            
            <div className="transform hover:translate-x-2 transition-transform duration-200">
              <ActionButton
                title="Doctor Management"
                description="Add, edit, or remove doctors from your clinic"
                icon={UserGroupIcon}
                onClick={() => navigate('/admin/doctors')}
                variant="secondary"
              />
            </div>
            
            <div className="transform hover:translate-x-2 transition-transform duration-200">
              <ActionButton
                title="Edit Profile"
                description="Modify clinic details and preferences"
                icon={PencilSquareIcon}
                onClick={() => navigate('/admin/update-clinic')}
                variant="secondary"
              />
            </div>
          </div>
        </div>

        {/* Clinic Profile */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Clinic Overview</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <ClinicProfile 
              clinicData={clinicData} 
              doctors={doctors}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGoogleMapsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-slideUp">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Google Maps Link</h3>
              <p className="text-gray-600">Help patients find your clinic easily</p>
            </div>
            <form onSubmit={handleUpdateGoogleMapsLink}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-900/20 focus:border-gray-900 transition-all duration-200 text-sm"
                  placeholder="https://maps.google.com/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg">
                  💡 Add a valid Maps URL to continue verification and help patients locate your clinic
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowGoogleMapsModal(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingClinic}
                  className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {isUpdatingClinic ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : 'Save & Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-slideUp">
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Enter Verification Code</h3>
              <p className="text-gray-600 leading-relaxed">
                We've sent a 6-digit verification code to your registered phone number
              </p>
            </div>
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-8">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-6 py-6 text-center text-3xl font-mono border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 tracking-widest transition-all duration-200"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
                <p className="text-center text-sm text-gray-500 mt-4">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationCode('');
                  }}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOTP}
                  className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {verifyingOTP ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    <style jsx>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out;
      }
      
      .animate-slideUp {
        animation: slideUp 0.3s ease-out;
      }
    `}</style>
  </div>
);


  
};

export default AdminDashboard;