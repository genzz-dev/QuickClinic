// publicRoutes.js
import express from 'express';
import {
  checkDoctorAvailability,
  getClinicById,
  getClinicDoctors,
  getDoctorAvailability,
  getDoctorById,
  getDoctorSchedule,
  getSearchSuggestions,
  searchClinics,
  searchDoctors,
} from '../Controllers/publicController.js';

const router = express.Router();

// Doctor routes
router.get('/doctors/search', searchDoctors);
router.get('/doctors/:id', getDoctorById);
router.get('/doctors/:doctorId/schedule', getDoctorSchedule);
router.get('/doctors/:doctorId/availability', getDoctorAvailability);
router.get('/doctors/:doctorId/availability/check', checkDoctorAvailability);
router.get('/search/suggestions', getSearchSuggestions);

// Clinic routes
router.get('/clinics/search', searchClinics);
router.get('/clinics/:id', getClinicById);
router.get('/clinics/:clinicId/doctors', getClinicDoctors);

export default router;
