import { API_BASE_URL } from '../config/apiConfig';
import { apiFetch } from './apiClient';

// ==========================================
// 📋 ATTENDANCE API SERVICE LAYER
// ==========================================

/**
 * Create attendance session (Manager only)
 * @param {Object} sessionData - Session data
 * @param {number} sessionData.project_id - Project ID
 * @param {string} sessionData.check_in_start - Check-in start time (HH:MM:SS)
 * @param {string} sessionData.check_in_end - Check-in end time (HH:MM:SS)
 * @returns {Promise<Object>} Created session object
 */

export const createSession = async (sessionData) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/session`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error ||
        json.message ||
        'Failed to create attendance session'
      );
    }

    return json.data ?? json;

  } catch (error) {
    console.error('❌ createSession error:', error.message);
    throw error;
  }
};
/**
 * Get session by ID
 * @param {number|string} id - Session ID
 * @returns {Promise<Object>} Session object
 */
export const getSession = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/session/${id}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Session not found`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ getSession error:', error.message);
    throw error;
  }
};

/**
 * Get active session for a project
 * @param {number|string} projectId - Project ID
 * @returns {Promise<Object>} Active session object
 */
export const getProjectSession = async (projectId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/session/project/${projectId}`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      // NO_ACTIVE_SESSION is not an error, it's normal application state
      if (json.message === 'NO_ACTIVE_SESSION') {
        return null;
      }
      throw new Error(json.message || `HTTP ${response.status}: No active session found`);
    }

    return json.data;
  } catch (error) {
    // Only log actual errors, not NO_ACTIVE_SESSION
    if (error.message !== 'NO_ACTIVE_SESSION') {
      console.error('❌ getProjectSession error:', error.message);
    }
    throw error;
  }
};

/**
 * Close attendance session (Manager only)
 * @param {number|string} id - Session ID
 * @returns {Promise<Object>} Updated session object
 */
export const closeSession = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/session/${id}/close`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to close session`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ closeSession error:', error.message);
    throw error;
  }
};

/**
 * Delete attendance session (Manager only)
 * @param {number|string} id - Session ID
 * @returns {Promise<Object>} Response with success message
 */
export const deleteSession = async (id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/session/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: Failed to delete session`);
    }

    return json.data;
  } catch (error) {
    console.error('❌ deleteSession error:', error.message);
    throw error;
  }
};

/**
 * Scan QR code - Check in/out (Worker)
 * @param {string} session_token - QR code session token
 * @param {Object} scanData - Scan metadata
 * @returns {Promise<Object>} Attendance record
 */
export const scanAttendance = async (session_token, scanData = {}) => {
  try {
    console.log('========================================');
    console.log('📤 ATTENDANCE SERVICE - SCAN REQUEST');
    console.log('========================================');
    console.log('Session Token:', session_token);
    console.log('Scan Data:', scanData);
    console.log('API URL:', `${API_BASE_URL}/api/attendance/checkin`);

    const payload = { session_token, ...scanData };
    console.log('Request Payload:', payload);

    const response = await apiFetch(`${API_BASE_URL}/api/attendance/checkin`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json().catch(() => ({}));
    console.log('Response Data:', responseData);

    if (!response.ok) {
      console.error('❌ Request failed:', responseData);
      throw new Error(
        responseData.error ||
        responseData.message ||
        `HTTP ${response.status}: Failed to record attendance`
      );
    }

    console.log('✅ Attendance recorded successfully');
    console.log('========================================');
    return responseData.data || responseData; // Unwrap data field, fallback to raw response
  } catch (error) {
    console.error('========================================');
    console.error('❌ SCAN ATTENDANCE SERVICE ERROR');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Session Token:', session_token);
    console.error('Scan Data:', scanData);
    console.error('========================================');
    throw error;
  }
};

/**
 * Check out (Worker)
 * @param {number|string} attendance_id - Attendance record ID
 * @returns {Promise<Object>} Updated attendance record
 */
export const checkOut = async (attendance_id) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/checkout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attendance_id }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to check out`);
    }

    const data = await response.json();
    return data.data || data; // Unwrap data field, fallback to raw response
  } catch (error) {
    console.error('❌ checkOut error:', error.message);
    throw error;
  }
};

/**
 * Get attendance by project
 * @param {number|string} projectId - Project ID
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @param {string} params.status - Attendance status filter
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAttendance = async (projectId, params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.start_date) queryString.append('start_date', params.start_date);
    if (params.end_date) queryString.append('end_date', params.end_date);
    if (params.status) queryString.append('status', params.status);

    const url = `${API_BASE_URL}/api/attendance/project/${projectId}${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch attendance`);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('❌ getAttendance error:', error.message);
    throw error;
  }
};

/**
 * Get attendance list for a session
 * @param {number|string} sessionId - Session ID
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAttendanceBySession = async (sessionId) => {
  try {
    const response = await apiFetch(`${API_BASE_URL}/api/attendance/session/${sessionId}/list`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch session attendance`);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('❌ getAttendanceBySession error:', error.message);
    throw error;
  }
};

