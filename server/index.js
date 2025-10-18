import dotenv from "dotenv";

dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";
import { config } from "./config/token.js";
import adminRoutes from "./Routes/adminRoutes.js";
import appointmentRoutes from "./Routes/appointmentRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import doctorRoutes from "./Routes/doctorRoutes.js";
import patientRoutes from "./Routes/patientRoutes.js";
import prescriptionRoutes from "./Routes/prescriptionRoutes.js";
import publicRoutes from "./Routes/publicRoutes.js";
import ratingRoutes from "./Routes/ratingRoutes.js";

const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
const frontendurl = process.env.Frontend_url;
console.log(frontendurl);
// CORS config
app.use(
	cors({
		origin: frontendurl,
		credentials: true,
	}),
);
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/ratings", ratingRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
