const Diagnosis = ({ diagnosis }) => {
  if (!diagnosis) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-2">Diagnosis</h3>
      <p className="text-gray-600 bg-blue-50 p-3 rounded-md">{diagnosis}</p>
    </div>
  );
};

export default Diagnosis;
