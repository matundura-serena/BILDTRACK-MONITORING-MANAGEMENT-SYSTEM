import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as analyticsService from '../services/analyticsService';

const DashboardContext = createContext(null);

const DEFAULT_DASHBOARD = Object.freeze({
  projects: null,
  workers: null,
  tasks: null,
  milestones: null,
  attendance: null,
  recentActivities: [],
  upcomingDeadlines: [],
  // also allow alternative backend keys (snake_case) to be present
  recent_activities: [],
  upcoming_deadlines: [],
});

const safeArray = (v) => (Array.isArray(v) ? v : []);
const safeNullOrObject = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object' && !Array.isArray(v)) return v;
  return null;
};

const normalizeDashboardResponse = (raw) => {
  const data = raw && typeof raw === 'object' ? raw : {};

  // Backend controller returns camelCase keys already, but normalize both shapes.
  const recentActivities =
    safeArray(data.recentActivities ?? data.recent_activities);
  const upcomingDeadlines =
    safeArray(data.upcomingDeadlines ?? data.upcoming_deadlines);

  return {
    ...DEFAULT_DASHBOARD,
    ...data,

    // enforce safe list defaults
    recentActivities,
    upcomingDeadlines,

    // enforce safe object/stat defaults
    projects: safeNullOrObject(data.projects),
    workers: safeNullOrObject(data.workers),
    tasks: safeNullOrObject(data.tasks),
    milestones: safeNullOrObject(data.milestones),
    attendance: safeNullOrObject(data.attendance),
  };
};

export function DashboardProvider({ children, autoLoad = false }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshAt, setLastRefreshAt] = useState(null);

  const loadingRef = useRef(0);
  const abortRef = useRef(false);

  const normalizeAndSet = useCallback((raw) => {
    const normalized = normalizeDashboardResponse(raw);
    setDashboard(normalized);
    return normalized;
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      abortRef.current = false;
      loadingRef.current += 1;
      setLoading(true);
      setError(null);

      const raw = await analyticsService.getDashboardSummary();
      if (abortRef.current) return null;
      return normalizeAndSet(raw);
    } catch (e) {
      const msg = e?.message || 'Failed to load dashboard';
      setError(msg);
      console.error('❌ Dashboard load error:', msg);
      throw e;
    } finally {
      loadingRef.current -= 1;
      if (loadingRef.current <= 0) {
        setLoading(false);
      }
    }
  }, [normalizeAndSet]);

  const refreshDashboard = useCallback(async () => {
    try {
      const result = await loadDashboard();
      setLastRefreshAt(Date.now());
      return result;
    } catch (e) {
      // refresh should not crash the navigation; show alert but keep app alive
      const msg = e?.message || 'Failed to refresh dashboard';
      setError(msg);
      Alert.alert('Refresh failed', msg);
      return null;
    }
  }, [loadDashboard]);

  // Optional auto-load, but only when explicitly enabled.
  useEffect(() => {
    if (!autoLoad) return;
    loadDashboard();
    return () => {
      abortRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  const value = useMemo(
    () => ({
      dashboard,
      loading,
      error,
      lastRefreshAt,
      loadDashboard,
      refreshDashboard,
    }),
    [dashboard, loading, error, lastRefreshAt, loadDashboard, refreshDashboard]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    return {
      dashboard: null,
      loading: false,
      error: null,
      lastRefreshAt: null,
      loadDashboard: async () => null,
      refreshDashboard: async () => null,
    };
  }
  return ctx;
}

export default DashboardContext;