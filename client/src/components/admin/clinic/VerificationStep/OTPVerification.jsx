import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { sendVerificationOTP, verifyOtp } from '../../../../service/adminApiService.js';

const OTPVerification = ({ onSuccess, onFailed, onManualReview }) => {
  const [submitting, setSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errors, setErrors] = useState({});
  const [otpAttempts, setOtpAttempts] = useState(0);

  const handleSendOTP = async () => {
    try {
      setSubmitting(true);
      await sendVerificationOTP();
      setOtpSent(true);
      setErrors({ otp: '' });
    } catch (error) {
      // Check if it's a 500 error or OTP sending failure
      if (error.response?.status === 500 ||error.response?.status === 400 || error.response?.data?.message?.includes('OTP')) {
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
      setOtpAttempts(prev => prev + 1);
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

  if (otpAttempts >= 3) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Maximum Attempts Reached
        </h3>
        <p className="text-gray-600 mb-6">
          Maximum attempts reached for today. Please try again tomorrow.
        </p>
        <button
          onClick={handleSkipVerification}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue with Manual Review
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Your Phone Number
        </h3>
        <p className="text-gray-600">
          Click below to send an OTP to your clinic's registered phone number
        </p>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
          <button
            onClick={handleSendOTP}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Sending OTP...' : 'Send OTP'}
          </button>
          
          <div className="text-center">
            <button
              onClick={handleSkipVerification}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip Verification
            </button>
            <p className="text-xs text-gray-400 mt-1">
              You can skip verification now and complete it later
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm">
              ✓ OTP sent successfully! Check your registered phone number.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP Code
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-red-600 text-sm mt-1">{errors.otp}</p>
            )}
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={submitting || !otpCode.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            <button
              onClick={handleSkipVerification}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              Skip Verification
            </button>
            <p className="text-xs text-gray-400 mt-1">
              Unverified clinics won't display the verification badge until manual verification is completed
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
