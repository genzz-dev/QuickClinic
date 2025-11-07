import express from 'express';
import {
  subscribeToNotifications,
  getPublicKey,
  unsubscribeFromNotifications,
  testPushNotification,
} from '../Controllers/pushNotificationController.js';
import { authenticate } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public route - get VAPID public key
router.get('/public-key', getPublicKey);

// Protected routes
router.use(authenticate);

router.post('/subscribe', subscribeToNotifications);
router.post('/unsubscribe', unsubscribeFromNotifications);
router.post('/test', testPushNotification);

export default router;
