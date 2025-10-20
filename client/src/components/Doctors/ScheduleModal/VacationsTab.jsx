import { FiPlus } from 'react-icons/fi';

const VacationsTab = ({ vacations, addVacation, updateVacation, removeVacation }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900">Vacations</h3>
        <button
          onClick={addVacation}
          className="flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          <FiPlus className="mr-1" /> Add Vacation
        </button>
      </div>
      {vacations.length === 0 ? (
        <p className="text-gray-500">No vacations added.</p>
      ) : (
        <div className="space-y-3">
          {vacations.map((v, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                <input
                  type="date"
                  value={v.startDate ? String(v.startDate).slice(0, 10) : ''}
                  onChange={(e) => updateVacation(idx, 'startDate', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                />
                <input
                  type="date"
                  value={v.endDate ? String(v.endDate).slice(0, 10) : ''}
                  onChange={(e) => updateVacation(idx, 'endDate', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-gray-900"
                />
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={v.reason || ''}
                    onChange={(e) => updateVacation(idx, 'reason', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900"
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => removeVacation(idx)}
                  className="px-3 py-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VacationsTab;
