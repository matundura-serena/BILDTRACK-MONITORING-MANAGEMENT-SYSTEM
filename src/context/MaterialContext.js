import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { materialService } from '../services/materialService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  materials: [],
  currentMaterial: null,
  statistics: null,
  analytics: null,
  filterOptions: null,
  transactions: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Reducer
const materialReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_MATERIALS':
      return { 
        ...state, 
        materials: action.payload, 
        loading: false, 
        error: null,
        lastUpdated: new Date()
      };
    
    case 'SET_CURRENT_MATERIAL':
      return { ...state, currentMaterial: action.payload, loading: false };
    
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload, loading: false };
    
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload, loading: false };
    
    case 'SET_FILTER_OPTIONS':
      return { ...state, filterOptions: action.payload, loading: false };
    
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload, loading: false };
    
    case 'ADD_MATERIAL':
      return { 
        ...state, 
        materials: [action.payload, ...state.materials],
        loading: false 
      };
    
    case 'UPDATE_MATERIAL':
      return {
        ...state,
        materials: state.materials.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
        currentMaterial: state.currentMaterial?.id === action.payload.id 
          ? action.payload 
          : state.currentMaterial,
        loading: false
      };
    
    case 'DELETE_MATERIAL':
      return {
        ...state,
        materials: state.materials.filter(m => m.id !== action.payload),
        loading: false
      };
    
    default:
      return state;
  }
};

// Context
const MaterialContext = createContext(initialState);

// Provider
export const MaterialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(materialReducer, initialState);
  const { authenticated } = useAuth();

  // Load materials on mount and when authenticated
  useEffect(() => {
    if (authenticated) {
      loadMaterials();
      loadStatistics();
      loadFilterOptions();
    }
  }, [authenticated]);

  // Actions
   const loadMaterials = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const materials = await materialService.getMaterials(filters);
      dispatch({ type: 'SET_MATERIALS', payload: materials });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

   const loadMaterialById = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const material = await materialService.getMaterialById(id);
      dispatch({ type: 'SET_CURRENT_MATERIAL', payload: material });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

   const loadStatistics = async () => {
    try {
      const statistics = await materialService.getStatistics();
      dispatch({ type: 'SET_STATISTICS', payload: statistics });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

   const loadAnalytics = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const analytics = await materialService.getAnalytics();
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

   const loadFilterOptions = async () => {
    try {
      const options = await materialService.getFilterOptions();
      dispatch({ type: 'SET_FILTER_OPTIONS', payload: options });
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadTransactions = async (materialId, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const transactions = await materialService.getTransactions(materialId, filters);
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const createMaterial = async (materialData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const material = await materialService.createMaterial(materialData);
      dispatch({ type: 'ADD_MATERIAL', payload: material });
      return material;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const updateMaterial = async (id, materialData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const material = await materialService.updateMaterial(id, materialData);
      dispatch({ type: 'UPDATE_MATERIAL', payload: material });
      return material;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const deleteMaterial = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await materialService.deleteMaterial(id);
      dispatch({ type: 'DELETE_MATERIAL', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const refreshMaterials = async (filters = {}) => {
    await loadMaterials(filters);
    await loadStatistics();
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const bulkCreateMaterials = async (materialsData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await materialService.bulkCreateMaterials(materialsData);
      // Refresh materials list after bulk create
      await refreshMaterials();
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    // State
    materials: state.materials,
    currentMaterial: state.currentMaterial,
    statistics: state.statistics,
    analytics: state.analytics,
    filterOptions: state.filterOptions,
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    loadMaterials,
    loadMaterialById,
    loadStatistics,
    loadAnalytics,
    loadFilterOptions,
    loadTransactions,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    refreshMaterials,
    clearError,
    bulkCreateMaterials,
  };

  return (
    <MaterialContext.Provider value={value}>
      {children}
    </MaterialContext.Provider>
  );
};

// Custom hook
export const useMaterials = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
};