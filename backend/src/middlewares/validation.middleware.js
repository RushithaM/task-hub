import { validateEmail, validatePassword, validateDate, validatePriority, validateURL } from '../utils/validation.js';

/**
 * Validation middleware factory
 * Creates validation middleware for specific request types
 */

export const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || !validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateSignin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateTask = (req, res, next) => {
  const { title, date, priority, referenceLinks } = req.body;
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Task title is required');
  } else if (title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  if (req.body.description && req.body.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  if (date && !validateDate(date)) {
    errors.push('Valid date is required (YYYY-MM-DD format)');
  }

  if (priority && !validatePriority(priority)) {
    errors.push('Priority must be low, medium, or high');
  }

  if (referenceLinks && Array.isArray(referenceLinks)) {
    const invalidLinks = referenceLinks.filter(link => !validateURL(link));
    if (invalidLinks.length > 0) {
      errors.push('Invalid URL(s) in reference links');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required');
  }

  if (!newPassword || !validatePassword(newPassword)) {
    errors.push('New password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { name, title } = req.body;
  const errors = [];

  if (name !== undefined && (!name || name.trim().length === 0)) {
    errors.push('Name cannot be empty');
  }

  if (title !== undefined && title && title.trim().length === 0) {
    errors.push('Title cannot be empty');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

