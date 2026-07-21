import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 📊 ANALYTICS API SERVICE LAYER
// ==========================================

/**
 * Get dashboard summary (all stats in one call)
 * @returns {Promise<Object>} Dashboard summary data
 */
export const getDashboardSummary = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/dashboard/summary`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch dashboard summary`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getDashboardSummary error:', error.message);
    throw error;
  }
};

/**
 * Get project statistics
 * @returns {Promise<Object>} Project statistics
 */
export const getProjectStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/projects/stats`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project statistics`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectStats error:', error.message);
    throw error;
  }
};

/**
 * Get worker statistics
 * @returns {Promise<Object>} Worker statistics
 */
export const getWorkerStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/workers/stats`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch worker statistics`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getWorkerStats error:', error.message);
    throw error;
  }
};

/**
 * Get task statistics
 * @returns {Promise<Object>} Task statistics
 */
export const getTaskStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/tasks/stats`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch task statistics`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getTaskStats error:', error.message);
    throw error;
  }
};

/**
 * Get milestone statistics
 * @returns {Promise<Object>} Milestone statistics
 */
export const getMilestoneStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/milestones/stats`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch milestone statistics`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getMilestoneStats error:', error.message);
    throw error;
  }
};

/**
 * Get project progress data for charts
 * @returns {Promise<Array>} Project progress data
 */
export const getProjectProgressData = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/project-progress`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project progress data`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectProgressData error:', error.message);
    throw error;
  }
};

/**
 * Get task completion trends
 * @returns {Promise<Array>} Task completion trends
 */
export const getTaskCompletionTrends = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/task-completion`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch task completion trends`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getTaskCompletionTrends error:', error.message);
    throw error;
  }
};

/**
 * Get worker productivity metrics
 * @returns {Promise<Array>} Worker productivity data
 */
export const getWorkerProductivity = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/worker-productivity`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch worker productivity`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getWorkerProductivity error:', error.message);
    throw error;
  }
};

/**
 * Get project status distribution
 * @returns {Promise<Array>} Project status distribution
 */
export const getProjectStatusDistribution = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/project-status`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project status distribution`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectStatusDistribution error:', error.message);
    throw error;
  }
};

/**
 * Get milestone progress data
 * @returns {Promise<Array>} Milestone progress data
 */
export const getMilestoneProgressData = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/milestone-progress`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch milestone progress data`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getMilestoneProgressData error:', error.message);
    throw error;
  }
};

/**
 * Get attendance statistics
 * @returns {Promise<Object>} Attendance statistics with daily stats
 */
export const getAttendanceStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/attendance/stats`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch attendance statistics`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getAttendanceStats error:', error.message);
    throw error;
  }
};

/**
 * Get project progress by phase (Planning, Foundation, Structure, Finishing, Completed)
 * @returns {Promise<Object>} Project progress data with chart format
 */
export const getProjectProgressByPhase = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/project-progress/phases`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project progress by phase`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectProgressByPhase error:', error.message);
    throw error;
  }
};

/**
 * Get project status chart data
 * @returns {Promise<Object>} Project status distribution with chart format
 */
export const getProjectStatusChart = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/project-status/chart`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project status chart`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectStatusChart error:', error.message);
    throw error;
  }
};

/**
 * Get worker distribution data
 * @returns {Promise<Object>} Worker distribution with chart format
 */
export const getWorkerDistribution = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/worker-distribution`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch worker distribution`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getWorkerDistribution error:', error.message);
    throw error;
  }
};

/**
 * Get task distribution data
 * @returns {Promise<Object>} Task distribution with chart format
 */
export const getTaskDistribution = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/task-distribution`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch task distribution`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getTaskDistribution error:', error.message);
    throw error;
  }
};

/**
 * Get milestone chart data
 * @returns {Promise<Object>} Milestone progress with chart format
 */
export const getMilestoneChart = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/milestone-progress/chart`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch milestone chart`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getMilestoneChart error:', error.message);
    throw error;
  }
};

/**
 * Get top workers productivity data
 * @returns {Promise<Object>} Top 10 workers with chart format
 */
export const getTopWorkers = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/worker-productivity/top`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch top workers`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getTopWorkers error:', error.message);
    throw error;
  }
};

/**
 * Get project comparison data
 * @returns {Promise<Object>} All projects with progress for comparison
 */
export const getProjectComparison = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/project-comparison`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project comparison`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectComparison error:', error.message);
    throw error;
  }
};

/**
 * Get attendance trend for last 7 days
 * @returns {Promise<Object>} Attendance trend with chart format
 */
export const getAttendanceTrend = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/attendance/trend`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch attendance trend`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getAttendanceTrend error:', error.message);
    throw error;
  }
};

/**
 * Get budget analytics
 * @returns {Promise<Object>} Budget KPIs
 */
export const getBudgetAnalytics = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/budget`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch budget analytics`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getBudgetAnalytics error:', error.message);
    throw error;
  }
};

/**
 * Get recent activities with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Activities with pagination
 */
export const getRecentActivities = async (page = 1, limit = 10) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/recent-activities?page=${page}&limit=${limit}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch recent activities`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getRecentActivities error:', error.message);
    throw error;
  }
};

/**
 * Get upcoming deadlines
 * @returns {Promise<Array>} Upcoming deadlines
 */
export const getUpcomingDeadlines = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/analytics/upcoming-deadlines`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch upcoming deadlines`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getUpcomingDeadlines error:', error.message);
    throw error;
  }
};
