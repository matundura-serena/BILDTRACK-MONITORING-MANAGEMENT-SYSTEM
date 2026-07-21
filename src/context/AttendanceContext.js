import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as attendanceService from '../services/attendanceService';

// ==========================================
// 📋 ATTENDANCE CONTEXT - STATE MANAGEMENT
// ==========================================

// Initial State
const initialState = {
  // Session State
  currentSession: null,
  attendanceSessions: [],
  
  // Attendance Records
  attendanceRecords: [],
  workerAttendanceHistory: [],
  
  // Statistics
  stats: null,
  dailyStats: [],
  workerStats: null,
  
  // UI State
  loading: false,
  error: null,
  success: null,
  
  // Pagination
  hasMore: false,
  page: 1,
};

// Action Types
const ActionTypes = {
  // Session Actions
  SET_CURRENT_SESSION: 'SET_CURRENT_SESSION',
  SET_ATTENDANCE_SESSIONS: 'SET_ATTENDANCE_SESSIONS',
  ADD_SESSION: 'ADD_SESSION',
  UPDATE_SESSION: 'UPDATE_SESSION',
  DELETE_SESSION: 'DELETE_SESSION',
  
  // Attendance Actions
  SET_ATTENDANCE_RECORDS: 'SET_ATTENDANCE_RECORDS',
  ADD_ATTENDANCE_RECORD: 'ADD_ATTENDANCE_RECORD',
  UPDATE_ATTENDANCE_RECORD: 'UPDATE_ATTENDANCE_RECORD',
  SET_WORKER_ATTENDANCE_HISTORY: 'SET_WORKER_ATTENDANCE_HISTORY',
  
  // Statistics Actions
  SET_STATS: 'SET_STATS',
  SET_DAILY_STATS: 'SET_DAILY_STATS',
  SET_WORKER_STATS: 'SET_WORKER_STATS',
  
  // UI Actions
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  
  // Pagination
  SET_PAGINATION: 'SET_PAGINATION',
};

// Reducer
const attendanceReducer = (state, action) => {
  switch (action.type) {
    // Session Actions
    case ActionTypes.SET_CURRENT_SESSION:
      return { ...state, currentSession: action.payload };
    
    case ActionTypes.SET_ATTENDANCE_SESSIONS:
      return { ...state, attendanceSessions: action.payload };
    
    case ActionTypes.ADD_SESSION:
      return { ...state, attendanceSessions: [action.payload, ...state.attendanceSessions] };
    
    case ActionTypes.UPDATE_SESSION:
      return {
        ...state,
        attendanceSessions: state.attendanceSessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        ),
        currentSession: state.currentSession?.id === action.payload.id ? action.payload : state.currentSession,
      };
    
    case ActionTypes.DELETE_SESSION:
      return {
        ...state,
        attendanceSessions: state.attendanceSessions.filter(session => session.id !== action.payload),
        currentSession: state.currentSession?.id === action.payload ? null : state.currentSession,
      };
    
    // Attendance Actions
    case ActionTypes.SET_ATTENDANCE_RECORDS:
      return { ...state, attendanceRecords: action.payload };
    
    case ActionTypes.ADD_ATTENDANCE_RECORD:
      return { ...state, attendanceRecords: [action.payload, ...state.attendanceRecords] };
    
    case ActionTypes.UPDATE_ATTENDANCE_RECORD:
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map(record =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    
    case ActionTypes.SET_WORKER_ATTENDANCE_HISTORY:
      return { ...state, workerAttendanceHistory: action.payload };
    
    // Statistics Actions
    case ActionTypes.SET_STATS:
      return { ...state, stats: action.payload };
    
    case ActionTypes.SET_DAILY_STATS:
      return { ...state, dailyStats: action.payload };
    
    case ActionTypes.SET_WORKER_STATS:
      return { ...state, workerStats: action.payload };
    
    // UI Actions
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, success: null };
    
    case ActionTypes.SET_SUCCESS:
      return { ...state, success: action.payload, error: null };
    
    case ActionTypes.CLEAR_MESSAGES:
      return { ...state, error: null, success: null };
    
    // Pagination
    case ActionTypes.SET_PAGINATION:
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
};

// ==========================================
// CONTEXT CREATION
// ==========================================

