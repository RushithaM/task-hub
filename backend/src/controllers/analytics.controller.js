import * as analyticsService from '../services/analytics.service.js';

/**
 * Get overview controller
 */
export const getOverview = async (req, res, next) => {
  try {
    const month = req.query.month || null;
    const data = await analyticsService.getOverview(req.user.id, month);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task status controller
 */
export const getTaskStatus = async (req, res, next) => {
  try {
    const month = req.query.month || null;
    const data = await analyticsService.getTaskStatus(req.user.id, month);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get weekly distribution controller
 */
export const getWeeklyDistribution = async (req, res, next) => {
  try {
    const week = req.query.week || null;
    const data = await analyticsService.getWeeklyDistribution(req.user.id, week);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get priority distribution controller
 */
export const getPriorityDistribution = async (req, res, next) => {
  try {
    const month = req.query.month || null;
    const data = await analyticsService.getPriorityDistribution(req.user.id, month);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly trend controller
 */
export const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 9;
    const data = await analyticsService.getMonthlyTrend(req.user.id, months);
    
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

