import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	getDoctorProfile,
	getDoctorClinicInfo,
} from "../../service/doctorApiService.js";
import { getDoctorAppointments } from "../../service/appointmentApiService.js";
import { getRatingStats } from "../../service/ratingApiService.js";
const DoctorDashboard = () => {
	const [doctor, setDoctor] = useState(null);
	const [clinic, setClinic] = useState(null);
	const [todayAppointments, setTodayAppointments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [ratingStats, setRatingStats] = useState(null);
	const navigate = useNavigate();

	// Helper function to safely convert MongoDB decimals
	const getDecimalValue = (value) => {
		if (!value) return 0;
		if (typeof value === "object" && value.$numberDecimal) {
			return parseFloat(value.$numberDecimal);
		}
		return parseFloat(value) || 0;
	};

	// Helper function to safely get string values
	const getStringValue = (value) => {
		if (!value) return "";
		if (typeof value === "object" && value.$numberDecimal) {
			return value.$numberDecimal;
		}
		return String(value);
	};
	const handleRatingClick = () => {
		navigate(`/doctor/ratings/${doctor._id}`);
	};
	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const doctorResponse = await getDoctorProfile();
				setDoctor(doctorResponse);

				const clinicResponse = await getDoctorClinicInfo();
				setClinic(clinicResponse.clinic);

				const today = new Date().toISOString().split("T")[0];
				const appointmentsResponse = await getDoctorAppointments({
					date: today,
					upcoming: "true",
				});

				const appointments = appointmentsResponse?.appointments || [];
				setTodayAppointments(appointments.slice(0, 3));
				try {
					const userData = JSON.parse(localStorage.getItem("userData") || "{}");
					const doctorId = userData.profileId || userData._id;
					if (doctorId) {
						const ratingsResponse = await getRatingStats("doctor", doctorId);
						setRatingStats(ratingsResponse);
					}
				} catch (ratingError) {
					console.log("Rating stats not available:", ratingError);
				}
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const handleAppointmentClick = (appointmentId) => {
		navigate(`/doctor/appointment/${appointmentId}`);
	};

	const formatTime = (timeString) => {
		const [hours, minutes] = timeString.split(":");
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "confirmed":
				return "bg-emerald-50 text-emerald-700 border-emerald-200";
			case "pending":
				return "bg-amber-50 text-amber-700 border-amber-200";
			case "completed":
				return "bg-blue-50 text-blue-700 border-blue-200";
			case "cancelled":
				return "bg-red-50 text-red-700 border-red-200";
			default:
				return "bg-gray-50 text-gray-700 border-gray-200";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "confirmed":
				return "✓";
			case "pending":
				return "⏳";
			case "completed":
				return "✅";
			case "cancelled":
				return "✕";
			default:
				return "○";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					<p className="text-gray-600 font-medium">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
			<div>
				{/* Header Section */}
				<div className="mb-8">
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
							<div className="flex items-center space-x-6">
								<div className="relative">
									<div className="w-20 h-20 ">
										<img src={doctor.profilePicture} />
									</div>
								</div>
								<div>
									<h1 className="text-3xl font-bold text-gray-900">
										Dr. {doctor?.firstName} {doctor?.lastName}
									</h1>
									<p className="text-lg text-blue-600 font-medium mt-1">
										{doctor?.specialization || "Medical Professional"}
									</p>
									{doctor?.yearsOfExperience && (
										<p className="text-gray-600 mt-1">
											{getDecimalValue(doctor.yearsOfExperience)} years of
											experience
										</p>
									)}
								</div>
							</div>

							<div className="mt-6 lg:mt-0 text-left lg:text-right">
								<p className="text-sm text-gray-500 font-medium">
									Today's Date
								</p>
								<p className="text-lg font-semibold text-gray-900 mt-1">
									{new Date().toLocaleDateString("en-US", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Clinic Info */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
							<div className="flex items-center space-x-3 mb-6">
								<div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
									<svg
										className="w-5 h-5 text-indigo-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								</div>
								<h2 className="text-xl font-bold text-gray-900">
									Clinic Information
								</h2>
							</div>

							<div className="space-y-4">
								<div>
									<p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
										Clinic Name
									</p>
									<p className="text-lg font-semibold text-gray-900 mt-1">
										{clinic?.name || "Not Associated"}
									</p>
								</div>

								<div>
									<p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
										Address
									</p>
									<div className="mt-1">
										<p className="text-gray-900 font-medium">
											{clinic?.address?.formattedAddress || "N/A"}
										</p>
										{clinic?.address?.city && (
											<p className="text-gray-600 text-sm mt-1">
												{clinic.address.city}, {clinic.address.state} -{" "}
												{clinic.address.zipCode}
											</p>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Today's Appointments */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
										<svg
											className="w-5 h-5 text-blue-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<h2 className="text-xl font-bold text-gray-900">
										Today's Appointments
									</h2>
									<span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">
										{todayAppointments.length}
									</span>
								</div>

								<div className="flex space-x-3">
									<button
										onClick={() => navigate("/doctor/appointments")}
										className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
									>
										View All
										<svg
											className="w-4 h-4 ml-2"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								</div>
							</div>

							<div className="space-y-3">
								{todayAppointments.length > 0 ? (
									todayAppointments.map((appointment, index) => (
										<div
											key={appointment._id}
											onClick={() => handleAppointmentClick(appointment._id)}
											className="group p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
										>
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="flex items-center space-x-3 mb-2">
														<div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
															<span className="text-gray-700 font-semibold text-sm">
																{appointment.patientName?.[0] || "P"}
															</span>
														</div>
														<div>
															<h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
																{appointment.patientName || "Patient"}
															</h3>
															<p className="text-sm text-gray-600">
																{appointment.reason || "General Consultation"}
															</p>
														</div>
													</div>
												</div>

												<div className="text-right">
													<p className="text-lg font-bold text-gray-900 mb-1">
														{formatTime(appointment.startTime)} -{" "}
														{formatTime(appointment.endTime)}
													</p>
													<span
														className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}
													>
														<span className="mr-1">
															{getStatusIcon(appointment.status)}
														</span>
														{appointment.status.charAt(0).toUpperCase() +
															appointment.status.slice(1)}
													</span>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="text-center py-16">
										<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<svg
												className="w-8 h-8 text-green-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M12 3v18m9-9H3"
												/>
											</svg>
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											No appointments today
										</h3>
										<p className="text-gray-600">Enjoy your free day!</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Quick Stats Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div className="flex items-center">
							<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
								<svg
									className="w-6 h-6 text-blue-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Today's Patients
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{todayAppointments.length}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div className="flex items-center">
							<div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
								<svg
									className="w-6 h-6 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Consultation Fee
								</p>
								<p className="text-2xl font-bold text-gray-900">
									₹{getDecimalValue(doctor?.consultationFee).toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<div className="flex  items-center">
							<div
								className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-yellow-400"
								onClick={handleRatingClick}
							>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-gray-800 mb-2">
											Average Rating
										</h3>
										<div className="flex items-center space-x-2">
											<div className="text-3xl font-bold text-yellow-600">
												{ratingStats?.averageRating?.toFixed(1) ||
													getDecimalValue(doctor?.ratings?.average).toFixed(
														1,
													) ||
													"5.0"}
											</div>
											<div className="flex">
												{Array.from({ length: 5 }, (_, index) => (
													<span
														key={index}
														className={`text-xl ${
															index <
															Math.round(
																ratingStats?.averageRating ||
																	getDecimalValue(doctor?.ratings?.average) ||
																	5,
															)
																? "text-yellow-400"
																: "text-gray-300"
														}`}
													>
														★
													</span>
												))}
											</div>
										</div>
										<div className="text-sm text-gray-600 mt-1">
											Based on{" "}
											{ratingStats?.totalRatings || doctor?.ratings?.count || 0}{" "}
											reviews
										</div>
									</div>
									<div className="text-blue-500">
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
								<div className="mt-3 text-sm text-blue-600 font-medium">
									Click to view all reviews →
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DoctorDashboard;
