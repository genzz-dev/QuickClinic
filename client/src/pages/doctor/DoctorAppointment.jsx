import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getDoctorAppointments } from "../../service/appointmentApiService";
import {
	CalendarIcon,
	ClockIcon,
	UserIcon,
	MagnifyingGlassIcon,
	FunnelIcon,
	PhoneIcon,
	VideoCameraIcon,
	ArrowPathIcon,
} from "@heroicons/react/24/outline";

const DoctorAppointments = () => {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [activeTab, setActiveTab] = useState("today"); // New state for active tab

	// Fetch appointments on component mount
	useEffect(() => {
		fetchAppointments();
	}, []);

	const fetchAppointments = async () => {
		try {
			setLoading(true);
			const response = await getDoctorAppointments();
			setAppointments(response.appointments || []);
			console.log(response);
			setError(null);
		} catch (err) {
			setError("Failed to fetch appointments. Please try again.");
			console.error("Error fetching appointments:", err);
		} finally {
			setLoading(false);
		}
	};

	// Filter and search appointments
	const filteredAppointments = useMemo(() => {
		let filtered = appointments;

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter((apt) => apt.status === statusFilter);
		}

		// Search by patient name
		if (searchTerm) {
			filtered = filtered.filter((apt) => {
				const patientName =
					`${apt.patientId?.firstName || ""} ${apt.patientId?.lastName || ""}`.toLowerCase();
				return patientName.includes(searchTerm.toLowerCase());
			});
		}

		return filtered;
	}, [appointments, searchTerm, statusFilter]);

	// Categorize appointments
	const categorizedAppointments = useMemo(() => {
		const now = new Date();
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const todaysAppointments = [];
		const pastAppointments = [];
		const upcomingAppointments = [];

		filteredAppointments.forEach((apt) => {
			const aptDate = new Date(apt.date);
			const aptDateTime = new Date(
				`${apt.date.split("T")[0]}T${apt.startTime}`,
			);

			aptDate.setHours(0, 0, 0, 0);

			if (aptDate.getTime() === today.getTime()) {
				// Today's appointments - only show future time slots
				if (aptDateTime > now) {
					todaysAppointments.push(apt);
				} else {
					pastAppointments.push(apt);
				}
			} else if (aptDate < today) {
				pastAppointments.push(apt);
			} else {
				upcomingAppointments.push(apt);
			}
		});

		// Sort appointments by date and time
		const sortByDateTime = (a, b) => {
			const dateA = new Date(`${a.date.split("T")[0]}T${a.startTime}`);
			const dateB = new Date(`${b.date.split("T")}T${b.startTime}`);
			return dateA - dateB;
		};

		const sortByDateTimeDesc = (a, b) => {
			const dateA = new Date(`${a.date.split("T")}T${a.startTime}`);
			const dateB = new Date(`${b.date.split("T")}T${b.startTime}`);
			return dateB - dateA;
		};

		return {
			today: todaysAppointments.sort(sortByDateTime),
			past: pastAppointments.sort(sortByDateTimeDesc),
			upcoming: upcomingAppointments.sort(sortByDateTime),
		};
	}, [filteredAppointments]);

	// Tab configuration
	const tabs = [
		{
			id: "today",
			name: "Today's Appointments",
			icon: <ClockIcon className="w-5 h-5" />,
			count: categorizedAppointments.today.length,
			color: "text-blue-600",
			activeColor: "border-blue-500 text-blue-600",
		},
		{
			id: "upcoming",
			name: "Upcoming",
			icon: <CalendarIcon className="w-5 h-5" />,
			count: categorizedAppointments.upcoming.length,
			color: "text-green-600",
			activeColor: "border-green-500 text-green-600",
		},
		{
			id: "past",
			name: "Past Appointments",
			icon: <CalendarIcon className="w-5 h-5" />,
			count: categorizedAppointments.past.length,
			color: "text-gray-600",
			activeColor: "border-gray-500 text-gray-600",
		},
	];

	// Status badge component
	const StatusBadge = ({ status }) => {
		const statusStyles = {
			pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
			confirmed: "bg-blue-100 text-blue-800 border-blue-200",
			completed: "bg-green-100 text-green-800 border-green-200",
			cancelled: "bg-red-100 text-red-800 border-red-200",
			"no-show": "bg-gray-100 text-gray-800 border-gray-200",
		};

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles.pending}`}
			>
				{status?.charAt(0).toUpperCase() + status?.slice(1).replace("-", " ")}
			</span>
		);
	};

	// Appointment card component
	const AppointmentCard = ({ appointment }) => {
		const formatTime = (time) => {
			return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
				hour: "numeric",
				minute: "2-digit",
				hour12: true,
			});
		};

		const formatDate = (date) => {
			return new Date(date).toLocaleDateString("en-US", {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		};

		return (
			<Link
				to={`/doctor/appointment/${appointment._id}`}
				className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 p-6"
			>
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4 flex-1">
						{/* Patient Avatar */}
						<div className="flex-shrink-0">
							{appointment.patientId?.profilePicture ? (
								<img
									src={appointment.patientId.profilePicture}
									alt="Patient"
									className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
								/>
							) : (
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
									<UserIcon className="w-6 h-6 text-blue-600" />
								</div>
							)}
						</div>

						{/* Appointment Details */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-lg font-semibold text-gray-900 truncate">
										{appointment.patientId?.firstName}{" "}
										{appointment.patientId?.lastName}
									</h3>
									<div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
										<div className="flex items-center space-x-1">
											<CalendarIcon className="w-4 h-4" />
											<span>{formatDate(appointment.date)}</span>
										</div>
										<div className="flex items-center space-x-1">
											<ClockIcon className="w-4 h-4" />
											<span>
												{formatTime(appointment.startTime)} -{" "}
												{formatTime(appointment.endTime)}
											</span>
										</div>
									</div>
								</div>
								<StatusBadge status={appointment.status} />
							</div>

							{/* Appointment Type and Reason */}
							<div className="mt-3">
								<div className="flex items-center space-x-3">
									{appointment.isTeleconsultation ? (
										<div className="flex items-center space-x-1 text-sm text-purple-600">
											<VideoCameraIcon className="w-4 h-4" />
											<span>Teleconsultation</span>
										</div>
									) : (
										<div className="flex items-center space-x-1 text-sm text-green-600">
											<PhoneIcon className="w-4 h-4" />
											<span>In-person</span>
										</div>
									)}
								</div>
								{appointment.reason && (
									<p className="text-sm text-gray-600 mt-2 line-clamp-2">
										<span className="font-medium">Reason:</span>{" "}
										{appointment.reason}
									</p>
								)}
							</div>

							{/* Clinic Info */}
							{appointment.clinicId && (
								<div className="mt-2 text-sm text-gray-500">
									<span className="font-medium">Clinic:</span>{" "}
									{appointment.clinicId.name}
								</div>
							)}
						</div>
					</div>
				</div>
			</Link>
		);
	};

	// Get current appointments based on active tab
	const getCurrentAppointments = () => {
		switch (activeTab) {
			case "today":
				return categorizedAppointments.today;
			case "upcoming":
				return categorizedAppointments.upcoming;
			case "past":
				return categorizedAppointments.past;
			default:
				return [];
		}
	};

	// Get empty message based on active tab
	const getEmptyMessage = () => {
		switch (activeTab) {
			case "today":
				return "No appointments scheduled for today";
			case "upcoming":
				return "No upcoming appointments scheduled";
			case "past":
				return "No past appointments found";
			default:
				return "No appointments found";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading appointments...</p>
				</div>
			</div>
		);
	}

	const currentAppointments = getCurrentAppointments();

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								My Appointments
							</h1>
							<p className="mt-1 text-gray-600">
								Manage and view your patient appointments
							</p>
						</div>
						<button
							onClick={fetchAppointments}
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
						>
							<ArrowPathIcon className="w-4 h-4 mr-2" />
							Refresh
						</button>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Tab Navigation */}
				<div className="mb-8">
					<div className="border-b border-gray-200">
						<nav className="-mb-px flex space-x-8">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
										activeTab === tab.id
											? `${tab.activeColor} border-b-2`
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									<div className="flex items-center space-x-2">
										<span
											className={
												activeTab === tab.id ? tab.color : "text-gray-400"
											}
										>
											{tab.icon}
										</span>
										<span>{tab.name}</span>
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												activeTab === tab.id
													? "bg-blue-100 text-blue-800"
													: "bg-gray-100 text-gray-600"
											}`}
										>
											{tab.count}
										</span>
									</div>
								</button>
							))}
						</nav>
					</div>
				</div>

				{/* Search and Filter Controls */}
				<div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="text"
									placeholder="Search by patient name..."
									className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>
						</div>

						{/* Status Filter */}
						<div className="sm:w-48">
							<div className="relative">
								<FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<select
									className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option value="all">All Status</option>
									<option value="pending">Pending</option>
									<option value="confirmed">Confirmed</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
									<option value="no-show">No Show</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Error State */}
				{error && (
					<div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
						<div className="flex">
							<div className="text-red-400">⚠️</div>
							<div className="ml-3">
								<p className="text-red-800">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Current Tab Content */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					{/* Tab Content Header */}
					<div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<span
									className={
										tabs.find((tab) => tab.id === activeTab)?.color ||
										"text-gray-600"
									}
								>
									{tabs.find((tab) => tab.id === activeTab)?.icon}
								</span>
								<h2 className="text-lg font-semibold text-gray-900">
									{tabs.find((tab) => tab.id === activeTab)?.name}
								</h2>
							</div>
							<span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
								{currentAppointments.length} appointment
								{currentAppointments.length !== 1 ? "s" : ""}
							</span>
						</div>
					</div>

					{/* Appointments List */}
					<div className="p-6">
						{currentAppointments.length > 0 ? (
							<div className="space-y-4">
								{currentAppointments.map((appointment) => (
									<AppointmentCard
										key={appointment._id}
										appointment={appointment}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-16">
								<div className="text-gray-400 text-6xl mb-4">📅</div>
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									{getEmptyMessage()}
								</h3>
								<p className="text-gray-500">
									{activeTab === "today" &&
										"Check back later or refresh to see new appointments"}
									{activeTab === "upcoming" &&
										"New appointments will appear here once they're scheduled"}
									{activeTab === "past" &&
										"Completed appointments will be shown here"}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DoctorAppointments;
