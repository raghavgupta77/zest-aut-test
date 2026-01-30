/**
 * Authentication Context and State Management
 * Provides centralized authentication state management with React Context
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthToken, AuthCredentials } from '../types';

// Authentication state interface
export interface AuthState {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Authentication actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: AuthToken } }
  | { type: 'AUTH_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_RESTORE'; payload: { user: User; token: AuthToken } };

// Authentication context interface
interface AuthContextType {
  state: AuthState;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Authentication reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'AUTH_RESTORE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
}

// State persistence utilities
class StatePersistence {
  private readonly AUTH_STATE_KEY = 'auth_state';
  private readonly STATE_VERSION = '1.0';

  saveAuthState(user: User | null, token: AuthToken | null): void {
    const state = {
      user,
      token,
      version: this.STATE_VERSION,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(state, (_key, value) => {
        // Handle Date serialization
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      }));
    } catch (error) {
      console.warn('Failed to save auth state:', error);
    }
  }

  loadAuthState(): { user: User | null; token: AuthToken | null } {
    try {
      const stored = localStorage.getItem(this.AUTH_STATE_KEY);
      if (!stored) {
        return { user: null, token: null };
      }

      const state = JSON.parse(stored, (_key, value) => {
        // Handle Date deserialization
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });
      
      // Validate state version and structure
      if (state.version !== this.STATE_VERSION) {
        this.clearAuthState();
        return { user: null, token: null };
      }

      // Check if state is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - state.timestamp > maxAge) {
        this.clearAuthState();
        return { user: null, token: null };
      }

      return {
        user: state.user,
        token: state.token
      };
    } catch (error) {
      console.warn('Failed to load auth state:', error);
      this.clearAuthState();
      return { user: null, token: null };
    }
  }

  clearAuthState(): void {
    localStorage.removeItem(this.AUTH_STATE_KEY);
  }
}

// Sensitive data cleanup utilities
class SensitiveDataCleanup {
  clearSensitiveData(): void {
    // Clear localStorage auth data
    localStorage.removeItem('auth_state');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_session');
    
    // Clear sessionStorage auth data
    sessionStorage.removeItem('auth_state');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user_session');
    
    // Clear any other sensitive data patterns
    const sensitivePatterns = ['token', 'auth', 'user', 'session'];
    
    // Clear localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))) {
        sessionStorage.removeItem(key);
      }
    }
  }
}

// State change notification utilities
class StateChangeNotification {
  private listeners: Set<(newState: AuthState, previousState: AuthState) => void> = new Set();
  private currentState: AuthState = initialState;

  subscribe(listener: (newState: AuthState, previousState: AuthState) => void): () => void {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify(newState: AuthState): void {
    const previousState = { ...this.currentState };
    this.currentState = { ...newState };

    this.listeners.forEach(listener => {
      try {
        listener({ ...newState }, previousState);
      } catch (error) {
        console.warn('State change listener error:', error);
      }
    });
  }
}

// Concurrent authentication handler
class ConcurrentAuthenticationHandler {
  private pendingAuthentications: Map<string, Promise<{ user: User; token: AuthToken }>> = new Map();

  async authenticate(
    credentials: AuthCredentials,
    authFunction: (creds: AuthCredentials) => Promise<{ user: User; token: AuthToken }>
  ): Promise<{ user: User; token: AuthToken }> {
    const key = this.getCredentialsKey(credentials);
    
    // Cancel existing authentication for same credentials
    if (this.pendingAuthentications.has(key)) {
      this.pendingAuthentications.delete(key);
    }

    const authPromise = authFunction(credentials);
    this.pendingAuthentications.set(key, authPromise);

    try {
      const result = await authPromise;
      this.pendingAuthentications.delete(key);
      return result;
    } catch (error) {
      this.pendingAuthentications.delete(key);
      throw error;
    }
  }

  private getCredentialsKey(credentials: AuthCredentials): string {
    switch (credentials.type) {
      case 'email':
        return `email:${credentials.email}`;
      case 'phone':
        return `phone:${credentials.phoneNumber}`;
      case 'google':
        return `google:${credentials.externalToken}`;
      case 'truecaller':
        return `truecaller:${credentials.externalToken}`;
      default:
        return `unknown:${JSON.stringify(credentials)}`;
    }
  }

  isAuthenticationInProgress(): boolean {
    return this.pendingAuthentications.size > 0;
  }

  cancelPendingAuthentication(): void {
    this.pendingAuthentications.clear();
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context for use in other components
export { AuthContext };

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Authentication provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Utilities
  const statePersistence = new StatePersistence();
  const dataCleanup = new SensitiveDataCleanup();
  const stateNotification = new StateChangeNotification();
  const concurrentHandler = new ConcurrentAuthenticationHandler();

  // Mock authentication function (replace with actual API calls)
  const authenticateUser = async (credentials: AuthCredentials): Promise<{ user: User; token: AuthToken }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication logic
    if (credentials.type === 'email' && credentials.email && credentials.password) {
      return {
        user: {
          id: `user_${Date.now()}`,
          email: credentials.email,
          isVerified: true,
          createdAt: new Date(),
          lastLoginAt: new Date()
        },
        token: {
          accessToken: `token_${Date.now()}`,
          refreshToken: `refresh_${Date.now()}`,
          tokenType: 'Bearer',
          expiresIn: 3600,
          scope: 'read write'
        }
      };
    }
    
    throw new Error('Invalid credentials');
  };

  // Login function
  const login = useCallback(async (credentials: AuthCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const result = await concurrentHandler.authenticate(credentials, authenticateUser);
      
      dispatch({ 
        type: 'AUTH_SUCCESS', 
        payload: { user: result.user, token: result.token } 
      });
      
      // Persist state
      statePersistence.saveAuthState(result.user, result.token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      dispatch({ type: 'AUTH_FAILURE', payload: { error: errorMessage } });
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    dispatch({ type: 'AUTH_LOGOUT' });
    
    // Clear persisted state
    statePersistence.clearAuthState();
    
    // Clear sensitive data
    dataCleanup.clearSensitiveData();
    
    // Cancel pending authentications
    concurrentHandler.cancelPendingAuthentication();
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  // Refresh authentication function
  const refreshAuth = useCallback(async () => {
    const { user, token } = statePersistence.loadAuthState();
    
    if (user && token) {
      dispatch({ type: 'AUTH_RESTORE', payload: { user, token } });
    }
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Notify state changes
  useEffect(() => {
    stateNotification.notify(state);
  }, [state]);

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export utilities for testing
export { StatePersistence, SensitiveDataCleanup, StateChangeNotification, ConcurrentAuthenticationHandler };