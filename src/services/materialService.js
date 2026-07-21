import { API_BASE_URL } from '../config/apiConfig';

// API URL constants
const API_URL = `${API_BASE_URL}/api`;

// ==========================================
// MATERIALS API SERVICE
// ==========================================

/**
 * Generic API call helper for materials endpoints
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}/materials${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return json.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// CRUD OPERATIONS
// ==========================================

export const getMaterials = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const endpoint = queryString ? `?${queryString}` : '';

  const data = await apiCall(endpoint);
  return data;
};

export const getMaterialById = async (id) => {
  if (!id) {
    throw new Error('Material ID is required');
  }

  const data = await apiCall(`/${id}`);
  return data;
};

export const createMaterial = async (materialData) => {
  if (!materialData) {
    throw new Error('Material data is required');
  }

  const data = await apiCall('', {
    method: 'POST',
    body: JSON.stringify(materialData),
  });

  return data;
};

export const updateMaterial = async (id, materialData) => {
  if (!id) {
    throw new Error('Material ID is required');
  }

  if (!materialData) {
    throw new Error('Material data is required');
  }

  const data = await apiCall(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(materialData),
  });

  return data;
};

export const deleteMaterial = async (id) => {
  if (!id) {
    throw new Error('Material ID is required');
  }

  await apiCall(`/${id}`, {
    method: 'DELETE',
  });
};

// ==========================================
// STATISTICS & ANALYTICS
// ==========================================

export const getStatistics = async () => {
  const data = await apiCall('/stats');
  return data;
};

export const getFilterOptions = async () => {
  const data = await apiCall('/filters');
  return data;
};

export const getAnalytics = async () => {
  const data = await apiCall('/analytics');
  return data;
};

// ==========================================
// TRANSACTIONS
// ==========================================

export const getTransactions = async (materialId, filters = {}) => {
  if (!materialId) {
    throw new Error('Material ID is required');
  }

  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const endpoint = `/${materialId}/transactions${queryString ? `?${queryString}` : ''}`;

  const data = await apiCall(endpoint);
  return data;
};

export const adjustQuantity = async (id, quantityChange, notes = '') => {
  if (!id) {
    throw new Error('Material ID is required');
  }

  if (quantityChange === undefined || quantityChange === null) {
    throw new Error('Quantity change is required');
  }

  const data = await apiCall(`/${id}/adjust`, {
    method: 'POST',
    body: JSON.stringify({
      quantity_change: quantityChange,
      notes,
    }),
  });

  return data;
};

export const purchaseMaterial = async (id, quantity, notes = '') => {
  if (!id) {
    throw new Error('Material ID is required');
  }

  if (quantity === undefined || quantity === null) {
    throw new Error('Quantity is required');
  }

  const data = await apiCall(`/${id}/purchase`, {
    method: 'POST',
    body: JSON.stringify({
      quantity,
      notes,
    }),
  });

  return data;
};

// ==========================================
// BULK MATERIALS ENTRY
// ==========================================

export const bulkCreateMaterials = async (materials) => {
  const response = await fetch(`${API_URL}/materials/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ materials }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Bulk insert failed');
  }

  return await response.json();
};


// ==========================================
// SERVICE OBJECT EXPORT
// ==========================================

export const materialService = {
  // CRUD methods
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,

  // Statistics methods
  getStatistics,
  getFilterOptions,

  // Analytics methods
  getAnalytics,

  // Transaction methods
  getTransactions,
  adjustQuantity,
  purchaseMaterial,

  // Bulk entry method
  bulkCreateMaterials,
};

export default materialService;
