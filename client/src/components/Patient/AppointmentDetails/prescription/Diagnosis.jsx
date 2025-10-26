const Diagnosis = ({ diagnosis }) => {
  if (!diagnosis) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Diagnosis</h3>
      <p className="text-gray-600 bg-blue-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm">
        {diagnosis}
      </p>
    </div>
  );
};

export default Diagnosis;
