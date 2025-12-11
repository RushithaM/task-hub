import { logger } from '../utils/logger.js';
import Task from '../models/Task.js';
import { parseIntent } from './ai/intentService.js';
import * as taskService from './tasks.service.js';
import * as analyticsService from './analytics.service.js';
import { getGroqClient } from './ai/groqClient.js';
import { FORMAT_RESPONSE_PROMPT } from './ai/prompts.js';
import mongoose from 'mongoose';

/**
 * AI chat service (legacy - kept for backward compatibility)
 * Placeholder implementation - can be enhanced with actual AI integration
 */
export const chat = async (userId, message) => {
  try {
    // Get user's recent tasks for context
    const recentTasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title priority completed date');
    
    // Placeholder AI response
    // In production, this would integrate with an AI service (OpenAI, Anthropic, etc.)
    let response = "I'm your AI Task Assistant. I can help you organize, prioritize, and manage your tasks efficiently. ";
    
    const suggestions = [];
    
    // Simple rule-based suggestions based on tasks
    if (recentTasks.length > 0) {
      const incompleteTasks = recentTasks.filter(t => !t.completed);
      const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
      
      if (highPriorityTasks.length > 0) {
        suggestions.push({
          type: 'task_optimization',
          message: `You have ${highPriorityTasks.length} high-priority task(s) pending. Consider focusing on these first.`,
        });
      }
      
      if (incompleteTasks.length > 5) {
        suggestions.push({
          type: 'task_organization',
          message: 'You have many pending tasks. Consider grouping similar tasks together for better efficiency.',
        });
      }
      
      response += `Based on your ${recentTasks.length} recent tasks, I can help you prioritize and organize your workload.`;
    }
    
    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('organize') || lowerMessage.includes('organize')) {
      response = "To organize your tasks effectively, I recommend:\n1. Group similar tasks together\n2. Prioritize by deadline and importance\n3. Break large tasks into smaller subtasks\n4. Schedule time blocks for focused work";
    } else if (lowerMessage.includes('priority') || lowerMessage.includes('prioritize')) {
      response = "For prioritizing tasks:\n1. Focus on high-priority items first\n2. Consider deadlines and dependencies\n3. Balance urgent vs important tasks\n4. Review and adjust priorities regularly";
    } else if (lowerMessage.includes('productivity') || lowerMessage.includes('efficient')) {
      response = "To improve productivity:\n1. Use time blocking for similar tasks\n2. Minimize context switching\n3. Take regular breaks\n4. Review and complete tasks in batches";
    }
    
    return {
      response,
      suggestions: suggestions.length > 0 ? suggestions : [
        {
          type: 'general',
          message: 'Try asking me about organizing tasks, prioritizing work, or improving productivity!',
        },
      ],
    };
  } catch (error) {
    logger.error('AI chat error:', error);
    throw error;
  }
};

/**
 * Validate task data extracted from AI
 * @param {Object} taskData - Task data to validate
 * @returns {Object} Validated and normalized task data
 */
const validateTaskData = (taskData) => {
  const validated = {};

  // Title validation
  if (taskData.title) {
    const title = String(taskData.title).trim();
    if (title.length === 0) {
      throw new Error('Task title cannot be empty');
    }
    if (title.length > 100) {
      throw new Error('Task title cannot exceed 100 characters');
    }
    validated.title = title;
  }

  // Description validation
  if (taskData.description) {
    const description = String(taskData.description).trim();
    if (description.length > 500) {
      throw new Error('Task description cannot exceed 500 characters');
    }
    validated.description = description;
  }

  // Priority validation
  if (taskData.priority) {
    const priority = String(taskData.priority).toLowerCase();
    if (!['low', 'medium', 'high'].includes(priority)) {
      throw new Error('Priority must be low, medium, or high');
    }
    validated.priority = priority;
  }

  // Date validation
  if (taskData.date) {
    const date = new Date(taskData.date);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    validated.date = date.toISOString().split('T')[0];
  }

  // Optional fields
  if (taskData.timeStart !== undefined) validated.timeStart = String(taskData.timeStart).trim();
  if (taskData.timeEnd !== undefined) validated.timeEnd = String(taskData.timeEnd).trim();
  if (taskData.time !== undefined) validated.time = String(taskData.time).trim();
  if (taskData.referenceLinks !== undefined) {
    validated.referenceLinks = Array.isArray(taskData.referenceLinks) 
      ? taskData.referenceLinks.filter(link => typeof link === 'string')
      : [];
  }
  if (taskData.completed !== undefined) {
    validated.completed = Boolean(taskData.completed);
  }

  return validated;
};

/**
 * Format response using Groq for user-friendly messages
 * @param {string} intent - The intent that was executed
 * @param {Object} result - The result of the operation
 * @param {string} originalMessage - Original user message
 * @returns {Promise<string>} Formatted response message
 */
const formatResponse = async (intent, result, originalMessage) => {
  try {
    const client = getGroqClient();
    
    let contextMessage = '';
    switch (intent) {
      case 'create_task':
        contextMessage = `Task created successfully: ${result.title || 'Untitled'}`;
        break;
      case 'update_task':
        contextMessage = `Task updated: ${result.title || 'Task'}`;
        break;
      case 'delete_task':
        contextMessage = 'Task deleted successfully';
        break;
      case 'list_tasks':
        contextMessage = `Found ${result.total || 0} task(s)`;
        break;
      case 'summarize_tasks':
        contextMessage = 'Task summary generated';
        break;
      case 'task_suggestions':
        contextMessage = 'Productivity suggestions generated';
        break;
      default:
        contextMessage = 'Operation completed';
    }

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: FORMAT_RESPONSE_PROMPT },
        { 
          role: 'user', 
          content: `User asked: "${originalMessage}"\n\nOperation: ${intent}\nResult: ${JSON.stringify(result)}\n\nGenerate a friendly, concise response message.`
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || contextMessage;
  } catch (error) {
    logger.warn('Failed to format response with Groq, using fallback:', error);
    // Fallback to simple message
    switch (intent) {
      case 'create_task':
        return `I've created the task "${result.title || 'Untitled'}" for you.`;
      case 'update_task':
        return `I've updated the task "${result.title || 'Task'}" for you.`;
      case 'delete_task':
        return `I've deleted the task for you.`;
      case 'list_tasks':
        return `I found ${result.total || 0} task(s) matching your criteria.`;
      case 'summarize_tasks':
        return `Here's a summary of your tasks.`;
      case 'task_suggestions':
        return `Here are some productivity suggestions based on your tasks.`;
      default:
        return `Operation completed successfully.`;
    }
  }
};

