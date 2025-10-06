// API Types based on backend schema
export interface User {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
    phoneNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    avatar?: string;
    bio?: string;
  };
  authentication: {
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    lastLogin?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    passwordChangedAt?: Date;
    recoveryPasses: string[];
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      reminderTimes: string[];
      crisisAlerts: boolean;
      weeklyReports: boolean;
      achievementAlerts: boolean;
      socialUpdates: boolean;
    };
    privacy: {
      shareAnonymousData: boolean;
      allowResearch: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  wellnessGoals: WellnessGoal[];
  emergencyContacts: EmergencyContact[];
  subscription: {
    plan: 'free' | 'premium' | 'therapy';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd?: Date;
    stripeCustomerId?: string;
  };
  wellness: {
    onboardingCompleted: boolean;
    therapyHistory: Array<{
      provider: string;
      duration: string;
      type: string;
      effectivenessRating?: number;
    }>;
  };
  metadata: {
    status: 'active' | 'inactive' | 'suspended' | 'deleted';
    lastActive: Date;
    joinedAt: Date;
    version: number;
  };
}

export interface WellnessGoal {
  _id?: string;
  type: 'mood' | 'meditation' | 'exercise' | 'sleep' | 'stress' | 'custom';
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  createdAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isPrimary: boolean;
}

export interface MoodEntry {
  _id?: string;
  id?: string;
  userId?: string;
  user?: {
    _id: string;
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName?: string;
      age?: number | null;
    };
  };
  // Backend returns flat structure, not nested moodData
  mood: number; // Primary mood 1-10 scale (backend field)
  energyLevel?: number;
  stressLevel?: number;
  anxietyLevel?: number;
  emotions: Array<{
    name: string;
    intensity: number;
    _id?: string;
    id?: string;
  }>;
  notes?: string; // Backend stores notes as string, not nested
  tags?: string[];
  triggers?: string[];
  coping_strategies?: Array<{
    strategy: string;
    effectiveness: number;
  }>;
  factors?: {
    stress?: {
      sources: string[];
    };
    sleep?: {
      quality: number;
      hours: number;
    };
    exercise?: {
      type: string;
      duration: number;
      enjoyment: number;
    };
  };
  ai_insights?: {
    sentiment_score: number;
    confidence_level: number;
    risk_assessment: {
      level: string;
      factors: string[];
      suggested_actions: string[];
    };
    recommendations: string[];
    patterns_detected: string[];
  };
  metadata?: {
    source: string;
    revised: boolean;
    revision_count: number;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
  moodCategory?: string;
  dominantEmotion?: {
    name: string;
    intensity: number;
    _id?: string;
    id?: string;
  };
  
  // Legacy support for frontend expecting nested structure
  moodData?: {
    primaryMood: number;
    emotions: (string | { name: string; intensity: number })[];
    energyLevel: number;
    stressLevel: number;
    anxietyLevel: number;
  };
}

