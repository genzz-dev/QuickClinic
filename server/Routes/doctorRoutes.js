import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorProfile,
  getDoctorsByClinic
} from '../Controllers/doctorController.js';
import upload from '../Middleware/upload.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.post('/profile', upload.single('profilePicture'),createDoctorProfile);
router.put('/profile', upload.single('profilePicture'),updateDoctorProfile);
router.get('/profile', getDoctorProfile);
router.get('/clinic/:clinicId', getDoctorsByClinic);

export default router;