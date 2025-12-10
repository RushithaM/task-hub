import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateProfileUpdate, validatePasswordChange } from '../middlewares/validation.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// User routes
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfileUpdate, userController.updateProfile);
router.put('/password', validatePasswordChange, userController.changePassword);

export default router;

