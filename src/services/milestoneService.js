import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 🎯 MILESTONE API SERVICE LAYER
// ==========================================

/**
 * Get all milestones with optional filters
 * @param {Object|number} filters - Filter object or projectId
 * @returns {Promise<Array>} Array of milestones
 */
export const getMilestones = async (filters = {}) => {
  try {
    // Handle both calling patterns: getMilestones(projectId) and getMilestones({ projectId })
    let projectId = null;
    let status = null;
    let search = null;

    if (typeof filters === 'number' || (typeof filters === 'string' && !filters.includes('='))) {
      // Called with just projectId: getMilestones(123)
      projectId = filters;
    } else {
      // Called with filters object: getMilestones({ projectId, status, search })
      projectId = filters.projectId;
      status = filters.status;
      search = filters.search;
    }

    const queryString = new URLSearchParams();
    
    if (projectId) queryString.append('projectId', projectId);
    if (status) queryString.append('status', status);
    if (search) queryString.append('search', search);

    const url = `${API_BASE_URL}/api/milestones${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch milestones`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getMilestones error:', error.message);
    throw error;
  }
};

/**
 * Get single milestone by ID
 * @param {number|string} id - Milestone ID
 * @returns {Promise<Object>} Milestone object
 */
export const getMilestoneById = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/${id}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Milestone not found`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getMilestoneById error:', error.message);
    throw error;
  }
};

/**
 * Get milestones for a specific project
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Array>} Array of milestones
 */
export const getProjectMilestones = async (projectId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/projects/${projectId}/milestones`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch project milestones`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectMilestones error:', error.message);
    throw error;
  }
};

/**
 * Create new milestone
 * @param {number|string} projectId - Project ID
 * @param {Object} milestoneData - Milestone data
 * @returns {Promise<Object>} Created milestone
 */
export const createMilestone = async (projectId, milestoneData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestoneData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to create milestone`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ createMilestone error:', error.message);
    throw error;
  }
};

/**
 * Update milestone
 * @param {number|string} id - Milestone ID
 * @param {Object} milestoneData - Updated milestone data
 * @returns {Promise<Object>} Updated milestone
 */
export const updateMilestone = async (id, milestoneData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestoneData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to update milestone`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ updateMilestone error:', error.message);
    throw error;
  }
};

/**
 * Delete milestone
 * @param {number|string} id - Milestone ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteMilestone = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to delete milestone`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ deleteMilestone error:', error.message);
    throw error;
  }
};

/**
 * Complete milestone
 * @param {number|string} id - Milestone ID
 * @returns {Promise<Object>} Completed milestone
 */
export const completeMilestone = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/${id}/complete`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to complete milestone`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ completeMilestone error:', error.message);
    throw error;
  }
};

/**
 * Get tasks for a milestone
 * @param {number|string} milestoneId - Milestone ID
 * @returns {Promise<Array>} Array of tasks
 */
export const getMilestoneTasks = async (milestoneId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/${milestoneId}/tasks`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch milestone tasks`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getMilestoneTasks error:', error.message);
    throw error;
  }
};

/**
 * Get milestone statistics
 * @returns {Promise<Object>} Milestone statistics
 */
export const getMilestoneStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/stats/overview`);
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
 * Get project statistics
 * @returns {Promise<Object>} Project statistics
 */
export const getProjectStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/milestones/projects/stats`);
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
