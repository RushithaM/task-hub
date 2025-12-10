/**
 * Validation utility functions
 * Simple validation helpers for request data
 */

export const validateEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const validatePriority = (priority) => {
  return ['low', 'medium', 'high'].includes(priority);
};

export const validateStatus = (status) => {
  return ['completed', 'pending', 'in-progress'].includes(status);
};

export const validateURL = (url) => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

