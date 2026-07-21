import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as taskService from '../services/taskService';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskStats, setTaskStats] = useState(null);

  // 🔄 FETCH ALL TASKS
  const getTasks = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks(params);
      setTasks(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch tasks';
      setError(errorMessage);
      console.error('❌ getTasks error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📥 FETCH SINGLE TASK
  const getTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTaskById(id);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch task';
      setError(errorMessage);
      console.error('❌ getTask error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ➕ CREATE TASK
  const addTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      console.log('✅ Task added successfully:', newTask);
      return newTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add task';
      setError(errorMessage);
      console.error('❌ addTask error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✏️ UPDATE TASK
  const updateTask = async (id, taskData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskService.updateTask(id, taskData);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      console.log('✅ Task updated successfully:', updatedTask);
      return updatedTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task';
      setError(errorMessage);
      console.error('❌ updateTask error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ DELETE TASK
  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      console.log('✅ Task deleted successfully:', result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete task';
      setError(errorMessage);
      console.error('❌ deleteTask error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 UPDATE TASK PROGRESS
  const updateTaskProgress = async (id, progress) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskService.updateTaskProgress(id, progress);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      console.log('✅ Task progress updated:', updatedTask);
      return updatedTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task progress';
      setError(errorMessage);
      console.error('❌ updateTaskProgress error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 UPDATE TASK STATUS
  const updateTaskStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskService.updateTaskStatus(id, status);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      console.log('✅ Task status updated:', updatedTask);
      return updatedTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update task status';
      setError(errorMessage);
      console.error('❌ updateTaskStatus error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ COMPLETE TASK
  const completeTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const completedTask = await taskService.completeTask(id);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? completedTask : task))
      );
      console.log('✅ Task completed:', completedTask);
      return completedTask;
    } catch (err) {
      const errorMessage = err.message || 'Failed to complete task';
      setError(errorMessage);
      console.error('❌ completeTask error:', errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 REFRESH TASKS
  const refreshTasks = async (params = {}) => {
    return getTasks(params);
  };

  // 📊 CALCULATE TASK STATS
  const calculateStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      in_progress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => {
        if (!t.due_date || t.status === 'Completed') return false;
        const today = new Date();
        const dueDate = new Date(t.due_date);
        return dueDate < today;
      }).length,
      high_priority: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length,
    };
    setTaskStats(stats);
    return stats;
  };

  // 🚀 INITIAL FETCH ON MOUNT
  useEffect(() => {
    getTasks();
  }, []);

  // 📊 UPDATE STATS WHEN TASKS CHANGE
  useEffect(() => {
    if (tasks.length > 0) {
      calculateStats();
    }
  }, [tasks]);

  const value = {
    tasks,
    loading,
    error,
    taskStats,
    getTasks,
    getTask,
    addTask,
    updateTask,
    deleteTask,
    updateTaskProgress,
    updateTaskStatus,
    completeTask,
    refreshTasks,
    calculateStats,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    return {
      tasks: [],
      loading: false,
      error: null,
      taskStats: null,
      getTasks: async () => [],
      getTask: async () => ({}),
      addTask: async () => ({}),
      updateTask: async () => ({}),
      deleteTask: async () => ({}),
      updateTaskProgress: async () => ({}),
      updateTaskStatus: async () => ({}),
      completeTask: async () => ({}),
      refreshTasks: async () => [],
      calculateStats: () => ({}),
    };
  }
  return context;
}

export default TaskProvider;