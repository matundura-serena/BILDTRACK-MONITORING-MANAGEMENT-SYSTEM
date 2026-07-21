import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 🏗️ PROJECT API SERVICE LAYER
// ==========================================

/**
 * Fetch all projects with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of projects
 */
export const getProjects = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.search) queryString.append('search', params.search);
    if (params.status) queryString.append('status', params.status);
    if (params.priority) queryString.append('priority', params.priority);
    if (params.manager) queryString.append('manager', params.manager);
    if (params.location) queryString.append('location', params.location);

    const url = `${API_BASE_URL}/api/projects${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch projects`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjects error:', error.message);
    throw error;
  }
};

/**
 * Fetch single project by ID
 * @param {number|string} id - Project ID
 * @returns {Promise<Object>} Project object
 */
export const getProjectById = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/${id}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Project not found`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getProjectById error:', error.message);
    throw error;
  }
};

/**
 * Create new project
 * @param {Object} projectData - Project data
 * @returns {Promise<Object>} Created project
 */
export const createProject = async (projectData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to create project`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ createProject error:', error.message);
    throw error;
  }
};

/**
 * Update project
 * @param {number|string} id - Project ID
 * @param {Object} projectData - Updated project data
 * @returns {Promise<Object>} Updated project
 */
export const updateProject = async (id, projectData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to update project`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ updateProject error:', error.message);
    throw error;
  }
};

/**
 * Delete project
 * @param {number|string} id - Project ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteProject = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to delete project`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ deleteProject error:', error.message);
    throw error;
  }
};

/**
 * Export projects to Excel/CSV
 * @param {string} format - Export format ('excel' or 'csv')
 * @returns {Promise<Object>} Export data with base64 encoded file
 */
export const exportProjects = async (format = 'excel') => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/export?format=${format}`);
    
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to export projects`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ exportProjects error:', error.message);
    throw error;
  }
};

/**
 * Get all workers assigned to a project
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Array>} Array of assigned workers
 */
export const getAssignedWorkers = async (projectId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/${projectId}/workers`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch assigned workers`);
    }

    // Transform the data to match the expected frontend format
    return json.data.map(worker => ({
      id: worker.worker_id,
      project_id: worker.project_id,
      worker_id: worker.worker_id,
      assigned_role: worker.assigned_role,
      assigned_date: worker.assigned_date,
      end_date: worker.end_date,
      status: worker.status,
      first_name: worker.first_name,
      last_name: worker.last_name,
      job_title: worker.job_title,
      department: worker.department,
      phone_number: worker.phone_number,
      email: worker.email
    }));
  } catch (error) {
    console.error('❌ getAssignedWorkers error:', error.message);
    throw error;
  }
};

/**
 * Get available workers for a project (not assigned)
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Array>} Array of available workers
 */
export const getAvailableWorkers = async (projectId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/available/workers?projectId=${projectId}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch available workers`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getAvailableWorkers error:', error.message);
    throw error;
  }
};

/**
 * Assign workers to a project
 * @param {number|string} projectId - Project ID
 * @param {Array<number>} workerIds - Array of worker IDs to assign
 * @returns {Promise<Object>} Assignment result
 */
export const assignWorkers = async (projectId, workerIds) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/${projectId}/workers`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workerIds }),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to assign workers`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ assignWorkers error:', error.message);
    throw error;
  }
};

/**
 * Remove a worker from a project
 * @param {number|string} projectId - Project ID
 * @param {number|string} workerId - Worker ID
 * @returns {Promise<Object>} Response with success message
 */
export const removeWorker = async (projectId, workerId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/projects/${projectId}/workers/${workerId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to remove worker`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ removeWorker error:', error.message);
    throw error;
  }
};
