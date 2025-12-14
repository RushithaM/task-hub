/**
 * Error classification utilities
 * Categorizes errors and provides user-friendly messages
 */

/**
 * Error categories
 */
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  VALIDATION: 'validation',
  RATE_LIMIT: 'rate_limit',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  TIMEOUT: 'timeout',
  INVALID_RESPONSE: 'invalid_response',
  UNKNOWN: 'unknown',
};

/**
 * Classify an error into a category
 * @param {Error} error - Error to classify
 * @returns {string} Error category
 */
export const classifyError = (error) => {
  if (!error) {
    return ERROR_CATEGORIES.UNKNOWN;
  }

  // Check HTTP status codes
  const status = error.status || error.statusCode || error.response?.status;
  
  if (status) {
    if (status === 401 || status === 403) {
      return ERROR_CATEGORIES.AUTHENTICATION;
    }
    if (status === 400 || status === 422) {
      return ERROR_CATEGORIES.VALIDATION;
    }
    if (status === 429) {
      return ERROR_CATEGORIES.RATE_LIMIT;
    }
    if (status === 503 || status === 502 || status === 504) {
      return ERROR_CATEGORIES.SERVICE_UNAVAILABLE;
    }
    if (status === 408) {
      return ERROR_CATEGORIES.TIMEOUT;
    }
  }

  // Check error codes
  const errorCode = error.code;
  if (errorCode) {
    const networkCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN'];
    if (networkCodes.includes(errorCode)) {
      return ERROR_CATEGORIES.NETWORK;
    }
  }

  // Check error message
  const errorMessage = (error.message || '').toLowerCase();
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return ERROR_CATEGORIES.TIMEOUT;
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return ERROR_CATEGORIES.NETWORK;
  }
  
  if (errorMessage.includes('invalid json') || errorMessage.includes('parse')) {
    return ERROR_CATEGORIES.INVALID_RESPONSE;
  }
  
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return ERROR_CATEGORIES.RATE_LIMIT;
  }
  
  if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
    return ERROR_CATEGORIES.AUTHENTICATION;
  }

  // Check error name
  if (error.name === 'TimeoutError') {
    return ERROR_CATEGORIES.TIMEOUT;
  }
  
  if (error.name === 'NetworkError' || error.name === 'FetchError') {
    return ERROR_CATEGORIES.NETWORK;
  }

  return ERROR_CATEGORIES.UNKNOWN;
};

/**
 * Get user-friendly error message based on error category and context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context (e.g., intent, operation)
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (error, context = {}) => {
  const category = classifyError(error);
  const { intent, operation } = context;

  switch (category) {
    case ERROR_CATEGORIES.NETWORK:
      return "I'm having trouble connecting to the service. Please check your internet connection and try again.";

    case ERROR_CATEGORIES.SERVICE_UNAVAILABLE:
      return "I'm having trouble processing your request right now. Please try again in a moment.";

    case ERROR_CATEGORIES.TIMEOUT:
      return "The request took too long. Please try again.";

    case ERROR_CATEGORIES.RATE_LIMIT:
      return "I'm receiving too many requests. Please wait a moment and try again.";

    case ERROR_CATEGORIES.AUTHENTICATION:
      return "There was an authentication issue. Please sign in again.";

    case ERROR_CATEGORIES.INVALID_RESPONSE:
      if (intent === 'create_task') {
        return "I received an unexpected response while creating your task. Please try rephrasing your request.";
      }
      if (intent === 'update_task') {
        return "I received an unexpected response while updating your task. Please try again.";
      }
      if (intent === 'delete_task') {
        return "I received an unexpected response while deleting your task. Please try again.";
      }
      return "I received an unexpected response. Please try rephrasing your request.";

    case ERROR_CATEGORIES.VALIDATION:
      if (intent === 'create_task') {
        return "I couldn't understand the task details. Please provide a clear task title and try again.";
      }
      if (intent === 'update_task') {
        return "I couldn't understand what you want to update. Please specify the changes clearly.";
      }
      return "I couldn't understand that request. Could you rephrase it?";

    case ERROR_CATEGORIES.UNKNOWN:
    default:
      if (intent === 'create_task') {
        return "I had trouble creating that task. Please check the details and try again.";
      }
      if (intent === 'update_task') {
        return "I had trouble updating that task. Please try again.";
      }
      if (intent === 'delete_task') {
        return "I had trouble deleting that task. Please try again.";
      }
      if (intent === 'list_tasks') {
        return "I couldn't retrieve your tasks. Please try again.";
      }
      return "I couldn't understand that request. Could you rephrase it?";
  }
};

/**
 * Get fallback suggestions based on error context
 * @param {string} category - Error category
 * @param {Object} context - Additional context
 * @returns {Array<string>} Array of suggestion messages
 */
export const getFallbackSuggestions = (category, context = {}) => {
  const { intent } = context;
  const suggestions = [];

  if (category === ERROR_CATEGORIES.INVALID_RESPONSE || category === ERROR_CATEGORIES.VALIDATION) {
    if (intent === 'create_task') {
      suggestions.push("Try: 'Create a task to [your task description]'");
      suggestions.push("Example: 'Add a task to review the project proposal tomorrow'");
    } else if (intent === 'list_tasks') {
      suggestions.push("Try: 'Show me my tasks' or 'List all pending tasks'");
    } else if (intent === 'update_task') {
      suggestions.push("Try: 'Update task [ID] to [new details]'");
    }
  }

  if (category === ERROR_CATEGORIES.NETWORK || category === ERROR_CATEGORIES.SERVICE_UNAVAILABLE) {
    suggestions.push("Wait a few seconds and try again");
    suggestions.push("Check your internet connection");
  }

  if (suggestions.length === 0) {
    suggestions.push("Please try rephrasing your request");
    suggestions.push("Make sure you're using a supported command");
  }

  return suggestions;
};

