// routes/labAppointmentRoutes.js
import express from 'express';
import { authenticate, authorize } from '../../Middleware/authMiddleware.js';
import {
  bookLabAppointment,
  getPatientLabAppointments,
  getLabAppointments,
  assignStaffForCollection,
  updateLabAppointmentStatus,
} from '../../Controllers/QuickLab/labAppointmentController.js';

const router = express.Router();

router.post('/book', authenticate, authorize('patient'), bookLabAppointment);
router.get('/patient', authenticate, authorize('patient'), getPatientLabAppointments);
router.get('/lab', authenticate, authorize('lab_admin', 'lab_staff'), getLabAppointments);
router.put(
  '/:appointmentId/assign-staff',
  authenticate,
  authorize('lab_admin'),
  assignStaffForCollection
);
router.put(
  '/:appointmentId/status',
  authenticate,
  authorize('lab_admin', 'lab_staff'),
  updateLabAppointmentStatus
);

export default router;
