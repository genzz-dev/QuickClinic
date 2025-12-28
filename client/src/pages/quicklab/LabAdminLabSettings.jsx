import { useEffect, useState } from 'react';
import {
  Building2,
  Upload,
  Save,
  Image as ImageIcon,
  Phone,
  MapPin,
  Globe,
  Mail,
  DollarSign,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getLabInfo, updateLabInfo } from '../../service/labAdminService';
import '../../quicklab.css';

export default function LabAdminLabSettings() {
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    formattedAddress: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    generalHomeCollectionFee: '',
    existingPhotos: [],
  });

  useEffect(() => {
    loadLab();
  }, []);

  const loadLab = async () => {
    try {
      setLoading(true);
      const response = await getLabInfo();
      const data = response.data || response;
      const labInfo = data.lab;
      setLab(labInfo);
      setFormData({
        name: labInfo?.name || '',
        description: labInfo?.description || '',
        phone: labInfo?.contact?.phone || '',
        email: labInfo?.contact?.email || '',
        website: labInfo?.contact?.website || '',
        formattedAddress: labInfo?.address?.formattedAddress || '',
        street: labInfo?.address?.street || '',
        city: labInfo?.address?.city || '',
        state: labInfo?.address?.state || '',
        zipCode: labInfo?.address?.zipCode || '',
        country: labInfo?.address?.country || '',
        generalHomeCollectionFee:
          labInfo?.generalHomeCollectionFee !== undefined ? labInfo.generalHomeCollectionFee : '',
        existingPhotos: labInfo?.photos || [],
      });
    } catch (error) {
      console.error('Failed to load lab info:', error);
      toast.error('Failed to load lab info');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemovePhoto = (url) => {
    setFormData((prev) => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((p) => p !== url),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Lab name is required');
      return;
    }
    if (!formData.phone) {
      toast.error('Contact phone is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
        },
        address: {
          formattedAddress: formData.formattedAddress,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        generalHomeCollectionFee: formData.generalHomeCollectionFee,
        existingPhotos: formData.existingPhotos,
      };

      const response = await updateLabInfo(payload, logoFile, newPhotos);
      const updated = response.data?.lab || response.lab;
      setLab(updated);
      setNewPhotos([]);
      setLogoFile(null);
      setFormData((prev) => ({
        ...prev,
        existingPhotos: updated?.photos || prev.existingPhotos,
      }));
      toast.success('Lab info updated');
    } catch (error) {
      console.error('Failed to update lab:', error);
      toast.error(error?.response?.data?.message || 'Failed to update lab info');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 flex items-center justify-center">
        <div className="card-quicklab p-6 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-lab-yellow-600" />
          <p className="text-lab-black-800 dark:text-lab-black-100">Loading lab settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white dark:from-lab-black-900 dark:via-lab-black-800 dark:to-lab-black-900 p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-lab-black-500 dark:text-lab-black-300">
              Lab Admin
            </p>
            <h1 className="text-3xl font-bold text-lab-black-900 dark:text-lab-black-50">
              Lab Settings
            </h1>
            <p className="text-lab-black-600 dark:text-lab-black-300">
              View and edit your lab profile, charges, and media
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-quicklab-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Snapshot */}
        {lab && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-quicklab flex items-center gap-3 p-4">
              <Building2 className="w-10 h-10 text-lab-yellow-600" />
              <div>
                <p className="text-lab-black-500 dark:text-lab-black-300 text-sm">Lab name</p>
                <p className="text-xl font-semibold text-lab-black-900 dark:text-lab-black-50">
                  {lab.name}
                </p>
              </div>
            </div>
            <div className="card-quicklab flex items-center gap-3 p-4">
              <DollarSign className="w-10 h-10 text-lab-blue-600" />
              <div>
                <p className="text-lab-black-500 dark:text-lab-black-300 text-sm">
                  Home collection fee
                </p>
                <p className="text-xl font-semibold text-lab-black-900 dark:text-lab-black-50">
                  {lab.generalHomeCollectionFee ? `₹${lab.generalHomeCollectionFee}` : 'Not set'}
                </p>
              </div>
            </div>
            <div className="card-quicklab flex items-center gap-3 p-4">
              <Clock className="w-10 h-10 text-lab-black-700" />
              <div>
                <p className="text-lab-black-500 dark:text-lab-black-300 text-sm">Last updated</p>
                <p className="text-lab-black-900 dark:text-lab-black-50 font-semibold text-sm">
                  {formatDate(lab.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
            <div className="card-quicklab p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lab-yellow-600" />
                <h2 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                  Basic details
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                    Lab name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                    placeholder="Enter lab name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Home collection fee (₹)
                  </label>
                  <input
                    name="generalHomeCollectionFee"
                    type="number"
                    value={formData.generalHomeCollectionFee}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                  About the lab
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  className="input-quicklab min-h-[100px] bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  placeholder="Short description, specialties, certifications"
                />
              </div>
            </div>

            <div className="card-quicklab p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-lab-blue-600" />
                <h2 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                  Contact
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                    Phone *
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                    placeholder="Primary contact number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300 flex items-center gap-1">
                    <Mail className="w-4 h-4" /> Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                    placeholder="contact@lab.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300 flex items-center gap-1">
                    <Globe className="w-4 h-4" /> Website
                  </label>
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            <div className="card-quicklab p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lab-yellow-600" />
                <h2 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                  Address
                </h2>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                  Formatted address
                </label>
                <input
                  name="formattedAddress"
                  value={formData.formattedAddress}
                  onChange={handleInput}
                  className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  placeholder="Building, area"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                    Street
                  </label>
                  <input
                    name="street"
                    value={formData.street}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">City</label>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                    ZIP / PIN
                  </label>
                  <input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">
                    Country
                  </label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleInput}
                    className="input-quicklab bg-white dark:bg-lab-black-800 border border-lab-black-200 dark:border-lab-black-700 text-lab-black-900 dark:text-lab-black-50"
                  />
                </div>
              </div>
            </div>

            <div className="card-quicklab p-4 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-lab-blue-600" />
                <h2 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                  Media
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="input-quicklab"
                  />
                  {lab?.logo && !logoFile && (
                    <div className="flex items-center gap-3 mt-2">
                      <img
                        src={lab.logo}
                        alt="Lab logo"
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <p className="text-sm text-lab-black-600 dark:text-lab-black-300">
                        Current logo
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-lab-black-600 dark:text-lab-black-300 flex items-center gap-1">
                    <Upload className="w-4 h-4" /> Add photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setNewPhotos(Array.from(e.target.files || []))}
                    className="input-quicklab"
                  />
                  {newPhotos.length > 0 && (
                    <p className="text-sm text-lab-black-600 dark:text-lab-black-300">
                      {newPhotos.length} new photo(s) selected
                    </p>
                  )}
                </div>
              </div>

              {formData.existingPhotos?.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-lab-black-800 dark:text-lab-black-200 mb-2">
                    Existing photos
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.existingPhotos.map((photo) => (
                      <div key={photo} className="relative group">
                        <img
                          src={photo}
                          alt="Lab"
                          className="w-full h-28 object-cover rounded-lg border border-lab-black-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo)}
                          className="absolute top-2 right-2 bg-white/90 dark:bg-black/70 text-red-600 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <div className="card-quicklab p-4 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-lab-yellow-600" />
                <h3 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                  Change log
                </h3>
              </div>
              <div className="space-y-2 text-sm text-lab-black-700 dark:text-lab-black-200">
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span className="font-medium">{formatDate(lab?.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last updated</span>
                  <span className="font-medium">{formatDate(lab?.updatedAt)}</span>
                </div>
                <p className="text-xs text-lab-black-500 dark:text-lab-black-400 mt-2">
                  Future updates will include detailed field-level change history.
                </p>
              </div>
            </div>

            <div className="card-quicklab p-4 md:p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lab-blue-600" />
                <h3 className="text-lg font-semibold text-lab-black-900 dark:text-lab-black-50">
                  At a glance
                </h3>
              </div>
              <div className="space-y-2 text-sm text-lab-black-700 dark:text-lab-black-200">
                <div className="flex items-center justify-between">
                  <span>Tests offered</span>
                  <span className="font-semibold">{lab?.tests?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Staff on roster</span>
                  <span className="font-semibold">{lab?.staff?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Home collection enabled</span>
                  <span className="font-semibold">
                    {lab?.tests?.some((t) => t.homeCollectionAvailable) ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
