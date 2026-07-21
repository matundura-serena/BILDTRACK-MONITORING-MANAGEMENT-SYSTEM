# BuildTrack Architecture - Dependency Report

## Executive Summary
Complete architectural scan performed before authentication implementation. This document identifies all existing patterns, dependencies, and integration points for the AuthContext.

---

## 1. Discovered API Client

### Configuration File: `src/config/apiConfig.js`
- **Export Pattern**: Named export `API_BASE_URL` + default export
- **Type**: String constant (base URL only)
- **Client Library**: Native `fetch()` API (NOT Axios)
- **Platform Handling**: Android emulator (192.168.1.100:5000) vs iOS/Web (localhost:5000)

### Usage Pattern Across Services
All services follow this exact pattern:
```javascript
import { API_BASE_URL } from '../config/apiConfig';

const response = await fetch(`${API_BASE_URL}/api/endpoint`, {
  method: 'GET/POST/PUT/DELETE',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

### Services Using This Pattern
- `workerService.js` - 6 functions (getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker, getWorkerStats)
- `projectService.js` - 5 functions (getProjects, getProjectById, createProject, updateProject, deleteProject)
- `taskService.js` - 8 functions (getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskProgress, updateTaskStatus, completeTask)
- `attendanceService.js` - 10 functions (createSession, getSession, getProjectSession, closeSession, deleteSession, scanAttendance, checkOut, getAttendance, getAttendanceBySession, getAttendanceHistory, getAttendanceStats, getDailyAttendanceStats, getWorkerAttendanceStats)
- `analyticsService.js` - 10 functions (getDashboardSummary, getProjectStats, getWorkerStats, getTaskStats, getMilestoneStats, getProjectProgressData, getTaskCompletionTrends, getWorkerProductivity, getProjectStatusDistribution, getMilestoneProgressData, getAttendanceStats)

**CRITICAL FINDING**: No Axios instance exists. The existing AuthContext.js incorrectly references `import api from '../config/apiConfig'` which will fail.

---

## 2. Authentication Endpoints Found

### Backend Routes (my-backend/server.js)
**NO AUTHENTICATION ROUTES EXIST**

Currently mounted routes:
- `/api/projects` - projectRoutes.js
- `/api/workers` - workerRoutes.js
- `/api/milestones` - milestoneRoutes.js
- `/api/tasks` - taskRoutes.js
- `/api/analytics` - analyticsRoutes.js
- `/api/attendance` - attendanceRoutes.js

### Referenced in AuthContext.js (DO NOT EXIST)
- `POST /auth/login` - **NOT FOUND**
- `GET /auth/me` - **NOT FOUND**

### Conclusion
**No authentication backend exists.** The current AuthContext.js will fail with 404 errors on all authentication attempts.

---

## 3. Provider Hierarchy

### Current App.js Structure
```
SafeAreaProvider
└── ProjectProvider
    └── TaskProvider
        └── WorkerProvider
            └── AttendanceProvider
                └── AnalyticsProvider
                    └── NavigationContainer
                        └── AppNavigator
```

### Context Files
1. `ProjectContext.js` - ProjectProvider (uses projectService, milestoneService)
2. `TaskContext.js` - TaskProvider (uses taskService)
3. `WorkerContext.js` - WorkerProvider (uses workerService)
4. `AttendanceContext.js` - AttendanceProvider (uses attendanceService)
5. `AnalyticsContext.js` - AnalyticsProvider (uses analyticsService)
6. `AuthContext.js` - AuthProvider (EXISTS BUT BROKEN)

### Context Pattern
All contexts follow this structure:
- Named export: `export function [Name]Provider({ children })`
- Named export: `export function use[Name]()`
- Default export: `export default [Name]Provider`
- State management: useState + useEffect
- Service import: `import * as [name]Service from '../services/[name]Service'`
- Error handling: try/catch with console.error logging
- Custom hook with fallback values when context not found

---

## 4. Required Imports

### For New AuthContext.js
```javascript
// React
import React, { createContext, useContext, useState, useEffect } from 'react';

// Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Config
import { API_BASE_URL } from '../config/apiConfig';

