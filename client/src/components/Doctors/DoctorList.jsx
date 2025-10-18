import { FiCalendar, FiLoader, FiTrash2 } from "react-icons/fi";

const DoctorList = ({ doctors, loading, onScheduleClick, onDeleteClick }) => {
	if (loading) {
		return (
			<div className="flex justify-center py-6 text-gray-500 items-center gap-2">
				<FiLoader className="animate-spin" />
				Loading doctors...
			</div>
		);
	}

	if (!doctors.length) {
		return (
			<p className="text-center py-4 text-gray-500">No doctors added yet.</p>
		);
	}

	return (
		<div className="grid md:grid-cols-2 gap-4">
			{doctors.map((doc) => (
				<div
					key={doc._id}
					className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 flex justify-between items-center"
				>
					<div>
						<h3 className="font-semibold text-lg text-gray-800">
							{doc.firstName} {doc.lastName}
						</h3>
						<p className="text-sm text-gray-500">
							{doc.specialization || "General"}
						</p>
						<p className="text-xs text-gray-400 mt-1">ID: {doc._id}</p>
					</div>

					<div className="flex gap-2">
						<button
							onClick={() => onScheduleClick(doc)}
							className="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-1 transition-colors"
						>
							<FiCalendar /> Schedule
						</button>
						<button
							onClick={() => onDeleteClick(doc._id)}
							className="px-3 py-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 flex items-center gap-1 transition-colors"
						>
							<FiTrash2 /> Remove
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default DoctorList;
