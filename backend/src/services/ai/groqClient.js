import OpenAI from 'openai';
import { logger } from '../../utils/logger.js';

/**
 * Groq API client instance
 * Uses OpenAI SDK with Groq's base URL
 */
let client = null;

/**
 * Get or create Groq client instance
 * @returns {OpenAI} Groq client instance
 */
export const getGroqClient = () => {
  if (client) {
    return client;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    logger.error('GROQ_API_KEY is not set in environment variables');
    throw new Error('GROQ_API_KEY is required but not configured');
  }

  client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  return client;
};

/**
 * Reset client instance (useful for testing)
 */
export const resetClient = () => {
  client = null;
};


