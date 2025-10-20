import Appointment from "../models/Appointment/Appointment.js";
import Clinic from "../models/Clinic/Clinic.js";
import Rating from "../models/Ratings/Ratings.js";
import Doctor from "../models/Users/Doctor.js";

// Create a new rating (for doctor or clinic)
export const createRating = async (req, res) => {
	try {
		const { appointmentId, rating, comment, ratingType, doctorId, clinicId } =
			req.body;
		const { profileId } = req.user; // Assuming patient ID comes from auth middleware

		// Validate appointment exists and is completed
		const appointment = await Appointment.findById(appointmentId);
		if (!appointment) {
			return res.status(404).json({ message: "Appointment not found" });
		}

		if (appointment.status !== "completed") {
			return res
				.status(400)
				.json({ message: "Can only rate completed appointments" });
		}

		if (appointment.patientId.toString() !== profileId.toString()) {
			return res
				.status(403)
				.json({ message: "Unauthorized to rate this appointment" });
		}

		// Check if rating already exists for this appointment and type
		const existingRating = await Rating.findOne({
			appointmentId,
			patientId: profileId,
			ratingType,
		});

		if (existingRating) {
			return res
				.status(400)
				.json({ message: `You have already rated this ${ratingType}` });
		}

		// Create new rating
		const newRating = new Rating({
			patientId: profileId,
			appointmentId,
			doctorId:
				ratingType === "doctor" ? doctorId || appointment.doctorId : null,
			clinicId:
				ratingType === "clinic" ? clinicId || appointment.clinicId : null,
			rating,
			comment,
			ratingType,
		});

		await newRating.save();

		// Update doctor or clinic rating statistics
		if (ratingType === "doctor") {
			await updateDoctorRating(doctorId || appointment.doctorId);
		} else if (ratingType === "clinic") {
			await updateClinicRating(clinicId || appointment.clinicId);
		}

		res.status(201).json({
			message: `${ratingType} rated successfully`,
			rating: newRating,
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ message: "Error creating rating", error: error.message });
	}
};

