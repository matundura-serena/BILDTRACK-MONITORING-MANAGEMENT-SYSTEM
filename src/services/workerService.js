import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 👷 WORKER API SERVICE LAYER
// ==========================================

/**
 * Fetch all workers with optional search and filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search term
 * @param {string} params.department - Department filter
 * @param {string} params.employment_type - Employment type filter
 * @param {string} params.status - Status filter
 * @returns {Promise<Array>} Array of workers
 */
export const getWorkers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.search) queryString.append('search', params.search);
    if (params.department) queryString.append('department', params.department);
    if (params.employment_type) queryString.append('employment_type', params.employment_type);
    if (params.status) queryString.append('status', params.status);

    const url = `${API_BASE_URL}/api/workers${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to fetch workers`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getWorkers error:', error.message);
    throw error;
  }
};

/**
 * Fetch single worker by ID
 * @param {number|string} id - Worker ID
 * @returns {Promise<Object>} Worker object
 */
export const getWorkerById = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/workers/${id}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Worker not found`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getWorkerById error:', error.message);
    throw error;
  }
};

/**
 * Create new worker
 * @param {Object} workerData - Worker data object
 * @returns {Promise<Object>} Created worker object
 */
export const createWorker = async (workerData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/workers`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to create worker`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ createWorker error:', error.message);
    throw error;
  }
};

/**
 * Update existing worker
 * @param {number|string} id - Worker ID
 * @param {Object} workerData - Updated worker data
 * @returns {Promise<Object>} Updated worker object
 */
export const updateWorker = async (id, workerData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/workers/${id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerData),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to update worker`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ updateWorker error:', error.message);
    throw error;
  }
};

/**
 * Delete worker
 * @param {number|string} id - Worker ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteWorker = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/workers/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to delete worker`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ deleteWorker error:', error.message);
    throw error;
  }
};

/**
 * Fetch worker statistics for dashboard
 * @returns {Promise<Object>} Statistics object
 */
export const getWorkerStats = async () => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/workers/stats`);
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
