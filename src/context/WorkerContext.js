import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as workerService from '../services/workerService';
import * as workerAssignmentService from '../services/workerAssignmentService';

const WorkerContext = createContext(null);

export function WorkerProvider({ children }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔄 FETCH ALL WORKERS
  const getWorkers = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await workerService.getWorkers(params);
      setWorkers(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch workers';
      setError(errorMessage);
      console.error('❌ getWorkers error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📥 FETCH WORKER BY ID
  const getWorkerById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await workerService.getWorkerById(id);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch worker';
      setError(errorMessage);
      console.error('❌ getWorkerById error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ➕ ADD NEW WORKER
  const addWorker = async (workerData) => {
    try {
      setLoading(true);
      setError(null);
      const newWorker = await workerService.createWorker(workerData);
      
      // Update local state with the new worker
      setWorkers((prevWorkers) => [newWorker, ...prevWorkers]);
      
      console.log('✅ Worker added successfully:', newWorker);
      return newWorker;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add worker';
      setError(errorMessage);
      console.error('❌ addWorker error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✏️ UPDATE WORKER
  const updateWorker = async (id, workerData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedWorker = await workerService.updateWorker(id, workerData);
      
      // Update local state
      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker.id === id ? updatedWorker : worker
        )
      );
      
      console.log('✅ Worker updated successfully:', updatedWorker);
      return updatedWorker;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update worker';
      setError(errorMessage);
      console.error('❌ updateWorker error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ DELETE WORKER
  const deleteWorker = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await workerService.deleteWorker(id);
      
      // Remove from local state
      setWorkers((prevWorkers) =>
        prevWorkers.filter((worker) => worker.id !== id)
      );
      
      console.log('✅ Worker deleted successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete worker';
      setError(errorMessage);
      console.error('❌ deleteWorker error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 REFRESH WORKERS (alias for getWorkers)
  const refreshWorkers = async (params = {}) => {
    return getWorkers(params);
  };

  // 📊 FETCH WORKER STATS
  const getWorkerStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await workerService.getWorkerStats();
      return stats;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch worker statistics';
      setError(errorMessage);
      console.error('❌ getWorkerStats error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔗 GET WORKER ASSIGNMENTS
  const getWorkerAssignments = async (workerId, status = null) => {
    try {
      setLoading(true);
      setError(null);
      const assignments = await workerAssignmentService.getWorkerAssignments(workerId, status);
      return assignments;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch worker assignments';
      setError(errorMessage);
      console.error('❌ getWorkerAssignments error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🚀 INITIAL FETCH ON MOUNT
  useEffect(() => {
    getWorkers();
  }, []);

  const value = {
    workers,
    loading,
    error,
    getWorkers,
    getWorkerById,
    addWorker,
    updateWorker,
    deleteWorker,
    refreshWorkers,
    getWorkerStats,
    getWorkerAssignments,
  };

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorkers() {
  const context = useContext(WorkerContext);
  if (!context) {
    return {
      workers: [],
      loading: false,
      error: null,
      getWorkers: async () => [],
      getWorkerById: async () => ({}),
      addWorker: async () => ({}),
      updateWorker: async () => ({}),
      deleteWorker: async () => ({}),
      refreshWorkers: async () => [],
      getWorkerStats: async () => ({}),
      getWorkerAssignments: async () => [],
    };
  }
  return context;
}

export default WorkerProvider;