const AttendanceContext = createContext(null);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const AttendanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(attendanceReducer, initialState);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (state.error || state.success) {
      const timer = setTimeout(() => {
        dispatch({ type: ActionTypes.CLEAR_MESSAGES });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, state.success]);

  // ==========================================
  // SESSION ACTIONS
  // ==========================================

  /**
   * Create attendance session
   */
  const createSession = async (sessionData) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const session = await attendanceService.createSession(sessionData);
      
      dispatch({ type: ActionTypes.ADD_SESSION, payload: session });
      dispatch({ type: ActionTypes.SET_CURRENT_SESSION, payload: session });
      dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Attendance session created successfully' });
      
      return session;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch session by ID
   */
  const fetchSession = async (id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const session = await attendanceService.getSession(id);
      
      dispatch({ type: ActionTypes.SET_CURRENT_SESSION, payload: session });
      return session;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch active session for a project
   */
  const fetchProjectSession = async (projectId) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const session = await attendanceService.getProjectSession(projectId);
      
      dispatch({ type: ActionTypes.SET_CURRENT_SESSION, payload: session });
      return session;
    } catch (error) {
      // No active session is not an error, just null
      dispatch({ type: ActionTypes.SET_CURRENT_SESSION, payload: null });
      return null;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Close attendance session
   */
  const closeSession = async (id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const session = await attendanceService.closeSession(id);
      
      dispatch({ type: ActionTypes.UPDATE_SESSION, payload: session });
      
      if (state.currentSession?.id === id) {
        dispatch({ type: ActionTypes.SET_CURRENT_SESSION, payload: session });
      }
      
      dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Attendance session closed successfully' });
      return session;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Delete attendance session
   */
  const deleteSession = async (id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      await attendanceService.deleteSession(id);
      
      dispatch({ type: ActionTypes.DELETE_SESSION, payload: id });
      dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Attendance session deleted successfully' });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // ==========================================
  // ATTENDANCE ACTIONS
  // ==========================================

  /**
   * Scan QR code - Check in/out
   */
  const scanAttendance = async (session_token, scanData = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const result = await attendanceService.scanAttendance(session_token, scanData);
      const attendanceRecord = result.attendance || result.data || result;
      
      if (attendanceRecord?.id) {
        if (scanData.scan_type === 'check_out') {
          dispatch({ type: ActionTypes.UPDATE_ATTENDANCE_RECORD, payload: attendanceRecord });
        } else {
          dispatch({ type: ActionTypes.ADD_ATTENDANCE_RECORD, payload: attendanceRecord });
        }
      }
      
      dispatch({ type: ActionTypes.SET_SUCCESS, payload: result.message || 'Attendance recorded successfully' });
      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Check out
   */
  const checkOut = async (attendance_id) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const result = await attendanceService.checkOut(attendance_id);
      
      if (result.attendance) {
        dispatch({ type: ActionTypes.UPDATE_ATTENDANCE_RECORD, payload: result.attendance });
      }
      
      dispatch({ type: ActionTypes.SET_SUCCESS, payload: 'Check-out recorded successfully' });
      return result;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch attendance by project
   */
  const fetchAttendance = async (projectId, params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const records = await attendanceService.getAttendance(projectId, params);
      
      dispatch({ type: ActionTypes.SET_ATTENDANCE_RECORDS, payload: records });
      return records;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch attendance by session
   */
  const fetchAttendanceBySession = async (sessionId) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const records = await attendanceService.getAttendanceBySession(sessionId);
      
      dispatch({ type: ActionTypes.SET_ATTENDANCE_RECORDS, payload: records });
      return records;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch worker attendance history
   */
  const fetchAttendanceHistory = async (workerId, params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const history = await attendanceService.getAttendanceHistory(workerId, params);
      
      dispatch({ type: ActionTypes.SET_WORKER_ATTENDANCE_HISTORY, payload: history });
      return history;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // ==========================================
  // STATISTICS ACTIONS
  // ==========================================

  /**
   * Fetch attendance statistics
   */
  const fetchStats = async (params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const stats = await attendanceService.getAttendanceStats(params);
      
      dispatch({ type: ActionTypes.SET_STATS, payload: stats });
      return stats;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch daily attendance stats
   */
  const fetchDailyStats = async (params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const dailyStats = await attendanceService.getDailyAttendanceStats(params);
      
      dispatch({ type: ActionTypes.SET_DAILY_STATS, payload: dailyStats });
      return dailyStats;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  /**
   * Fetch worker attendance stats
   */
  const fetchWorkerStats = async (workerId, params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      dispatch({ type: ActionTypes.CLEAR_MESSAGES });

      const workerStats = await attendanceService.getWorkerAttendanceStats(workerId, params);
      
      dispatch({ type: ActionTypes.SET_WORKER_STATS, payload: workerStats });
      return workerStats;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // ==========================================
  // REFRESH ACTIONS
  // ==========================================

  /**
   * Refresh current session data
   */
  const refreshCurrentSession = async () => {
    if (state.currentSession?.id) {
      try {
        const session = await attendanceService.getSession(state.currentSession.id);
        dispatch({ type: ActionTypes.SET_CURRENT_SESSION, payload: session });
      } catch (error) {
        console.error('Failed to refresh session:', error);
      }
    }
  };

  /**
   * Refresh attendance data
   */
  const refreshAttendance = async () => {
    if (state.currentSession?.id) {
      try {
        const records = await attendanceService.getAttendanceBySession(state.currentSession.id);
        dispatch({ type: ActionTypes.SET_ATTENDANCE_RECORDS, payload: records });
      } catch (error) {
        console.error('Failed to refresh attendance:', error);
      }
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    // State
    ...state,
    
    // Session Actions
    createSession,
    fetchSession,
    fetchProjectSession,
    closeSession,
    deleteSession,
    
    // Attendance Actions
    scanAttendance,
    checkOut,
    fetchAttendance,
    fetchAttendanceBySession,
    fetchAttendanceHistory,
    
    // Statistics Actions
    fetchStats,
    fetchDailyStats,
    fetchWorkerStats,
    
    // Refresh Actions
    refreshCurrentSession,
    refreshAttendance,
    
    // Utility
    clearMessages: () => dispatch({ type: ActionTypes.CLEAR_MESSAGES }),
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export default AttendanceContext;
