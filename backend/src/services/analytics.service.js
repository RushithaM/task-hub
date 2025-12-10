import Task from '../models/Task.js';
import { logger } from '../utils/logger.js';

/**
 * Get analytics overview
 */
export const getOverview = async (userId, month = null) => {
  try {
    let startDate, endDate;
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    } else {
      // Current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    const tasks = await Task.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const inProgressTasks = tasks.filter(t => !t.completed && t.timeStart).length;
    const pendingTasks = tasks.filter(t => !t.completed && !t.timeStart).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // AI suggestions - placeholder (can be enhanced later)
    const aiSuggestions = Math.floor(totalTasks * 0.4); // 40% of tasks as placeholder
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      highPriorityTasks,
      completionRate,
      aiSuggestions,
    };
  } catch (error) {
    logger.error('Get overview error:', error);
    throw error;
  }
};

/**
 * Get task status distribution
 */
export const getTaskStatus = async (userId, month = null) => {
  try {
    let startDate, endDate;
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    const tasks = await Task.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => !t.completed && t.timeStart).length;
    const pending = tasks.filter(t => !t.completed && !t.timeStart).length;
    
    const percentages = total > 0 ? {
      completed: Math.round((completed / total) * 100),
      inProgress: Math.round((inProgress / total) * 100),
      pending: Math.round((pending / total) * 100),
    } : { completed: 0, inProgress: 0, pending: 0 };
    
    return {
      completed,
      inProgress,
      pending,
      percentages,
    };
  } catch (error) {
    logger.error('Get task status error:', error);
    throw error;
  }
};

/**
 * Get weekly distribution
 */
export const getWeeklyDistribution = async (userId, week = null) => {
  try {
    let startDate, endDate;
    
    if (week) {
      // Parse ISO week format (YYYY-WW)
      const [year, weekNum] = week.split('-W').map(Number);
      const date = new Date(year, 0, 1 + (weekNum - 1) * 7);
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
      startDate = new Date(date.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Current week
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }
    
    const tasks = await Task.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });
    
    // Group by day
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const distribution = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.toISOString().split('T')[0] === dateStr;
      });
      
      distribution.push({
        day: days[i],
        date: dateStr,
        count: dayTasks.length,
      });
    }
    
    const total = tasks.length;
    const weekStr = week || `${startDate.getFullYear()}-W${Math.ceil((startDate.getDate() + new Date(startDate.getFullYear(), 0, 1).getDay()) / 7)}`;
    
    return {
      week: weekStr,
      distribution,
      total,
    };
  } catch (error) {
    logger.error('Get weekly distribution error:', error);
    throw error;
  }
};

/**
 * Get priority distribution
 */
export const getPriorityDistribution = async (userId, month = null) => {
  try {
    let startDate, endDate;
    
    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    
    const tasks = await Task.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });
    
    const total = tasks.length;
    const high = tasks.filter(t => t.priority === 'high').length;
    const medium = tasks.filter(t => t.priority === 'medium').length;
    const low = tasks.filter(t => t.priority === 'low').length;
    
    return {
      high: {
        count: high,
        percentage: total > 0 ? Math.round((high / total) * 100) : 0,
      },
      medium: {
        count: medium,
        percentage: total > 0 ? Math.round((medium / total) * 100) : 0,
      },
      low: {
        count: low,
        percentage: total > 0 ? Math.round((low / total) * 100) : 0,
      },
      total,
    };
  } catch (error) {
    logger.error('Get priority distribution error:', error);
    throw error;
  }
};

/**
 * Get monthly trend
 */
export const getMonthlyTrend = async (userId, months = 9) => {
  try {
    const now = new Date();
    const trend = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      const tasks = await Task.find({
        userId,
        date: { $gte: startDate, $lte: endDate },
        completed: true,
      });
      
      trend.push({
        month: monthStr,
        completed: tasks.length,
      });
    }
    
    const currentMonth = trend[trend.length - 1];
    const previousMonth = trend.length > 1 ? trend[trend.length - 2] : { completed: 0 };
    
    const currentCount = currentMonth.completed;
    const previousMonthCount = previousMonth.completed;
    const change = previousMonthCount > 0 
      ? Math.round(((currentCount - previousMonthCount) / previousMonthCount) * 100)
      : 0;
    
    return {
      trend,
      currentMonth: currentMonth.month,
      currentCount,
      previousMonthCount,
      change,
    };
  } catch (error) {
    logger.error('Get monthly trend error:', error);
    throw error;
  }
};

