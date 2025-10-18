import express from "express";
import {
	createPrescription,
	getAppointmentPrescription,
	getDoctorPrescriptions,
	getPatientAppointmentPrescription,
	getPatientPrescriptions,
	getPrescription,
	updatePrescription,
} from "../Controllers/prescriptionController.js";
import { authenticate, authorize } from "../Middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Doctor routes
router.post(
	"/appointments/:appointmentId",
	authorize("doctor"),
	createPrescription,
);
router.get("/doctor", authorize("doctor"), getDoctorPrescriptions);

// Patient routes
router.get("/patient", authorize("patient"), getPatientPrescriptions);
router.get(
	"/patient/appointments/:appointmentId",
	authorize("patient"),
	getPatientAppointmentPrescription,
);
// Shared route
router.get(
	"/:prescriptionId",
	authorize(["doctor", "patient", "admin"]),
	getPrescription,
);

router.get(
	"/appointments/:appointmentId",
	authorize("doctor"),
	getAppointmentPrescription,
);
router.put("/:prescriptionId", authorize("doctor"), updatePrescription);
export default router;
