import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	type: {
		type: String,
		enum: [
			"appointment-reminder",
			"appointment-confirmation",
			"prescription-ready",
			"test-result",
			"general",
		],
		required: true,
	},
	title: { type: String, required: true },
	message: { type: String, required: true },
	relatedEntity: {
		type: {
			type: String,
			enum: ["appointment", "prescription", "health-record"],
		},
		id: { type: mongoose.Schema.Types.ObjectId },
	},
	isRead: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
