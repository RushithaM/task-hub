import express from 'express';
import * as tasksController from '../controllers/tasks.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateTask } from '../middlewares/validation.middleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Task routes
router.get('/', tasksController.getTasks);
router.get('/:id', tasksController.getTaskById);
router.post('/', validateTask, tasksController.createTask);
router.put('/:id', validateTask, tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);
router.patch('/:id/complete', tasksController.toggleTaskCompletion);

export default router;