/**
 * Main AI service function - processes natural language and executes task operations
 * @param {string} userId - User ID
 * @param {string} message - User's natural language message
 * @returns {Promise<Object>} Response with formatted message and results
 */
export const ask = async (userId, message) => {
  try {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Message is required and must be a non-empty string');
    }

    // Parse intent from user message
    const { intent, payload } = await parseIntent(message, userId);

    let result = null;
    let response = '';

    // Execute action based on intent
    switch (intent) {
      case 'list_tasks': {
        const filters = payload.filters || {};
        result = await taskService.getTasks(userId, filters);
        response = await formatResponse(intent, result, message);
        break;
      }

      case 'create_task': {
        if (!payload.task || !payload.task.title) {
          throw new Error('Task title is required to create a task');
        }

        // Validate and normalize task data
        const validatedTask = validateTaskData(payload.task);
        
        // Set default date if not provided
        if (!validatedTask.date) {
          validatedTask.date = new Date().toISOString().split('T')[0];
        }

        result = await taskService.createTask(validatedTask, userId);
        response = await formatResponse(intent, result, message);
        break;
      }

      case 'update_task': {
        if (!payload.taskId) {
          throw new Error('Task ID is required to update a task');
        }

        // Validate taskId format
        if (!mongoose.Types.ObjectId.isValid(payload.taskId)) {
          throw new Error('Invalid task ID format');
        }

        // Validate and normalize update data
        const validatedUpdate = validateTaskData(payload.task || {});
        
        if (Object.keys(validatedUpdate).length === 0) {
          throw new Error('No valid fields provided for update');
        }

        result = await taskService.updateTask(payload.taskId, userId, validatedUpdate);
        response = await formatResponse(intent, result, message);
        break;
      }

      case 'delete_task': {
        if (!payload.taskId) {
          throw new Error('Task ID is required to delete a task');
        }

        // Validate taskId format
        if (!mongoose.Types.ObjectId.isValid(payload.taskId)) {
          throw new Error('Invalid task ID format');
        }

        result = await taskService.deleteTask(payload.taskId, userId);
        response = await formatResponse(intent, result, message);
        break;
      }

      case 'summarize_tasks': {
        // Get all tasks and analytics
        const allTasks = await taskService.getTasks(userId, {});
        const overview = await analyticsService.getOverview(userId);
        const status = await analyticsService.getTaskStatus(userId);
        const priority = await analyticsService.getPriorityDistribution(userId);

        result = {
          summary: {
            total: overview.totalTasks,
            completed: overview.completedTasks,
            pending: overview.pendingTasks,
            inProgress: overview.inProgressTasks,
            completionRate: overview.completionRate,
            highPriority: overview.highPriorityTasks,
          },
          status,
          priority,
          recentTasks: allTasks.tasks.slice(0, 10),
        };

        response = await formatResponse(intent, result, message);
        break;
      }

      case 'task_suggestions': {
        // Get tasks and analytics for suggestions
        const allTasks = await taskService.getTasks(userId, {});
        const overview = await analyticsService.getOverview(userId);
        
        const incompleteTasks = allTasks.tasks.filter(t => !t.completed);
        const highPriorityTasks = incompleteTasks.filter(t => t.priority === 'high');
        const overdueTasks = incompleteTasks.filter(t => {
          const taskDate = new Date(t.date);
          return taskDate < new Date() && !t.completed;
        });

        const suggestions = [];

        if (highPriorityTasks.length > 0) {
          suggestions.push({
            type: 'priority',
            message: `You have ${highPriorityTasks.length} high-priority task(s) pending. Focus on these first.`,
            tasks: highPriorityTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title })),
          });
        }

        if (overdueTasks.length > 0) {
          suggestions.push({
            type: 'overdue',
            message: `You have ${overdueTasks.length} overdue task(s). Consider rescheduling or completing them soon.`,
            tasks: overdueTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title })),
          });
        }

        if (incompleteTasks.length > 10) {
          suggestions.push({
            type: 'organization',
            message: 'You have many pending tasks. Consider breaking them into smaller tasks or grouping similar ones.',
          });
        }

        if (overview.completionRate < 50 && overview.totalTasks > 5) {
          suggestions.push({
            type: 'productivity',
            message: 'Your completion rate is below 50%. Consider focusing on completing existing tasks before adding new ones.',
          });
        }

        result = {
          suggestions: suggestions.length > 0 ? suggestions : [{
            type: 'general',
            message: 'You\'re doing great! Keep up the good work.',
          }],
          stats: {
            total: overview.totalTasks,
            completed: overview.completedTasks,
            completionRate: overview.completionRate,
          },
        };

        response = await formatResponse(intent, result, message);
        break;
      }

      default:
        throw new Error(`Unsupported intent: ${intent}`);
    }

    return {
      response,
      intent,
      result,
    };
  } catch (error) {
    logger.error('AI ask error:', error);
    throw error;
  }
};

