import React, { useState } from 'react';
import { Check, AlertCircle, Clock } from 'lucide-react';
import OTPVerification from './OTPVerification.jsx';

const VerificationStep = ({ onVerificationComplete }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending');

  const handleVerificationSuccess = () => {
    setVerificationStatus('verified');
    setTimeout(() => {
      onVerificationComplete();
    }, 2000);
  };

  const handleVerificationFailed = () => {
    setVerificationStatus('failed');
  };

  const handleManualReview = () => {
    setVerificationStatus('manual_review');
    // Show manual review message for 3 seconds then redirect
    setTimeout(() => {
      onVerificationComplete();
    }, 3000);
  };

  if (verificationStatus === 'verified') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Verification Complete!
        </h2>
        <p className="text-gray-600 mb-4">
          Your clinic has been verified and is now active. Redirecting to dashboard...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (verificationStatus === 'manual_review') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Manual Review Process
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
          <p className="text-yellow-800 font-medium mb-2">
            Verification failed through OTP in Google Maps. We will use manual review, which will take up to 1 month.
          </p>
          <p className="text-yellow-700 text-sm">
            Our team will manually verify your clinic details and contact you once the process is complete.
          </p>
        </div>
        <p className="text-gray-600 mb-4">
          Redirecting to dashboard...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Verification Failed
        </h2>
        <p className="text-gray-600 mb-6">
          Unable to verify your clinic at this time. Please try again later or contact support.
        </p>
        <button
          onClick={() => setVerificationStatus('pending')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Clinic
        </h2>
        <p className="text-gray-600">
          Complete the verification process to activate your clinic
        </p>
      </div>

      <OTPVerification
        onSuccess={handleVerificationSuccess}
        onFailed={handleVerificationFailed}
        onManualReview={handleManualReview}
      />
    </div>
  );
};

export default VerificationStep;
