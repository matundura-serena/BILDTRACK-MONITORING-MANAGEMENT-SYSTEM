import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 👷 WORKER-PROJECT ASSIGNMENT API SERVICE
// ==========================================

/**
 * Assign worker to project
 * @param {number} projectId - Project ID
 * @param {Object} assignmentData - Assignment data
 * @param {number} assignmentData.worker_id - Worker ID
 * @param {string} assignmentData.role - Worker role in project
 * @param {string} assignmentData.notes - Optional notes
 * @param {string} assignmentData.status - Assignment status
 * @returns {Promise<Object>} Created assignment
 */
export const assignWorkerToProject = async (projectId, assignmentData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/worker-assignments/projects/${projectId}/assign-worker`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignmentData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to assign worker`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ assignWorkerToProject error:', error.message);
    throw error;
  }
};

/**
 * Get all assignments for a worker
 * @param {number} workerId - Worker ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Array of assignments
 */
export const getWorkerAssignments = async (workerId, status = null) => {
  try {
    const url = new URL(`${API_BASE_URL}/api/worker-assignments/workers/${workerId}/assignments`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await apiFetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch worker assignments`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ getWorkerAssignments error:', error.message);
    throw error;
  }
};

/**
 * Get all assignments for a project
 * @param {number} projectId - Project ID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Array of assignments
 */
export const getProjectAssignments = async (projectId, status = null) => {
  try {
    const url = new URL(`${API_BASE_URL}/api/worker-assignments/projects/${projectId}/assignments`);
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await apiFetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch project assignments`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ getProjectAssignments error:', error.message);
    throw error;
  }
};

/**
 * Update assignment
 * @param {number} assignmentId - Assignment ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated assignment
 */
export const updateAssignment = async (assignmentId, updateData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/worker-assignments/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to update assignment`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ updateAssignment error:', error.message);
    throw error;
  }
};

/**
 * Remove assignment (soft delete)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Response with success message
 */
export const removeAssignment = async (assignmentId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/worker-assignments/assignments/${assignmentId}/remove`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to remove assignment`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ removeAssignment error:', error.message);
    throw error;
  }
};

/**
 * Delete assignment (hard delete)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/worker-assignments/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to delete assignment`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ deleteAssignment error:', error.message);
    throw error;
  }
};

/**
 * Get all assignments with filters
 * @param {Object} filters - Filter parameters
 * @param {number} filters.worker_id - Filter by worker ID
 * @param {number} filters.project_id - Filter by project ID
 * @param {string} filters.status - Filter by status
 * @param {string} filters.role - Filter by role (partial match)
 * @returns {Promise<Array>} Array of assignments
 */
export const getAllAssignments = async (filters = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}/api/worker-assignments/assignments`);
    
    if (filters.worker_id) {
      url.searchParams.append('worker_id', filters.worker_id);
    }
    if (filters.project_id) {
      url.searchParams.append('project_id', filters.project_id);
    }
    if (filters.status) {
      url.searchParams.append('status', filters.status);
    }
    if (filters.role) {
      url.searchParams.append('role', filters.role);
    }

    const response = await apiFetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch assignments`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('❌ getAllAssignments error:', error.message);
    throw error;
  }
};