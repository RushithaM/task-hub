import * as authService from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

/**
 * Sign up controller
 */
export const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sign in controller
 */
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signin(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout controller
 * Note: With JWT, logout is typically handled client-side by removing the token
 * This endpoint can be used for logging purposes or token blacklisting if needed
 */
export const logout = async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // This endpoint can be used for logging or future token blacklisting
  logger.info(`User ${req.user.id} logged out`);
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Get current user controller
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

