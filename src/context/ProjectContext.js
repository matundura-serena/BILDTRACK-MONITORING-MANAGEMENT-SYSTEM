import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as projectService from '../services/projectService';
import * as milestoneService from '../services/milestoneService';
import * as workerAssignmentService from '../services/workerAssignmentService';

const ProjectContext = createContext(null);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // 🔄 FETCH ALL PROJECTS
  const getProjects = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects(params);
      setProjects(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch projects';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 📥 FETCH SINGLE PROJECT
  const getProject = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjectById(id);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch project';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ➕ CREATE PROJECT
  const addProject = async (projectData) => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectService.createProject(projectData);
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add project';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✏️ UPDATE PROJECT
  const updateProject = async (id, projectData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await projectService.updateProject(id, projectData);
      setProjects((prev) =>
        prev.map((project) => (project.id === id ? updatedProject : project))
      );
      return updatedProject;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update project';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ DELETE PROJECT
  const deleteProject = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((project) => project.id !== id));
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete project';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔄 REFRESH PROJECTS
  const refreshProjects = async (params = {}) => {
    return getProjects(params);
  };

  // 📊 FETCH PROJECT STATISTICS
  const getStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await milestoneService.getProjectStats();
      setProjectStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch project statistics';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔗 WORKER ASSIGNMENT FUNCTIONS

  // Assign worker to project
  const assignWorkerToProject = async (projectId, workerId, role) => {
    try {
      setLoading(true);
      setError(null);
      const assignment = await workerAssignmentService.assignWorkerToProject(projectId, {
        worker_id: workerId,
        role: role || 'General Worker',
        status: 'Active',
      });
      return assignment;
    } catch (err) {
      const errorMessage = err.message || 'Failed to assign worker to project';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assign multiple workers to project
  const assignWorkersToProject = async (projectId, workerIds) => {
    try {
      setLoading(true);
      setError(null);
      const result = await projectService.assignWorkers(projectId, workerIds);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to assign workers to project';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get project assignments
  const getProjectAssignments = async (projectId, status = null) => {
    try {
      setLoading(true);
      setError(null);
      const assignments = await workerAssignmentService.getProjectAssignments(projectId, status);
      return assignments;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch project assignments';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get assigned workers
  const getAssignedWorkers = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const workers = await projectService.getAssignedWorkers(projectId);
      return workers;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch assigned workers';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get available workers
  const getAvailableWorkers = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const workers = await projectService.getAvailableWorkers(projectId);
      return workers;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch available workers';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove worker from project
  const removeWorkerFromProject = async (assignmentId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await workerAssignmentService.removeAssignment(assignmentId);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove worker from project';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🎯 MILESTONE FUNCTIONS

  // Fetch milestones for a project
  const getMilestones = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await milestoneService.getMilestones(projectId);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch milestones';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create milestone
  const addMilestone = async (projectId, milestoneData) => {
    try {
      setLoading(true);
      setError(null);
      const newMilestone = await milestoneService.createMilestone(projectId, milestoneData);
      
      // Refresh project stats after adding milestone
      await getStats();
      
      return newMilestone;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add milestone';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update milestone
  const updateMilestone = async (milestoneId, milestoneData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedMilestone = await milestoneService.updateMilestone(milestoneId, milestoneData);
      
      // Refresh project stats after updating milestone
      await getStats();
      
      return updatedMilestone;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update milestone';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Complete milestone
  const completeMilestone = async (milestoneId) => {
    try {
      setLoading(true);
      setError(null);
      const completedMilestone = await milestoneService.completeMilestone(milestoneId);
      
      // Refresh project stats after completing milestone
      await getStats();
      
      return completedMilestone;
    } catch (err) {
      const errorMessage = err.message || 'Failed to complete milestone';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete milestone
  const deleteMilestone = async (milestoneId, projectId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await milestoneService.deleteMilestone(milestoneId);
      
      // Refresh project stats after deleting milestone
      await getStats();
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete milestone';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🚀 INITIAL FETCH ON MOUNT
  useEffect(() => {
    getProjects();
    getStats();
  }, []);

  const value = {
    projects,
    loading,
    error,
    projectStats,
    selectedProject,
    setSelectedProject,
    getProjects,
    getProject,
    addProject,
    updateProject,
    deleteProject,
    refreshProjects,
    getStats,
    getMilestones,
    addMilestone,
    updateMilestone,
    completeMilestone,
    deleteMilestone,
    assignWorkerToProject,
    assignWorkersToProject,
    getProjectAssignments,
    getAssignedWorkers,
    getAvailableWorkers,
    removeWorkerFromProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    return {
      projects: [],
      loading: false,
      error: null,
      projectStats: null,
      getProjects: async () => [],
      getProject: async () => ({}),
      addProject: async () => ({}),
      updateProject: async () => ({}),
      deleteProject: async () => ({}),
      refreshProjects: async () => [],
      getStats: async () => ({}),
      getMilestones: async () => [],
      addMilestone: async () => ({}),
      updateMilestone: async () => ({}),
      completeMilestone: async () => ({}),
      deleteMilestone: async () => ({}),
      assignWorkerToProject: async () => ({}),
      assignWorkersToProject: async () => ({}),
      getProjectAssignments: async () => [],
      getAssignedWorkers: async () => [],
      getAvailableWorkers: async () => [],
      removeWorkerFromProject: async () => ({}),
    };
  }
  return context;
}

export default ProjectProvider;