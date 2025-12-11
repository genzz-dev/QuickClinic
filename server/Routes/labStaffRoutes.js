// routes/labStaffRoutes.js
import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import {
  createStaffProfile,
  updateStaffProfile,
  getStaffProfile,
  checkStaffProfileExists,
  getMyAssignments,
  getAssignmentDetails,
  updateMyAssignmentStatus,
  completeAssignment,
} from '../Controllers/labStaffController.js';
import upload from '../Middleware/upload.js';

const router = express.Router();

// Profile management
router.post(
  '/profile',
  authenticate,
  authorize('lab_staff'),
  upload.single('profilePicture'),
  createStaffProfile
);
router.put(
  '/profile',
  authenticate,
  authorize('lab_staff'),
  upload.single('profilePicture'),
  updateStaffProfile
);
router.get('/profile', authenticate, authorize('lab_staff'), getStaffProfile);
router.get('/profile/check', authenticate, authorize('lab_staff'), checkStaffProfileExists);

// Assignments/Tasks
router.get('/assignments', authenticate, authorize('lab_staff'), getMyAssignments);
router.get(
  '/assignments/:appointmentId',
  authenticate,
  authorize('lab_staff'),
  getAssignmentDetails
);
router.put(
  '/assignments/:appointmentId/status',
  authenticate,
  authorize('lab_staff'),
  updateMyAssignmentStatus
);
router.post(
  '/assignments/:appointmentId/complete',
  authenticate,
  authorize('lab_staff'),
  completeAssignment
);

export default router;