export interface MeditationSession {
  _id?: string;
  userId: string;
  session: {
    type: 'breathing' | 'mindfulness' | 'body-scan' | 'loving-kindness' | 'visualization' | 'custom';
    guidedContentId?: string;
    plannedDuration: number; // minutes
    actualDuration: number; // minutes
    completed: boolean;
  };
  experience: {
    difficulty: number; // 1-5 scale
    enjoyment: number; // 1-5 scale
    effectiveness: number; // 1-5 scale
    distractionLevel: number; // 1-5 scale
    notes?: string;
  };
  environment: {
    location: 'home' | 'work' | 'outdoor' | 'commute' | 'other';
    ambientSound: boolean;
    interruptions: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  biometrics?: {
    heartRateBefore?: number;
    heartRateAfter?: number;
  };
  ai: {
    recommendations: Array<{
      type: string;
      suggestion: string;
      priority: number;
      implemented?: boolean;
    }>;
  };
  metadata: {
    startedAt: Date;
    completedAt?: Date;
    source: 'manual' | 'scheduled' | 'reminder';
    updatedAt: Date;
  };
}

export interface Habit {
  _id?: string;
  user: string;
  name: string;
  description?: string;
  category: 'health' | 'mental_wellness' | 'productivity' | 'social' | 'learning' | 'spiritual' | 'physical' | 'other';
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    target_count: number;
    days_of_week?: number[]; // 0-6, Sunday = 0
    specific_dates?: Date[];
  };
  tracking: {
    type: 'boolean' | 'count' | 'duration' | 'scale';
    unit?: string;
    scale_min?: number;
    scale_max?: number;
  };
  reminders: {
    enabled: boolean;
    times: string[];
    message?: string;
  };
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  start_date: Date;
  end_date?: Date;
  statistics: {
    current_streak: number;
    longest_streak: number;
    total_completions: number;
    completion_rate: number;
    last_completed?: Date;
    next_due?: Date;
  };
  ai_insights: {
    success_probability?: number;
    optimal_timing?: {
      recommended_time: string;
      confidence: number;
    };
    difficulty_assessment?: number;
    improvement_suggestions: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HabitCompletion {
  _id?: string;
  user: string;
  habit: string;
  date: Date;
  completed: boolean;
  value?: any; // Boolean, Number, or String
  notes?: string;
  mood_before?: number;
  mood_after?: number;
  difficulty_experienced?: 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard';
  motivation_level?: number;
  environment: {
    location?: string;
    weather?: string;
    social_context?: 'alone' | 'with_family' | 'with_friends' | 'in_public' | 'with_partner';
  };
  completion_time: {
    planned?: Date;
    actual?: Date;
  };
  barriers_encountered?: string[];
  success_factors?: string[];
  metadata: {
    completion_method?: 'manual' | 'automatic' | 'reminder_prompt' | 'voice_command';
    device_type?: string;
    location_accuracy?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Appointment {
  _id?: string;
  userId: string;
  title: string;
  description?: string;
  provider: {
    name: string;
    type: 'therapist' | 'psychiatrist' | 'counselor' | 'coach' | 'doctor' | 'other';
    contact?: {
      phone?: string;
      email?: string;
    };
  };
  datetime: Date;
  duration: number; // minutes
  location: {
    type: 'in-person' | 'virtual' | 'phone';
    address?: string;
    meeting_url?: string;
    phone_number?: string;
  };
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  reminders: Array<{
    time: number; // minutes before appointment
    type: 'email' | 'sms' | 'push';
    sent: boolean;
  }>;
  notes: {
    preparation?: string;
    session_notes?: string;
    follow_up?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CrisisAlert {
  _id?: string;
  userId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trigger: {
    type: 'mood_pattern' | 'keyword_detection' | 'user_reported' | 'ai_assessment';
    details: string;
    confidence?: number;
  };
  context: {
    recent_mood_entries?: string[];
    user_location?: {
      type: string;
      coordinates?: [number, number];
    };
    time_of_day: string;
    day_of_week: string;
  };
  response: {
    status: 'pending' | 'acknowledged' | 'resolved' | 'escalated';
    actions_taken: string[];
    contacted_emergency_services: boolean;
    contacted_emergency_contacts: boolean;
    professional_notified: boolean;
  };
  resolution: {
    outcome?: 'user_safe' | 'professional_intervention' | 'emergency_services' | 'ongoing_monitoring';
    notes?: string;
    follow_up_required: boolean;
    resolved_at?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  session: {
    id: string;
    expiresAt: Date;
  };
}

export interface Analytics {
  period: {
    start: Date;
    end: Date;
    timeframe: string;
  };
  mood: {
    totalEntries: number;
    averageRating: number;
    trend: 'improving' | 'stable' | 'declining';
    distribution: Record<number, number>;
    topEmotions: Array<{ emotion: string; count: number }>;
  };
  meditation: {
    totalSessions: number;
    totalMinutes: number;
    averageSession: number;
    completionRate: number;
    streakCount: number;
    favoriteTypes: Array<{ type: string; count: number }>;
  };
  habits: {
    totalHabits: number;
    activeHabits: number;
    completedToday: number;
    overallCompletionRate: number;
    longestStreak: number;
    habitsByCategory: Record<string, number>;
    topPerformingHabits: Array<{ name: string; rate: number }>;
  };
  wellnessScore: number;
  insights: Array<{
    type: 'positive' | 'concern' | 'achievement' | 'suggestion';
    category: string;
    message: string;
    actionable: boolean;
    suggestions?: string[];
  }>;
  goals: WellnessGoal[];
}

// Form Types
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  marketingConsent?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreateMoodEntryData {
  moodData: {
    primaryMood: number; // 1-10 scale to match backend
    emotions?: (string | { name: string; intensity: number })[];
    energyLevel?: number;
    stressLevel?: number;
    anxietyLevel?: number;
  };
  context?: {
    factors?: Array<{
      category: string;
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
    }>;
    location?: {
      type: string;
      coordinates?: [number, number];
    };
    weather?: string;
    activities?: string[];
  };
  notes?: {
    userNotes?: string;
    images?: string[];
    additionalContext?: string;
  };
  metadata?: {
    loggedAt?: string;
    factors?: string[];
  };
}

export interface CreateMeditationSessionData {
  session: {
    type: 'breathing' | 'mindfulness' | 'body-scan' | 'loving-kindness' | 'visualization' | 'custom';
    guidedContentId?: string;
    plannedDuration: number;
  };
  environment?: {
    location?: 'home' | 'work' | 'outdoor' | 'commute' | 'other';
    ambientSound?: boolean;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

export interface CreateHabitData {
  name: string;
  description?: string;
  category: 'health' | 'mental_wellness' | 'productivity' | 'social' | 'learning' | 'spiritual' | 'physical' | 'other';
  frequency: {
    type: 'daily' | 'weekly' | 'monthly';
    target_count: number;
    days_of_week?: number[];
    specific_dates?: Date[];
  };
  tracking: {
    type: 'boolean' | 'count' | 'duration' | 'scale';
    unit?: string;
    scale_min?: number;
    scale_max?: number;
  };
  reminders?: {
    enabled: boolean;
    times: string[];
    message?: string;
  };
  start_date?: Date;
  end_date?: Date;
}

export interface CreateAppointmentData {
  title: string;
  description?: string;
  provider: {
    name: string;
    type: 'therapist' | 'psychiatrist' | 'counselor' | 'coach' | 'doctor' | 'other';
    contact?: {
      phone?: string;
      email?: string;
    };
  };
  datetime: Date;
  duration: number;
  location: {
    type: 'in-person' | 'virtual' | 'phone';
    address?: string;
    meeting_url?: string;
    phone_number?: string;
  };
  reminders?: Array<{
    time: number;
    type: 'email' | 'sms' | 'push';
  }>;
  notes?: {
    preparation?: string;
  };
}

// Error Types
export interface APIError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}