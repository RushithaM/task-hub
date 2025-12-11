import { getGroqClient } from './groqClient.js';
import { INTENT_SYSTEM_PROMPT, buildUserPrompt } from './prompts.js';
import { logger } from '../../utils/logger.js';
import Task from '../../models/Task.js';

/**
 * Supported intent types
 */
const SUPPORTED_INTENTS = [
  'list_tasks',
  'create_task',
  'update_task',
  'delete_task',
  'summarize_tasks',
  'task_suggestions',
];

/**
 * Parse user's natural language input into structured intent
 * @param {string} userText - User's natural language input
 * @param {string} userId - User ID for context
 * @returns {Promise<Object>} Parsed intent object with intent and payload
 */
export const parseIntent = async (userText, userId) => {
  try {
    if (!userText || typeof userText !== 'string' || userText.trim().length === 0) {
      throw new Error('User text is required and must be a non-empty string');
    }

    // Get user's recent tasks for context
    const recentTasks = await Task.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title priority completed date')
      .lean();

    const context = { recentTasks };
    const userPrompt = buildUserPrompt(userText, context);

    const client = getGroqClient();

    // Call Groq API
    // Using llama-3.3-70b-versatile (replacement for deprecated llama-3.1-70b-versatile)
    // Alternative models: llama-3.1-8b-instant, mixtral-8x7b-32768
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: INTENT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from Groq API');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('Failed to parse Groq JSON response:', parseError);
      logger.error('Response text:', responseText);
      throw new Error('Invalid JSON response from AI service');
    }

    // Validate intent
    const intent = parsedResponse.intent;
    if (!intent || !SUPPORTED_INTENTS.includes(intent)) {
      logger.warn('Unsupported or missing intent:', intent);
      throw new Error(`Unsupported intent: ${intent || 'missing'}`);
    }

    // Normalize payload
    const payload = {
      filters: parsedResponse.filters || {},
      task: parsedResponse.task || {},
      taskId: parsedResponse.taskId || null,
      notes: parsedResponse.notes || '',
    };

    return {
      intent,
      payload,
    };
  } catch (error) {
    logger.error('Intent parsing error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.response && { response: error.response }),
      ...(error.status && { status: error.status }),
    });
    
    // Re-throw with context if it's not already a known error
    if (error.message.includes('GROQ_API_KEY') || 
        error.message.includes('Invalid JSON') ||
        error.message.includes('Unsupported intent') ||
        error.message.includes('No response from Groq API')) {
      throw error;
    }
    
    // Include original error message for debugging
    const errorMessage = error.message || 'Unknown error';
    throw new Error(`Failed to parse user intent: ${errorMessage}. Please try again.`);
  }
};

