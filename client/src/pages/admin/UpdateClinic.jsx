import React, { useState, useEffect, useCallback } from 'react';
import { getClinicInfo, updateClinic } from '../../service/adminApiService'
import { FiUpload, FiTrash2, FiClock, FiMapPin, FiBriefcase, FiCheckCircle, FiAlertTriangle, FiPhone, FiMail, FiGlobe } from 'react-icons/fi';

const PREDEFINED_FACILITIES = [
  "Wheelchair Accessible",
  "On-site Pharmacy",
  "Ample Parking",
  "Wi-Fi Available",
  "Cafeteria",
  "Laboratory Services",
  "Radiology (X-Ray/MRI)",
  "Emergency Services",
];

const UpdateClinic = () => {
  const [clinicData, setClinicData] = useState({
    name: '',
    description: '',
    logo: '',
    photos: [],
    googleMapsLink: '',
    isVerified: false,
    gstNumber: '',
    gstName: '',
    address: {
      formattedAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    facilities: [],
    openingHours: {
      monday: { isClosed: false, open: '09:00', close: '17:00' },
      tuesday: { isClosed: false, open: '09:00', close: '17:00' },
      wednesday: { isClosed: false, open: '09:00', close: '17:00' },
      thursday: { isClosed: false, open: '09:00', close: '17:00' },
      friday: { isClosed: false, open: '09:00', close: '17:00' },
      saturday: { isClosed: true, open: '09:00', close: '17:00' },
      sunday: { isClosed: true, open: '09:00', close: '17:00' },
    },
  });
  const [logoFile, setLogoFile] = useState(null);
  const [newPhotoFiles, setNewPhotoFiles] = useState([]);
  const [logoPreview, setLogoPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Fetch clinic data on mount
  const fetchClinicDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getClinicInfo();
      console.log("Fetched clinic data:", response);
      if (response.clinic) {
        // Ensure all nested objects have default values to avoid errors
        const fetchedData = {
          ...clinicData, // Start with default structure
          ...response.clinic,
          address: response.clinic.address || clinicData.address,
          contact: response.clinic.contact || clinicData.contact,
          facilities: response.clinic.facilities || [],
          openingHours: response.clinic.openingHours || clinicData.openingHours,
        };
        setClinicData(fetchedData);
        setLogoPreview(fetchedData.logo || '');
      }
    } catch (err) {
      setError('Failed to fetch clinic details. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinicDetails();
  }, [fetchClinicDetails]);

  // Handlers for form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClinicData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setClinicData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value,
      },
    }));
  };

  const handleFacilitiesChange = (e) => {
    const { value, checked } = e.target;
    setClinicData((prev) => {
      const facilities = prev.facilities || [];
      if (checked) {
        return { ...prev, facilities: [...facilities, value] };
      } else {
        return { ...prev, facilities: facilities.filter((facility) => facility !== value) };
      }
    });
  };
  
  const handleOpeningHoursChange = (day, field, value) => {
    setClinicData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: { ...prev.openingHours[day], [field]: value },
      },
    }));
  };
  
  // File handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotosChange = (e) => {
    setNewPhotoFiles([...e.target.files]);
  };

  const handleDeletePhoto = (photoUrl) => {
    // This updates the state. The updated array will be sent on submit.
    setClinicData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p !== photoUrl),
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateClinic(clinicData, logoFile, newPhotoFiles);
      setSuccess('Clinic details updated successfully!');
      setLogoFile(null);
      setNewPhotoFiles([]);
      // Refetch data to confirm changes and get new photo URLs
      fetchClinicDetails();
    } catch (err) {
      setError('Failed to update clinic. Please check your inputs and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isAddressEditable = !clinicData.isVerified && !clinicData.googleMapsLink;

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Clinic Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- Basic Information Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Clinic Name</label>
                  <input type="text" id="name" name="name" value={clinicData.name} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <textarea id="description" name="description" rows="6" value={clinicData.description} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Logo</label>
                <div className="w-40 h-40 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                  {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover rounded-md" /> : <span className="text-gray-400">No Logo</span>}
                </div>
                <label htmlFor="logo-upload" className="cursor-pointer mt-2 inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <FiUpload className="mr-2" /> Change Logo
                </label>
                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
              </div>
            </div>
          </div>

          {/* --- Contact & Legal Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">Contact & Legal</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-600 mb-1"><FiPhone className="mr-2"/>Phone</label>
                  <input type="tel" id="phone" name="phone" value={clinicData.contact.phone} onChange={(e) => handleNestedChange('contact', e)} className="w-full p-2 border border-gray-300 rounded-md" required/>
                </div>
                <div>
                  <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-600 mb-1"><FiMail className="mr-2"/>Email</label>
                  <input type="email" id="email" name="email" value={clinicData.contact.email} onChange={(e) => handleNestedChange('contact', e)} className="w-full p-2 border border-gray-300 rounded-md" required/>
                </div>
                <div>
                  <label htmlFor="website" className="flex items-center text-sm font-medium text-gray-600 mb-1"><FiGlobe className="mr-2"/>Website</label>
                  <input type="url" id="website" name="website" value={clinicData.contact.website} onChange={(e) => handleNestedChange('contact', e)} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="gstNumber" className="text-sm font-medium text-gray-600 mb-1">GST Number</label>
                  <input type="text" id="gstNumber" name="gstNumber" value={clinicData.gstNumber} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="gstName" className="text-sm font-medium text-gray-600 mb-1">GST Name / Registered Name</label>
                  <input type="text" id="gstName" name="gstName" value={clinicData.gstName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
             </div>
          </div>
          
          {/* --- Location Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6 flex items-center"><FiMapPin className="mr-3" /> Location</h2>
            {clinicData.isVerified && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center">
                <FiCheckCircle className="mr-2" /> This clinic is verified. The Google Maps link and address cannot be changed.
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="googleMapsLink" className="block text-sm font-medium text-gray-600 mb-1">Google Maps Link</label>
                <input type="url" id="googleMapsLink" name="googleMapsLink" value={clinicData.googleMapsLink} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={clinicData.isVerified} />
              </div>

              {!isAddressEditable && !clinicData.isVerified && clinicData.googleMapsLink && (
                  <div className="mt-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md flex items-center">
                    <FiAlertTriangle className="mr-2" /> Address is automatically synced from the Google Maps link and is not editable. To edit manually, please remove the link above.
                  </div>
              )}
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Address Details</h3>
                {!isAddressEditable && !clinicData.googleMapsLink && !clinicData.isVerified && (
                  <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md flex items-center">
                    <FiAlertTriangle className="mr-2" /> To enable manual address entry, ensure the clinic is not verified and no Google Maps link is provided.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <label htmlFor="formattedAddress" className="block text-sm font-medium text-gray-600 mb-1">Full Address</label>
                    <input type="text" name="formattedAddress" value={clinicData.address.formattedAddress} onChange={(e) => handleNestedChange('address', e)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={!isAddressEditable} />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <input type="text" name="city" value={clinicData.address.city} onChange={(e) => handleNestedChange('address', e)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={!isAddressEditable} />
                  </div>
                   <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-600 mb-1">State / Province</label>
                    <input type="text" name="state" value={clinicData.address.state} onChange={(e) => handleNestedChange('address', e)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={!isAddressEditable} />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-600 mb-1">ZIP / Postal Code</label>
                    <input type="text" name="zipCode" value={clinicData.address.zipCode} onChange={(e) => handleNestedChange('address', e)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={!isAddressEditable} />
                  </div>
                   <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                    <input type="text" name="country" value={clinicData.address.country} onChange={(e) => handleNestedChange('address', e)} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" disabled={!isAddressEditable} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- Facilities Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6 flex items-center"><FiBriefcase className="mr-3" /> Facilities & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {PREDEFINED_FACILITIES.map((facility) => (
                <div key={facility} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`facility-${facility}`}
                    value={facility}
                    checked={(clinicData.facilities || []).includes(facility)}
                    onChange={handleFacilitiesChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`facility-${facility}`} className="ml-2 text-sm text-gray-600">{facility}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* --- Photos Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6">Clinic Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {clinicData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={typeof photo === 'string' ? photo : photo.url} alt={`Clinic photo ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                  <button type="button" onClick={() => handleDeletePhoto(typeof photo === 'string' ? photo : photo.url)} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <label htmlFor="photos-upload" className="block text-sm font-medium text-gray-600 mb-1">Add New Photos</label>
              <input type="file" id="photos-upload" multiple onChange={handlePhotosChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
            </div>
          </div>

          {/* --- Opening Hours Card --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-4 mb-6 flex items-center"><FiClock className="mr-3" /> Opening Hours</h2>
            <div className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-t md:border-t-0 pt-4 md:pt-0">
                  <span className="font-medium text-gray-800 capitalize">{day}</span>
                  <div className="flex items-center space-x-4">
                    <input type="time" value={clinicData.openingHours[day]?.open || ''} onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)} disabled={clinicData.openingHours[day]?.isClosed} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                    <span>-</span>
                    <input type="time" value={clinicData.openingHours[day]?.close || ''} onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)} disabled={clinicData.openingHours[day]?.isClosed} className="w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100" />
                  </div>
                  <div className="flex items-center justify-start md:justify-end">
                    <input type="checkbox" id={`${day}-closed`} checked={clinicData.openingHours[day]?.isClosed || false} onChange={(e) => handleOpeningHoursChange(day, 'isClosed', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor={`${day}-closed`} className="ml-2 text-sm text-gray-600">Closed</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* --- Action Buttons --- */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button type="submit" disabled={isLoading} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-wait">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateClinic;
