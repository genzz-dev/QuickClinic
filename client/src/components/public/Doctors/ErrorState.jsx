import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-red-800">Error Loading Doctors</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
