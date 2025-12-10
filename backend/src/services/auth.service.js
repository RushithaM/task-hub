import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

/**
 * Sign up a new user
 */
export const signup = async (userData) => {
  try {
    const { name, email, password, title } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      title: title || null,
    });

    // Generate token
    const token = generateToken({ id: user._id.toString() });

    // Return user data (password excluded by toJSON)
    const userObj = user.toJSON();

    return {
      user: userObj,
      token,
    };
  } catch (error) {
    logger.error('Signup error:', error);
    throw error;
  }
};

/**
 * Sign in an existing user
 */
export const signin = async (email, password) => {
  try {
    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken({ id: user._id.toString() });

    // Return user data (password excluded by toJSON)
    const userObj = user.toJSON();

    return {
      user: userObj,
      token,
    };
  } catch (error) {
    logger.error('Signin error:', error);
    throw error;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user.toJSON();
  } catch (error) {
    logger.error('Get current user error:', error);
    throw error;
  }
};

