import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createDoctorProfile,
  updateDoctorProfile,
  getDoctorProfile,
  getDoctorsByClinic
} from '../Controllers/doctorController.js';
const router = express.Router();

router.use(authenticate);
router.use(authorize('doctor'));

router.post('/profile', createDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.get('/profile', getDoctorProfile);
router.get('/clinic/:clinicId', getDoctorsByClinic);

export default router;