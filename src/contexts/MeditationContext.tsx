import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, ReactNode } from 'react';
import apiService from '@/services/api';
import { MeditationSession, CreateMeditationSessionData, APIError } from '@/types/api';
import { useAuth } from './AuthContext';

// Meditation State Types
interface MeditationState {
  sessions: MeditationSession[];
  currentSession: MeditationSession | null;
  guidedContent: any[];
  stats: any | null;
  isLoading: boolean;
  isSessionActive: boolean;
  error: string | null;
  lastFetch: Date | null;
}

// Meditation Actions
type MeditationAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: MeditationSession[] }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'CREATE_SESSION_START' }
  | { type: 'CREATE_SESSION_SUCCESS'; payload: MeditationSession }
  | { type: 'CREATE_SESSION_FAILURE'; payload: string }
  | { type: 'UPDATE_SESSION_SUCCESS'; payload: MeditationSession }
  | { type: 'COMPLETE_SESSION_SUCCESS'; payload: MeditationSession }
  | { type: 'SET_CURRENT_SESSION'; payload: MeditationSession | null }
  | { type: 'SET_SESSION_ACTIVE'; payload: boolean }
  | { type: 'SET_GUIDED_CONTENT'; payload: any[] }
  | { type: 'SET_STATS'; payload: any }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Meditation Context Interface
interface MeditationContextType {
  state: MeditationState;
  createSession: (data: CreateMeditationSessionData) => Promise<MeditationSession>;
  updateSession: (id: string, data: Partial<MeditationSession>) => Promise<MeditationSession>;
  completeSession: (id: string, experience: MeditationSession['experience']) => Promise<MeditationSession>;
  startSession: (session: MeditationSession) => void;
  endSession: () => void;
  fetchSessions: (params?: any) => Promise<void>;
  fetchGuidedContent: (params?: any) => Promise<void>;
  fetchStats: (timeframe?: string) => Promise<void>;
  setCurrentSession: (session: MeditationSession | null) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Initial State
const initialState: MeditationState = {
  sessions: [],
  currentSession: null,
  guidedContent: [],
  stats: null,
  isLoading: false,
  isSessionActive: false,
  error: null,
  lastFetch: null,
};

// Meditation Reducer
function meditationReducer(state: MeditationState, action: MeditationAction): MeditationState {
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
        sessions: action.payload,
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

    case 'CREATE_SESSION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'CREATE_SESSION_SUCCESS':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSession: action.payload,
        isLoading: false,
        error: null,
      };

    case 'CREATE_SESSION_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'UPDATE_SESSION_SUCCESS':
    case 'COMPLETE_SESSION_SUCCESS':
      return {
        ...state,
        sessions: state.sessions.map(session => 
          session._id === action.payload._id ? action.payload : session
        ),
        currentSession: state.currentSession?._id === action.payload._id ? action.payload : state.currentSession,
        isSessionActive: action.type === 'COMPLETE_SESSION_SUCCESS' ? false : state.isSessionActive,
        error: null,
      };

    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSession: action.payload,
      };

    case 'SET_SESSION_ACTIVE':
      return {
        ...state,
        isSessionActive: action.payload,
      };

    case 'SET_GUIDED_CONTENT':
      return {
        ...state,
        guidedContent: action.payload,
      };

    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
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
const MeditationContext = createContext<MeditationContextType | undefined>(undefined);

// Meditation Provider Props
interface MeditationProviderProps {
  children: ReactNode;
}

