import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ error, className = '' }) => {
  if (!error) return null;
  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-red-800 font-medium">{error}</p>
    </div>
  );
};

export default ErrorMessage;
