import { Calendar, Clock, Coffee, Plane, User } from "lucide-react";
import { useEffect, useState } from "react";
import { getDoctorSchedule } from "../../service/doctorApiService";

const DoctorSchedule = () => {
	const [schedule, setSchedule] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const dayOrder = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];
	const dayNames = {
		monday: "Monday",
		tuesday: "Tuesday",
		wednesday: "Wednesday",
		thursday: "Thursday",
		friday: "Friday",
		saturday: "Saturday",
		sunday: "Sunday",
	};

	useEffect(() => {
		fetchSchedule();
	}, []);

	const fetchSchedule = async () => {
		try {
			setLoading(true);
			const response = await getDoctorSchedule();

			if (response.hasSchedule) {
				setSchedule(response.schedule);
				console.log(response);
			} else {
				setError("No schedule found");
			}
		} catch (err) {
			console.error("Error fetching schedule:", err);
			setError(err.response?.message || "Failed to fetch schedule");
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (time) => {
		if (!time) return "";
		const [hour, minute] = time.split(":");
		const hourNum = parseInt(hour);
		const ampm = hourNum >= 12 ? "PM" : "AM";
		const displayHour = hourNum % 12 || 12;
		return `${displayHour}:${minute} ${ampm}`;
	};

	const getWorkingDaysInOrder = () => {
		if (!schedule?.workingDays) return [];
		return dayOrder
			.map((day) => schedule.workingDays.find((wd) => wd.day === day))
			.filter(Boolean);
	};

	const isUpcoming = (startDate) => {
		return new Date(startDate) > new Date();
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
				<div className="max-w-6xl mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8">
						<div className="animate-pulse">
							<div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
							<div className="space-y-4">
								{[...Array(7)].map((_, i) => (
									<div key={i} className="h-16 bg-gray-200 rounded"></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
				<div className="max-w-6xl mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8">
						<div className="text-center">
							<Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								No Schedule Found
							</h2>
							<p className="text-gray-600 mb-6">{error}</p>
							<button
								onClick={fetchSchedule}
								className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Try Again
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Weekly Schedule */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-lg p-6">
							<div className="flex items-center mb-6">
								<Calendar className="h-6 w-6 text-blue-600 mr-2" />
								<h2 className="text-2xl font-bold text-gray-900">
									Weekly Schedule
								</h2>
							</div>

							<div className="space-y-4">
								{getWorkingDaysInOrder().map((workDay, index) => (
									<div
										key={index}
										className={`p-4 rounded-lg border-2 transition-all ${
											workDay.isWorking
												? "border-green-200 bg-green-50"
												: "border-gray-200 bg-gray-50"
										}`}
									>
										<div className="flex justify-between items-center">
											<div className="flex items-center space-x-3">
												<div
													className={`w-3 h-3 rounded-full ${
														workDay.isWorking ? "bg-green-500" : "bg-gray-400"
													}`}
												></div>
												<h3 className="text-lg font-semibold text-gray-900">
													{dayNames[workDay.day]}
												</h3>
											</div>

											{workDay.isWorking ? (
												<div className="flex items-center space-x-2 text-gray-700">
													<Clock className="h-4 w-4" />
													<span className="font-medium">
														{formatTime(workDay.startTime)} -{" "}
														{formatTime(workDay.endTime)}
													</span>
												</div>
											) : (
												<span className="text-gray-500 font-medium">
													Closed
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Appointment Duration */}
						<div className="bg-white rounded-xl shadow-lg p-6">
							<div className="flex items-center mb-4">
								<Clock className="h-6 w-6 text-indigo-600 mr-2" />
								<h3 className="text-xl font-bold text-gray-900">
									Appointment Duration
								</h3>
							</div>
							<div className="text-3xl font-bold text-indigo-600 mb-2">
								{schedule?.appointmentDuration || 30} minutes
							</div>
							<p className="text-gray-600">per appointment</p>
						</div>

						{/* Breaks */}
						{schedule?.breaks && schedule.breaks.length > 0 && (
							<div className="bg-white rounded-xl shadow-lg p-6">
								<div className="flex items-center mb-4">
									<Coffee className="h-6 w-6 text-orange-600 mr-2" />
									<h3 className="text-xl font-bold text-gray-900">Breaks</h3>
								</div>
								<div className="space-y-3">
									{schedule.breaks.map((breakItem, index) => (
										<div
											key={index}
											className="p-3 bg-orange-50 rounded-lg border border-orange-200"
										>
											<div className="font-medium text-gray-900 capitalize">
												{breakItem.day}
											</div>
											<div className="text-sm text-gray-600">
												{formatTime(breakItem.startTime)} -{" "}
												{formatTime(breakItem.endTime)}
											</div>
											{breakItem.reason && (
												<div className="text-sm text-orange-700 mt-1">
													{breakItem.reason}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Upcoming Vacations */}
						{schedule?.vacations &&
							schedule.vacations.filter((v) => isUpcoming(v.startDate)).length >
								0 && (
								<div className="bg-white rounded-xl shadow-lg p-6">
									<div className="flex items-center mb-4">
										<Plane className="h-6 w-6 text-purple-600 mr-2" />
										<h3 className="text-xl font-bold text-gray-900">
											Upcoming Vacations
										</h3>
									</div>
									<div className="space-y-3">
										{schedule.vacations
											.filter((vacation) => isUpcoming(vacation.startDate))
											.map((vacation, index) => (
												<div
													key={index}
													className="p-3 bg-purple-50 rounded-lg border border-purple-200"
												>
													<div className="font-medium text-gray-900">
														{new Date(vacation.startDate).toLocaleDateString()}{" "}
														- {new Date(vacation.endDate).toLocaleDateString()}
													</div>
													{vacation.reason && (
														<div className="text-sm text-purple-700 mt-1">
															{vacation.reason}
														</div>
													)}
												</div>
											))}
									</div>
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DoctorSchedule;
