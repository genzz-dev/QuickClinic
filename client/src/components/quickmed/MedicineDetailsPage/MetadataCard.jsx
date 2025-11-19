const MetadataCard = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
};

export default MetadataCard;
