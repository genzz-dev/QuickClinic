import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
	patientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Patient",
		required: true,
	},

	appointmentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Appointment",
		required: true,
	},

	doctorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Doctor",
	},

	clinicId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Clinic",
	},

	rating: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},

	// Optional comment/review
	comment: {
		type: String,
		maxlength: 500,
	},

	// Type of rating - doctor or clinic
	ratingType: {
		type: String,
		enum: ["doctor", "clinic"],
		required: true,
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},

	updatedAt: {
		type: Date,
		default: Date.now,
	},
});
export default mongoose.model("Rating", ratingSchema);
