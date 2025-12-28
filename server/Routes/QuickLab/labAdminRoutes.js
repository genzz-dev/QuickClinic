// routes/labAdminRoutes.js
import express from 'express';
import { authenticate, authorize } from '../../Middleware/authMiddleware.js';
import {
  createLabAdminProfile,
  createLab,
  searchStaff,
  addStaffToLab,
  removeStaffFromLab,
  getLabStaff,
  addTest,
  updateTest,
  getLabInfo,
  updateLabInfo,
  checkLabExists,
  checkLabAdminProfileExists,
} from '../../Controllers/QuickLab/labAdminController.js';
import upload from '../../Middleware/upload.js';

const router = express.Router();

router.post('/profile', authenticate, authorize('lab_admin'), createLabAdminProfile);
router.get(
  '/profile/status',
  authenticate,
  authorize('lab_admin', 'lab_staff'),
  checkLabAdminProfileExists
);
router.get('/lab/status', authenticate, authorize('lab_admin'), checkLabExists);
router.post(
  '/lab',
  authenticate,
  authorize('lab_admin'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]),
  createLab
);

// Staff management
router.get('/staff/search', authenticate, authorize('lab_admin'), searchStaff);
router.post('/staff/add', authenticate, authorize('lab_admin'), addStaffToLab);
router.delete('/staff/:staffId', authenticate, authorize('lab_admin'), removeStaffFromLab);
router.get('/staff', authenticate, authorize('lab_admin'), getLabStaff);

// Test management
router.post('/tests', authenticate, authorize('lab_admin'), addTest);
router.put('/tests/:testId', authenticate, authorize('lab_admin'), updateTest);

// Lab info
router.get('/lab/info', authenticate, authorize('lab_admin'), getLabInfo);
router.put(
  '/lab/info',
  authenticate,
  authorize('lab_admin'),
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]),
  updateLabInfo
);

export default router;
