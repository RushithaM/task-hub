import express from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.json({ message: 'Server running' });
});

// Health check route
router.get('/api/health', getHealth);

// Import and use other route modules
import authRoutes from './auth.routes.js';
import taskRoutes from './tasks.routes.js';
import analyticsRoutes from './analytics.routes.js';
import userRoutes from './user.routes.js';
import aiRoutes from './ai.routes.js';

router.use('/api/auth', authRoutes);
router.use('/api/tasks', taskRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/user', userRoutes);
router.use('/api/ai', aiRoutes);

export default router;

