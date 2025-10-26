const Medications = ({ medications }) => {
  if (!medications || medications.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-3">Medications</h3>
      <div className="overflow-hidden">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-1.5 sm:p-3 font-medium text-[10px] sm:text-sm">Med</th>
              <th className="text-left p-1.5 sm:p-3 font-medium text-[10px] sm:text-sm">Dose</th>
              <th className="text-left p-1.5 sm:p-3 font-medium text-[10px] sm:text-sm">Freq</th>
              <th className="text-left p-1.5 sm:p-3 font-medium text-[10px] sm:text-sm">Days</th>
              <th className="text-left p-1.5 sm:p-3 font-medium text-[10px] sm:text-sm">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {medications.map((med, index) => (
              <tr key={index}>
                <td className="p-1.5 sm:p-3 font-medium text-gray-900 text-[10px] sm:text-sm">
                  {med.name}
                </td>
                <td className="p-1.5 sm:p-3 text-gray-600 text-[10px] sm:text-sm">{med.dosage}</td>
                <td className="p-1.5 sm:p-3 text-gray-600 text-[10px] sm:text-sm">
                  {med.frequency}
                </td>
                <td className="p-1.5 sm:p-3 text-gray-600 text-[10px] sm:text-sm">
                  {med.duration}
                </td>
                <td className="p-1.5 sm:p-3 text-gray-600 text-[10px] sm:text-sm">
                  {med.instructions || 'As directed'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medications;