// NO service imports needed (will use fetch directly like other services)
```

### For App.js Updates
```javascript
import { AuthProvider } from './src/context/AuthContext';
```

### Integration Point
AuthProvider must wrap all other providers to ensure authentication state is available throughout the app.

---

## 5. Potential Circular Dependencies

### Analysis
**NO CIRCULAR DEPENDENCIES DETECTED**

Current dependency flow:
- Services → config/apiConfig (one-way)
- Contexts → Services (one-way)
- Screens → Contexts (one-way)
- App.js → Contexts (one-way)

### Safe Integration Points
1. AuthContext can import from config/apiConfig ✓
2. AuthContext does NOT need to import any other context ✓
3. Other contexts do NOT need to import AuthContext (can use optional chaining) ✓
4. Screens can optionally useAuth() without breaking existing contexts ✓

---

## 6. Files That Will Be Modified

### Files to Create
1. **`src/context/AuthContext.js`** (REPLACE existing broken version)
   - Remove Axios dependency
   - Use native fetch() like all other services
   - Add mock authentication mode for development
   - Follow existing context patterns exactly

### Files to Modify
1. **`App.js`**
   - Add AuthProvider import
   - Wrap all providers with AuthProvider
   - New hierarchy: AuthProvider → ProjectProvider → TaskProvider → WorkerProvider → AttendanceProvider → AnalyticsProvider

2. **`src/screens/SignInScreen.js`**
   - Connect to AuthContext
   - Use login() function from context
   - Handle authentication state

3. **`src/screens/SplashScreen.js`**
   - Check authentication state
   - Route to MainTabs if authenticated, SignIn if not

### Files NOT to Modify
- All service files (workerService, projectService, etc.) - no changes needed
- All other context files - no changes needed
- AppNavigator.js - no changes needed
- Backend files - no authentication routes exist yet

---

## 7. Coding Standards Identified

### Service Layer Pattern
- Named exports for all functions
- Async/await with try/catch
- URL construction with template literals
- Response validation (response.ok check)
- Error normalization (errorData.error || message)
- Console.error logging with ❌ emoji prefix
- Throw errors to caller for handling

### Context Pattern
- createContext(null) initialization
- useState for state management
- useEffect for lifecycle
- useReducer only in AttendanceContext (complex state)
- Custom hook with fallback object
- Provider returns context.Provider with value object
- All functions wrapped in try/catch
- Loading state management
- Error state with Alert.alert for user feedback

### Naming Conventions
- Functions: camelCase (getWorkers, createProject)
- Contexts: PascalCase (WorkerContext, ProjectContext)
- Providers: [Name]Provider (WorkerProvider, ProjectProvider)
- Hooks: use[Name] (useWorkers, useProjects)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL, COLORS)

---

## 8. Mock Authentication Strategy

### Rationale
Since no authentication backend exists, implement a mock authentication system that:
1. Provides a logged-in user object compatible with existing modules
2. Stores token in AsyncStorage (same as current AuthContext)
3. Uses native fetch() to match project patterns
4. Can be easily replaced with real API calls when backend is ready

### Mock User Object Structure
```javascript
{
  id: 1,
  email: 'demo@buildtrack.com',
  name: 'Demo User',
  role: 'manager', // or 'worker'
  created_at: '2024-01-01T00:00:00Z'
}
```

### Compatibility
- QR Attendance module: Requires user.id for worker identification
- Analytics module: Requires user.role for permission checks
- All other modules: Use user.id for data filtering

---

## 9. Integration Verification Checklist

### Before Implementation
- [x] All service files inspected
- [x] All context files inspected
- [x] App.js structure analyzed
- [x] Backend routes verified
- [x] Import patterns confirmed
- [x] No circular dependencies detected
- [x] Coding standards documented

### After Implementation
- [ ] AuthContext.js compiles without errors
- [ ] All imports resolve successfully
- [ ] App.js builds with new provider hierarchy
- [ ] SignInScreen connects to AuthContext
- [ ] SplashScreen checks auth state
- [ ] No console errors on app launch
- [ ] Mock authentication works
- [ ] AsyncStorage persistence works
- [ ] All existing contexts still function

---

## 10. Risk Assessment

### Low Risk
- Adding AuthProvider to App.js (simple wrapper)
- Creating mock authentication (no backend dependency)
- Using native fetch() (matches existing pattern)

### Medium Risk
- Modifying SignInScreen (needs careful integration)
- SplashScreen routing logic (needs auth state check)

### High Risk
- **NONE** - All changes are additive or replacement of broken code

---

## Conclusion

The BuildTrack project has a well-structured architecture with consistent patterns. The existing AuthContext.js is broken due to:
1. Non-existent Axios import
2. Non-existent authentication endpoints
3. Incorrect API client usage

The recommended approach is to replace AuthContext.js with a mock authentication system that:
- Uses native fetch() like all other services
- Provides a demo user for development
- Can be easily upgraded to real authentication when backend is ready
- Follows all existing project patterns exactly

**Next Step**: Generate new AuthContext.js and update App.js provider hierarchy.