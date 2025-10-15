import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
	doctorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Doctor",
		required: true,
		unique: true,
	},
	workingDays: [
		{
			day: {
				type: String,
				enum: [
					"monday",
					"tuesday",
					"wednesday",
					"thursday",
					"friday",
					"saturday",
					"sunday",
				],
			},
			startTime: { type: String },
			endTime: { type: String },
			isWorking: { type: Boolean, default: true },
		},
	],
	breaks: [
		{
			day: String,
			startTime: String,
			endTime: String,
			reason: String,
		},
	],
	vacations: [
		{
			startDate: { type: Date },
			endDate: { type: Date },
			reason: String,
		},
	],
	appointmentDuration: { type: Number, default: 30 }, // in minutes
});

export default mongoose.model("Schedule", scheduleSchema);
