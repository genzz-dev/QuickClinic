import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
	patientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Patient",
		required: true,
	},
	doctorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Doctor",
		required: true,
	},
	clinicId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Clinic",
		required: true,
	},
	date: { type: Date, required: true },
	startTime: { type: String, required: true },
	endTime: { type: String, required: true },
	status: {
		type: String,
		enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
		default: "pending",
	},
	reason: { type: String },
	isTeleconsultation: { type: Boolean, default: false },
	meetingLink: { type: String },
	prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
	notes: { type: String },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Appointment", appointmentSchema);
