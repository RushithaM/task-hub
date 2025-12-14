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
 * AI-powered fallback to extract task details from natural language
 * Uses Groq to intelligently parse task information when initial intent parsing fails
 * @param {string} message - Original user message
 * @returns {Promise<Object|null>} Extracted task object or null if extraction fails
 */
const extractTaskDetailsWithAI = async (message) => {
  try {
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return null;
    }

    const client = getGroqClient();
    
    const extractionPrompt = `You are a task extraction assistant. Extract task details from the user's natural language message.

Extract the following information if mentioned:
- title (required - the main task description)
- description (optional - additional details)
- priority (optional - must be "low", "medium", or "high")
- date (optional - in YYYY-MM-DD format)
- timeStart (optional - start time if mentioned)
- timeEnd (optional - end time if mentioned)

Rules:
1. Return ONLY valid JSON, no explanations
2. If title cannot be determined, return null
3. Convert relative dates (tomorrow, today, next week) to YYYY-MM-DD format
4. Priority must be exactly "low", "medium", or "high" (default to "medium" if unclear)
5. Extract time in HH:MM format if mentioned

User message: "${message}"

Return JSON in this format:
{
  "title": "extracted title or null",
  "description": "extracted description or null",
  "priority": "low|medium|high or null",
  "date": "YYYY-MM-DD or null",
  "timeStart": "HH:MM or null",
  "timeEnd": "HH:MM or null"
}`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { 
          role: 'system', 
          content: 'You are a task extraction assistant. Extract task details from natural language and return ONLY valid JSON, no explanations.' 
        },
        { role: 'user', content: extractionPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2, // Lower temperature for more consistent extraction
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      logger.warn('AI extraction failed - no response from Groq');
      return null;
    }

    const extracted = JSON.parse(responseText);
    
    // Validate that we got at least a title
    if (!extracted.title || typeof extracted.title !== 'string' || extracted.title.trim().length === 0) {
      logger.warn('AI extraction failed - no title extracted', { extracted, message });
      return null;
    }

    // Clean and validate extracted data
    const cleaned = {
      title: extracted.title.trim(),
      description: extracted.description ? String(extracted.description).trim() : null,
      priority: ['low', 'medium', 'high'].includes(extracted.priority?.toLowerCase()) 
        ? extracted.priority.toLowerCase() 
        : null,
      date: extracted.date ? normalizeDate(String(extracted.date)) : null,
      timeStart: extracted.timeStart || null,
      timeEnd: extracted.timeEnd || null,
    };

    // Validate title length
    if (cleaned.title.length > 100) {
      cleaned.title = cleaned.title.substring(0, 100).trim();
    }

    logger.info('AI extraction successful', { cleaned, originalMessage: message });
    return cleaned;
  } catch (error) {
    logger.error('AI extraction error:', error);
    return null;
  }
};

/**
 * Normalize relative date strings to YYYY-MM-DD format
 * Handles: today, tomorrow, next week, next month, day names, etc.
 * @param {string} dateValue - Date string (relative or absolute)
 * @returns {string|null} Normalized date in YYYY-MM-DD format or null
 */
