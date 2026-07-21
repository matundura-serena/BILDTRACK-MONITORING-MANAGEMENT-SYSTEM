import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 📋 TASK API SERVICE LAYER
// ==========================================

/**
 * Fetch all tasks with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of tasks
 */
export const getTasks = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.search) queryString.append('search', params.search);
    if (params.status) queryString.append('status', params.status);
    if (params.priority) queryString.append('priority', params.priority);
    if (params.project_id) queryString.append('project_id', params.project_id);
    if (params.milestone_id) queryString.append('milestone_id', params.milestone_id);
    if (params.assigned_worker_id) queryString.append('assigned_worker_id', params.assigned_worker_id);
    if (params.sort) queryString.append('sort', params.sort);
    if (params.order) queryString.append('order', params.order);

    const url = `${API_BASE_URL}/api/tasks${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch tasks`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getTasks error:', error.message);
    throw error;
  }
};

/**
 * Fetch single task by ID
 * @param {number|string} id - Task ID
 * @returns {Promise<Object>} Task object
 */
export const getTaskById = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Task not found`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getTaskById error:', error.message);
    throw error;
  }
};

/**
 * Create new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to create task`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ createTask error:', error.message);
    throw error;
  }
};

/**
 * Update task
 * @param {number|string} id - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to update task`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ updateTask error:', error.message);
    throw error;
  }
};

/**
 * Delete task
 * @param {number|string} id - Task ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteTask = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to delete task`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ deleteTask error:', error.message);
    throw error;
  }
};

/**
 * Update task progress
 * @param {number|string} id - Task ID
 * @param {number} progress - Progress value (0-100)
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskProgress = async (id, progress) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}/progress`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progress }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to update task progress`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ updateTaskProgress error:', error.message);
    throw error;
  }
};

/**
 * Update task status
 * @param {number|string} id - Task ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated task
 */
export const updateTaskStatus = async (id, status) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to update task status`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ updateTaskStatus error:', error.message);
    throw error;
  }
};

/**
 * Complete task
 * @param {number|string} id - Task ID
 * @returns {Promise<Object>} Completed task
 */
export const completeTask = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to complete task`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ completeTask error:', error.message);
    throw error;
  }
};