// Meditation Provider Component
export const MeditationProvider: React.FC<MeditationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(meditationReducer, initialState);
  const { state: authState } = useAuth();
  const isFetchingRef = useRef(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'RESET_STATE' });
      isFetchingRef.current = false;
    }
  }, [authState.isAuthenticated]);

  // Fetch sessions function - memoized to prevent infinite loops
  const fetchSessions = useCallback(async (params: any = {}): Promise<void> => {
    if (isFetchingRef.current) {
      console.log('fetchSessions: Already fetching, skipping...');
      return;
    }

    isFetchingRef.current = true;
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await apiService.getMeditationSessions(params);
      
      if (response.success && response.data) {
        dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
      } else {
        throw new Error(response.message || 'Failed to fetch meditation sessions');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to fetch meditation sessions';
      dispatch({ type: 'FETCH_FAILURE', payload: errorMessage });
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch guided content function - memoized
  const fetchGuidedContent = useCallback(async (params: any = {}): Promise<void> => {
    try {
      const response = await apiService.getGuidedContent(params);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_GUIDED_CONTENT', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch guided content:', error);
    }
  }, []);

  // Fetch stats function - memoized
  const fetchStats = useCallback(async (timeframe: string = '30d'): Promise<void> => {
    try {
      const response = await apiService.getMeditationStats(timeframe);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_STATS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch meditation stats:', error);
    }
  }, []);

  // Auto-fetch data when user is authenticated - fixed dependencies
  useEffect(() => {
    const shouldFetch = authState.isAuthenticated && 
                       authState.user && 
                       !state.lastFetch && 
                       !isFetchingRef.current;

    if (shouldFetch) {
      console.log('MeditationProvider: Auto-fetching initial data');
      fetchSessions();
      fetchGuidedContent();
    }
  }, [authState.isAuthenticated, authState.user, state.lastFetch, fetchSessions, fetchGuidedContent]);

  // Create session function
  const createSession = async (data: CreateMeditationSessionData): Promise<MeditationSession> => {
    dispatch({ type: 'CREATE_SESSION_START' });

    try {
      const response = await apiService.createMeditationSession(data);
      
      if (response.success && response.data) {
        dispatch({ type: 'CREATE_SESSION_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create meditation session');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to create meditation session';
      dispatch({ type: 'CREATE_SESSION_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Update session function
  const updateSession = async (id: string, data: Partial<MeditationSession>): Promise<MeditationSession> => {
    try {
      const response = await apiService.updateMeditationSession(id, data);
      
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_SESSION_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update meditation session');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to update meditation session';
      dispatch({ type: 'CREATE_SESSION_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Complete session function
  const completeSession = async (id: string, experience: MeditationSession['experience']): Promise<MeditationSession> => {
    try {
      const response = await apiService.completeMeditationSession(id, experience);
      
      if (response.success && response.data) {
        dispatch({ type: 'COMPLETE_SESSION_SUCCESS', payload: response.data });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to complete meditation session');
      }
    } catch (error) {
      const errorMessage = (error as APIError).message || 'Failed to complete meditation session';
      dispatch({ type: 'CREATE_SESSION_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Start session function
  const startSession = (session: MeditationSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    dispatch({ type: 'SET_SESSION_ACTIVE', payload: true });
  };

  // End session function
  const endSession = () => {
    dispatch({ type: 'SET_SESSION_ACTIVE', payload: false });
  };

  // Set current session function
  const setCurrentSession = (session: MeditationSession | null) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Refresh data function
  const refreshData = async (): Promise<void> => {
    await Promise.all([
      fetchSessions(),
      fetchGuidedContent(),
      fetchStats()
    ]);
  };

  // Context value
  const value: MeditationContextType = {
    state,
    createSession,
    updateSession,
    completeSession,
    startSession,
    endSession,
    fetchSessions,
    fetchGuidedContent,
    fetchStats,
    setCurrentSession,
    clearError,
    refreshData,
  };

  return (
    <MeditationContext.Provider value={value}>
      {children}
    </MeditationContext.Provider>
  );
};

// Custom hook to use meditation context
export const useMeditation = (): MeditationContextType => {
  const context = useContext(MeditationContext);
  if (context === undefined) {
    throw new Error('useMeditation must be used within a MeditationProvider');
  }
  return context;
};

export default MeditationContext;