import express from "express";
import {
	checkPatientProfileExists,
	createPatientProfile,
	getPatientProfile,
	updatePatientProfile,
	uploadHealthRecord,
} from "../Controllers/patientController.js";
import { authenticate, authorize } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("patient"));

// Profile routes (already handle profile pictures)
router.post("/profile", upload.single("profilePicture"), createPatientProfile);
router.put("/profile", upload.single("profilePicture"), updatePatientProfile);
router.get("/profile", getPatientProfile);
router.get("/profile/status", checkPatientProfileExists);

// Health records routes
router.post("/health-records", upload.single("file"), uploadHealthRecord);

export default router;
