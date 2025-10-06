import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import apiService from '@/services/api';
import { Habit, HabitCompletion, CreateHabitData, APIError } from '@/types/api';
import { useAuth } from './AuthContext';

// Habit State Types
interface HabitState {
  habits: Habit[];
  completions: Record<string, HabitCompletion[]>; // habitId -> completions
  summary: any | null;
  analytics: any | null;
  pagination: any | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastFetch: Date | null;
}

// Habit Actions
type HabitAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { habits: Habit[]; pagination?: any } }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; payload: Habit }
  | { type: 'CREATE_FAILURE'; payload: string }
  | { type: 'UPDATE_SUCCESS'; payload: Habit }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'COMPLETE_START' }
  | { type: 'COMPLETE_SUCCESS'; payload: { habitId: string; completion: HabitCompletion } }
  | { type: 'COMPLETE_FAILURE'; payload: string }
  | { type: 'SET_COMPLETIONS'; payload: { habitId: string; completions: HabitCompletion[] } }
  | { type: 'SET_SUMMARY'; payload: any }
  | { type: 'SET_ANALYTICS'; payload: any }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Habit Context Interface
interface HabitContextType {
  state: HabitState;
  createHabit: (data: CreateHabitData) => Promise<Habit>;
  updateHabit: (id: string, data: Partial<CreateHabitData>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, data: any) => Promise<HabitCompletion>;
  markHabitIncomplete: (habitId: string, data: any) => Promise<HabitCompletion>;
  fetchHabits: (params?: any) => Promise<void>;
  fetchHabitCompletions: (habitId: string, params?: any) => Promise<void>;
  fetchHabitsSummary: () => Promise<void>;
  fetchHabitAnalytics: (timeframe?: string) => Promise<void>;
  getTodaysHabits: () => Habit[];
  getHabitStreak: (habitId: string) => number;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Initial State
const initialState: HabitState = {
  habits: [],
  completions: {},
  summary: null,
  analytics: null,
  pagination: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastFetch: null,
};

// Habit Reducer
function habitReducer(state: HabitState, action: HabitAction): HabitState {
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
        habits: Array.isArray(action.payload.habits) ? action.payload.habits : [],
        pagination: action.payload.pagination || null,
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
    case 'COMPLETE_START':
      return {
        ...state,
        isSubmitting: true,
        error: null,
      };

    case 'CREATE_SUCCESS':
      return {
        ...state,
        habits: Array.isArray(state.habits) ? [action.payload, ...state.habits] : [action.payload],
        isSubmitting: false,
        error: null,
      };

    case 'CREATE_FAILURE':
    case 'COMPLETE_FAILURE':
      return {
        ...state,
        isSubmitting: false,
        error: action.payload,
      };

    case 'UPDATE_SUCCESS':
      return {
        ...state,
        habits: Array.isArray(state.habits) ? state.habits.map(habit => 
          habit._id === action.payload._id ? action.payload : habit
        ) : [action.payload],
        error: null,
      };

    case 'DELETE_SUCCESS':
      return {
        ...state,
        habits: Array.isArray(state.habits) ? state.habits.filter(habit => habit._id !== action.payload) : [],
        completions: Object.fromEntries(
          Object.entries(state.completions).filter(([habitId]) => habitId !== action.payload)
        ),
        error: null,
      };

    case 'COMPLETE_SUCCESS':
      const { habitId, completion } = action.payload;
      const existingCompletions = state.completions[habitId] || [];
      
      // Update or add completion
      const updatedCompletions = existingCompletions.some(c => c._id === completion._id)
        ? existingCompletions.map(c => c._id === completion._id ? completion : c)
        : [completion, ...existingCompletions];

      return {
        ...state,
        completions: {
          ...state.completions,
          [habitId]: updatedCompletions,
        },
        isSubmitting: false,
        error: null,
      };

    case 'SET_COMPLETIONS':
      return {
        ...state,
        completions: {
          ...state.completions,
          [action.payload.habitId]: action.payload.completions,
        },
      };

    case 'SET_SUMMARY':
      return {
        ...state,
        summary: action.payload,
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
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Habit Provider Props
interface HabitProviderProps {
  children: ReactNode;
}

// Habit Provider Component
export const HabitProvider: React.FC<HabitProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(habitReducer, initialState);
  const { state: authState } = useAuth();
  const isFetchingRef = useRef(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'RESET_STATE' });
      isFetchingRef.current = false;
    }
  }, [authState.isAuthenticated]);

  // Fetch habits function - memoized to prevent infinite loops
  const fetchHabits = useCallback(async (params: any = {}): Promise<void> => {
    if (isFetchingRef.current) {
      console.log('fetchHabits: Already fetching, skipping...');
      return;
    }

    isFetchingRef.current = true;
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await apiService.getHabits(params);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
      } else {
        throw new Error(response.message || 'Failed to fetch habits');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to fetch habits';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch habits summary function - memoized to prevent infinite loops
  const fetchHabitsSummary = useCallback(async (): Promise<void> => {
    try {
      const response = await apiService.getHabitsSummary();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_SUMMARY', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch habits summary:', error);
    }
  }, []);

  // Auto-fetch data when user is authenticated - fixed dependencies
  useEffect(() => {
    const shouldFetch = authState.isAuthenticated && 
                       authState.user && 
                       !state.lastFetch && 
                       !isFetchingRef.current;

    if (shouldFetch) {
      console.log('HabitProvider: Auto-fetching initial data');
      fetchHabits();
      fetchHabitsSummary();
    }
  }, [authState.isAuthenticated, authState.user, state.lastFetch, fetchHabits, fetchHabitsSummary]);

  // Create habit function
  const createHabit = async (data: CreateHabitData): Promise<Habit> => {
    dispatch({ type: 'CREATE_START' });

    try {
      const response = await apiService.createHabit(data);
      
      if (response.success && response.data) {
        dispatch({ type: 'CREATE_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create habit');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to create habit';
      dispatch({ type: 'CREATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update habit function
  const updateHabit = async (id: string, data: Partial<CreateHabitData>): Promise<Habit> => {
    try {
      const response = await apiService.updateHabit(id, data);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update habit');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to update habit';
      dispatch({ type: 'CREATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Delete habit function
  const deleteHabit = async (id: string): Promise<void> => {
    try {
      const response = await apiService.deleteHabit(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_SUCCESS', payload: id });
      } else {
        throw new Error(response.message || 'Failed to delete habit');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to delete habit';
      dispatch({ type: 'CREATE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Complete habit function
  const completeHabit = async (habitId: string, data: any): Promise<HabitCompletion> => {
    dispatch({ type: 'COMPLETE_START' });

    try {
      const response = await apiService.completeHabit(habitId, data);
      
      if (response.success && response.data) {
        dispatch({ type: 'COMPLETE_SUCCESS', payload: { habitId, completion: response.data } });
        
        // Update the habit's statistics
        const updatedHabits = state.habits.map(habit => {
          if (habit._id === habitId) {
            return {
              ...habit,
              statistics: {
                ...habit.statistics,
                current_streak: habit.statistics.current_streak + 1,
                total_completions: habit.statistics.total_completions + 1,
                last_completed: new Date(),
              }
            };
          }
          return habit;
        });
        
        dispatch({ type: 'FETCH_SUCCESS', payload: { habits: updatedHabits, pagination: state.pagination } });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to complete habit');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to complete habit';
      dispatch({ type: 'COMPLETE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Mark habit incomplete function
  const markHabitIncomplete = async (habitId: string, data: any): Promise<HabitCompletion> => {
    try {
      const response = await apiService.markHabitIncomplete(habitId, data);
      
      if (response.success && response.data) {
        dispatch({ type: 'COMPLETE_SUCCESS', payload: { habitId, completion: response.data } });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to mark habit incomplete');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to mark habit incomplete';
      dispatch({ type: 'COMPLETE_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Fetch habit completions function - memoized
  const fetchHabitCompletions = useCallback(async (habitId: string, params: any = {}): Promise<void> => {
    try {
      const response = await apiService.getHabitCompletions(habitId, params);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_COMPLETIONS', payload: { habitId, completions: response.data } });
      }
    } catch (error) {
      console.error('Failed to fetch habit completions:', error);
    }
  }, []);

  // Fetch habit analytics function - memoized
  const fetchHabitAnalytics = useCallback(async (timeframe: string = '30d'): Promise<void> => {
    try {
      const response = await apiService.getHabitAnalytics(timeframe);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_ANALYTICS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch habit analytics:', error);
    }
  }, []);

  // Get today's habits function
  const getTodaysHabits = (): Habit[] => {
    // Safety check to ensure habits is an array
    if (!Array.isArray(state.habits)) {
      console.warn('getTodaysHabits: state.habits is not an array:', state.habits);
      return [];
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return state.habits.filter(habit => {
      if (habit.status !== 'active') return false;
      
      switch (habit.frequency.type) {
        case 'daily':
          return true;
        case 'weekly':
          return habit.frequency.days_of_week?.includes(dayOfWeek) || false;
        case 'monthly':
          // Simple check for monthly habits - could be enhanced
          return true;
        default:
          return false;
      }
    });
  };

  // Get habit streak function
  const getHabitStreak = (habitId: string): number => {
    const habit = state.habits.find(h => h._id === habitId);
    return habit?.statistics.current_streak || 0;
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh data function - memoized with debounce
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        fetchHabits(),
        fetchHabitsSummary(),
        fetchHabitAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to refresh habit data:', error);
    }
  }, [fetchHabits, fetchHabitsSummary, fetchHabitAnalytics]);

  // Context value
  const value: HabitContextType = {
    state,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    markHabitIncomplete,
    fetchHabits,
    fetchHabitCompletions,
    fetchHabitsSummary,
    fetchHabitAnalytics,
    getTodaysHabits,
    getHabitStreak,
    clearError,
    refreshData,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
};

// Custom hook to use habit context
export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export default HabitContext;