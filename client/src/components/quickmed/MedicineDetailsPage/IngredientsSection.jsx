import { Package } from 'lucide-react';

const IngredientsSection = ({ medicineData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        Ingredients
      </h2>

      {medicineData.activeIngredients?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Active Ingredients</h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            {medicineData.activeIngredients.map((ingredient, idx) => (
              <p key={idx} className="text-gray-800 dark:text-gray-200 font-medium">
                {ingredient}
              </p>
            ))}
          </div>
        </div>
      )}

      {medicineData.inactiveIngredients?.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Inactive Ingredients</h4>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            {medicineData.inactiveIngredients.map((ingredient, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                {ingredient}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientsSection;
