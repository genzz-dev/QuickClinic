import express from "express";
import {
	addClinic,
	addDoctorToClinic,
	checkAdminProfileExists,
	checkClinicExists,
	createAdminProfile,
	getClinicDoctors,
	getClinicInfo,
	getDoctorSchedule,
	removeDoctorFromClinic,
	sendVerificationOTP,
	setDoctorSchedule,
	updateClinic,
	verifyClinicOTP,
} from "../Controllers/adminController.js";
import { authenticate, authorize } from "../Middleware/authMiddleware.js";
import upload from "../Middleware/upload.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post("/profile", upload.single("profilePicture"), createAdminProfile);
router.post(
	"/clinics",
	upload.fields([
		{ name: "logo", maxCount: 1 },
		{ name: "photos", maxCount: 10 },
	]),
	addClinic,
);

const conditionalUpload = (req, res, next) => {
	const contentType = req.headers["content-type"] || "";

	if (contentType.includes("multipart/form-data")) {
		upload.fields([
			{ name: "logo", maxCount: 1 },
			{ name: "photos", maxCount: 10 },
		])(req, res, next);
	} else {
		next(); // Skip multer if not multipart
	}
};
router.get("/getClinic", getClinicInfo);
router.put("/clinics", conditionalUpload, updateClinic);
router.post("/clinics/doctors", addDoctorToClinic);
router.get("/clinics/doctors", getClinicDoctors);
router.delete("/clinics/doctors/:doctorId", removeDoctorFromClinic);
router.post("/doctors/:doctorId/schedule", setDoctorSchedule);
router.get("/doctors/:doctorId/schedule", getDoctorSchedule);
router.get("/clinics", getClinicDoctors);
router.post("/clinics/verify/send-otp", sendVerificationOTP);
router.post("/clinics/verify/confirm-otp", verifyClinicOTP);
router.get("/profile/status", checkAdminProfileExists);
router.get("/clinic/status", checkClinicExists);
export default router;