// Get doctor ratings with filtering and sorting
export const getDoctorRatings = async (req, res) => {
	try {
		const { doctorId } = req.params;
		const {
			sort = "newest",
			rating: filterRating,
			page = 1,
			limit = 10,
		} = req.query;

		let sortQuery = {};
		switch (sort) {
			case "newest":
				sortQuery = { createdAt: -1 };
				break;
			case "oldest":
				sortQuery = { createdAt: 1 };
				break;
			case "highest":
				sortQuery = { rating: -1 };
				break;
			case "lowest":
				sortQuery = { rating: 1 };
				break;
			default:
				sortQuery = { createdAt: -1 };
		}

		const filterQuery = { doctorId, ratingType: "doctor" };
		if (filterRating) {
			filterQuery.rating = parseInt(filterRating);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const ratings = await Rating.find(filterQuery)
			.populate("patientId", "firstName lastName")
			.populate("appointmentId", "date")
			.sort(sortQuery)
			.skip(skip)
			.limit(parseInt(limit));

		const totalRatings = await Rating.countDocuments(filterQuery);
		const doctor = await Doctor.findById(doctorId);

		res.json({
			ratings,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalRatings / parseInt(limit)),
				totalRatings,
				hasNext: skip + ratings.length < totalRatings,
				hasPrev: parseInt(page) > 1,
			},
			averageRating: doctor?.ratings?.average || 0,
			totalRatingCount: doctor?.ratings?.count || 0,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching doctor ratings", error: error.message });
	}
};

// Get clinic ratings with filtering and sorting
export const getClinicRatings = async (req, res) => {
	try {
		const { clinicId } = req.params;
		const {
			sort = "newest",
			rating: filterRating,
			page = 1,
			limit = 10,
		} = req.query;

		let sortQuery = {};
		switch (sort) {
			case "newest":
				sortQuery = { createdAt: -1 };
				break;
			case "oldest":
				sortQuery = { createdAt: 1 };
				break;
			case "highest":
				sortQuery = { rating: -1 };
				break;
			case "lowest":
				sortQuery = { rating: 1 };
				break;
			default:
				sortQuery = { createdAt: -1 };
		}

		const filterQuery = { clinicId, ratingType: "clinic" };
		if (filterRating) {
			filterQuery.rating = parseInt(filterRating);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const ratings = await Rating.find(filterQuery)
			.populate("patientId", "firstName lastName")
			.populate("appointmentId", "date")
			.sort(sortQuery)
			.skip(skip)
			.limit(parseInt(limit));

		const totalRatings = await Rating.countDocuments(filterQuery);
		const clinic = await Clinic.findById(clinicId);

		res.json({
			ratings,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalRatings / parseInt(limit)),
				totalRatings,
				hasNext: skip + ratings.length < totalRatings,
				hasPrev: parseInt(page) > 1,
			},
			averageRating: clinic?.ratings?.average || 0,
			totalRatingCount: clinic?.ratings?.count || 0,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching clinic ratings", error: error.message });
	}
};

// Get patient's completed appointments eligible for rating
export const getEligibleAppointments = async (req, res) => {
	try {
		const { profileId } = req.user;

		const appointments = await Appointment.find({
			patientId: profileId,
			status: "completed",
		})
			.populate("doctorId", "firstName lastName specialization")
			.populate("clinicId", "name")
			.sort({ date: -1 });

		// Check which appointments haven't been rated yet
		const appointmentsWithRatingStatus = await Promise.all(
			appointments.map(async (appointment) => {
				const doctorRating = await Rating.findOne({
					appointmentId: appointment._id,
					patientId: profileId,
					ratingType: "doctor",
				});

				const clinicRating = await Rating.findOne({
					appointmentId: appointment._id,
					patientId: profileId,
					ratingType: "clinic",
				});

				return {
					...appointment.toObject(),
					hasRatedDoctor: !!doctorRating,
					hasRatedClinic: !!clinicRating,
					canRateDoctor: !doctorRating,
					canRateClinic: !clinicRating,
				};
			}),
		);

		res.json({
			appointments: appointmentsWithRatingStatus,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error fetching eligible appointments",
			error: error.message,
		});
	}
};

// Update or edit existing rating
export const updateRating = async (req, res) => {
	try {
		const { ratingId } = req.params;
		const { rating, comment } = req.body;
		const { profileId } = req.user;

		const existingRating = await Rating.findById(ratingId);
		if (!existingRating) {
			return res.status(404).json({ message: "Rating not found" });
		}

		if (existingRating.patientId.toString() !== profileId.toString()) {
			return res
				.status(403)
				.json({ message: "Unauthorized to update this rating" });
		}

		existingRating.rating = rating;
		existingRating.comment = comment;
		existingRating.updatedAt = new Date();

		await existingRating.save();

		// Update rating statistics
		if (existingRating.ratingType === "doctor") {
			await updateDoctorRating(existingRating.doctorId);
		} else {
			await updateClinicRating(existingRating.clinicId);
		}

		res.json({
			message: "Rating updated successfully",
			rating: existingRating,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error updating rating", error: error.message });
	}
};

// Delete rating
export const deleteRating = async (req, res) => {
	try {
		const { ratingId } = req.params;
		const { profileId } = req.user;

		const rating = await Rating.findById(ratingId);
		if (!rating) {
			return res.status(404).json({ message: "Rating not found" });
		}

		if (rating.patientId.toString() !== profileId.toString()) {
			return res
				.status(403)
				.json({ message: "Unauthorized to delete this rating" });
		}

		await Rating.findByIdAndDelete(ratingId);

		// Update rating statistics
		if (rating.ratingType === "doctor") {
			await updateDoctorRating(rating.doctorId);
		} else {
			await updateClinicRating(rating.clinicId);
		}

		res.json({ message: "Rating deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error deleting rating", error: error.message });
	}
};

// Helper function to update doctor rating statistics (NO DISTRIBUTION)
const updateDoctorRating = async (doctorId) => {
	try {
		const ratings = await Rating.find({ doctorId, ratingType: "doctor" });
		const count = ratings.length;
		const totalStars = ratings.reduce((sum, rating) => sum + rating.rating, 0);
		const average = count > 0 ? Math.round((totalStars / count) * 10) / 10 : 0;

		await Doctor.findByIdAndUpdate(doctorId, {
			"ratings.count": count,
			"ratings.totalStars": totalStars,
			"ratings.average": average,
		});
	} catch (error) {
		console.error("Error updating doctor rating:", error);
	}
};

// Helper function to update clinic rating statistics (NO DISTRIBUTION)
const updateClinicRating = async (clinicId) => {
	try {
		const ratings = await Rating.find({ clinicId, ratingType: "clinic" });
		const count = ratings.length;
		const totalStars = ratings.reduce((sum, rating) => sum + rating.rating, 0);
		const average = count > 0 ? Math.round((totalStars / count) * 10) / 10 : 0;

		await Clinic.findByIdAndUpdate(clinicId, {
			"ratings.count": count,
			"ratings.totalStars": totalStars,
			"ratings.average": average,
		});
	} catch (error) {
		console.error("Error updating clinic rating:", error);
	}
};

// Simple rating stats - NO DISTRIBUTION
export const getRatingStats = async (req, res) => {
	try {
		const { type, id } = req.params;

		let model;
		if (type === "doctor") {
			model = Doctor;
		} else if (type === "clinic") {
			model = Clinic;
		} else {
			return res
				.status(400)
				.json({ message: 'Invalid type. Use "doctor" or "clinic"' });
		}

		const entity = await model.findById(id);
		if (!entity) {
			return res.status(404).json({ message: `${type} not found` });
		}

		res.json({
			averageRating: entity.ratings?.average || 0,
			totalRatings: entity.ratings?.count || 0,
			entityInfo: {
				id: entity._id,
				name:
					type === "doctor"
						? `${entity.firstName} ${entity.lastName}`
						: entity.name,
			},
		});
	} catch (error) {
		console.error("Error in getRatingStats:", error);
		res
			.status(500)
			.json({ message: "Error fetching rating stats", error: error.message });
	}
};
