import { Calendar, Clock, Coffee, Plane } from "lucide-react";

const ScheduleSection = ({ schedule }) => {
	if (!schedule || !schedule.workingDays?.length) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Clock className="w-5 h-5 text-blue-600" />
					Schedule
				</h3>
				<p className="text-gray-600">Schedule information not available</p>
			</div>
		);
	}

	const formatTime = (time) => {
		if (!time) return "";
		return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const dayOrder = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];
	const orderedWorkingDays = schedule.workingDays
		.filter((day) => day.isWorking)
		.sort(
			(a, b) =>
				dayOrder.indexOf(a.day.toLowerCase()) -
				dayOrder.indexOf(b.day.toLowerCase()),
		);

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
				<Clock className="w-5 h-5 text-blue-600" />
				Schedule Information
			</h3>

			{/* Working Days */}
			<div className="mb-6">
				<h4 className="text-lg font-medium text-gray-800 mb-3">
					Working Hours
				</h4>
				<div className="space-y-2">
					{orderedWorkingDays.map((day, index) => (
						<div
							key={index}
							className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
						>
							<span className="font-medium text-gray-700 capitalize">
								{day.day}
							</span>
							<span className="text-gray-600">
								{formatTime(day.startTime)} - {formatTime(day.endTime)}
							</span>
						</div>
					))}
				</div>
				<p className="text-sm text-gray-500 mt-2">
					Appointment Duration: {schedule.appointmentDuration} minutes
				</p>
			</div>

			{/* Breaks */}
			{schedule.breaks && schedule.breaks.length > 0 && (
				<div className="mb-6">
					<h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
						<Coffee className="w-4 h-4 text-orange-500" />
						Break Times
					</h4>
					<div className="space-y-2">
						{schedule.breaks.map((breakTime, index) => (
							<div
								key={index}
								className="flex justify-between items-center py-2 px-3 bg-orange-50 rounded-md border-l-4 border-orange-500"
							>
								<span className="font-medium text-gray-700 capitalize">
									{breakTime.day}
								</span>
								<span className="text-gray-600">
									{formatTime(breakTime.startTime)} -{" "}
									{formatTime(breakTime.endTime)}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Vacations */}
			{schedule.vacations && schedule.vacations.length > 0 && (
				<div>
					<h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
						<Plane className="w-4 h-4 text-red-500" />
						Upcoming Vacations
					</h4>
					<div className="space-y-2">
						{schedule.vacations
							.filter((vacation) => new Date(vacation.endDate) >= new Date())
							.map((vacation, index) => (
								<div
									key={index}
									className="py-2 px-3 bg-red-50 rounded-md border-l-4 border-red-500"
								>
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4 text-red-500" />
										<span className="font-medium text-gray-700">
											{formatDate(vacation.startDate)} -{" "}
											{formatDate(vacation.endDate)}
										</span>
									</div>
									<p className="text-sm text-gray-600 mt-1">
										Doctor will be unavailable during this period
									</p>
								</div>
							))}
					</div>
				</div>
			)}

			{/* Note */}
			<div className="mt-6 p-4 bg-blue-50 rounded-md border-l-4 border-blue-500">
				<p className="text-sm text-blue-700">
					<strong>Note:</strong> Schedule information is for reference only.
					Please book an appointment to confirm availability.
				</p>
			</div>
		</div>
	);
};

export default ScheduleSection;
