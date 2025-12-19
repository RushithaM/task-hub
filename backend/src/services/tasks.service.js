import Task from '../models/Task.js';
import { logger } from '../utils/logger.js';

/**
 * Get tasks with filters
 */
export const getTasks = async (userId, filters = {}) => {
  try {
    const { date, month, status, priority } = filters;
    
    // Build query
    const query = { userId };
    
    // Filter by date
    if (date) {
      // Handle structured date range from AI (new format)
      if (typeof date === 'object' && date.start && date.end) {
        const startDate = new Date(date.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date.end);
        endDate.setHours(23, 59, 59, 999);
        
        // Validate dates
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          query.date = { $gte: startDate, $lte: endDate };
        } else {
          logger.warn('Invalid date range from AI:', { date, start: date.start, end: date.end });
        }
      } 
      // Handle string date (backward compatibility)
      else if (typeof date === 'string') {
        // Try to parse as YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          if (!isNaN(startOfDay.getTime())) {
            query.date = { $gte: startOfDay, $lte: endOfDay };
          } else {
            logger.warn('Invalid date string format:', date);
          }
        } else {
          // Relative date string that wasn't converted by AI - log warning and skip
          logger.warn('Unsupported date filter format (should be converted by AI):', date);
        }
      }
    }
    
    // Filter by month
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }
    
    // Filter by status
    if (status) {
      if (status === 'completed') {
        query.completed = true;
      } else if (status === 'pending') {
        query.completed = false;
      } else if (status === 'in-progress') {
        // For in-progress, we can check if task has timeStart and timeEnd in the future
        // For simplicity, we'll treat it as not completed and has time
        query.completed = false;
        query.timeStart = { $exists: true, $ne: '' };
      }
    }
    
    // Filter by priority
    if (priority) {
      query.priority = priority;
    }
    
    const tasks = await Task.find(query).sort({ date: 1, timeStart: 1 });
    
    return {
      tasks: tasks.map(task => task.toJSON()),
      total: tasks.length,
    };
  } catch (error) {
    logger.error('Get tasks error:', error);
    throw error;
  }
};

/**
 * Get single task by ID
 */
export const getTaskById = async (taskId, userId) => {
  try {
    const task = await Task.findOne({ _id: taskId, userId });
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    
    return task.toJSON();
  } catch (error) {
    logger.error('Get task by ID error:', error);
    throw error;
  }
};

/**
 * Create new task
 */
export const createTask = async (taskData, userId) => {
  try {
    const task = await Task.create({
      ...taskData,
      userId,
      date: new Date(taskData.date),
    });
    
    return task.toJSON();
  } catch (error) {
    logger.error('Create task error:', error);
    throw error;
  }
};

/**
 * Update task
 */
export const updateTask = async (taskId, userId, updateData) => {
  try {
    // Check if task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, userId });
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Update fields
    if (updateData.title !== undefined) task.title = updateData.title;
    if (updateData.description !== undefined) task.description = updateData.description;
    if (updateData.priority !== undefined) task.priority = updateData.priority;
    if (updateData.timeStart !== undefined) task.timeStart = updateData.timeStart;
    if (updateData.timeEnd !== undefined) task.timeEnd = updateData.timeEnd;
    if (updateData.time !== undefined) task.time = updateData.time;
    if (updateData.referenceLinks !== undefined) task.referenceLinks = updateData.referenceLinks;
    if (updateData.date !== undefined) task.date = new Date(updateData.date);
    if (updateData.completed !== undefined) task.completed = updateData.completed;
    
    await task.save();
    
    return task.toJSON();
  } catch (error) {
    logger.error('Update task error:', error);
    throw error;
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId, userId) => {
  try {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    
    return { id: taskId };
  } catch (error) {
    logger.error('Delete task error:', error);
    throw error;
  }
};

/**
 * Toggle task completion
 */
export const toggleTaskCompletion = async (taskId, userId) => {
  try {
    const task = await Task.findOne({ _id: taskId, userId });
    
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    
    task.completed = !task.completed;
    await task.save();
    
    return {
      id: task._id.toString(),
      completed: task.completed,
    };
  } catch (error) {
    logger.error('Toggle task completion error:', error);
    throw error;
  }
};

