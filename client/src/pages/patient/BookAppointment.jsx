import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	MapPin,
	Phone,
	Star,
	User,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookAppointment } from "../../service/appointmentApiService";
import {
	checkDoctorAvailability,
	getDoctorAvailability,
	getDoctorById,
	getDoctorSchedule,
} from "../../service/publicapi";

const BookAppointment = () => {
	const { doctorId } = useParams();
	const navigate = useNavigate();

	// State management
	const [doctor, setDoctor] = useState(null);
	const [schedule, setSchedule] = useState(null);
	const [selectedDate, setSelectedDate] = useState("");
	const [availableSlots, setAvailableSlots] = useState([]);
	const [selectedSlot, setSelectedSlot] = useState("");
	const [reason, setReason] = useState("");
	const [isTeleconsultation, setIsTeleconsultation] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [dateAvailability, setDateAvailability] = useState(null);

	// Fetch doctor details and schedule on component mount
	useEffect(() => {
		const fetchDoctorData = async () => {
			try {
				setLoading(true);
				const [doctorResponse, scheduleResponse] = await Promise.all([
					getDoctorById(doctorId),
					getDoctorSchedule(doctorId),
				]);

				if (doctorResponse.success) {
					setDoctor(doctorResponse.data);
				}

				if (scheduleResponse.success) {
					setSchedule(scheduleResponse.data);
				}
			} catch (err) {
				setError("Failed to load doctor information");
				console.error("Error fetching doctor data:", err);
			} finally {
				setLoading(false);
			}
		};

		if (doctorId) {
			fetchDoctorData();
		}
	}, [doctorId]);

	// Check availability when date is selected
	useEffect(() => {
		const checkDateAvailability = async () => {
			if (selectedDate && doctor) {
				try {
					const response = await getDoctorAvailability(doctorId, selectedDate);
					if (response.success) {
						setDateAvailability(response.data);
						if (response.data.available) {
							setAvailableSlots(response.data.slots || []);
						} else {
							setAvailableSlots([]);
						}
					}
				} catch (err) {
					console.error("Error checking availability:", err);
					setDateAvailability({
						available: false,
						reason: "Error checking availability",
					});
					setAvailableSlots([]);
				}
			}
		};

		checkDateAvailability();
	}, [selectedDate, doctorId, doctor]);

	// Generate next 30 days for date selection
	const generateAvailableDates = () => {
		const dates = [];
		const today = new Date();

		for (let i = 1; i <= 30; i++) {
			const date = new Date(today);
			date.setDate(today.getDate() + i);
			dates.push(date);
		}

		return dates;
	};

	// Check if a date is a working day
	const isWorkingDay = (date) => {
		if (!schedule?.workingDays) return false;

		const dayName = date
			.toLocaleDateString("en-US", { weekday: "long" })
			.toLowerCase();
		const workingDay = schedule.workingDays.find(
			(day) => day.day === dayName && day.isWorking,
		);

		return !!workingDay;
	};

	// Check if doctor is on vacation
	const isOnVacation = (date) => {
		if (!schedule?.vacations) return false;

		return schedule.vacations.some((vacation) => {
			const vacationStart = new Date(vacation.startDate);
			const vacationEnd = new Date(vacation.endDate);
			return date >= vacationStart && date <= vacationEnd;
		});
	};

	// Handle appointment booking
	const handleBooking = async (e) => {
		e.preventDefault();

		if (!selectedDate || !selectedSlot || !reason.trim()) {
			setError("Please fill in all required fields");
			return;
		}

		try {
			setLoading(true);
			setError("");

			// Calculate end time based on appointment duration
			const appointmentDuration = schedule?.appointmentDuration || 30;
			const [hours, minutes] = selectedSlot.split(":");
			const startTime = new Date();
			startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

			const endTime = new Date(startTime);
			endTime.setMinutes(endTime.getMinutes() + appointmentDuration);

			const bookingData = {
				doctorId,
				date: selectedDate,
				startTime: selectedSlot,
				endTime: `${String(endTime.getHours()).padStart(2, "0")}:${String(endTime.getMinutes()).padStart(2, "0")}`,
				reason,
				isTeleconsultation,
			};

			const response = await bookAppointment(bookingData);

			if (response.appointment) {
				setSuccess("Appointment booked successfully!");
				setTimeout(() => {
					navigate("/patient/appointments");
				}, 2000);
			}
		} catch (err) {
			setError(err.response?.data?.message || "Failed to book appointment");
			console.error("Booking error:", err);
		} finally {
			setLoading(false);
		}
	};

	// Helper function to safely render address
	const renderAddress = (clinic) => {
		if (!clinic) return "No clinic information";

		if (clinic.address) {
			// Handle both address formats from your backend
			if (typeof clinic.address === "string") {
				return clinic.address;
			}

			if (typeof clinic.address === "object") {
				const addressParts = [];
				if (clinic.address.formattedAddress) {
					return clinic.address.formattedAddress;
				}
				if (clinic.address.street) addressParts.push(clinic.address.street);
				if (clinic.address.city) addressParts.push(clinic.address.city);
				if (clinic.address.state) addressParts.push(clinic.address.state);
				if (clinic.address.zipCode) addressParts.push(clinic.address.zipCode);

				return addressParts.join(", ") || "Address not available";
			}
		}

		return "Address not available";
	};

	if (loading && !doctor) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading doctor information...</p>
				</div>
			</div>
		);
	}

	if (!doctor) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-gray-600">Doctor not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
					>
						<X className="h-5 w-5 mr-1" />
						Back
					</button>
					<h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Doctor Information */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="text-center mb-6">
								{doctor.profilePicture ? (
									<img
										src={doctor.profilePicture}
										alt={`${doctor.firstName} ${doctor.lastName}`}
										className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
									/>
								) : (
									<div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-4">
										<User className="h-12 w-12 text-gray-600" />
									</div>
								)}
								<h2 className="text-xl font-semibold text-gray-900">
									Dr. {doctor.firstName} {doctor.lastName}
								</h2>
								<p className="text-blue-600">{doctor.specialization}</p>
								{doctor.isVerified && (
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
										<CheckCircle className="h-3 w-3 mr-1" />
										Verified
									</span>
								)}
							</div>

							{/* Doctor Details */}
							<div className="space-y-3 text-sm">
								{doctor.yearsOfExperience && (
									<div className="flex items-center">
										<Clock className="h-4 w-4 text-gray-400 mr-2" />
										<span>{doctor.yearsOfExperience} years experience</span>
									</div>
								)}

								{doctor.averageRating > 0 && (
									<div className="flex items-center">
										<Star className="h-4 w-4 text-yellow-400 mr-2" />
										<span>{doctor.averageRating.toFixed(1)} rating</span>
									</div>
								)}

								<div className="flex items-center">
									<span className="font-medium">Consultation Fee:</span>
									<span className="ml-2">₹{doctor.consultationFee}</span>
								</div>

								{doctor.clinicId && (
									<div className="mt-4 pt-4 border-t">
										<div className="flex items-start">
											<MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
											<div>
												<p className="font-medium">{doctor.clinicId.name}</p>
												<p className="text-gray-600">
													{renderAddress(doctor.clinicId)}
												</p>
											</div>
										</div>
									</div>
								)}

								{doctor.availableForTeleconsultation && (
									<div className="mt-4 p-3 bg-blue-50 rounded-lg">
										<p className="text-sm text-blue-800">
											<Phone className="h-4 w-4 inline mr-1" />
											Teleconsultation available
										</p>
									</div>
								)}
							</div>

							{/* Schedule Overview */}
							{schedule && (
								<div className="mt-6 pt-6 border-t">
									<h3 className="text-sm font-medium text-gray-900 mb-3">
										Working Hours
									</h3>
									<div className="space-y-1 text-xs">
										{schedule.workingDays
											?.filter((day) => day.isWorking)
											.map((day) => (
												<div key={day.day} className="flex justify-between">
													<span className="capitalize">{day.day}</span>
													<span>
														{day.startTime} - {day.endTime}
													</span>
												</div>
											))}
									</div>
								</div>
							)}

							{/* Current Vacations */}
							{schedule?.vacations?.filter(
								(vacation) => new Date(vacation.endDate) >= new Date(),
							).length > 0 && (
								<div className="mt-6 pt-6 border-t">
									<h3 className="text-sm font-medium text-gray-900 mb-3">
										Upcoming Vacations
									</h3>
									<div className="space-y-2">
										{schedule.vacations
											.filter(
												(vacation) => new Date(vacation.endDate) >= new Date(),
											)
											.map((vacation, index) => (
												<div
													key={index}
													className="bg-red-50 p-2 rounded text-xs"
												>
													<div className="font-medium text-red-800">
														{new Date(vacation.startDate).toLocaleDateString()}{" "}
														- {new Date(vacation.endDate).toLocaleDateString()}
													</div>
												</div>
											))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Booking Form */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-6">
								Select Date & Time
							</h3>

							{/* Success/Error Messages */}
							{error && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
									<div className="flex items-center">
										<AlertCircle className="h-5 w-5 text-red-500 mr-2" />
										<p className="text-red-700">{error}</p>
									</div>
								</div>
							)}

							{success && (
								<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
									<div className="flex items-center">
										<CheckCircle className="h-5 w-5 text-green-500 mr-2" />
										<p className="text-green-700">{success}</p>
									</div>
								</div>
							)}

							<form onSubmit={handleBooking} className="space-y-6">
								{/* Date Selection */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-3">
										<Calendar className="h-4 w-4 inline mr-1" />
										Select Date
									</label>
									<div className="grid grid-cols-7 gap-2">
										{generateAvailableDates()
											.slice(0, 21)
											.map((date) => {
												const dateStr = date.toISOString().split("T")[0];
												const isWorking = isWorkingDay(date);
												const onVacation = isOnVacation(date);
												const isDisabled = !isWorking || onVacation;

												return (
													<button
														key={dateStr}
														type="button"
														onClick={() =>
															!isDisabled && setSelectedDate(dateStr)
														}
														disabled={isDisabled}
														className={`p-3 text-sm rounded-lg border transition-colors ${
															selectedDate === dateStr
																? "bg-blue-600 text-white border-blue-600"
																: isDisabled
																	? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
																	: "bg-white text-gray-900 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
														}`}
													>
														<div className="font-medium">
															{date.toLocaleDateString("en-US", {
																day: "numeric",
															})}
														</div>
														<div className="text-xs">
															{date.toLocaleDateString("en-US", {
																weekday: "short",
															})}
														</div>
													</button>
												);
											})}
									</div>

									{selectedDate &&
										dateAvailability &&
										!dateAvailability.available && (
											<div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
												<p className="text-sm text-yellow-800">
													<AlertCircle className="h-4 w-4 inline mr-1" />
													{dateAvailability.reason}
												</p>
											</div>
										)}
								</div>

								{/* Time Slot Selection */}
								{selectedDate && availableSlots.length > 0 && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-3">
											<Clock className="h-4 w-4 inline mr-1" />
											Available Time Slots
										</label>
										<div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
											{availableSlots.map((slot) => (
												<button
													key={slot}
													type="button"
													onClick={() => setSelectedSlot(slot)}
													className={`p-3 text-sm rounded-lg border transition-colors ${
														selectedSlot === slot
															? "bg-blue-600 text-white border-blue-600"
															: "bg-white text-gray-900 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
													}`}
												>
													{slot}
												</button>
											))}
										</div>
									</div>
								)}

								{/* Reason for Visit */}
								<div>
									<label
										htmlFor="reason"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Reason for Visit *
									</label>
									<textarea
										id="reason"
										value={reason}
										onChange={(e) => setReason(e.target.value)}
										rows={3}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
										placeholder="Please describe your symptoms or reason for consultation..."
										required
									/>
								</div>

								{/* Teleconsultation Option */}
								{doctor.availableForTeleconsultation && (
									<div className="flex items-center">
										<input
											id="teleconsultation"
											type="checkbox"
											checked={isTeleconsultation}
											onChange={(e) => setIsTeleconsultation(e.target.checked)}
											className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
										/>
										<label
											htmlFor="teleconsultation"
											className="ml-2 text-sm text-gray-700"
										>
											Request Teleconsultation (Video Call)
										</label>
									</div>
								)}

								{/* Booking Summary */}
								{selectedDate && selectedSlot && (
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="font-medium text-gray-900 mb-2">
											Booking Summary
										</h4>
										<div className="text-sm space-y-1">
											<div className="flex justify-between">
												<span>Date:</span>
												<span>
													{new Date(selectedDate).toLocaleDateString("en-US", {
														weekday: "long",
														year: "numeric",
														month: "long",
														day: "numeric",
													})}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Time:</span>
												<span>{selectedSlot}</span>
											</div>
											<div className="flex justify-between">
												<span>Type:</span>
												<span>
													{isTeleconsultation
														? "Teleconsultation"
														: "In-person"}
												</span>
											</div>
											<div className="flex justify-between font-medium">
												<span>Fee:</span>
												<span>₹{doctor.consultationFee}</span>
											</div>
										</div>
									</div>
								)}

								{/* Submit Button */}
								<button
									type="submit"
									disabled={
										loading || !selectedDate || !selectedSlot || !reason.trim()
									}
									className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
											Booking Appointment...
										</div>
									) : (
										"Book Appointment"
									)}
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookAppointment;
