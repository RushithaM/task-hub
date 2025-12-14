import * as aiService from '../services/ai.service.js';

/**
 * AI chat controller (legacy - kept for backward compatibility)
 */
export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }
    
    const data = await aiService.chat(req.user.id, message);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI ask controller - main endpoint for natural language task management
 */
export const ask = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string',
      });
    }
    
    const data = await aiService.ask(req.user.id, message);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    // Handle enhanced errors with suggestions
    if (error.suggestions && error.category) {
      // Return user-friendly error with suggestions
      return res.status(500).json({
        success: false,
        message: error.message || 'An error occurred while processing your request',
        error: error.category,
        suggestions: error.suggestions,
      });
    }
    
    // Fallback to standard error handling
    next(error);
  }
};

