import { AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getClinicInfo,
  sendVerificationOTP,
  updateClinic,
  verifyOtp,
} from '../../../../service/adminApiService.js';
import Loading from '../../../ui/Loading.jsx';

const OTPVerification = ({ onSuccess, onFailed, onManualReview }) => {
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState({});
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Google Maps link state
  const [hasGoogleLink, setHasGoogleLink] = useState(false);
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [showGoogleLinkForm, setShowGoogleLinkForm] = useState(false);
  const [updatingLink, setUpdatingLink] = useState(false);
  const [checkingClinic, setCheckingClinic] = useState(true);

  // Check clinic info on component mount
  useEffect(() => {
    checkClinicGoogleLink();
  }, []);

  const checkClinicGoogleLink = async () => {
    try {
      setCheckingClinic(true);
      const response = await getClinicInfo();
      const clinic = response.data?.clinic || response.clinic;
      if (clinic?.googleMapsLink) {
        setHasGoogleLink(true);
        setGoogleMapsLink(clinic.googleMapsLink);
      } else {
        setHasGoogleLink(false);
        setShowGoogleLinkForm(true);
      }
    } catch (error) {
      console.error('Error checking clinic info:', error);
      setErrors({ general: 'Failed to load clinic information' });
    } finally {
      setCheckingClinic(false);
    }
  };

  const handleUpdateGoogleLink = async () => {
    if (!googleMapsLink.trim()) {
      setErrors({ googleLink: 'Please enter a valid Google Maps link' });
      return;
    }

    try {
      setUpdatingLink(true);
      setErrors({});

      await updateClinic({ googleMapsLink });

      setHasGoogleLink(true);
      setShowGoogleLinkForm(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating Google Maps link:', error);
      setErrors({
        googleLink: error.response?.data?.message || 'Failed to update Google Maps link',
      });
    } finally {
      setUpdatingLink(false);
    }
  };

  const handleSendOTP = async () => {
    if (!hasGoogleLink) {
      setErrors({ otp: 'Please add Google Maps link first' });
      return;
    }

    try {
      setSubmitting(true);
      await sendVerificationOTP();
      setOtpSent(true);
      setErrors({ otp: '' });
    } catch (error) {
      // Check if it's a 500 error or OTP sending failure
      if (
        error.response?.status === 500 ||
        error.response?.status === 400 ||
        error.response?.data?.message?.includes('OTP')
      ) {
        // Trigger manual review flow
        onManualReview();
        return;
      }
      setErrors({ otp: error.response?.data?.message || 'Failed to send OTP' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      setErrors({ otp: 'Please enter the OTP code' });
      return;
    }

    try {
      setSubmitting(true);
      await verifyOtp(otpCode);
      onSuccess();
    } catch (error) {
      setOtpAttempts((prev) => prev + 1);
      setErrors({ otp: error.response?.data?.message || 'Invalid OTP code' });
      if (otpAttempts >= 2) {
        onFailed();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipVerification = () => {
    onManualReview();
  };

  if (checkingClinic) {
    return <Loading />;
  }

  if (otpAttempts >= 3) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Maximum Attempts Reached</h2>
          <p className="text-gray-600 mb-6">
            Maximum attempts reached for today. Please try again tomorrow.
          </p>
          <button
            onClick={handleSkipVerification}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Clinic</h2>
        <p className="text-gray-600">
          We'll send an OTP to your clinic's phone number listed on Google Maps
        </p>
      </div>

      {/* Google Maps Link Section */}
      {showGoogleLinkForm && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center mb-4">
            <ExternalLink className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Google Maps Link Required</h3>
          </div>
          <p className="text-yellow-700 mb-4">
            To verify your clinic via OTP, we need your Google Maps business listing link.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-2">
                Google Maps Link
              </label>
              <input
                type="url"
                value={googleMapsLink}
                onChange={(e) => setGoogleMapsLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={updatingLink}
              />
              {errors.googleLink && (
                <p className="text-red-600 text-sm mt-1">{errors.googleLink}</p>
              )}
            </div>

            <button
              onClick={handleUpdateGoogleLink}
              disabled={updatingLink || !googleMapsLink.trim()}
              className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {updatingLink ? 'Saving...' : 'Save Google Maps Link'}
            </button>
          </div>
        </div>
      )}

      {/* OTP Section */}
      <div className="space-y-6">
        {!otpSent ? (
          <div>
            <p className="text-gray-700 mb-6">
              Click below to send an OTP to your clinic's registered phone number
            </p>
            <button
              onClick={handleSendOTP}
              disabled={submitting || !hasGoogleLink}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {submitting ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>

            {!hasGoogleLink && (
              <p className="text-orange-600 text-sm mt-2 text-center">
                Please add your Google Maps link first to enable OTP verification
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-green-600 mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />✓ OTP sent successfully! Check your registered
              phone number.
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              maxLength={6}
            />
            <button
              onClick={handleVerifyOTP}
              disabled={submitting || otpCode.length !== 6}
              className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {submitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {errors.otp && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-red-600 text-sm">{errors.otp}</p>
          </div>
        )}

        {errors.general && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleSkipVerification}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            You can skip verification now and complete it later
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Unverified clinics won't display the verification badge until manual verification is
            completed
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
