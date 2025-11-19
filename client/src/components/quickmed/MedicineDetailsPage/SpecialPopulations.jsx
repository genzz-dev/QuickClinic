import { Users, Baby, HeartPulse, Activity } from 'lucide-react';

const SpecialPopulations = ({ medicineData }) => {
  const hasSpecialPopulations =
    medicineData.pregnancy?.length > 0 ||
    medicineData.nursing?.length > 0 ||
    medicineData.pediatric?.length > 0 ||
    medicineData.geriatric?.length > 0;

  if (!hasSpecialPopulations) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        Special Populations
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {medicineData.pregnancy?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Baby className="w-4 h-4" />
              Pregnancy
            </h4>
            {medicineData.pregnancy.map((item, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                {item}
              </p>
            ))}
          </div>
        )}
        {medicineData.nursing?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4" />
              Nursing Mothers
            </h4>
            {medicineData.nursing.map((item, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                {item}
              </p>
            ))}
          </div>
        )}
        {medicineData.pediatric?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pediatric Use
            </h4>
            {medicineData.pediatric.map((item, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                {item}
              </p>
            ))}
          </div>
        )}
        {medicineData.geriatric?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Geriatric Use
            </h4>
            {medicineData.geriatric.map((item, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialPopulations;
