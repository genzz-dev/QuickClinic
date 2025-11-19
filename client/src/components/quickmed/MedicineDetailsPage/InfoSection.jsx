import { AlertTriangle, Info, FileText, Shield, Thermometer, Activity } from 'lucide-react';

const iconMap = {
  AlertTriangle,
  Info,
  FileText,
  Shield,
  Thermometer,
  Activity,
};

const InfoSection = ({ icon, title, content, variant = 'default' }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  const IconComponent = iconMap[icon];

  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    warning: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  const iconStyles = {
    default: 'text-gray-600 dark:text-gray-400',
    warning: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
  };

  return (
    <div
      className={`border rounded-xl p-6 ${variantStyles[variant]} transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-3 mb-4">
        <IconComponent className={`w-6 h-6 flex-shrink-0 mt-0.5 ${iconStyles[variant]}`} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="ml-9 space-y-2">
        {Array.isArray(content) ? (
          content.map((item, idx) => (
            <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {item}
            </p>
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
        )}
      </div>
    </div>
  );
};

export default InfoSection;
