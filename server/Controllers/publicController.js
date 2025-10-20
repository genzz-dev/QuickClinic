// publicController.js

import Clinic from "../models/Clinic/Clinic.js";
import Schedule from "../models/Clinic/Schedule.js";
import Doctor from "../models/Users/Doctor.js";

// Helper functions
const getDayName = (date) =>
	[
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	][date.getDay()];

const generateTimeSlots = (startTime, endTime, duration) => {
	const slots = [];
	const start = new Date(`2000-01-01T${startTime}:00`);
	const end = new Date(`2000-01-01T${endTime}:00`);

	let current = new Date(start);
	while (current < end) {
		slots.push(current.toTimeString().slice(0, 5));
		current = new Date(current.getTime() + duration * 60000);
	}
	return slots;
};

// Search doctors with basic filters
export const searchDoctors = async (req, res) => {
	try {
		const {
			specialization,
			city,
			state,
			name,
			minRating,
			maxFee,
			sort = "rating_desc",
			page = 1,
			limit = 10,
			latitude, // Add these for proximity search
			longitude,
			radius = 10, // Default 10km radius
		} = req.query;

		const skip = (page - 1) * limit;

		// First, find clinics that match location criteria
		const clinicQuery = {};

		if (latitude && longitude) {
			// Use geospatial query for nearby clinics
			clinicQuery.location = {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [parseFloat(longitude), parseFloat(latitude)],
					},
					$maxDistance: radius * 1000, // Convert km to meters
				},
			};
		} else if (city || state) {
			// Fallback to city/state filtering
			if (city) clinicQuery["address.city"] = { $regex: city, $options: "i" };
			if (state)
				clinicQuery["address.state"] = { $regex: state, $options: "i" };
		}

		// Get nearby/matching clinics
		const nearbyClinicIds = await Clinic.find(clinicQuery).select("_id");

		if (nearbyClinicIds.length === 0) {
			return res.json({
				success: true,
				data: [],
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total: 0,
					pages: 0,
				},
			});
		}

		// Build doctor query - only search doctors from nearby clinics
		const doctorQuery = {
			clinicId: { $in: nearbyClinicIds.map((c) => c._id) },
		};

		// Add other filters
		if (specialization) {
			doctorQuery.specialization = { $regex: specialization, $options: "i" };
		}

		if (name) {
			doctorQuery.$or = [
				{ firstName: { $regex: name, $options: "i" } },
				{ lastName: { $regex: name, $options: "i" } },
			];
		}

		if (minRating) {
			doctorQuery.averageRating = { $gte: parseFloat(minRating) };
		}

		if (maxFee) {
			doctorQuery.consultationFee = { $lte: parseFloat(maxFee) };
		}

		// Sort options
		let sortOption = {};
		switch (sort) {
			case "rating_desc":
				sortOption = { averageRating: -1 };
				break;
			case "rating_asc":
				sortOption = { averageRating: 1 };
				break;
			case "fee_desc":
				sortOption = { consultationFee: -1 };
				break;
			case "fee_asc":
				sortOption = { consultationFee: 1 };
				break;
			case "name_asc":
				sortOption = { lastName: 1, firstName: 1 };
				break;
			case "name_desc":
				sortOption = { lastName: -1, firstName: -1 };
				break;
			case "distance":
				// Sort by clinic distance (requires aggregation)
				sortOption = { "clinicId.distance": 1 };
				break;
			default:
				sortOption = { averageRating: -1 };
		}

		const [doctors, total] = await Promise.all([
			Doctor.find(doctorQuery)
				.sort(sortOption)
				.skip(skip)
				.limit(parseInt(limit))
				.populate({
					path: "clinicId",
					select: "name address location contact",
				}),
			Doctor.countDocuments(doctorQuery),
		]);

		res.json({
			success: true,
			data: doctors,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Search clinics with basic filters
export const searchClinics = async (req, res) => {
	try {
		const { city, state, page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		const query = {};
		if (city) query["address.city"] = { $regex: city, $options: "i" };
		if (state) query["address.state"] = { $regex: state, $options: "i" };

		const [clinics, total] = await Promise.all([
			Clinic.find(query).skip(skip).limit(parseInt(limit)),
			Clinic.countDocuments(query),
		]);

		res.json({
			success: true,
			data: clinics,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Get doctor details
export const getDoctorById = async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id)
			.populate("clinicId", "name address contact openingHours isVerified")
			.populate("schedule");

		if (!doctor)
			return res
				.status(404)
				.json({ success: false, error: "Doctor not found" });
		res.json({ success: true, data: doctor });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Get clinic details
export const getClinicById = async (req, res) => {
	try {
		const clinic = await Clinic.findById(req.params.id);
		console.log(clinic);
		if (!clinic)
			return res
				.status(404)
				.json({ success: false, error: "Clinic not found" });
		res.json({ success: true, data: clinic });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Get doctor availability for a specific date
export const getDoctorAvailability = async (req, res) => {
	try {
		const { doctorId } = req.params;
		const { date } = req.query;

		if (!date)
			return res
				.status(400)
				.json({ success: false, error: "Date is required" });

		const doctor = await Doctor.findById(doctorId).populate("schedule");
		if (!doctor)
			return res
				.status(404)
				.json({ success: false, error: "Doctor not found" });
		if (!doctor.schedule)
			return res.json({
				success: true,
				data: { available: false, reason: "No schedule" },
			});

		const requestedDate = new Date(date);
		const dayName = getDayName(requestedDate);

		// Check vacation
		const isOnVacation = doctor.schedule.vacations.some(
			(v) =>
				requestedDate >= new Date(v.startDate) &&
				requestedDate <= new Date(v.endDate),
		);
		if (isOnVacation)
			return res.json({
				success: true,
				data: { available: false, reason: "On vacation" },
			});

		// Check working day
		const workingDay = doctor.schedule.workingDays.find(
			(d) => d.day.toLowerCase() === dayName && d.isWorking,
		);
		if (!workingDay)
			return res.json({
				success: true,
				data: { available: false, reason: "Not working today" },
			});

		// Generate available slots
		const dayBreaks = doctor.schedule.breaks.filter(
			(b) => b.day.toLowerCase() === dayName,
		);
		const allSlots = generateTimeSlots(
			workingDay.startTime,
			workingDay.endTime,
			doctor.schedule.appointmentDuration,
		);

		const availableSlots = allSlots.filter((slot) => {
			const slotTime = new Date(`2000-01-01T${slot}:00`);
			return !dayBreaks.some((b) => {
				const breakStart = new Date(`2000-01-01T${b.startTime}:00`);
				const breakEnd = new Date(`2000-01-01T${b.endTime}:00`);
				return slotTime >= breakStart && slotTime < breakEnd;
			});
		});

		res.json({
			success: true,
			data: {
				available: true,
				slots: availableSlots,
				workingHours: { start: workingDay.startTime, end: workingDay.endTime },
				breaks: dayBreaks,
				appointmentDuration: doctor.schedule.appointmentDuration,
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Get clinic doctors with basic info
export const getClinicDoctors = async (req, res) => {
	try {
		const { clinicId } = req.params;
		const { page = 1, limit = 20 } = req.query;
		const skip = (page - 1) * limit;

		const clinic = await Clinic.findById(clinicId);
		if (!clinic)
			return res
				.status(404)
				.json({ success: false, error: "Clinic not found" });

		const [doctors, total] = await Promise.all([
			Doctor.find({ clinicId })
				.skip(skip)
				.limit(parseInt(limit))
				.select(
					"firstName lastName specialization profilePicture consultationFee averageRating",
				),
			Doctor.countDocuments({ clinicId }),
		]);

		res.json({
			success: true,
			data: {
				clinic: { id: clinic._id, name: clinic.name },
				doctors,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total,
					pages: Math.ceil(total / limit),
				},
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Check doctor availability at specific time
export const checkDoctorAvailability = async (req, res) => {
	try {
		const { doctorId } = req.params;
		const { date, time } = req.query;

		if (!date || !time)
			return res
				.status(400)
				.json({ success: false, error: "Date and time required" });

		const doctor = await Doctor.findById(doctorId).populate("schedule");
		if (!doctor)
			return res
				.status(404)
				.json({ success: false, error: "Doctor not found" });
		if (!doctor.schedule)
			return res.json({
				success: true,
				data: { available: false, reason: "No schedule" },
			});

		const requestedDate = new Date(date);
		const dayName = getDayName(requestedDate);
		const requestedTime = new Date(`2000-01-01T${time}:00`);

		// Check vacation
		const isOnVacation = doctor.schedule.vacations.some(
			(v) =>
				requestedDate >= new Date(v.startDate) &&
				requestedDate <= new Date(v.endDate),
		);
		if (isOnVacation)
			return res.json({
				success: true,
				data: { available: false, reason: "On vacation" },
			});

		// Check working day
		const workingDay = doctor.schedule.workingDays.find(
			(d) => d.day.toLowerCase() === dayName && d.isWorking,
		);
		if (!workingDay)
			return res.json({
				success: true,
				data: { available: false, reason: "Not working today" },
			});

		// Check working hours
		const workStart = new Date(`2000-01-01T${workingDay.startTime}:00`);
		const workEnd = new Date(`2000-01-01T${workingDay.endTime}:00`);
		if (requestedTime < workStart || requestedTime >= workEnd) {
			return res.json({
				success: true,
				data: { available: false, reason: "Outside working hours" },
			});
		}

		// Check breaks
		const isInBreak = doctor.schedule.breaks.some((b) => {
			if (b.day.toLowerCase() !== dayName) return false;
			const breakStart = new Date(`2000-01-01T${b.startTime}:00`);
			const breakEnd = new Date(`2000-01-01T${b.endTime}:00`);
			return requestedTime >= breakStart && requestedTime < breakEnd;
		});
		if (isInBreak)
			return res.json({
				success: true,
				data: { available: false, reason: "During break" },
			});

		res.json({
			success: true,
			data: {
				available: true,
				appointmentDuration: doctor.schedule.appointmentDuration,
				workingHours: { start: workingDay.startTime, end: workingDay.endTime },
			},
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

// Get doctor's schedule
// In publicController.js - Update getDoctorSchedule function
export const getDoctorSchedule = async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.doctorId).populate(
			"schedule",
		);

		if (!doctor) {
			return res
				.status(404)
				.json({ success: false, error: "Doctor not found" });
		}

		const doctorID = doctor._id;
		const schedule = await Schedule.findOne({ doctorId: doctorID }).populate(
			"doctorId",
			"firstName lastName",
		);

		// Filter out sensitive information for public API
		const publicSchedule = schedule
			? {
					workingDays: schedule.workingDays,
					breaks: schedule.breaks.map((breakTime) => ({
						day: breakTime.day,
						startTime: breakTime.startTime,
						endTime: breakTime.endTime,
						// Don't include reason for privacy
					})),
					vacations: schedule.vacations
						.filter((vacation) => new Date(vacation.endDate) >= new Date()) // Only future/current vacations
						.map((vacation) => ({
							startDate: vacation.startDate,
							endDate: vacation.endDate,
							// Don't include reason for privacy
						})),
					appointmentDuration: schedule.appointmentDuration,
				}
			: {
					workingDays: [],
					breaks: [],
					vacations: [],
					appointmentDuration: 30,
				};

		res.json({
			success: true,
			data: publicSchedule,
		});
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

export const getSearchSuggestions = async (req, res) => {
	try {
		const { query } = req.query;
		if (!query || query.length < 2) {
			return res.json({ success: true, data: [] });
		}

		const [doctors, clinics] = await Promise.all([
			Doctor.find({
				$or: [
					{ firstName: { $regex: query, $options: "i" } },
					{ lastName: { $regex: query, $options: "i" } },
					{ specialization: { $regex: query, $options: "i" } },
				],
			})
				.limit(5)
				.select("firstName lastName specialization"),

			Clinic.find({
				$or: [
					{ name: { $regex: query, $options: "i" } },
					{ "address.city": { $regex: query, $options: "i" } },
					{ "address.state": { $regex: query, $options: "i" } },
				],
			})
				.limit(5)
				.select("name address.city address.state"),
		]);

		const suggestions = [
			...doctors.map((d) => ({
				type: "doctor",
				id: d._id,
				name: `${d.firstName} ${d.lastName}`,
				specialization: d.specialization,
			})),
			...clinics.map((c) => ({
				type: "clinic",
				id: c._id,
				name: c.name,
				location: `${c.address.city}, ${c.address.state}`,
			})),
		];

		res.json({ success: true, data: suggestions });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};
