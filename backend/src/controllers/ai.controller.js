import * as aiService from '../services/ai.service.js';

/**
 * AI chat controller
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

