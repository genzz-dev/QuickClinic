import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Calendar,
	Clock,
	User,
	MapPin,
	Video,
	FileText,
	AlertCircle,
	Search,
	Filter,
	CheckCircle,
	XCircle,
	Clock3,
	Eye,
	Phone,
} from "lucide-react";
import { format, isToday, isFuture, isPast, differenceInHours } from "date-fns";
import { getPatientAppointments } from "../../service/appointmentApiService";
import { getPatientAppointmentPrescription } from "../../service/prescriptionApiSevice";

const PatientAppointments = () => {
	const [appointments, setAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [prescriptionStatus, setPrescriptionStatus] = useState({});
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [activeTab, setActiveTab] = useState("upcoming");

	const navigate = useNavigate();

	// Fetch appointments on component mount
	useEffect(() => {
		fetchAppointments();
	}, []);

	// Fetch appointments function
	const fetchAppointments = async () => {
		try {
			setLoading(true);
			const response = await getPatientAppointments();

			if (response && response.appointments) {
				setAppointments(response.appointments);
				// Check prescription status for each appointment
				await checkPrescriptionStatus(response.appointments);
			}
		} catch (err) {
			setError("Failed to fetch appointments. Please try again.");
			console.error("Error fetching appointments:", err);
		} finally {
			setLoading(false);
		}
	};

	// Check prescription status for appointments
	const checkPrescriptionStatus = async (appointmentList) => {
		const prescriptionStatusMap = {};

		const statusChecks = appointmentList.map(async (appointment) => {
			try {
				await getPatientAppointmentPrescription(appointment._id);
				prescriptionStatusMap[appointment._id] = true;
			} catch (err) {
				prescriptionStatusMap[appointment._id] = false;
			}
		});

		await Promise.all(statusChecks);
		setPrescriptionStatus(prescriptionStatusMap);
	};

	// Get status badge styling
	const getStatusBadge = (status) => {
		const statusConfig = {
			pending: {
				color: "bg-yellow-100 text-yellow-800 border-yellow-200",
				icon: <Clock3 className="w-3 h-3" />,
				text: "Pending",
			},
			confirmed: {
				color: "bg-blue-100 text-blue-800 border-blue-200",
				icon: <CheckCircle className="w-3 h-3" />,
				text: "Confirmed",
			},
			completed: {
				color: "bg-green-100 text-green-800 border-green-200",
				icon: <CheckCircle className="w-3 h-3" />,
				text: "Completed",
			},
			cancelled: {
				color: "bg-red-100 text-red-800 border-red-200",
				icon: <XCircle className="w-3 h-3" />,
				text: "Cancelled",
			},
			"no-show": {
				color: "bg-gray-100 text-gray-800 border-gray-200",
				icon: <AlertCircle className="w-3 h-3" />,
				text: "No Show",
			},
		};

		const config = statusConfig[status] || statusConfig.pending;

		return (
			<span
				className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
			>
				{config.icon}
				{config.text}
			</span>
		);
	};

	// Filter and search appointments
	const filteredAppointments = useMemo(() => {
		let filtered = appointments;

		// Search filter
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(appointment) =>
					appointment.doctorId?.firstName?.toLowerCase().includes(term) ||
					appointment.doctorId?.lastName?.toLowerCase().includes(term) ||
					appointment.doctorId?.specialization?.toLowerCase().includes(term) ||
					appointment.clinicId?.name?.toLowerCase().includes(term) ||
					appointment.reason?.toLowerCase().includes(term),
			);
		}

		// Status filter
		if (filterStatus !== "all") {
			filtered = filtered.filter(
				(appointment) => appointment.status === filterStatus,
			);
		}

		return filtered;
	}, [appointments, searchTerm, filterStatus]);

	// Categorize appointments
	const categorizedAppointments = useMemo(() => {
		const today = new Date();

		return {
			upcoming: filteredAppointments
				.filter((apt) => {
					const aptDate = new Date(apt.date);
					return (
						isFuture(aptDate) ||
						(isToday(aptDate) &&
							differenceInHours(
								new Date(`${apt.date}T${apt.startTime}`),
								today,
							) > 0)
					);
				})
				.sort((a, b) => new Date(a.date) - new Date(b.date)),

			today: filteredAppointments
				.filter((apt) => {
					const aptDate = new Date(apt.date);
					return isToday(aptDate);
				})
				.sort((a, b) => a.startTime.localeCompare(b.startTime)),

			past: filteredAppointments
				.filter((apt) => {
					const aptDate = new Date(apt.date);
					return isPast(aptDate) && !isToday(aptDate);
				})
				.sort((a, b) => new Date(b.date) - new Date(a.date)),
		};
	}, [filteredAppointments]);

	// Handle appointment click
	const handleAppointmentClick = (appointmentId) => {
		navigate(`/patient/appointment/${appointmentId}`);
	};

	// Format date and time
	const formatDateTime = (date, time) => {
		try {
			const appointmentDate = new Date(date);
			const formattedDate = format(appointmentDate, "MMM dd, yyyy");
			const formattedTime = format(new Date(`2000-01-01T${time}`), "hh:mm a");
			return { date: formattedDate, time: formattedTime };
		} catch (error) {
			return { date: "Invalid date", time: "Invalid time" };
		}
	};

	// Appointment Card Component
	const AppointmentCard = ({ appointment }) => {
		const { date: formattedDate, time: formattedTime } = formatDateTime(
			appointment.date,
			appointment.startTime,
		);
		const hasPrescription = prescriptionStatus[appointment._id];

		return (
			<div
				onClick={() => handleAppointmentClick(appointment._id)}
				className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group"
			>
				{/* Header */}
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
							{appointment.doctorId?.firstName?.[0]}
							{appointment.doctorId?.lastName?.[0]}
						</div>
						<div>
							<h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
								Dr. {appointment.doctorId?.firstName}{" "}
								{appointment.doctorId?.lastName}
							</h3>
							<p className="text-sm text-gray-600">
								{appointment.doctorId?.specialization}
							</p>
						</div>
					</div>
					{getStatusBadge(appointment.status)}
				</div>

				{/* Appointment Details */}
				<div className="space-y-3">
					{/* Date and Time */}
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-gray-700">
							<Calendar className="w-4 h-4" />
							<span className="text-sm">{formattedDate}</span>
						</div>
						<div className="flex items-center gap-2 text-gray-700">
							<Clock className="w-4 h-4" />
							<span className="text-sm">{formattedTime}</span>
						</div>
					</div>

					{/* Clinic */}
					<div className="flex items-center gap-2 text-gray-700">
						<MapPin className="w-4 h-4 flex-shrink-0" />
						<span className="text-sm truncate">
							{appointment.clinicId?.name}
						</span>
					</div>

					{/* Consultation Type */}
					<div className="flex items-center gap-2">
						{appointment.isTeleconsultation ? (
							<>
								<Video className="w-4 h-4 text-green-600" />
								<span className="text-sm text-green-600 font-medium">
									Video Consultation
								</span>
							</>
						) : (
							<>
								<User className="w-4 h-4 text-blue-600" />
								<span className="text-sm text-blue-600 font-medium">
									In-Person Visit
								</span>
							</>
						)}
					</div>

					{/* Reason */}
					{appointment.reason && (
						<div className="bg-gray-50 rounded-lg p-3">
							<p className="text-sm text-gray-700">
								<span className="font-medium">Reason: </span>
								{appointment.reason}
							</p>
						</div>
					)}

					{/* Prescription Status */}
					<div className="flex items-center justify-between pt-3 border-t border-gray-100">
						<div className="flex items-center gap-2">
							<FileText className="w-4 h-4" />
							<span className="text-sm text-gray-600">Prescription:</span>
							{hasPrescription ? (
								<span className="text-sm text-green-600 font-medium">
									Available
								</span>
							) : (
								<span className="text-sm text-gray-400">Not available</span>
							)}
						</div>
						<Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
					</div>
				</div>
			</div>
		);
	};

	// Tab Navigation
	const tabs = [
		{
			key: "upcoming",
			label: "Upcoming",
			count: categorizedAppointments.upcoming?.length || 0,
		},
		{
			key: "today",
			label: "Today",
			count: categorizedAppointments.today?.length || 0,
		},
		{
			key: "past",
			label: "Past",
			count: categorizedAppointments.past?.length || 0,
		},
	];

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

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								My Appointments
							</h1>
							<p className="text-gray-600">
								Manage and view your medical appointments
							</p>
						</div>

						{/* Search and Filter */}
						<div className="flex flex-col sm:flex-row gap-3 lg:w-96">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<input
									type="text"
									placeholder="Search by doctor, clinic, or reason..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div className="relative">
								<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<select
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
									className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
								>
									<option value="all">All Status</option>
									<option value="pending">Pending</option>
									<option value="confirmed">Confirmed</option>
									<option value="completed">Completed</option>
									<option value="cancelled">Cancelled</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Error State */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
						<div className="flex items-center gap-2">
							<AlertCircle className="w-5 h-5 text-red-600" />
							<p className="text-red-800">{error}</p>
						</div>
					</div>
				)}

				{/* Tab Navigation */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6" aria-label="Tabs">
							{tabs.map((tab) => (
								<button
									key={tab.key}
									onClick={() => setActiveTab(tab.key)}
									className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
										activeTab === tab.key
											? "border-blue-500 text-blue-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									{tab.label}
									{tab.count > 0 && (
										<span
											className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
												activeTab === tab.key
													? "bg-blue-100 text-blue-600"
													: "bg-gray-100 text-gray-900"
											}`}
										>
											{tab.count}
										</span>
									)}
								</button>
							))}
						</nav>
					</div>

					{/* Appointments Content */}
					<div className="p-6">
						{categorizedAppointments[activeTab]?.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{categorizedAppointments[activeTab].map((appointment) => (
									<AppointmentCard
										key={appointment._id}
										appointment={appointment}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium text-gray-900 mb-2">
									No {activeTab} appointments
								</h3>
								<p className="text-gray-600">
									{activeTab === "upcoming"
										? "You have no upcoming appointments."
										: activeTab === "today"
											? "No appointments scheduled for today."
											: "No past appointments found."}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Total</p>
								<p className="text-2xl font-bold text-gray-900">
									{appointments.length}
								</p>
							</div>
							<Calendar className="w-8 h-8 text-gray-400" />
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Upcoming</p>
								<p className="text-2xl font-bold text-blue-600">
									{categorizedAppointments.upcoming.length}
								</p>
							</div>
							<Clock className="w-8 h-8 text-blue-400" />
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">Completed</p>
								<p className="text-2xl font-bold text-green-600">
									{
										appointments.filter((apt) => apt.status === "completed")
											.length
									}
								</p>
							</div>
							<CheckCircle className="w-8 h-8 text-green-400" />
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-600">With Prescription</p>
								<p className="text-2xl font-bold text-purple-600">
									{Object.values(prescriptionStatus).filter(Boolean).length}
								</p>
							</div>
							<FileText className="w-8 h-8 text-purple-400" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PatientAppointments;
