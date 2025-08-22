import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createPatientProfile,
  updatePatientProfile,
  getPatientProfile,
  uploadHealthRecord,
  checkPatientProfileExists
} from '../Controllers/patientController.js';
import upload from '../Middleware/upload.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('patient'));

router.post('/profile', upload.single('profilePicture'), createPatientProfile);
router.put('/profile', upload.single('profilePicture'), updatePatientProfile);
router.get('/profile', getPatientProfile);
router.post('/health-records', upload.single('file'), uploadHealthRecord);
router.get('/profile/status', checkPatientProfileExists);
export default router;