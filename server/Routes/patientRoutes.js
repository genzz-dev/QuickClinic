import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createPatientProfile,
  updatePatientProfile,
  getPatientProfile,
  uploadHealthRecord
} from '../Controllers/patientController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('patient'));

router.post('/profile', createPatientProfile);
router.put('/profile', updatePatientProfile);
router.get('/profile', getPatientProfile);
router.post('/health-records', uploadHealthRecord);

export default router;