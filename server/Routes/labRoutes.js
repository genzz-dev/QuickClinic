// routes/labRoutes.js
import express from 'express';
import { authenticate, authorize } from '../Middleware/authMiddleware.js';
import { searchLabs, getLabDetails, getLabTests } from '../Controllers/labController.js';

const router = express.Router();

router.get('/search', authenticate, searchLabs);
router.get('/:labId', authenticate, getLabDetails);
router.get('/:labId/tests', authenticate, getLabTests);

export default router;
