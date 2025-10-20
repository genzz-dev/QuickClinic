import express from 'express';
import {
  createRating,
  deleteRating,
  getClinicRatings,
  getDoctorRatings,
  getEligibleAppointments,
  getRatingStats,
  updateRating,
} from '../Controllers/ratingController.js';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// Get doctor ratings with filters and sorting - PUBLIC ACCESS
router.get('/doctor/:doctorId', getDoctorRatings);

// Get clinic ratings with filters and sorting - PUBLIC ACCESS
router.get('/clinic/:clinicId', getClinicRatings);

// Get rating statistics for doctor or clinic - PUBLIC ACCESS
router.get('/stats/:type/:id', getRatingStats);

// PROTECTED ROUTES (AUTHENTICATION REQUIRED)
// Apply authentication middleware only to protected routes
router.use(authenticate);

// Create a new rating (doctor or clinic)
router.post('/', authorize('patient'), createRating);

// Get eligible appointments for rating
router.get('/eligible-appointments', authorize('patient'), getEligibleAppointments);

// Update existing rating
router.put('/:ratingId', authorize('patient'), updateRating);

// Delete rating
router.delete('/:ratingId', authorize('patient'), deleteRating);

export default router;
