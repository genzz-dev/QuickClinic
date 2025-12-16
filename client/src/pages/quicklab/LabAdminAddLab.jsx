import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, Mail, Globe, MapPin, Upload, Image } from 'lucide-react';
import Loading from '../../components/ui/Loading';
import { createLab } from '../../service/labAdminService';
import '../../quicklab.css';

const initialState = {
  name: '',
  description: '',
  contact: {
    phone: '',
    email: '',
    website: '',
  },
  address: {
    formattedAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  generalHomeCollectionFee: '',
};

export default function LabAdminAddLab() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [logoFile, setLogoFile] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (path, value) => {
    setForm((prev) => {
      // Safe deep clone for nested updates
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let target = updated;
      keys.slice(0, -1).forEach((k) => {
        target[k] = target[k] || {};
        target = target[k];
      });
      target[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    setLogoFile(file || null);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.name.trim() || !form.contact.phone.trim()) {
        setError('Lab name and contact phone are required.');
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        generalHomeCollectionFee: form.generalHomeCollectionFee
          ? Number(form.generalHomeCollectionFee)
          : undefined,
      };

      await createLab(payload, logoFile, photoFiles);
      navigate('/quick-lab/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create lab');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-yellow-50 via-lab-black-50 to-white px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-lab-yellow-100 mb-4">
            <Building2 className="w-6 h-6 text-lab-yellow-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-lab-black-900 mb-2">Add Your Lab</h1>
          <p className="text-lab-black-600 text-base max-w-2xl mx-auto">
            Provide your lab details so patients and doctors can find and trust your services.
          </p>
        </div>

        <div className="card-quicklab bg-white border border-lab-black-100 shadow-lg">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800" htmlFor="name">
                  Lab Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent"
                    placeholder="QuickLab Diagnostics"
                    required
                  />
                  <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800" htmlFor="phone">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={form.contact.phone}
                    onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-lab-black-800" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full min-h-[120px] rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent p-3"
                placeholder="Briefly describe your lab, specialties, or services"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800" htmlFor="email">
                  Contact Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={form.contact.email}
                    onChange={(e) => handleInputChange('contact.email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent"
                    placeholder="lab@example.com"
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800" htmlFor="website">
                  Website
                </label>
                <div className="relative">
                  <input
                    id="website"
                    type="url"
                    value={form.contact.website}
                    onChange={(e) => handleInputChange('contact.website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent"
                    placeholder="https://yourlab.com"
                  />
                  <Globe className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800" htmlFor="fee">
                  Home Collection Fee
                </label>
                <input
                  id="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.generalHomeCollectionFee}
                  onChange={(e) => handleInputChange('generalHomeCollectionFee', e.target.value)}
                  className="w-full rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent p-3"
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-lab-black-800" htmlFor="address">
                Address
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="address"
                    type="text"
                    value={form.address.formattedAddress}
                    onChange={(e) => handleInputChange('address.formattedAddress', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent"
                    placeholder="Street & number"
                  />
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-lab-black-400" />
                </div>
                <input
                  type="text"
                  placeholder="City"
                  value={form.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent p-3"
                />
                <input
                  type="text"
                  placeholder="State/Province"
                  value={form.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  className="w-full rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent p-3"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ZIP/Postal"
                    value={form.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    className="w-full rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent p-3"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className="w-full rounded-lg border border-lab-black-200 text-lab-black-900 placeholder-lab-black-400 focus:outline-none focus:ring-2 focus:ring-lab-yellow-400 focus:border-transparent p-3"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800">Logo</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-lab-yellow-400 rounded-lg cursor-pointer hover:bg-lab-yellow-50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <span className="flex items-center gap-2 text-lab-black-800 text-sm font-medium">
                      <Upload className="w-5 h-5 text-lab-yellow-600" /> Upload logo
                    </span>
                  </label>
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-14 h-14 rounded-lg border-2 border-lab-yellow-400 object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-lab-black-800">Photos</label>
                <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-lab-yellow-400 rounded-lg cursor-pointer hover:bg-lab-yellow-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotosChange}
                  />
                  <span className="flex items-center gap-2 text-lab-black-800 text-sm font-medium">
                    <Image className="w-5 h-5 text-lab-yellow-600" /> Upload photos
                  </span>
                </label>
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {photoPreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-16 object-cover rounded-lg border border-lab-black-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-quicklab-primary py-3 font-semibold rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loading />
                  Saving Lab...
                </span>
              ) : (
                'Save Lab & Continue'
              )}
            </button>

            <p className="text-xs text-lab-black-500 text-center">
              You can update these details later from your dashboard.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
