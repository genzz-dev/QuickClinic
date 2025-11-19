import { Pill, ChevronRight } from 'lucide-react';

const MedicineHeader = ({ medicineData, navigate }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">Back to Search</span>
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <Pill className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{medicineData.name}</h1>
            {medicineData.genericName && (
              <p className="text-xl text-blue-100 mb-2">Generic: {medicineData.genericName}</p>
            )}
            {medicineData.manufacturer && (
              <p className="text-sm text-blue-100">Manufactured by {medicineData.manufacturer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineHeader;
