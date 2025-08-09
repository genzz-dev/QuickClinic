import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Upload, 
  Check, 
  AlertCircle, 
  Clock, 
  Shield,
  Link,
  Navigation
} from 'lucide-react';
import { 
  addClinic, 
  checkAdminProfileExists, 
  checkClinicExists,
  sendVerificationOTP,
  verifyOtp 
} from '../../service/adminApiService.js'

const AdminClinicAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [addressMethod, setAddressMethod] = useState('manual'); // 'manual' or 'google'
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gstNumber: '',
    gstName: '',
    googleMapsLink: '',
    address: {
      formattedAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    facilities: [],
    openingHours: {
      monday: { isClosed: false, open: '09:00', close: '18:00' },
      tuesday: { isClosed: false, open: '09:00', close: '18:00' },
      wednesday: { isClosed: false, open: '09:00', close: '18:00' },
      thursday: { isClosed: false, open: '09:00', close: '18:00' },
      friday: { isClosed: false, open: '09:00', close: '18:00' },
      saturday: { isClosed: false, open: '09:00', close: '15:00' },
      sunday: { isClosed: true, open: '', close: '' }
    }
  });
  
  const [files, setFiles] = useState({
    logo: null,
    photos: []
  });
  
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'failed'
  const [otpAttempts, setOtpAttempts] = useState(0);

  // Predefined facilities
  const availableFacilities = [
    'Parking', 'Wheelchair Accessible', 'Pharmacy', 'Laboratory', 
    'X-Ray', 'Emergency Care', 'Wi-Fi', 'Air Conditioning', 
    'Waiting Room'
  ];

  // Check profile and clinic status on component mount
  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const [profileResponse, clinicResponse] = await Promise.all([
        checkAdminProfileExists(),
        checkClinicExists()
      ]);

      if (!profileResponse.exists) {
        navigate('/admin/complete-profile');
        return;
      }

      if (clinicResponse.exists) {
        navigate('/admin/dashboard');
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking user status:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (type === 'logo') {
      setFiles(prev => ({ ...prev, logo: selectedFiles[0] }));
    } else {
      setFiles(prev => ({ ...prev, photos: [...prev.photos, ...selectedFiles] }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Clinic name is required';
    if (!formData.contact.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.contact.email.trim()) newErrors.email = 'Email is required';
    
    if (addressMethod === 'manual') {
      if (!formData.address.formattedAddress.trim()) newErrors.address = 'Address is required';
      if (!formData.address.city.trim()) newErrors.city = 'City is required';
      if (!formData.address.state.trim()) newErrors.state = 'State is required';
      if (!formData.address.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    } else {
      if (!formData.googleMapsLink.trim()) newErrors.googleMapsLink = 'Google Maps link is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const clinicData = { ...formData };
      
      // If using Google Maps, remove manual address fields
      if (addressMethod === 'google') {
        delete clinicData.address;
      } else {
        delete clinicData.googleMapsLink;
      }
      
      await addClinic(clinicData, files.logo, files.photos);
      setCurrentStep(2); // Move to verification step
    } catch (error) {
      console.error('Error adding clinic:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to add clinic' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      setSubmitting(true);
      await sendVerificationOTP();
      setOtpSent(true);
      setErrors({ otp: '' });
    } catch (error) {
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
      setVerificationStatus('verified');
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (error) {
      setVerificationStatus('failed');
      setOtpAttempts(prev => prev + 1);
      setErrors({ otp: error.response?.data?.message || 'Invalid OTP code' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}>
                {currentStep > 1 ? <Check size={20} /> : '1'}
              </div>
              <span className="font-medium">Clinic Details</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'
              }`}>
                {verificationStatus === 'verified' ? <Check size={20} /> : '2'}
              </div>
              <span className="font-medium">Verification</span>
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <Building2 className="text-white" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-white">Add Your Clinic</h1>
                  <p className="text-blue-100">Complete your clinic setup to start managing appointments</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Building2 size={24} />
                  <span>Basic Information</span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter clinic name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number 
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="22AAAAA0000A1Z5"
                    />
                    {errors.gstNumber && <p className="text-red-500 text-sm mt-1">{errors.gstNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your clinic"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <MapPin size={24} />
                  <span>Address Information</span>
                </h2>

                {/* Address Method Selection */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 mb-3 flex items-center space-x-2">
                    <Navigation size={16} />
                    <span>You can now add your address using Google Maps link for automatic location detection!</span>
                  </p>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="addressMethod"
                        value="manual"
                        checked={addressMethod === 'manual'}
                        onChange={(e) => setAddressMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium">Manual Entry</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="addressMethod"
                        value="google"
                        checked={addressMethod === 'google'}
                        onChange={(e) => setAddressMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium">Google Maps Link</span>
                    </label>
                  </div>
                </div>

                {addressMethod === 'google' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Maps Link *
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="url"
                        name="googleMapsLink"
                        value={formData.googleMapsLink}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    {errors.googleMapsLink && <p className="text-red-500 text-sm mt-1">{errors.googleMapsLink}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Copy and paste the Google Maps link of your clinic for automatic address detection
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Address *
                      </label>
                      <textarea
                        name="address.formattedAddress"
                        value={formData.address.formattedAddress}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Complete address"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Phone size={24} />
                  <span>Contact Information</span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="tel"
                        name="contact.phone"
                        value={formData.contact.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="contact.email"
                        value={formData.contact.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="clinic@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="contact.website"
                      value={formData.contact.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.yourclinic.com"
                    />
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Clock size={24} />
                  <span>Opening Hours</span>
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(formData.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-24 font-medium capitalize">{day}</div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hours.isClosed}
                          onChange={(e) => handleOpeningHoursChange(day, 'isClosed', e.target.checked)}
                          className="text-blue-600"
                        />
                        <span className="text-sm">Closed</span>
                      </label>
                      {!hours.isClosed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800">Facilities & Services</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableFacilities.map((facility) => (
                    <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <Upload size={24} />
                  <span>Images</span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {files.logo && (
                      <p className="text-sm text-green-600 mt-1">✓ {files.logo.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Photos
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'photos')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {files.photos.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">✓ {files.photos.length} photo(s) selected</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{submitting ? 'Adding Clinic...' : 'Add Clinic & Continue'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <Shield className="text-white" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-white">Verify Your Clinic</h1>
                  <p className="text-green-100">Complete the verification process to activate your clinic</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {verificationStatus === 'verified' ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="text-green-600" size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Clinic Verified Successfully!</h2>
                    <p className="text-gray-600">Your clinic has been verified and is now active. Redirecting to dashboard...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Verification Process</h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>• We'll send an OTP to your clinic's phone number from Google Maps</p>
                      <p>• Enter the OTP code to verify your clinic's authenticity</p>
                      <p>• This ensures patients can trust your clinic information</p>
                      <p>• You have 3 attempts per day to complete verification</p>
                    </div>
                  </div>

                  {!otpSent ? (
                    <div className="text-center space-y-4">
                      <p className="text-gray-600">
                        Click below to send an OTP to your clinic's registered phone number
                      </p>
                      <button
                        onClick={handleSendOTP}
                        disabled={submitting}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 mx-auto"
                      >
                        {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                        <span>{submitting ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800 text-center">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                        />
                        {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={handleVerifyOTP}
                          disabled={submitting || !otpCode.trim()}
                          className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                          <span>{submitting ? 'Verifying...' : 'Verify OTP'}</span>
                        </button>
                        
                        <button
                          onClick={handleSendOTP}
                          disabled={submitting || otpAttempts >= 3}
                          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Resend OTP
                        </button>
                      </div>

                      {otpAttempts >= 3 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-700 text-center">
                            Maximum attempts reached for today. Please try again tomorrow.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClinicAdd;
