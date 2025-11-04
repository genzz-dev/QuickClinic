// client/src/components/Patient/PatientProfile/HealthRecordModal.jsx
import { X } from 'lucide-react';
import { uploadHealthRecord } from '../../../service/patientApiService';

const HealthRecordModal = ({
  healthRecordForm,
  setHealthRecordForm,
  selectedFile,
  setSelectedFile,
  isLoading,
  setShowHealthRecordForm,
  setError,
  setSuccess,
  fetchProfile,
  setIsLoading,
}) => {
  const healthRecordTypes = [
    'allergy',
    'condition',
    'immunization',
    'lab-result',
    'medication',
    'procedure',
    'vital-sign',
  ];

  const formatRecordType = (type) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleHealthRecordInputChange = (e) => {
    const { name, value } = e.target;
    setHealthRecordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUploadHealthRecord = async (e) => {
    e.preventDefault();
    if (!selectedFile || !healthRecordForm.recordType || !healthRecordForm.title) {
      setError('Please fill all required fields and select a file');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await uploadHealthRecord(healthRecordForm, selectedFile);
      setSuccess('Health record uploaded successfully!');
      setShowHealthRecordForm(false);
      setHealthRecordForm({
        recordType: '',
        title: '',
        date: '',
        description: '',
      });
      setSelectedFile(null);
      await fetchProfile();
    } catch (error) {
      setError('Failed to upload health record');
      console.error('Error uploading health record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upload Health Record</h3>
            <button
              onClick={() => setShowHealthRecordForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleUploadHealthRecord} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type *</label>
              <select
                name="recordType"
                value={healthRecordForm.recordType}
                onChange={handleHealthRecordInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                {healthRecordTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatRecordType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={healthRecordForm.title}
                onChange={handleHealthRecordInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter record title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={healthRecordForm.date}
                onChange={handleHealthRecordInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={healthRecordForm.description}
                onChange={handleHealthRecordInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File *</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Uploading...' : 'Upload Record'}
              </button>
              <button
                type="button"
                onClick={() => setShowHealthRecordForm(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthRecordModal;
