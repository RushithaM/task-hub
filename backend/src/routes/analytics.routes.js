import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Analytics routes
router.get('/overview', analyticsController.getOverview);
router.get('/task-status', analyticsController.getTaskStatus);
router.get('/weekly-distribution', analyticsController.getWeeklyDistribution);
router.get('/priority-distribution', analyticsController.getPriorityDistribution);
router.get('/monthly-trend', analyticsController.getMonthlyTrend);

export default router;

