import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneIcon, MapPinIcon, GlobeAltIcon, EnvelopeIcon,
  PhotoIcon, UserGroupIcon, CheckBadgeIcon, PencilSquareIcon, BuildingOfficeIcon, ClockIcon
} from '@heroicons/react/24/outline';

const Section = ({ title, cta, onCta, children }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {cta && (
        <button
          onClick={onCta}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <PencilSquareIcon className="h-4 w-4" /> {cta}
        </button>
      )}
    </div>
    {children}
  </div>
);

const TimePill = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ring-1 ring-gray-200">
    {label}
  </span>
);

const DayRow = ({ day, data }) => {
  const cap = day.charAt(0).toUpperCase() + day.slice(1);
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-700">{cap}</span>
      {data?.isClosed ? (
        <span className="text-gray-400">Closed</span>
      ) : (
        <div className="flex items-center gap-2">
          <TimePill label={data?.open || '--:--'} />
          <span className="text-gray-400">to</span>
          <TimePill label={data?.close || '--:--'} />
        </div>
      )}
    </div>
  );
};

const ClinicProfile = ({ clinicData, doctors }) => {
  const navigate = useNavigate();

  if (!clinicData) {
    return (
      <div className="p-10 text-center">
        <BuildingOfficeIcon className="h-16 w-16 mx-auto text-gray-300" />
        <h3 className="mt-3 text-lg font-semibold text-gray-900">No clinic profile yet</h3>
        <p className="text-gray-600 mt-1">Create your clinic to start managing details.</p>
        <button
          onClick={() => navigate('/admin/update-clinic')}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          <PencilSquareIcon className="h-4 w-4" /> Setup Clinic
        </button>
      </div>
    );
  }

  const {
    name, description, logo, photos = [], googleMapsLink, isVerified,
    gstNumber, gstName, address, contact, facilities = [], openingHours = {}
  } = clinicData;

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  return (
    <div className="divide-y divide-gray-100">
      {/* Header */}
      <div className="p-6 flex flex-col md:flex-row md:items-center gap-4">
        <img
          src={logo || 'https://via.placeholder.com/96'}
          alt="Clinic Logo"
          className="h-20 w-20 rounded-xl object-cover ring-1 ring-gray-200"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{name || 'Clinic name'}</h2>
            {isVerified && <CheckBadgeIcon className="h-6 w-6 text-green-600" />}
          </div>
          <p className="text-gray-600 mt-1">{description || 'Add a brief clinic description for patients.'}</p>
        </div>
        <button
          onClick={() => navigate('/admin/update-clinic')}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit Clinic
        </button>
      </div>

      {/* Contact & Location */}
      <Section title="Contact & Location" cta="Edit" onCta={() => navigate('/admin/update-clinic')}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <p className="flex items-start">
            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
            {address?.formattedAddress || 'Add full address'}
          </p>
          <p className="flex items-center">
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
            {contact?.phone || 'Add phone number'}
          </p>
          <p className="flex items-center">
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
            {contact?.email || 'Add email'}
          </p>
          <p className="flex items-center">
            <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
            {contact?.website ? (
              <span className="text-indigo-600">{contact.website}</span>
            ) : 'Add website'}
          </p>
          {googleMapsLink && (
            <p className="flex items-center col-span-full">
              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-indigo-600">Google Maps added</span>
            </p>
          )}
        </div>
      </Section>

      {/* Opening Hours (restored) */}
      <Section title="Opening Hours" cta="Edit" onCta={() => navigate('/admin/update-clinic')}>
        <div className="bg-gray-50 rounded-2xl p-4 ring-1 ring-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <ClockIcon className="h-5 w-5 text-gray-500" />
            <p className="text-sm text-gray-600">Weekly schedule</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
              <div key={d} className="bg-white rounded-xl p-3 ring-1 ring-gray-200">
                <DayRow day={d} data={openingHours[d]} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Photos */}
      <Section title="Clinic Photos" cta="Manage" onCta={() => navigate('/admin/update-clinic')}>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((p, i) => (
              <img key={i} src={p} alt={`Clinic ${i + 1}`} className="h-28 w-full object-cover rounded-lg ring-1 ring-gray-200" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No photos yet. Add photos to showcase your clinic.</p>
        )}
      </Section>

      {/* Doctors */}
      <Section title="Doctors" cta="Manage doctors" onCta={() => navigate('/admin/manage-doctor')}>
        {doctors?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((d) => (
              
              <div key={d._id} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3 ring-1 ring-gray-200">
                {console.log('Doctor data:', d)}
                <img
                  src={d.profilePicture }
                  alt={d.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{d.firstName + ' ' + d.lastName}</p>
                  <p className="text-xs text-gray-600">{d.specialization || 'General Practice'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
            <p className="text-sm text-indigo-800">No doctors added yet.</p>
            <button
              onClick={() => navigate('/admin/manage-doctor')}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <UserGroupIcon className="h-4 w-4" /> Add & Manage
            </button>
          </div>
        )}
      </Section>

      {/* Facilities */}
      <Section title="Facilities & Amenities" cta="Edit" onCta={() => navigate('/admin/update-clinic')}>
        {facilities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {facilities.map((f, i) => (
              <span key={i} className="bg-indigo-50 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-indigo-200">{f}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No facilities listed. Add facilities to improve discovery.</p>
        )}
      </Section>

      {/* GST */}
      <Section title="GST Details" cta="Edit" onCta={() => navigate('/admin/update-clinic')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="text-gray-500">GST Number</p>
            <p className="font-medium">{gstNumber || 'Not added'}</p>
          </div>
          <div>
            <p className="text-gray-500">GST Name</p>
            <p className="font-medium">{gstName || 'Not added'}</p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ClinicProfile;