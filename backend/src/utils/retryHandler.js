/**
 * Retry handler with exponential backoff
 * Handles retries for transient failures in AI service calls
 */

import { logger } from './logger.js';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
  baseDelay: parseInt(process.env.AI_RETRY_BASE_DELAY || '500', 10),
  maxDelay: parseInt(process.env.AI_RETRY_MAX_DELAY || '5000', 10),
  jitter: true,
};

/**
 * Calculate exponential backoff delay with optional jitter
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay cap in milliseconds
 * @param {boolean} jitter - Whether to add random jitter
 * @returns {number} Delay in milliseconds
 */
export const calculateBackoffDelay = (attempt, baseDelay, maxDelay, jitter = true) => {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Cap at maxDelay
  const delay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter (random value between 0 and 20% of delay) to prevent thundering herd
  if (jitter) {
    const jitterAmount = Math.random() * delay * 0.2;
    return Math.floor(delay + jitterAmount);
  }
  
  return Math.floor(delay);
};

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is retryable
 */
export const isRetryableError = (error) => {
  if (!error) {
    return false;
  }

  // Network errors - retryable
  const networkErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN'];
  if (error.code && networkErrorCodes.includes(error.code)) {
    return true;
  }

  // HTTP status codes
  const status = error.status || error.statusCode || error.response?.status;
  
  if (status) {
    // Rate limit - retryable
    if (status === 429) {
      return true;
    }
    
    // Service unavailable - retryable
    if (status === 503 || status === 502 || status === 504) {
      return true;
    }
    
    // Timeout - retryable
    if (status === 408) {
      return true;
    }
    
    // Non-retryable errors
    if ([400, 401, 403, 404, 422].includes(status)) {
      return false;
    }
  }

  // Check error message for timeout indicators
  const errorMessage = error.message?.toLowerCase() || '';
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return true;
  }

  // Check error type
  if (error.name === 'TimeoutError' || error.name === 'NetworkError') {
    return true;
  }

  // Default: non-retryable for unknown errors
  return false;
};

/**
 * Sleep/delay utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 500)
 * @param {number} options.maxDelay - Maximum delay cap in milliseconds (default: 5000)
 * @param {boolean} options.jitter - Whether to add jitter (default: true)
 * @param {Function} options.shouldRetry - Custom function to determine if error is retryable
 * @param {string} options.operationName - Name of operation for logging (optional)
 * @returns {Promise<any>} Result of the function
 * @throws {Error} Last error if all retries fail
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const config = {
    ...DEFAULT_RETRY_CONFIG,
    ...options,
  };

  const {
    maxRetries,
    baseDelay,
    maxDelay,
    jitter,
    shouldRetry = isRetryableError,
    operationName = 'operation',
  } = config;

  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      
      // Log successful retry if it wasn't the first attempt
      if (attempt > 0) {
        logger.info(`Retry successful for ${operationName} after ${attempt} attempt(s)`, {
          operation: operationName,
          attempts: attempt + 1,
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = shouldRetry(error);
      
      // If not retryable or we've exhausted retries, throw
      if (!isRetryable || attempt >= maxRetries) {
        if (!isRetryable) {
          logger.debug(`Non-retryable error for ${operationName}, not retrying`, {
            operation: operationName,
            error: error.message,
            errorCode: error.code,
            status: error.status || error.statusCode,
          });
        } else {
          logger.warn(`All retries exhausted for ${operationName}`, {
            operation: operationName,
            attempts: attempt + 1,
            error: error.message,
            errorCode: error.code,
            status: error.status || error.statusCode,
          });
        }
        throw error;
      }
      
      // Calculate delay for next attempt
      const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay, jitter);
      
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} for ${operationName}`, {
        operation: operationName,
        attempt: attempt + 1,
        maxRetries,
        delay,
        error: error.message,
        errorCode: error.code,
        status: error.status || error.statusCode,
      });
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  // This should never be reached, but just in case
  throw lastError;
};

