import express from "express";
import {
	createRating,
	getDoctorRatings,
	getClinicRatings,
	getEligibleAppointments,
	updateRating,
	deleteRating,
	getRatingStats,
} from "../Controllers/ratingController.js";
import { authenticate, authorize } from "../Middleware/authMiddleware.js";

const router = express.Router();
router.use(authenticate);
// Create a new rating (doctor or clinic)
router.post("/", authorize("patient"), createRating);

// Get eligible appointments for rating
router.get(
	"/eligible-appointments",
	authorize("patient"),
	getEligibleAppointments,
);

// Get doctor ratings with filters and sorting
router.get("/doctor/:doctorId", getDoctorRatings);

// Get clinic ratings with filters and sorting
router.get("/clinic/:clinicId", getClinicRatings);

// Get rating statistics for doctor or clinic
router.get("/stats/:type/:id", getRatingStats);

// Update existing rating
router.put("/:ratingId", authorize("patient"), updateRating);

// Delete rating
router.delete("/:ratingId", authorize("patient"), deleteRating);

export default router;
