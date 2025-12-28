import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export const ErrorMessage = ({ error, className = '' }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!error || isDismissed) return null;

  return (
    <div className={`animate-slideDown ${className}`}>
      <div className="relative p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
