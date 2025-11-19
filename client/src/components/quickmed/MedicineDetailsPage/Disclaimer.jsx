import { AlertCircle } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="mt-12 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Medical Disclaimer</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            This information is for educational purposes only and is not intended to replace
            professional medical advice, diagnosis, or treatment. Always consult with a qualified
            healthcare provider before starting any medication or if you have questions about your
            medical condition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
