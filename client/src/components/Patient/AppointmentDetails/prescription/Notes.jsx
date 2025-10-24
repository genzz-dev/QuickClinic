const Notes = ({ notes }) => {
  if (!notes) return null;

  return (
    <div className="mb-4">
      <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
      <p className="text-gray-600 bg-yellow-50 p-3 rounded-md">{notes}</p>
    </div>
  );
};

export default Notes;