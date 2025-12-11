// routes/labAdminRoutes.js
import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createLabAdminProfile,
  createLab,
  addStaffMember,
  getLabStaff,
  addTest,
  updateTest,
  getLabInfo,
} from '../Controllers/labAdminController.js';
import upload from '../Middleware/upload.js';

const router = express.Router();

router.post('/profile', authenticate, authorize('lab_admin'), createLabAdminProfile);
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
router.post('/staff', authenticate, authorize('lab_admin'), addStaffMember);
router.get('/staff', authenticate, authorize('lab_admin'), getLabStaff);
router.post('/tests', authenticate, authorize('lab_admin'), addTest);
router.put('/tests/:testId', authenticate, authorize('lab_admin'), updateTest);
router.get('/lab/info', authenticate, authorize('lab_admin'), getLabInfo);

export default router;
