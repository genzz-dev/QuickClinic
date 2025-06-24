import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createAdminProfile,
  addClinic,
  updateClinic,
  addDoctorToClinic
} from '../Controllers/adminController.js';
import upload from '../Middleware/upload.js';
const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/profile', upload.single('profilePicture'),createAdminProfile);
router.post('/clinics',upload.single('profilePicture'), addClinic);
router.put('/clinics/:clinicId', upload.single('profilePicture'),updateClinic);
router.post('/clinics/:clinicId/doctors', upload.single('profilePicture'),addDoctorToClinic);

export default router;