import { useCallback, useMemo } from 'react';
import { useMood } from '@/contexts/MoodContext';
import { useMeditation } from '@/contexts/MeditationContext';
import { useHabits } from '@/contexts/HabitContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useAsyncOperation } from './common';
import { CreateMoodEntryData, CreateMeditationSessionData, CreateHabitData } from '@/types/api';

// Hook for mood tracking functionality
export function useMoodTracker() {
  const { state, createMoodEntry, updateMoodEntry, deleteMoodEntry, fetchMoodInsights } = useMood();
  
  const {
    execute: submitMoodEntry,
    isLoading: isSubmitting,
    error: submitError,
  } = useAsyncOperation(createMoodEntry);

  const quickMoodEntry = useCallback(async (mood: number, emotions?: string[]) => {
    const data: CreateMoodEntryData = {
      moodData: {
        primaryMood: mood,
        emotions: emotions || [],
      },
    };
    
    return await submitMoodEntry(data);
  }, [submitMoodEntry]);

  const detailedMoodEntry = useCallback(async (data: CreateMoodEntryData) => {
    return await submitMoodEntry(data);
  }, [submitMoodEntry]);

  // Get recent mood trend
  const moodTrend = useMemo(() => {
    // Safety check to ensure entries is an array
    if (!Array.isArray(state.entries) || state.entries.length < 2) return 'stable';
    
    const recent = state.entries.slice(0, 7); // Last 7 entries
    const average = recent.reduce((sum, entry) => sum + (entry.mood || 0), 0) / recent.length;
    const older = state.entries.slice(7, 14);
    
    if (older.length === 0) return 'stable';
    
    const olderAverage = older.reduce((sum, entry) => sum + (entry.mood || 0), 0) / older.length;
    
    if (average > olderAverage + 0.5) return 'improving';
    if (average < olderAverage - 0.5) return 'declining';
    return 'stable';
  }, [state.entries]);

  

  // Get mood statistics
  const moodStats = useMemo(() => {
    if (!Array.isArray(state.entries) || state.entries.length === 0) {
      return {
        averageMood: 0,
        totalEntries: 0,
        streakDays: 0,
        bestMood: 0,
        lowestMood: 0,
      };
    }

    const moods = state.entries.map(entry => entry.mood);
    const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
    
    // Calculate streak (consecutive days with entries)
    let streakDays = 0;
    const today = new Date();
    
    for (let i = 0; i < state.entries.length; i++) {
      const entryDate = new Date(state.entries[i].metadata.loggedAt);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      totalEntries: state.entries.length,
      streakDays,
      bestMood: Math.max(...moods),
      lowestMood: Math.min(...moods),
    };
  }, [state.entries]);

  return {
    entries: Array.isArray(state.entries) ? state.entries : [],
    insights: state.insights,
    isLoading: state.isLoading,
    isSubmitting,
    error: state.error || submitError,
    moodTrend,
    moodStats,
    quickMoodEntry,
    detailedMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    fetchMoodInsights,
  };
}

