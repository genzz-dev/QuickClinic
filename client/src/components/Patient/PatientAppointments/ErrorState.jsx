import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-800">{error}</p>
      </div>
    </div>
  );
};

export default ErrorState;
