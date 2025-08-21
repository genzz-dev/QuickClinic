import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescription
} from '../Controllers/prescriptionController.js';

const router = express.Router();

router.use(authenticate);

// Doctor routes
router.post('/appointments/:appointmentId', authorize('doctor'), createPrescription);
router.get('/doctor', authorize('doctor'), getDoctorPrescriptions);

// Patient routes
router.get('/patient', authorize('patient'), getPatientPrescriptions);

// Shared route
router.get('/:prescriptionId', authorize(['doctor', 'patient', 'admin']), getPrescription);

export default router;