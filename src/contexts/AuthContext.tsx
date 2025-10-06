import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import apiService from '@/services/api';
import { User, LoginData, RegisterData, APIError } from '@/types/api';

// Auth State Types
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | { type: 'AUTH_INIT_SUCCESS'; payload: User | null }
  | { type: 'AUTH_INIT_FAILURE'; payload: string }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ERROR'; payload: string };

// Auth Context Interface
interface AuthContextType {
  state: AuthState;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
  checkAuthStatus: () => boolean;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_INIT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_INIT_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case 'AUTH_INIT_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        isInitialized: true,
      };

    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    dispatch({ type: 'AUTH_INIT_START' });

    try {
      // Check if we have a stored token
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: null });
        return;
      }

      // Validate token by fetching current user
      const response = await apiService.getCurrentUser();
      
      if (response.success && response.data) {
        // Update stored user with fresh data
        localStorage.setItem('user', JSON.stringify(response.data));
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: response.data });
      } else {
        // Invalid token, clear storage
        apiService.clearAuth();
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: null });
      }
    } catch (error) {
      // Token validation failed, try to refresh
      try {
        await apiService.refreshToken();
        const response = await apiService.getCurrentUser();
        
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data));
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: response.data });
        } else {
          throw new Error('Failed to get user after token refresh');
        }
      } catch (refreshError) {
        // Refresh failed, clear auth
        apiService.clearAuth();
        const errorMessage = (refreshError as APIError).message || 'Authentication expired';
        dispatch({ type: 'AUTH_INIT_FAILURE', payload: errorMessage });
      }
    }
  };

  // Login function
  const login = async (data: LoginData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await apiService.login(data);
      
      if (response.success && response.data) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const response = await apiService.register(data);
      
      if (response.success && response.data) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: response.data.user });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Log error but still clear local state
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Update user function
  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh auth function
  const refreshAuth = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        updateUser(response.data);
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to refresh user data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Check auth status function
  const checkAuthStatus = (): boolean => {
    return state.isAuthenticated && !!state.user;
  };

  // Context value
  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshAuth,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback = <div>Please log in to access this page.</div> 
}) => {
  const { state } = useAuth();

  if (!state.isInitialized) {
    return <div>Loading...</div>;
  }

  if (!state.isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { state } = useAuth();
  
  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    user: state.user,
    error: state.error,
  };
};

// Hook for auth actions
export const useAuthActions = () => {
  const { login, register, logout, clearError, refreshAuth, checkAuthStatus } = useAuth();
  
  return {
    login,
    register,
    logout,
    clearError,
    refreshAuth,
    checkAuthStatus,
  };
};

export default AuthContext;