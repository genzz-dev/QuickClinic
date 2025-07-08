import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
} from '../Controllers/appointmentController.js';

const router = express.Router();

// Patient routes
router.use(authenticate);
router.post('/', authorize('patient'), bookAppointment);
router.get('/patient', authorize('patient'), getPatientAppointments);

// Doctor routes
router.get('/doctor', authorize('doctor'), getDoctorAppointments);

// Admin routes
router.put('/:appointmentId/status', authorize('admin'), updateAppointmentStatus);

export default router;