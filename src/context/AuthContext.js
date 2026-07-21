import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/apiConfig';

const AuthContext = createContext(null);

export const USER_ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  SUPERVISOR: 'supervisor',
  WORKER: 'worker',
};

export const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase().replace(/\s+/g, '_');

  if (value === 'admin') return USER_ROLES.ADMIN;
  if (value === 'project_manager') return USER_ROLES.PROJECT_MANAGER;
  if (value === 'supervisor') return USER_ROLES.SUPERVISOR;
  if (value === 'worker') return USER_ROLES.WORKER;

  return value;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }) {
  const [appLoading, setAppLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authStartScreen, setAuthStartScreen] = useState('SignUp');

  const applyAuthSession = (authToken, authUser) => {
    const nextRole = normalizeRole(authUser?.role);

    setToken(authToken);
    setUser(authUser);
    setRole(nextRole);
    setAuthenticated(Boolean(authToken));
  };

  const persistSession = async (authToken, authUser) => {
    await AsyncStorage.multiSet([
      ['auth_token', authToken],
      ['auth_user', JSON.stringify(authUser)],
    ]);
    applyAuthSession(authToken, authUser);
  };

  const clearSession = async () => {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    setAuthenticated(false);
    setUser(null);
    setRole(null);
    setToken(null);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      let storedToken = null;
      let storedUser = null;

      await Promise.all([
        sleep(5000),
        (async () => {
          try {
            storedToken = await AsyncStorage.getItem('auth_token');
            const rawUser = await AsyncStorage.getItem('auth_user');
            storedUser = rawUser ? JSON.parse(rawUser) : null;
          } catch (error) {
            storedToken = null;
            storedUser = null;
            await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
          }
        })(),
      ]);

      if (!mounted) return;

      if (storedToken && storedUser) {
        applyAuthSession(storedToken, storedUser);
      } else {
        setAuthenticated(false);
        setUser(null);
        setRole(null);
        setToken(null);
        setAuthStartScreen('SignUp');
      }

      setAuthInitialized(true);
      setAppLoading(false);
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      setLoginLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Invalid credentials');
      }

      const payload = json.data;

if (!payload?.token || !payload?.user?.role) {
  throw new Error('Login response must include a token and user role');
}

await persistSession(payload.token, payload.user);

return {
  success: true,
  user: payload.user,
  role: normalizeRole(payload.user.role),
};

    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      setLoginLoading(false);
    }
  };

  const register = async ({ name, email, password, role: requestedRole, worker_id }) => {
    try {
      setSignupLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role: requestedRole, worker_id }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Registration failed');
      }

      return { success: true, user: json.data.user };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      setSignupLoading(false);
    }
  };

  const logout = async () => {
    setAuthStartScreen('SignIn');
    await clearSession();
  };

  const updateUser = async (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    setRole(normalizeRole(updated.role));
    await AsyncStorage.setItem('auth_user', JSON.stringify(updated));
  };

  const refreshUser = async () => user;

  const value = useMemo(
    () => ({
      appLoading,
      authenticated,
      user,
      role,
      token,
      loginLoading,
      signupLoading,
      authInitialized,
      authStartScreen,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [appLoading, authenticated, user, role, token, loginLoading, signupLoading, authInitialized, authStartScreen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

export default AuthProvider;
