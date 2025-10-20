import { FiLoader, FiPlus } from 'react-icons/fi';

const AddDoctorForm = ({ newDoctorId, setNewDoctorId, adding, handleAdd }) => {
  return (
    <form
      onSubmit={handleAdd}
      className="bg-white shadow-sm rounded-lg p-4 flex items-center gap-3 border border-gray-200"
    >
      <input
        type="text"
        value={newDoctorId}
        onChange={(e) => setNewDoctorId(e.target.value)}
        placeholder="Enter Doctor ID..."
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
      />
      <button
        type="submit"
        disabled={adding}
        className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {adding ? <FiLoader className="animate-spin" /> : <FiPlus />}
        {adding ? 'Adding...' : 'Add Doctor'}
      </button>
    </form>
  );
};

export default AddDoctorForm;
