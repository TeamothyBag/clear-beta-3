import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import apiService from '@/services/api';
import { MoodEntry, CreateMoodEntryData, APIError } from '@/types/api';
import { useAuth } from './AuthContext';
import { GlobalErrorHandler } from '../utils/errorHandling';

// Mood State Types
interface MoodState {
  entries: MoodEntry[];
  currentEntry: MoodEntry | null;
  insights: any | null;
  analytics: any | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetch: Date | null;
}

// Mood Actions
type MoodAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: MoodEntry[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: MoodEntry }
  | { type: 'CREATE_FAILURE'; payload: string }
  | { type: 'UPDATE_SUCCESS'; payload: MoodEntry }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'SET_CURRENT_ENTRY'; payload: MoodEntry | null }
  | { type: 'SET_INSIGHTS'; payload: any }
  | { type: 'SET_ANALYTICS'; payload: any }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Mood Context Interface
interface MoodContextType {
  state: MoodState;
  createMoodEntry: (data: CreateMoodEntryData) => Promise<MoodEntry>;
  updateMoodEntry: (id: string, data: Partial<CreateMoodEntryData>) => Promise<MoodEntry>;
  deleteMoodEntry: (id: string) => Promise<void>;
  fetchMoodEntries: (params?: any) => Promise<void>;
  fetchMoodInsights: (timeframe?: string) => Promise<void>;
  setCurrentEntry: (entry: MoodEntry | null) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Initial State
const initialState: MoodState = {
  entries: [],
  currentEntry: null,
  insights: null,
  analytics: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastFetch: null,
};

// Mood Reducer
function moodReducer(state: MoodState, action: MoodAction): MoodState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        entries: Array.isArray(action.payload) ? action.payload : [],
        isLoading: false,
        error: null,
        lastFetch: new Date(),
      };

    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'CREATE_START':
      return {
        ...state,
        isSubmitting: true,
        error: null,
      };

    case 'CREATE_SUCCESS':
      return {
        ...state,
        entries: [action.payload, ...(Array.isArray(state.entries) ? state.entries : [])],
        currentEntry: action.payload,
        isSubmitting: false,
        error: null,
      };

    case 'CREATE_FAILURE':
      return {
        ...state,
        isSubmitting: false,
        error: action.payload,
      };

    case 'UPDATE_SUCCESS':
      return {
        ...state,
        entries: Array.isArray(state.entries) ? state.entries.map(entry => 
          entry._id === action.payload._id ? action.payload : entry
        ) : [action.payload],
        currentEntry: state.currentEntry?._id === action.payload._id ? action.payload : state.currentEntry,
        error: null,
      };

    case 'DELETE_SUCCESS':
      return {
        ...state,
        entries: Array.isArray(state.entries) ? state.entries.filter(entry => entry._id !== action.payload) : [],
        currentEntry: state.currentEntry?._id === action.payload ? null : state.currentEntry,
        error: null,
      };

    case 'SET_CURRENT_ENTRY':
      return {
        ...state,
        currentEntry: action.payload,
      };

    case 'SET_INSIGHTS':
      return {
        ...state,
        insights: action.payload,
      };

    case 'SET_ANALYTICS':
      return {
        ...state,
        analytics: action.payload,
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
const MoodContext = createContext<MoodContextType | undefined>(undefined);

// Mood Provider Props
interface MoodProviderProps {
  children: ReactNode;
}

// Mood Provider Component
export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(moodReducer, initialState);
  const { state: authState } = useAuth();

  // Reset state when user logs out
  useEffect(() => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [authState.isAuthenticated]);

  // Create mood entry function
  const createMoodEntry = async (data: CreateMoodEntryData): Promise<MoodEntry> => {
    dispatch({ type: 'CREATE_START' });

    try {
      const response = await apiService.createMoodEntry(data);
      
      if (response.success && response.data) {
        dispatch({ type: 'CREATE_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create mood entry');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to create mood entry';
      GlobalErrorHandler.getInstance().logError(error, 'MoodContext.createMoodEntry');
      dispatch({ type: 'CREATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update mood entry function
  const updateMoodEntry = async (id: string, data: Partial<CreateMoodEntryData>): Promise<MoodEntry> => {
    try {
      const response = await apiService.updateMoodEntry(id, data);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update mood entry');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to update mood entry';
      dispatch({ type: 'CREATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Delete mood entry function
  const deleteMoodEntry = async (id: string): Promise<void> => {
    try {
      const response = await apiService.deleteMoodEntry(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_SUCCESS', payload: id });
      } else {
        throw new Error(response.message || 'Failed to delete mood entry');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to delete mood entry';
      dispatch({ type: 'CREATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Fetch mood entries function - memoized to prevent infinite loops
  const fetchMoodEntries = useCallback(async (params: any = {}): Promise<void> => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await apiService.getMoodEntries(params);
      
      if (response.success && response.data) {
        // Handle the backend response structure where mood entries are nested in data.moodEntries
        const moodEntries = Array.isArray(response.data) 
          ? response.data 
          : (response.data as any).moodEntries || [];
        
        dispatch({ type: 'FETCH_SUCCESS', payload: moodEntries });
      } else {
        throw new Error(response.message || 'Failed to fetch mood entries');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to fetch mood entries';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    }
  }, []);

  // Fetch mood insights function - memoized to prevent infinite loops
  const fetchMoodInsights = useCallback(async (timeframe: string = '30d'): Promise<void> => {
    try {
      const response = await apiService.getMoodInsights(timeframe);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_INSIGHTS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch mood insights:', error);
    }
  }, []);

  // Auto-fetch mood entries when user is authenticated (after function declaration)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && !state.lastFetch) {
      fetchMoodEntries();
    }
  }, [authState.isAuthenticated, authState.user, state.lastFetch, fetchMoodEntries]);

  // Set current entry function
  const setCurrentEntry = (entry: MoodEntry | null) => {
    dispatch({ type: 'SET_CURRENT_ENTRY', payload: entry });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh data function - memoized
  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchMoodEntries(),
      fetchMoodInsights()
    ]);
  }, [fetchMoodEntries, fetchMoodInsights]);

  // Context value
  const value: MoodContextType = {
    state,
    createMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    fetchMoodEntries,
    fetchMoodInsights,
    setCurrentEntry,
    clearError,
    refreshData,
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
};

// Custom hook to use mood context
export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

export default MoodContext;