const Medications = ({ medications }) => {
  if (!medications || medications.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-3">Medications</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 font-medium">Medication</th>
              <th className="text-left p-3 font-medium">Dosage</th>
              <th className="text-left p-3 font-medium">Frequency</th>
              <th className="text-left p-3 font-medium">Duration</th>
              <th className="text-left p-3 font-medium">Instructions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {medications.map((med, index) => (
              <tr key={index}>
                <td className="p-3 font-medium text-gray-900">{med.name}</td>
                <td className="p-3 text-gray-600">{med.dosage}</td>
                <td className="p-3 text-gray-600">{med.frequency}</td>
                <td className="p-3 text-gray-600">{med.duration}</td>
                <td className="p-3 text-gray-600">{med.instructions || 'Take as directed'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medications;