const normalizeDate = (dateValue) => {
  if (!dateValue || typeof dateValue !== 'string') {
    return null;
  }

  const lowerDate = dateValue.toLowerCase().trim();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Handle relative dates
  if (lowerDate === 'today') {
    return now.toISOString().split('T')[0];
  }

  if (lowerDate === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (lowerDate === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Handle "next week", "next month"
  if (lowerDate.includes('next week')) {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }

  if (lowerDate.includes('next month')) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  }

  // Handle day names (Monday, Tuesday, etc.)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.findIndex(day => lowerDate.includes(day));
  if (dayIndex !== -1) {
    const targetDay = new Date(now);
    const currentDay = now.getDay();
    let daysToAdd = dayIndex - currentDay;
    
    // If the day has passed this week, get next week's occurrence
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    targetDay.setDate(targetDay.getDate() + daysToAdd);
    return targetDay.toISOString().split('T')[0];
  }

  // Try parsing as absolute date
  try {
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  } catch (e) {
    // Continue to return null
  }

  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  return null;
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

  // Date validation and normalization
  if (taskData.date) {
    // First try to normalize relative dates
    const normalizedDate = normalizeDate(String(taskData.date));
    
    if (normalizedDate) {
      validated.date = normalizedDate;
    } else {
      // If normalization fails, try parsing as absolute date
      const date = new Date(taskData.date);
      if (isNaN(date.getTime())) {
        logger.warn('Date normalization failed, using default date', {
          originalDate: taskData.date,
          taskData,
        });
        // Don't throw error, just use today's date as fallback
        validated.date = new Date().toISOString().split('T')[0];
      } else {
        validated.date = date.toISOString().split('T')[0];
      }
    }
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
        // Log payload structure for debugging
        logger.debug('Create task - payload received:', {
          hasPayload: !!payload,
          hasTask: !!payload.task,
          taskKeys: payload.task ? Object.keys(payload.task) : [],
          taskTitle: payload.task?.title,
          taskTitleType: typeof payload.task?.title,
          fullPayload: payload,
          originalMessage: message,
        });

        // Ensure payload.task exists
        if (!payload.task) {
          payload.task = {};
        }

        // If title is missing, try AI-powered fallback extraction
        if (!payload.task.title || (typeof payload.task.title === 'string' && payload.task.title.trim().length === 0)) {
          logger.warn('AI failed to extract task title, attempting AI-powered fallback extraction', {
            originalMessage: message,
            taskObject: payload.task,
          });
          
          const extractedDetails = await extractTaskDetailsWithAI(message);
          if (extractedDetails && extractedDetails.title) {
            logger.info('AI fallback extraction successful', {
              extractedDetails,
              originalMessage: message,
            });
            // Merge extracted details into payload.task, prioritizing extracted values
            payload.task = {
              ...extractedDetails,
              ...payload.task, // Keep any existing fields from initial parsing
              title: extractedDetails.title, // Ensure title is set
            };
          } else {
            logger.error('Create task failed - missing title (AI and fallback both failed):', {
              payload,
              originalMessage: message,
              taskObject: payload.task,
            });
            throw new Error('Task title is required to create a task. Please specify what task you want to create.');
          }
        }

        // Normalize date before validation (handle relative dates like "today", "tomorrow")
        if (payload.task.date) {
          const normalizedDate = normalizeDate(String(payload.task.date));
          if (normalizedDate) {
            payload.task.date = normalizedDate;
          } else {
            logger.warn('Date normalization failed, will use default date', {
              originalDate: payload.task.date,
              task: payload.task,
            });
          }
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
          logger.error('Update task failed - missing taskId:', {
            payload,
            originalMessage: message,
          });
          throw new Error('Task ID is required to update a task. Please specify which task you want to update.');
        }

        // Validate taskId format
        if (!mongoose.Types.ObjectId.isValid(payload.taskId)) {
          logger.error('Update task failed - invalid taskId format:', {
            taskId: payload.taskId,
            originalMessage: message,
          });
          throw new Error(`Invalid task ID format: "${payload.taskId}". Task IDs must be valid MongoDB ObjectIds.`);
        }

        // Validate and normalize update data
        const validatedUpdate = validateTaskData(payload.task || {});
        
        if (Object.keys(validatedUpdate).length === 0) {
          logger.error('Update task failed - no valid fields provided:', {
            payload,
            originalMessage: message,
            taskObject: payload.task,
          });
          throw new Error('No valid fields provided for update. Please specify what you want to change about the task.');
        }

        result = await taskService.updateTask(payload.taskId, userId, validatedUpdate);
        response = await formatResponse(intent, result, message);
        break;
      }

      case 'delete_task': {
        if (!payload.taskId) {
          logger.error('Delete task failed - missing taskId:', {
            payload,
            originalMessage: message,
          });
          throw new Error('Task ID is required to delete a task. Please specify which task you want to delete.');
        }

        // Validate taskId format
        if (!mongoose.Types.ObjectId.isValid(payload.taskId)) {
          logger.error('Delete task failed - invalid taskId format:', {
            taskId: payload.taskId,
            originalMessage: message,
          });
          throw new Error(`Invalid task ID format: "${payload.taskId}". Task IDs must be valid MongoDB ObjectIds.`);
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
        logger.error('Unsupported intent received:', {
          intent,
          payload,
          originalMessage: message,
        });
        throw new Error(`Unsupported intent: "${intent}". Supported intents are: list_tasks, create_task, update_task, delete_task, summarize_tasks, task_suggestions.`);
    }

    return {
      response,
      intent,
      result,
    };
  } catch (error) {
    logger.error('AI ask error:', {
      message: error.message,
      stack: error.stack,
      originalUserMessage: message,
      userId,
    });
    throw error;
  }
};

