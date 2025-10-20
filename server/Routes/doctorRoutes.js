import express from "express";
import {
	checkClinicStatus,
	checkProfileStatus,
	createDoctorProfile,
	getDoctorClinicInfo,
	getDoctorProfile,
	getDoctorSchedule,
	getDoctorsByClinic,
	leaveCurrentClinic,
	updateDoctorProfile,
	
} from "../Controllers/doctorController.js";
import { authenticate, authorize } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("doctor"));

router.post("/profile", upload.single("profilePicture"), createDoctorProfile);
router.put("/profile", upload.single("profilePicture"), updateDoctorProfile);
router.get("/profile", getDoctorProfile);
router.get("/clinic/:clinicId", getDoctorsByClinic);
router.post(
	"/leave-clinic",
	authenticate,
	authorize("doctor"),
	leaveCurrentClinic,
);
router.get("/clinic-status", checkClinicStatus);
router.get("/profile-status", checkProfileStatus);
router.get("/clinic", getDoctorClinicInfo);
router.get("/schedule", getDoctorSchedule);
export default router;
