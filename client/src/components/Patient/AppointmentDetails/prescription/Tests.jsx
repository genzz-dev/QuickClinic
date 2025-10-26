const Tests = ({ tests }) => {
  if (!tests || tests.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Recommended Tests</h3>
      <ul className="space-y-1.5 sm:space-y-2">
        {tests.map((test, index) => (
          <li key={index} className="bg-green-50 p-2 sm:p-3 rounded-md">
            <span className="font-medium text-green-800 text-xs sm:text-sm">{test.name}</span>
            {test.instructions && (
              <p className="text-green-600 text-[10px] sm:text-sm mt-0.5 sm:mt-1">
                Instructions: {test.instructions}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tests;
