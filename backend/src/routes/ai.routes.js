import express from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// AI routes
router.post('/chat', aiController.chat);

export default router;

