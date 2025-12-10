import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

/**
 * Get user profile
 */
export const getProfile = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    return user.toJSON();
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, updateData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Update allowed fields
    if (updateData.name !== undefined) {
      user.name = updateData.name.trim();
    }
    if (updateData.title !== undefined) {
      user.title = updateData.title ? updateData.title.trim() : null;
    }
    
    await user.save();
    
    return user.toJSON();
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 401;
      throw error;
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    return { success: true };
  } catch (error) {
    logger.error('Change password error:', error);
    throw error;
  }
};