// Hook for meditation functionality
export function useMeditationTracker() {
  const { 
    state, 
    createSession, 
    completeSession, 
    startSession, 
    endSession,
    fetchStats 
  } = useMeditation();
  
  const {
    execute: createNewSession,
    isLoading: isCreating,
    error: createError,
  } = useAsyncOperation(createSession);

  const {
    execute: finishSession,
    isLoading: isCompleting,
    error: completeError,
  } = useAsyncOperation(completeSession);

  const startMeditationSession = useCallback(async (data: CreateMeditationSessionData) => {
    const session = await createNewSession(data);
    if (session) {
      startSession(session);
    }
    return session;
  }, [createNewSession, startSession]);

  const completeMeditationSession = useCallback(async (
    sessionId: string,
    experience: {
      difficulty: number;
      enjoyment: number;
      effectiveness: number;
      distractionLevel: number;
      notes?: string;
    }
  ) => {
    const session = await finishSession(sessionId, experience);
    if (session) {
      endSession();
    }
    return session;
  }, [finishSession, endSession]);

  // Get meditation statistics
  const meditationStats = useMemo(() => {
    const completedSessions = state.sessions.filter(s => s.session.completed);
    
    if (completedSessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageSession: 0,
        streakDays: 0,
        favoriteType: null,
        completionRate: 0,
      };
    }

    const totalMinutes = completedSessions.reduce((sum, session) => 
      sum + session.session.actualDuration, 0
    );
    
    const averageSession = totalMinutes / completedSessions.length;
    
    // Calculate streak
    let streakDays = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      
      const hasSession = completedSessions.some(session => {
        const sessionDate = new Date(session.metadata.startedAt);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });
      
      if (hasSession) {
        streakDays++;
      } else if (i > 0) {
        break;
      }
    }

    // Find favorite type
    const typeCounts = completedSessions.reduce((acc, session) => {
      acc[session.session.type] = (acc[session.session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteType = Object.entries(typeCounts).reduce((a, b) => 
      typeCounts[a[0]] > typeCounts[b[0]] ? a : b
    )[0];

    const completionRate = (completedSessions.length / state.sessions.length) * 100;

    return {
      totalSessions: completedSessions.length,
      totalMinutes: Math.round(totalMinutes),
      averageSession: Math.round(averageSession),
      streakDays,
      favoriteType,
      completionRate: Math.round(completionRate),
    };
  }, [state.sessions]);

  return {
    sessions: state.sessions,
    currentSession: state.currentSession,
    isSessionActive: state.isSessionActive,
    guidedContent: state.guidedContent,
    stats: state.stats,
    isLoading: state.isLoading,
    isCreating,
    isCompleting,
    error: state.error || createError || completeError,
    meditationStats,
    startMeditationSession,
    completeMeditationSession,
    endSession,
    fetchStats,
  };
}

// Hook for habit tracking functionality
export function useHabitTracker() {
  const {
    state,
    createHabit,
    updateHabit,
    deleteHabit,
    completeHabit,
    markHabitIncomplete,
    getTodaysHabits,
    getHabitStreak,
    fetchHabitsSummary,
  } = useHabits();

  const {
    execute: createNewHabit,
    isLoading: isCreating,
    error: createError,
  } = useAsyncOperation(createHabit);

  const {
    execute: completeHabitAction,
    isLoading: isCompleting,
    error: completeError,
  } = useAsyncOperation(completeHabit);

  const quickHabitCompletion = useCallback(async (habitId: string, completed: boolean = true) => {
    if (completed) {
      return await completeHabitAction(habitId, {
        date: new Date(),
        completed: true,
      });
    } else {
      return await markHabitIncomplete(habitId, {
        date: new Date(),
      });
    }
  }, [completeHabitAction, markHabitIncomplete]);

  const detailedHabitCompletion = useCallback(async (habitId: string, data: {
    completed: boolean;
    value?: any;
    notes?: string;
    mood_before?: number;
    mood_after?: number;
    difficulty_experienced?: string;
    barriers_encountered?: string[];
    success_factors?: string[];
  }) => {
    if (data.completed) {
      return await completeHabitAction(habitId, {
        date: new Date(),
        ...data,
      });
    } else {
      return await markHabitIncomplete(habitId, {
        date: new Date(),
        barriers_encountered: data.barriers_encountered,
      });
    }
  }, [completeHabitAction, markHabitIncomplete]);

  // Get today's habit progress
  const todaysProgress = useMemo(() => {
    const todaysHabits = getTodaysHabits();
    const completedToday = todaysHabits.filter(habit => {
      const today = new Date().toISOString().split('T')[0];
      const completions = state.completions[habit._id!] || [];
      return completions.some(completion => {
        const completionDate = new Date(completion.date).toISOString().split('T')[0];
        return completionDate === today && completion.completed;
      });
    });

    return {
      total: todaysHabits.length,
      completed: completedToday.length,
      percentage: todaysHabits.length > 0 ? (completedToday.length / todaysHabits.length) * 100 : 0,
      remaining: todaysHabits.length - completedToday.length,
    };
  }, [getTodaysHabits, state.completions]);

  // Get overall habit statistics
  const habitStats = useMemo(() => {
    const activeHabits = state.habits.filter(h => h.status === 'active');
    const totalCompletions = Object.values(state.completions)
      .flat()
      .filter(c => c.completed).length;
    
    const longestStreak = Math.max(
      0,
      ...activeHabits.map(habit => habit.statistics.longest_streak)
    );

    const averageCompletionRate = activeHabits.length > 0
      ? activeHabits.reduce((sum, habit) => sum + habit.statistics.completion_rate, 0) / activeHabits.length
      : 0;

    return {
      totalHabits: state.habits.length,
      activeHabits: activeHabits.length,
      totalCompletions,
      longestStreak,
      averageCompletionRate: Math.round(averageCompletionRate),
    };
  }, [state.habits, state.completions]);

  return {
    habits: state.habits,
    completions: state.completions,
    summary: state.summary,
    analytics: state.analytics,
    isLoading: state.isLoading,
    isSubmitting: state.isSubmitting,
    isCreating,
    isCompleting,
    error: state.error || createError || completeError,
    todaysProgress,
    habitStats,
    getTodaysHabits,
    getHabitStreak,
    createNewHabit,
    updateHabit,
    deleteHabit,
    quickHabitCompletion,
    detailedHabitCompletion,
    fetchHabitsSummary,
  };
}

// Hook for wellness analytics and insights
export function useWellnessInsights() {
  const { state: analyticsState, fetchDashboard, setTimeframe } = useAnalytics();
  const { moodStats } = useMoodTracker();
  const { meditationStats } = useMeditationTracker();
  const { habitStats } = useHabitTracker();

  // Calculate overall wellness score
  const wellnessScore = useMemo(() => {
    if (!analyticsState.dashboard) {
      // Calculate a basic score from available data
      let score = 0;
      let components = 0;

      // Mood component (40%)
      if (moodStats.totalEntries > 0) {
        score += (moodStats.averageMood / 10) * 40;
        components++;
      }

      // Meditation component (30%)
      if (meditationStats.totalSessions > 0) {
        const meditationScore = Math.min(meditationStats.totalSessions / 7, 1) * 30;
        score += meditationScore;
        components++;
      }

      // Habit component (30%)
      if (habitStats.totalHabits > 0) {
        score += (habitStats.averageCompletionRate / 100) * 30;
        components++;
      }

      return components > 0 ? Math.round(score) : 0;
    }

    return analyticsState.dashboard.wellnessScore;
  }, [analyticsState.dashboard, moodStats, meditationStats, habitStats]);

  // Generate insights
  const insights = useMemo(() => {
    const generatedInsights = [];

    // Mood insights
    if (moodStats.totalEntries > 0) {
      if (moodStats.averageMood >= 7) {
        generatedInsights.push({
          type: 'positive' as const,
          category: 'mood',
          message: `Your average mood score of ${moodStats.averageMood}/10 shows you're doing well overall!`,
          actionable: false,
        });
      } else if (moodStats.averageMood <= 4) {
        generatedInsights.push({
          type: 'concern' as const,
          category: 'mood',
          message: `Your mood has been lower recently. Consider trying stress-reduction techniques or speaking with someone.`,
          actionable: true,
          suggestions: ['Practice deep breathing', 'Take a walk outside', 'Connect with a friend'],
        });
      }

      if (moodStats.streakDays >= 7) {
        generatedInsights.push({
          type: 'achievement' as const,
          category: 'mood',
          message: `Amazing! You've tracked your mood for ${moodStats.streakDays} days in a row.`,
          actionable: false,
        });
      }
    }

    // Meditation insights
    if (meditationStats.streakDays >= 3) {
      generatedInsights.push({
        type: 'achievement' as const,
        category: 'meditation',
        message: `You're on a ${meditationStats.streakDays}-day meditation streak! Keep it up.`,
        actionable: false,
      });
    } else if (meditationStats.totalSessions === 0) {
      generatedInsights.push({
        type: 'suggestion' as const,
        category: 'meditation',
        message: 'Try starting with just 5 minutes of meditation to build a healthy routine.',
        actionable: true,
        suggestions: ['Start with guided breathing', 'Try a body scan meditation', 'Set a daily reminder'],
      });
    }

    // Habit insights
    if (habitStats.averageCompletionRate >= 80) {
      generatedInsights.push({
        type: 'positive' as const,
        category: 'habits',
        message: `Excellent habit consistency at ${habitStats.averageCompletionRate}% completion rate!`,
        actionable: false,
      });
    } else if (habitStats.averageCompletionRate <= 50 && habitStats.activeHabits > 0) {
      generatedInsights.push({
        type: 'suggestion' as const,
        category: 'habits',
        message: 'Consider focusing on fewer habits to improve your consistency.',
        actionable: true,
        suggestions: ['Pick 1-2 most important habits', 'Set specific times for habits', 'Use habit stacking'],
      });
    }

    return generatedInsights;
  }, [moodStats, meditationStats, habitStats]);

  return {
    wellnessScore,
    insights,
    dashboard: analyticsState.dashboard,
    isLoading: analyticsState.isLoading,
    error: analyticsState.error,
    timeframe: analyticsState.timeframe,
    fetchDashboard,
    setTimeframe,
  };
}