import express from 'express';
import { login, logout, refresh, register } from '../Controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refresh);
router.post('/logout', logout);

export default router;
