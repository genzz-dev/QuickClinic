import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createAdminProfile,
  addClinic,
  updateClinic,
  addDoctorToClinic,
  setDoctorSchedule,
  getDoctorSchedule

} from '../Controllers/adminController.js';
import upload from '../Middleware/upload.js';
const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/profile', upload.single('profilePicture'),createAdminProfile);
router.post(
  '/clinics',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 }
  ]),
  addClinic
);
router.put('/clinics/:clinicId', upload.single('profilePicture'),updateClinic);
router.post('/clinics/:clinicId/doctors', upload.single('profilePicture'),addDoctorToClinic);
router.post('/doctors/:doctorId/schedule', setDoctorSchedule);
router.get('/doctors/:doctorId/schedule', getDoctorSchedule);

export default router;