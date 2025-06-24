import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createAdminProfile,
  addClinic,
  updateClinic,
  addDoctorToClinic
} from '../Controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/profile', createAdminProfile);
router.post('/clinics', addClinic);
router.put('/clinics/:clinicId', updateClinic);
router.post('/clinics/:clinicId/doctors', addDoctorToClinic);

export default router;