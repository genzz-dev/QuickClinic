import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiSearch } from "react-icons/fi";
import AddDoctorForm from "../../components/Doctors/AddDoctorForm";
import DoctorList from "../../components/Doctors/DoctorList";
import ScheduleModal from "../../components/Doctors/ScheduleModal";
import {
	addDoctor,
	deleteDoctorFromClinic,
	getClinicDoctors,
	setDoctorSchedule,
} from "../../service/adminApiService";

const ManageDoctors = () => {
	const [doctors, setDoctors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [adding, setAdding] = useState(false);
	const [newDoctorId, setNewDoctorId] = useState("");
	const [error, setError] = useState("");
	const [modalDoctor, setModalDoctor] = useState(null);
	const [search, setSearch] = useState("");

	const fetchDoctors = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const res = await getClinicDoctors();
			setDoctors(res?.doctors || []);
		} catch (e) {
			setError(e?.response?.data?.message || "Failed to fetch doctors.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDoctors();
	}, [fetchDoctors]);

	const handleAdd = async (e) => {
		e.preventDefault();
		if (!newDoctorId.trim()) return;
		setAdding(true);
		setError("");
		try {
			await addDoctor(newDoctorId.trim());
			setNewDoctorId("");
			await fetchDoctors();
		} catch (e) {
			setError(e?.response?.data?.message || "Failed to add doctor.");
		} finally {
			setAdding(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Remove this doctor from clinic?")) return;
		try {
			await deleteDoctorFromClinic(id);
			await fetchDoctors();
		} catch (e) {
			setError(e?.response?.data?.message || "Failed to delete doctor.");
		}
	};

	const filteredDoctors = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return doctors;
		return doctors.filter((d) => {
			const name = `${d.firstName || ""} ${d.lastName || ""}`.toLowerCase();
			const spec = (d.specialization || "").toLowerCase();
			const id = (d._id || "").toLowerCase();
			return name.includes(q) || spec.includes(q) || id.includes(q);
		});
	}, [search, doctors]);

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold text-gray-800">Manage Doctors</h1>

			{error && (
				<div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 border border-red-200 rounded-md">
					<FiAlertCircle />
					{error}
				</div>
			)}

			{/* Add Doctor */}
			<AddDoctorForm
				newDoctorId={newDoctorId}
				setNewDoctorId={setNewDoctorId}
				adding={adding}
				handleAdd={handleAdd}
			/>

			{/* Search filter */}
			<div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
				<div className="relative flex-1">
					<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search by name, specialization, or ID..."
						className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
					/>
				</div>
				{search && (
					<span className="text-sm text-gray-500">
						{filteredDoctors.length} result(s)
					</span>
				)}
			</div>

			{/* Doctor List */}
			<DoctorList
				doctors={filteredDoctors}
				loading={loading}
				onScheduleClick={(doc) => setModalDoctor(doc)}
				onDeleteClick={handleDelete}
			/>

			{/* Schedule Modal */}
			<ScheduleModal
				open={!!modalDoctor}
				onClose={() => setModalDoctor(null)}
				doctor={modalDoctor}
				onSave={setDoctorSchedule}
			/>
		</div>
	);
};

export default ManageDoctors;
