// client/src/components/Patient/PatientProfile/HealthRecords.jsx
import { FileText, Plus, Calendar, Download } from 'lucide-react';
import { AlertCircle, Heart, Shield, UserCheck } from 'lucide-react';

const HealthRecords = ({ profile, setShowHealthRecordForm, handleDownloadFile }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatRecordType = (type) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRecordTypeIcon = (type) => {
    const icons = {
      allergy: <AlertCircle className="w-4 h-4" />,
      condition: <Heart className="w-4 h-4" />,
      immunization: <Shield className="w-4 h-4" />,
      'lab-result': <FileText className="w-4 h-4" />,
      medication: <Plus className="w-4 h-4" />,
      procedure: <UserCheck className="w-4 h-4" />,
      'vital-sign': <Heart className="w-4 h-4" />,
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Health Records</h2>
          </div>
          <button
            onClick={() => setShowHealthRecordForm(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>

        <div className="space-y-4">
          {profile?.healthRecords && profile.healthRecords.length > 0 ? (
            profile.healthRecords.map((record, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getRecordTypeIcon(record.recordType)}
                    <h3 className="font-medium text-gray-900">{record.title}</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {formatRecordType(record.recordType)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(record.date)}</span>
                </div>

                {record.description && (
                  <p className="text-sm text-gray-700 mb-3">{record.description}</p>
                )}

                {record.files && record.files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Attached Files:</p>
                    {record.files.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {file.originalName}
                        </span>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Records</h3>
              <p className="text-gray-600 mb-4">
                Upload your first health record to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;