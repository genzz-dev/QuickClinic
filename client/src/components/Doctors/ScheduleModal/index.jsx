import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiLoader, FiX } from "react-icons/fi";
import { getDoctorSchedule } from "../../../service/adminApiService";
import BreaksTab from "./BreaksTab";
import SettingsTab from "./SettingsTab";
import Tabs from "./Tabs";
import VacationsTab from "./VacationsTab";
import WorkingDaysTab from "./WorkingDaysTab";

const DAYS = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

const emptyWorkingWeek = () =>
	DAYS.map((day) => ({
		day,
		isWorking: false,
		startTime: "09:00",
		endTime: "17:00",
	}));

const defaultSchedule = () => ({
	workingDays: emptyWorkingWeek(),
	breaks: [],
	vacations: [],
	appointmentDuration: 30,
});

const ScheduleModal = ({ open, onClose, doctor, onSave }) => {
	const [loading, setLoading] = useState(false);
	const [schedule, setSchedule] = useState(defaultSchedule());
	const [tab, setTab] = useState("days");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!open || !doctor) return;
		setError("");
		setLoading(true);
		(async () => {
			try {
				const res = await getDoctorSchedule(doctor._id);
				const data = res?.schedule || res;
				const existingDays = data?.workingDays || [];
				const fullWeek = DAYS.map((day) => {
					const found = existingDays.find((d) => d.day === day);
					return (
						found || {
							day,
							isWorking: false,
							startTime: "09:00",
							endTime: "17:00",
						}
					);
				});
				setSchedule({
					workingDays: fullWeek,
					breaks: data?.breaks || [],
					vacations: data?.vacations || [],
					appointmentDuration: data?.appointmentDuration || 30,
				});
			} catch (e) {
				setSchedule(defaultSchedule());
			} finally {
				setLoading(false);
			}
		})();
	}, [open, doctor]);

	const onToggleDay = (day) => {
		setSchedule((prev) => ({
			...prev,
			workingDays: prev.workingDays.map((d) =>
				d.day === day ? { ...d, isWorking: !d.isWorking } : d,
			),
		}));
	};

	const onTimeChange = (day, field, value) => {
		setSchedule((prev) => ({
			...prev,
			workingDays: prev.workingDays.map((d) =>
				d.day === day ? { ...d, [field]: value } : d,
			),
		}));
	};

	const addBreak = () => {
		setSchedule((prev) => ({
			...prev,
			breaks: [
				...prev.breaks,
				{ day: "monday", startTime: "13:00", endTime: "13:30", reason: "" },
			],
		}));
	};

	const updateBreak = (idx, field, value) => {
		setSchedule((prev) => {
			const next = [...prev.breaks];
			next[idx] = { ...next[idx], [field]: value };
			return { ...prev, breaks: next };
		});
	};

	const removeBreak = (idx) => {
		setSchedule((prev) => ({
			...prev,
			breaks: prev.breaks.filter((_, i) => i !== idx),
		}));
	};

	const addVacation = () => {
		setSchedule((prev) => ({
			...prev,
			vacations: [
				...prev.vacations,
				{ startDate: "", endDate: "", reason: "" },
			],
		}));
	};

	const updateVacation = (idx, field, value) => {
		setSchedule((prev) => {
			const next = [...prev.vacations];
			next[idx] = { ...next[idx], [field]: value };
			return { ...prev, vacations: next };
		});
	};

	const removeVacation = (idx) => {
		setSchedule((prev) => ({
			...prev,
			vacations: prev.vacations.filter((_, i) => i !== idx),
		}));
	};

	const validate = useCallback(() => {
		// Working days
		for (const d of schedule.workingDays) {
			if (d.isWorking) {
				if (!d.startTime || !d.endTime)
					return "All working days must have start and end times.";
				if (d.startTime >= d.endTime)
					return "Start time must be before end time for working days.";
			}
		}
		// Breaks
		for (const b of schedule.breaks) {
			if (!b.day || !b.startTime || !b.endTime)
				return "All breaks must have day, start, and end times.";
			if (b.startTime >= b.endTime)
				return "Break start time must be before end time.";
		}
		// Vacations
		for (const v of schedule.vacations) {
			if (!v.startDate || !v.endDate)
				return "Vacations must have start and end dates.";
			if (new Date(v.startDate) > new Date(v.endDate))
				return "Vacation start must be before end date.";
		}
		// Duration
		if (!schedule.appointmentDuration || schedule.appointmentDuration <= 0) {
			return "Appointment duration must be a positive number.";
		}
		return "";
	}, [schedule]);

	const handleSave = async () => {
		const msg = validate();
		if (msg) {
			setError(msg);
			return;
		}
		setError("");

		const payload = {
			workingDays: schedule.workingDays.filter((d) => d.isWorking),
			breaks: schedule.breaks,
			vacations: schedule.vacations,
			appointmentDuration: schedule.appointmentDuration,
		};

		try {
			await onSave(doctor._id, payload);
			onClose();
		} catch (e) {
			setError(e?.response?.data?.message || "Failed to save schedule.");
		}
	};

	const tabs = useMemo(
		() => [
			{ key: "days", label: "Working Days" },
			{ key: "breaks", label: "Breaks" },
			{ key: "vacations", label: "Vacations" },
			{ key: "settings", label: "Settings" },
		],
		[],
	);

	if (!open || !doctor) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
			<div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">
						Schedule — Dr. {doctor.firstName} {doctor.lastName}
					</h2>
					<button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
						<FiX className="w-5 h-5 text-gray-600" />
					</button>
				</div>

				{/* Tabs */}
				<div className="px-6 pt-4">
					<Tabs tabs={tabs} current={tab} onChange={setTab} />
				</div>

				{/* Body */}
				<div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-16">
							<FiLoader className="animate-spin w-8 h-8 text-blue-600" />
						</div>
					) : (
						<>
							{error && (
								<div className="mb-4 flex items-center text-red-700 bg-red-100 px-3 py-2 rounded">
									<FiAlertCircle className="mr-2" /> {error}
								</div>
							)}

							{tab === "days" && (
								<WorkingDaysTab
									workingDays={schedule.workingDays}
									onToggleDay={onToggleDay}
									onTimeChange={onTimeChange}
								/>
							)}

							{tab === "breaks" && (
								<BreaksTab
									breaks={schedule.breaks}
									addBreak={addBreak}
									updateBreak={updateBreak}
									removeBreak={removeBreak}
								/>
							)}

							{tab === "vacations" && (
								<VacationsTab
									vacations={schedule.vacations}
									addVacation={addVacation}
									updateVacation={updateVacation}
									removeVacation={removeVacation}
								/>
							)}

							{tab === "settings" && (
								<SettingsTab
									appointmentDuration={schedule.appointmentDuration}
									setSchedule={setSchedule}
								/>
							)}
						</>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
					>
						Save Schedule
					</button>
				</div>
			</div>
		</div>
	);
};

export default ScheduleModal;
