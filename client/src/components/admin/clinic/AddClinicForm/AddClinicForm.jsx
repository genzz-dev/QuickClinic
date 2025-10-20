import { Building2 } from 'lucide-react';
import { useState } from 'react';
import AddressSection from './AddressSection.jsx';
import BasicInfoSection from './BasicInfoSection.jsx';
import ContactSection from './ContactSection.jsx';
import FacilitiesSection from './FacilitiesSection.jsx';
import FileUploadSection from './FileUploadSection.jsx';
import OpeningHoursSection from './OpeningHoursSection.jsx';

const AddClinicForm = ({
  formData,
  setFormData,
  files,
  setFiles,
  errors,
  setErrors,
  submitting,
  onSubmit,
}) => {
  const [addressMethod, setAddressMethod] = useState('manual');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (type === 'logo') {
      setFiles((prev) => ({ ...prev, logo: selectedFiles[0] }));
    } else {
      setFiles((prev) => ({
        ...prev,
        photos: [...prev.photos, ...selectedFiles],
      }));
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
      if (!formData.googleMapsLink.trim())
        newErrors.googleMapsLink = 'Google Maps link is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData, files, addressMethod);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Building2 className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Add Your Clinic</h1>
        </div>
        <p className="text-gray-600">Complete your clinic setup to start managing appointments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicInfoSection
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        <AddressSection
          formData={formData}
          addressMethod={addressMethod}
          setAddressMethod={setAddressMethod}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        <ContactSection formData={formData} handleInputChange={handleInputChange} errors={errors} />

        <OpeningHoursSection
          openingHours={formData.openingHours}
          handleOpeningHoursChange={handleOpeningHoursChange}
        />

        <FacilitiesSection
          facilities={formData.facilities}
          handleFacilityToggle={handleFacilityToggle}
        />

        <FileUploadSection files={files} handleFileChange={handleFileChange} />

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding Clinic...
              </>
            ) : (
              'Add Clinic & Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClinicForm;
