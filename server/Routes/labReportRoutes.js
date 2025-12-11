// routes/labReportRoutes.js
import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  uploadLabReport,
  getPatientLabReports,
  getDoctorPatientReports,
  addDoctorRemarks,
  getReportDetails,
} from '../Controllers/labReportController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/upload/:appointmentId',
  authenticate,
  authorize('lab_admin', 'lab_staff'),
  upload.single('reportFile'),
  uploadLabReport
);
router.get('/patient', authenticate, authorize('patient'), getPatientLabReports);
router.get('/doctor', authenticate, authorize('doctor'), getDoctorPatientReports);
router.put('/:reportId/remarks', authenticate, authorize('doctor'), addDoctorRemarks);
router.get('/:reportId', authenticate, getReportDetails);

export default router;