/**
 * Get worker attendance history
 * @param {number|string} workerId - Worker ID
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @param {number|string} params.project_id - Project ID filter
 * @returns {Promise<Array>} Array of attendance records
 */
export const getAttendanceHistory = async (workerId, params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.start_date) queryString.append('start_date', params.start_date);
    if (params.end_date) queryString.append('end_date', params.end_date);
    if (params.project_id) queryString.append('project_id', params.project_id);

    const url = `${API_BASE_URL}/api/attendance/worker/${workerId}${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch attendance history`);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('❌ getAttendanceHistory error:', error.message);
    throw error;
  }
};

/**
 * Get attendance statistics
 * @param {Object} params - Query parameters
 * @param {number|string} params.project_id - Project ID
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Statistics object
 */
export const getAttendanceStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.project_id) queryString.append('project_id', params.project_id);
    if (params.start_date) queryString.append('start_date', params.start_date);
    if (params.end_date) queryString.append('end_date', params.end_date);

    const url = `${API_BASE_URL}/api/attendance/stats${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch attendance statistics`);
    }

    const data = await response.json();
    return data.data || data; // Unwrap data field, fallback to raw response
  } catch (error) {
    console.error('❌ getAttendanceStats error:', error.message);
    throw error;
  }
};

/**
 * Get daily attendance stats
 * @param {Object} params - Query parameters
 * @param {number|string} params.project_id - Project ID
 * @param {number} params.days - Number of days to look back
 * @returns {Promise<Array>} Array of daily stats
 */
export const getDailyAttendanceStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.project_id) queryString.append('project_id', params.project_id);
    if (params.days) queryString.append('days', params.days);

    const url = `${API_BASE_URL}/api/attendance/stats/daily${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch daily stats`);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('❌ getDailyAttendanceStats error:', error.message);
    throw error;
  }
};

/**
 * Get worker attendance stats
 * @param {number|string} workerId - Worker ID
 * @param {Object} params - Query parameters
 * @param {string} params.start_date - Start date (YYYY-MM-DD)
 * @param {string} params.end_date - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Worker statistics object
 */
export const getWorkerAttendanceStats = async (workerId, params = {}) => {
  try {
    const queryString = new URLSearchParams();
    
    if (params.start_date) queryString.append('start_date', params.start_date);
    if (params.end_date) queryString.append('end_date', params.end_date);

    const url = `${API_BASE_URL}/api/attendance/worker/${workerId}/stats${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    
    const response = await apiFetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch worker stats`);
    }

    const data = await response.json();
    return data.data || data; // Unwrap data field, fallback to raw response
  } catch (error) {
    console.error('❌ getWorkerAttendanceStats error:', error.message);
    throw error;
  }
};
