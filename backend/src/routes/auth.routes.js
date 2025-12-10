import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateSignup, validateSignin } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, authController.signup);
router.post('/signin', validateSignin, authController.signin);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

