import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { verifyOtp } from '../../service/adminApiService';

const OtpVerificationModal = ({ isOpen, onClose, onVerified }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.error('Enter OTP');
      return;
    }
    try {
      setLoading(true);
      await verifyOtp(code);
      toast.success('Clinic verified successfully');
      onVerified();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Verify OTP</h2>
        <input
          type="text"
          className="border rounded p-2 w-full mb-4"
          placeholder="Enter OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationModal;