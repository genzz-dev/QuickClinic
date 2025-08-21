import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getClinicAppointments,
  updateAppointment,
  updateAppointmentStatus,
  getAppointmentDetails,
  cancelAppointment,
    getPatientInfoForAppointment
} from '../Controllers/appointmentController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Patient routes
router.post('/', authorize('patient'), bookAppointment);
router.get('/patient', authorize('patient'), getPatientAppointments);
router.put('/:appointmentId', authorize('patient'), updateAppointment);
router.put('/:appointmentId/cancel', authorize('patient', 'doctor', 'admin'), cancelAppointment);

// Doctor routes
router.get('/doctor', authorize('doctor'), getDoctorAppointments);

// Admin routes
router.get('/clinic', authorize('admin'), getClinicAppointments);
router.put('/:appointmentId/status', authorize('admin'), updateAppointmentStatus);

// Common routes (accessible by patient, doctor, admin with appropriate permissions)
router.get('/:appointmentId', authorize('patient', 'doctor', 'admin'), getAppointmentDetails);
router.get('/:appointmentId/patient-info', authorize('doctor'), getPatientInfoForAppointment);
export default router;