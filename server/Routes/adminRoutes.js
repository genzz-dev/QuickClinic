import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createAdminProfile,
  addClinic,
  updateClinic,
  addDoctorToClinic,
  getClinicDoctors,
  removeDoctorFromClinic,
  setDoctorSchedule,
  getDoctorSchedule,
  getClinicInfo
} from '../Controllers/adminController.js';
import upload from '../Middleware/upload.js';
import { get } from 'mongoose';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/profile', upload.single('profilePicture'), createAdminProfile);
router.post(
  '/clinics',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]),
  addClinic
);
router.put('/clinics', upload.single('profilePicture'), updateClinic);
router.post('/clinics/doctors', upload.single('profilePicture'), addDoctorToClinic);
router.get('/clinics/doctors', getClinicDoctors); 
router.delete('/clinics/doctors/:doctorId', removeDoctorFromClinic); 
router.post('/doctors/:doctorId/schedule', setDoctorSchedule);
router.get('/doctors/:doctorId/schedule', getDoctorSchedule);
router.get('/clinics',getClinicDoctors);
export default router;