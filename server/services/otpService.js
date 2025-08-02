import axios from 'axios';

const API_BASE_URL = 'https://mock-sms-backend.onrender.com/api';
const API_KEY = '938153aceff2bbe2edbc8087beede1763bf319ad968e7836464b3eaaeb152906';

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json'
};

export const sendOTP = async (phone) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/message/send-otp`,
      {
        phone: phone,
        purpose: 'clinic_verification'
      },
      { headers }
    );
    
    return {
      success: true,
      message: 'OTP sent successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send OTP'
    };
  }
};

export const verifyOTP = async (phone, code) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/message/verify-otp`,
      {
        phone: phone,
        code: code
      },
      { headers }
    );
    
    return {
      success: true,
      message: 'OTP verified successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Invalid OTP'
    };
  }
};