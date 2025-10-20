const QuickStats = ({ doctors, facilities, createdAt }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Doctors</span>
          <span className="text-gray-900 font-medium">{doctors.length}</span>
        </div>

        {facilities && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Facilities</span>
            <span className="text-gray-900 font-medium">{facilities.length}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Established</span>
          <span className="text-gray-900 font-medium">{new Date(createdAt).getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
