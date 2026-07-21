import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useDashboard } from './DashboardContext';

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({ children, autoLoad = false }) {
  const { dashboard, refreshDashboard } = useDashboard();
  
  // Analytics-specific state - only store data that's NOT in DashboardContext
  const [projectProgressByPhase, setProjectProgressByPhase] = useState(null);
  const [projectStatusChart, setProjectStatusChart] = useState(null);
  const [workerDistribution, setWorkerDistribution] = useState(null);
  const [taskDistribution, setTaskDistribution] = useState(null);
  const [milestoneChart, setMilestoneChart] = useState(null);
  const [topWorkers, setTopWorkers] = useState(null);
  const [projectComparison, setProjectComparison] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState(null);
  const [budgetAnalytics, setBudgetAnalytics] = useState(null);
  
  const [chartLoading, setChartLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(0);

  // Extract basic stats from dashboard - NO need to store separately
  const projectStats = dashboard?.projects || null;
  const workerStats = dashboard?.workers || null;
  const taskStats = dashboard?.tasks || null;
  const milestoneStats = dashboard?.milestones || null;
  const attendanceStats = dashboard?.attendance || null;

  // Load chart data functions - wrapped in useCallback to prevent recreation
  const loadProjectProgressByPhase = useCallback(async () => {
    try {
      setError(null);
      const { getProjectProgressByPhase } = await import('../services/analyticsService.js');
      const data = await getProjectProgressByPhase();
      setProjectProgressByPhase(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load project progress by phase';
      setError(errorMessage);
      console.error('❌ loadProjectProgressByPhase error:', errorMessage);
      throw err;
    }
  }, []);

  const loadProjectStatusChart = useCallback(async () => {
    try {
      setError(null);
      const { getProjectStatusChart } = await import('../services/analyticsService.js');
      const data = await getProjectStatusChart();
      setProjectStatusChart(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load project status chart';
      setError(errorMessage);
      console.error('❌ loadProjectStatusChart error:', errorMessage);
      throw err;
    }
  }, []);

  const loadWorkerDistribution = useCallback(async () => {
    try {
      setError(null);
      const { getWorkerDistribution } = await import('../services/analyticsService.js');
      const data = await getWorkerDistribution();
      setWorkerDistribution(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load worker distribution';
      setError(errorMessage);
      console.error('❌ loadWorkerDistribution error:', errorMessage);
      throw err;
    }
  }, []);

  const loadTaskDistribution = useCallback(async () => {
    try {
      setError(null);
      const { getTaskDistribution } = await import('../services/analyticsService.js');
      const data = await getTaskDistribution();
      setTaskDistribution(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load task distribution';
      setError(errorMessage);
      console.error('❌ loadTaskDistribution error:', errorMessage);
      throw err;
    }
  }, []);

  const loadMilestoneChart = useCallback(async () => {
    try {
      setError(null);
      const { getMilestoneChart } = await import('../services/analyticsService.js');
      const data = await getMilestoneChart();
      setMilestoneChart(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load milestone chart';
      setError(errorMessage);
      console.error('❌ loadMilestoneChart error:', errorMessage);
      throw err;
    }
  }, []);

  const loadTopWorkers = useCallback(async () => {
    try {
      setError(null);
      const { getTopWorkers } = await import('../services/analyticsService.js');
      const data = await getTopWorkers();
      setTopWorkers(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load top workers';
      setError(errorMessage);
      console.error('❌ loadTopWorkers error:', errorMessage);
      throw err;
    }
  }, []);

  const loadProjectComparison = useCallback(async () => {
    try {
      setError(null);
      const { getProjectComparison } = await import('../services/analyticsService.js');
      const data = await getProjectComparison();
      setProjectComparison(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load project comparison';
      setError(errorMessage);
      console.error('❌ loadProjectComparison error:', errorMessage);
      throw err;
    }
  }, []);

  const loadAttendanceTrend = useCallback(async () => {
    try {
      setError(null);
      const { getAttendanceTrend } = await import('../services/analyticsService.js');
      const data = await getAttendanceTrend();
      setAttendanceTrend(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load attendance trend';
      setError(errorMessage);
      console.error('❌ loadAttendanceTrend error:', errorMessage);
      throw err;
    }
  }, []);

  const loadBudgetAnalytics = useCallback(async () => {
    try {
      setError(null);
      const { getBudgetAnalytics } = await import('../services/analyticsService.js');
      const data = await getBudgetAnalytics();
      setBudgetAnalytics(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load budget analytics';
      setError(errorMessage);
      console.error('❌ loadBudgetAnalytics error:', errorMessage);
      throw err;
    }
  }, []);

  // Load all chart data - memoized to prevent recreation
  const loadAllCharts = useCallback(async () => {
    try {
      setChartLoading(true);
      const results = await Promise.allSettled([
        loadProjectProgressByPhase(),
        loadProjectStatusChart(),
        loadWorkerDistribution(),
        loadTaskDistribution(),
        loadMilestoneChart(),
        loadTopWorkers(),
        loadProjectComparison(),
        loadAttendanceTrend(),
        loadBudgetAnalytics(),
      ]);
      
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some charts failed to load:', failures.length);
      }
    } catch (err) {
      console.error('Error loading charts:', err);
    } finally {
      setChartLoading(false);
    }
  }, [
    loadProjectProgressByPhase,
    loadProjectStatusChart,
    loadWorkerDistribution,
    loadTaskDistribution,
    loadMilestoneChart,
    loadTopWorkers,
    loadProjectComparison,
    loadAttendanceTrend,
    loadBudgetAnalytics,
  ]);

  // Refresh analytics - just refresh dashboard and reload charts
  const refreshAnalytics = useCallback(async () => {
    try {
      setError(null);
      await refreshDashboard();
      await loadAllCharts();
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh analytics';
      setError(errorMessage);
      console.error('❌ refreshAnalytics error:', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, [refreshDashboard, loadAllCharts]);

  // Load charts when dashboard changes - ONLY if we have dashboard data and no chart data yet
  useEffect(() => {
    if (dashboard && !projectProgressByPhase && !chartLoading) {
      loadAllCharts();
    }
  }, [dashboard, projectProgressByPhase, chartLoading, loadAllCharts]);

  // Optional initial load
  useEffect(() => {
    if (!autoLoad) return;
    loadAllCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const value = {
    // Dashboard data
    dashboardData: dashboard,
    // Basic stats - derived from dashboard, not stored separately
    projectStats,
    workerStats,
    taskStats,
    milestoneStats,
    attendanceStats,
    // Chart data
    projectProgressByPhase,
    projectStatusChart,
    workerDistribution,
    taskDistribution,
    milestoneChart,
    topWorkers,
    projectComparison,
    attendanceTrend,
    budgetAnalytics,
    // State
    loading,
    chartLoading,
    error,
    // Actions
    loadDashboard: refreshDashboard, // Use dashboard's refresh
    loadAllCharts,
    refreshAnalytics,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    return {
      dashboardData: null,
      projectStats: null,
      workerStats: null,
      taskStats: null,
      milestoneStats: null,
      attendanceStats: null,
      projectProgressByPhase: null,
      projectStatusChart: null,
      workerDistribution: null,
      taskDistribution: null,
      milestoneChart: null,
      topWorkers: null,
      projectComparison: null,
      attendanceTrend: null,
      budgetAnalytics: null,
      loading: false,
      chartLoading: false,
      error: null,
      loadDashboard: async () => {},
      loadAllCharts: async () => {},
      refreshAnalytics: async () => {},
    };
  }
  return context;
}

export default AnalyticsProvider;