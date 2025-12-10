import * as tasksService from '../services/tasks.service.js';
import { logger } from '../utils/logger.js';

/**
 * Get tasks controller
 */
export const getTasks = async (req, res, next) => {
  try {
    const filters = {
      date: req.query.date,
      month: req.query.month,
      status: req.query.status,
      priority: req.query.priority,
    };
    
    const result = await tasksService.getTasks(req.user.id, filters);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task controller
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await tasksService.getTaskById(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create task controller
 */
export const createTask = async (req, res, next) => {
  try {
    const task = await tasksService.createTask(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task controller
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = await tasksService.updateTask(req.params.id, req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete task controller
 */
export const deleteTask = async (req, res, next) => {
  try {
    await tasksService.deleteTask(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle task completion controller
 */
export const toggleTaskCompletion = async (req, res, next) => {
  try {
    const result = await tasksService.toggleTaskCompletion(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Task completion toggled',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

