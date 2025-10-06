import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import apiService from '@/services/api';
import { Analytics, APIError } from '@/types/api';
import { useAuth } from './AuthContext';

// Analytics State Types
interface AnalyticsState {
  dashboard: Analytics | null;
  wellnessReport: any | null;
  moodAnalytics: any | null;
  meditationAnalytics: any | null;
  habitAnalytics: any | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
  timeframe: string;
}

// Analytics Actions
type AnalyticsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_DASHBOARD_SUCCESS'; payload: Analytics }
  | { type: 'FETCH_WELLNESS_REPORT_SUCCESS'; payload: any }
  | { type: 'FETCH_MOOD_ANALYTICS_SUCCESS'; payload: any }
  | { type: 'FETCH_MEDITATION_ANALYTICS_SUCCESS'; payload: any }
  | { type: 'FETCH_HABIT_ANALYTICS_SUCCESS'; payload: any }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'SET_TIMEFRAME'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Analytics Context Interface
interface AnalyticsContextType {
  state: AnalyticsState;
  fetchDashboard: (timeframe?: string) => Promise<void>;
  fetchWellnessReport: (timeframe?: string) => Promise<void>;
  fetchMoodAnalytics: (timeframe?: string) => Promise<void>;
  fetchMeditationAnalytics: (timeframe?: string) => Promise<void>;
  fetchHabitAnalytics: (timeframe?: string) => Promise<void>;
  fetchAllAnalytics: (timeframe?: string) => Promise<void>;
  setTimeframe: (timeframe: string) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Initial State
const initialState: AnalyticsState = {
  dashboard: null,
  wellnessReport: null,
  moodAnalytics: null,
  meditationAnalytics: null,
  habitAnalytics: null,
  isLoading: false,
  error: null,
  lastFetch: null,
  timeframe: '30d',
};

// Analytics Reducer
function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FETCH_DASHBOARD_SUCCESS':
      return {
        ...state,
        dashboard: action.payload,
        isLoading: false,
        error: null,
        lastFetch: new Date(),
      };

    case 'FETCH_WELLNESS_REPORT_SUCCESS':
      return {
        ...state,
        wellnessReport: action.payload,
        isLoading: false,
        error: null,
      };

    case 'FETCH_MOOD_ANALYTICS_SUCCESS':
      return {
        ...state,
        moodAnalytics: action.payload,
        isLoading: false,
        error: null,
      };

    case 'FETCH_MEDITATION_ANALYTICS_SUCCESS':
      return {
        ...state,
        meditationAnalytics: action.payload,
        isLoading: false,
        error: null,
      };

    case 'FETCH_HABIT_ANALYTICS_SUCCESS':
      return {
        ...state,
        habitAnalytics: action.payload,
        isLoading: false,
        error: null,
      };

    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'SET_TIMEFRAME':
      return {
        ...state,
        timeframe: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Create Context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Analytics Provider Props
interface AnalyticsProviderProps {
  children: ReactNode;
}

// Analytics Provider Component
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);
  const { state: authState } = useAuth();

  // Reset state when user logs out
  useEffect(() => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [authState.isAuthenticated]);

  // Auto-fetch dashboard when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !state.lastFetch) {
      fetchDashboard();
    }
  }, [authState.isAuthenticated, authState.user]);

  // Fetch dashboard function
  const fetchDashboard = async (timeframe?: string): Promise<void> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const tf = timeframe || state.timeframe;
      const response = await apiService.getDashboardAnalytics(tf);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_DASHBOARD_SUCCESS', payload: response.data });
        if (timeframe) {
          dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
        }
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard analytics');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to fetch dashboard analytics';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    }
  };

  // Fetch wellness report function
  const fetchWellnessReport = async (timeframe?: string): Promise<void> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const tf = timeframe || state.timeframe;
      const response = await apiService.getWellnessReport(tf);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_WELLNESS_REPORT_SUCCESS', payload: response.data });
        if (timeframe) {
          dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
        }
      } else {
        throw new Error(response.message || 'Failed to fetch wellness report');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to fetch wellness report';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    }
  };

  // Fetch mood analytics function
  const fetchMoodAnalytics = async (timeframe?: string): Promise<void> => {
    try {
      const tf = timeframe || state.timeframe;
      const response = await apiService.getMoodAnalytics(tf);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_MOOD_ANALYTICS_SUCCESS', payload: response.data });
        if (timeframe) {
          dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
        }
      }
    } catch (error) {
      console.error('Failed to fetch mood analytics:', error);
    }
  };

  // Fetch meditation analytics function
  const fetchMeditationAnalytics = async (timeframe?: string): Promise<void> => {
    try {
      const tf = timeframe || state.timeframe;
      const response = await apiService.getMeditationAnalytics(tf);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_MEDITATION_ANALYTICS_SUCCESS', payload: response.data });
        if (timeframe) {
          dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
        }
      }
    } catch (error) {
      console.error('Failed to fetch meditation analytics:', error);
    }
  };

  // Fetch habit analytics function
  const fetchHabitAnalytics = async (timeframe?: string): Promise<void> => {
    try {
      const tf = timeframe || state.timeframe;
      const response = await apiService.getHabitAnalytics(tf);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_HABIT_ANALYTICS_SUCCESS', payload: response.data });
        if (timeframe) {
          dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
        }
      }
    } catch (error) {
      console.error('Failed to fetch habit analytics:', error);
    }
  };

  // Fetch all analytics function
  const fetchAllAnalytics = async (timeframe?: string): Promise<void> => {
    const tf = timeframe || state.timeframe;
    
    await Promise.all([
      fetchDashboard(tf),
      fetchWellnessReport(tf),
      fetchMoodAnalytics(tf),
      fetchMeditationAnalytics(tf),
      fetchHabitAnalytics(tf),
    ]);
  };

  // Set timeframe function
  const setTimeframe = (timeframe: string) => {
    dispatch({ type: 'SET_TIMEFRAME', payload: timeframe });
    // Optionally auto-refresh data with new timeframe
    fetchDashboard(timeframe);
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh data function
  const refreshData = async (): Promise<void> => {
    await fetchAllAnalytics(state.timeframe);
  };

  // Context value
  const value: AnalyticsContextType = {
    state,
    fetchDashboard,
    fetchWellnessReport,
    fetchMoodAnalytics,
    fetchMeditationAnalytics,
    fetchHabitAnalytics,
    fetchAllAnalytics,
    setTimeframe,
    clearError,
    refreshData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Custom hook to use analytics context
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;