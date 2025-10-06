import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  APIResponse,
  APIError,
  User,
  LoginData,
  RegisterData,
  LoginResponse,
  MoodEntry,
  CreateMoodEntryData,
  MeditationSession,
  CreateMeditationSessionData,
  Habit,
  HabitCompletion,
  CreateHabitData,
  Appointment,
  CreateAppointmentData,
  CrisisAlert,
  Analytics
} from '@/types/api';

class APIService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5000; // 5 seconds cache for identical requests

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and handle caching
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Add cache key for GET requests
        if (config.method === 'get') {
          const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
          const cached = this.requestCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            console.log(`API Cache hit for: ${cacheKey}`);
            // Return a resolved promise with cached data
            return Promise.reject({
              isCancel: true,
              cached: cached.data
            });
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and caching
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Cache GET requests
        if (response.config.method === 'get') {
          const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`;
          this.requestCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }
        return response;
      },
      (error: AxiosError | any) => {
        // Handle cached responses
        if (error.isCancel && error.cached) {
          return Promise.resolve({ data: error.cached });
        }

        const apiError: APIError = {
          message: 'An unexpected error occurred',
          statusCode: error.response?.status || 500,
        };

        if (error.response?.data) {
          const data = error.response.data as any;
          apiError.message = data.message || data.error || apiError.message;
          apiError.code = data.code;
          apiError.details = data.details;
        } else if (error.message) {
          apiError.message = error.message;
        }

        // Handle unauthorized errors
        if (error.response?.status === 401) {
          this.clearAuth();
          // Optionally redirect to login
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          console.warn('Rate limit exceeded, implementing backoff');
          apiError.message = 'Too many requests. Please wait a moment and try again.';
        }

        return Promise.reject(apiError);
      }
    );

    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.setAuthToken(token);
      }
    }
  }

  // Auth Management
  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearAuth() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Authentication Endpoints
  async register(data: RegisterData): Promise<APIResponse<LoginResponse>> {
    // Transform flat registration data to nested structure expected by backend
    const backendData = {
      email: data.email,
      password: data.password,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth })
      }
    };

    const response = await this.api.post<APIResponse<LoginResponse>>('/auth/register', backendData);
    if (response.data.success && response.data.data) {
      this.setAuthToken(response.data.data.tokens.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  }

  async login(data: LoginData): Promise<APIResponse<LoginResponse>> {
    const response = await this.api.post<APIResponse<LoginResponse>>('/auth/login', data);
    if (response.data.success && response.data.data) {
      this.setAuthToken(response.data.data.tokens.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  }

  async logout(): Promise<APIResponse> {
    try {
      const response = await this.api.post<APIResponse>('/auth/logout');
      return response.data;
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<APIResponse<{ accessToken: string }>> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<APIResponse<{ accessToken: string }>>('/auth/refresh', {
      refreshToken
    });

    if (response.data.success && response.data.data) {
      this.setAuthToken(response.data.data.accessToken);
    }

    return response.data;
  }

  async forgotPassword(email: string): Promise<APIResponse> {
    const response = await this.api.post<APIResponse>('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<APIResponse> {
    const response = await this.api.post<APIResponse>('/auth/reset-password', { token, password });
    return response.data;
  }

  async verifyEmail(token: string): Promise<APIResponse> {
    const response = await this.api.post<APIResponse>('/auth/verify-email', { token });
    return response.data;
  }

  // User Management Endpoints
  async getCurrentUser(): Promise<APIResponse<User>> {
    const response = await this.api.get<APIResponse<User>>('/users/me');
    return response.data;
  }

  async updateProfile(data: Partial<User['profile']>): Promise<APIResponse<User>> {
    const response = await this.api.put<APIResponse<User>>('/users/profile', data);
    return response.data;
  }

  async updatePreferences(data: Partial<User['preferences']>): Promise<APIResponse<User>> {
    const response = await this.api.put<APIResponse<User>>('/users/preferences', data);
    return response.data;
  }

  async updateWellnessGoals(goals: User['wellnessGoals']): Promise<APIResponse<User>> {
    const response = await this.api.put<APIResponse<User>>('/users/wellness-goals', { goals });
    return response.data;
  }

  async updateEmergencyContacts(contacts: User['emergencyContacts']): Promise<APIResponse<User>> {
    const response = await this.api.put<APIResponse<User>>('/users/emergency-contacts', { contacts });
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<APIResponse> {
    const response = await this.api.put<APIResponse>('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  async deleteAccount(): Promise<APIResponse> {
    const response = await this.api.delete<APIResponse>('/users/me');
    this.clearAuth();
    return response.data;
  }

  // Mood Tracking Endpoints
  async createMoodEntry(data: CreateMoodEntryData): Promise<APIResponse<MoodEntry>> {
    const response = await this.api.post<APIResponse<MoodEntry>>('/mood', data);
    return response.data;
  }

  async getMoodEntries(params: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<MoodEntry[]>> {
    const response = await this.api.get<any>('/mood', { params });
    
    // Transform the backend response structure to match frontend expectations
    if (response.data.success && response.data.data?.moodEntries) {
      return {
        success: true,
        data: response.data.data.moodEntries,
        message: response.data.message
      };
    }
    
    return response.data;
  }

  async getMoodEntry(id: string): Promise<APIResponse<MoodEntry>> {
    const response = await this.api.get<APIResponse<MoodEntry>>(`/mood/${id}`);
    return response.data;
  }

  async updateMoodEntry(id: string, data: Partial<CreateMoodEntryData>): Promise<APIResponse<MoodEntry>> {
    const response = await this.api.put<APIResponse<MoodEntry>>(`/mood/${id}`, data);
    return response.data;
  }

  async deleteMoodEntry(id: string): Promise<APIResponse> {
    const response = await this.api.delete<APIResponse>(`/mood/${id}`);
    return response.data;
  }

  async getMoodInsights(timeframe: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/mood/insights?timeframe=${timeframe}`);
    return response.data;
  }

  // Meditation Endpoints
  async createMeditationSession(data: CreateMeditationSessionData): Promise<APIResponse<MeditationSession>> {
    const response = await this.api.post<APIResponse<MeditationSession>>('/meditation', data);
    return response.data;
  }

  async getMeditationSessions(params: {
    startDate?: Date;
    endDate?: Date;
    type?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<MeditationSession[]>> {
    const response = await this.api.get<APIResponse<MeditationSession[]>>('/meditation', { params });
    return response.data;
  }

  async getMeditationSession(id: string): Promise<APIResponse<MeditationSession>> {
    const response = await this.api.get<APIResponse<MeditationSession>>(`/meditation/${id}`);
    return response.data;
  }

  async updateMeditationSession(id: string, data: Partial<MeditationSession>): Promise<APIResponse<MeditationSession>> {
    const response = await this.api.put<APIResponse<MeditationSession>>(`/meditation/${id}`, data);
    return response.data;
  }

  async completeMeditationSession(id: string, experience: MeditationSession['experience']): Promise<APIResponse<MeditationSession>> {
    const response = await this.api.post<APIResponse<MeditationSession>>(`/meditation/${id}/complete`, { experience });
    return response.data;
  }

  async getMeditationStats(timeframe: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/meditation/stats?timeframe=${timeframe}`);
    return response.data;
  }

  async getGuidedContent(params: {
    type?: string;
    duration?: number;
    difficulty?: string;
    limit?: number;
  } = {}): Promise<APIResponse<any[]>> {
    const response = await this.api.get<APIResponse<any[]>>('/meditation/guided-content', { params });
    return response.data;
  }

  // Habit Tracking Endpoints
  async createHabit(data: CreateHabitData): Promise<APIResponse<Habit>> {
    const response = await this.api.post<APIResponse<Habit>>('/habits', data);
    return response.data;
  }

  async getHabits(params: {
    status?: string;
    category?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<{ habits: Habit[]; pagination: any }>> {
    const response = await this.api.get<APIResponse<{ habits: Habit[]; pagination: any }>>('/habits', { params });
    return response.data;
  }

  async getHabit(id: string): Promise<APIResponse<Habit>> {
    const response = await this.api.get<APIResponse<Habit>>(`/habits/${id}`);
    return response.data;
  }

  async updateHabit(id: string, data: Partial<CreateHabitData>): Promise<APIResponse<Habit>> {
    const response = await this.api.put<APIResponse<Habit>>(`/habits/${id}`, data);
    return response.data;
  }

  async deleteHabit(id: string): Promise<APIResponse> {
    const response = await this.api.delete<APIResponse>(`/habits/${id}`);
    return response.data;
  }

  async completeHabit(habitId: string, data: {
    date?: Date;
    value?: any;
    notes?: string;
    mood_before?: number;
    mood_after?: number;
    difficulty_experienced?: string;
    motivation_level?: number;
    environment?: any;
    barriers_encountered?: string[];
    success_factors?: string[];
  }): Promise<APIResponse<HabitCompletion>> {
    const response = await this.api.post<APIResponse<HabitCompletion>>(`/habits/${habitId}/complete`, data);
    return response.data;
  }

  async markHabitIncomplete(habitId: string, data: {
    date?: Date;
    barriers_encountered?: string[];
  }): Promise<APIResponse<HabitCompletion>> {
    const response = await this.api.post<APIResponse<HabitCompletion>>(`/habits/${habitId}/incomplete`, data);
    return response.data;
  }

  async getHabitCompletions(habitId: string, params: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<HabitCompletion[]>> {
    const response = await this.api.get<APIResponse<HabitCompletion[]>>(`/habits/${habitId}/completions`, { params });
    return response.data;
  }

  async getHabitStats(habitId: string, days: number = 30): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/habits/${habitId}/stats?days=${days}`);
    return response.data;
  }

  async getHabitsSummary(): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>('/habits/stats/summary');
    return response.data;
  }

  // Appointment Endpoints
  async createAppointment(data: CreateAppointmentData): Promise<APIResponse<Appointment>> {
    const response = await this.api.post<APIResponse<Appointment>>('/appointments', data);
    return response.data;
  }

  async getAppointments(params: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    type?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<Appointment[]>> {
    const response = await this.api.get<APIResponse<Appointment[]>>('/appointments', { params });
    return response.data;
  }

  async getAppointment(id: string): Promise<APIResponse<Appointment>> {
    const response = await this.api.get<APIResponse<Appointment>>(`/appointments/${id}`);
    return response.data;
  }

  async updateAppointment(id: string, data: Partial<CreateAppointmentData>): Promise<APIResponse<Appointment>> {
    const response = await this.api.put<APIResponse<Appointment>>(`/appointments/${id}`, data);
    return response.data;
  }

  async cancelAppointment(id: string, reason?: string): Promise<APIResponse<Appointment>> {
    const response = await this.api.post<APIResponse<Appointment>>(`/appointments/${id}/cancel`, { reason });
    return response.data;
  }

  async completeAppointment(id: string, notes: {
    session_notes?: string;
    follow_up?: string;
  }): Promise<APIResponse<Appointment>> {
    const response = await this.api.post<APIResponse<Appointment>>(`/appointments/${id}/complete`, { notes });
    return response.data;
  }

  // Crisis Support Endpoints
  async reportCrisisAlert(data: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
    location?: {
      type: string;
      coordinates?: [number, number];
    };
  }): Promise<APIResponse<CrisisAlert>> {
    const response = await this.api.post<APIResponse<CrisisAlert>>('/crisis/alert', data);
    return response.data;
  }

  async getCrisisAlerts(params: {
    status?: string;
    severity?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<CrisisAlert[]>> {
    const response = await this.api.get<APIResponse<CrisisAlert[]>>('/crisis/alerts', { params });
    return response.data;
  }

  async getCrisisResources(location?: {
    coordinates: [number, number];
    radius?: number;
  }): Promise<APIResponse<any[]>> {
    const response = await this.api.get<APIResponse<any[]>>('/crisis/resources', { params: location });
    return response.data;
  }

  async getEmergencyContacts(): Promise<APIResponse<any[]>> {
    const response = await this.api.get<APIResponse<any[]>>('/crisis/emergency-contacts');
    return response.data;
  }

  // AI Assistant Endpoints
  async sendAIMessage(message: string, context?: any): Promise<APIResponse<any>> {
    const response = await this.api.post<APIResponse<any>>('/ai/chat', { message, context });
    return response.data;
  }

  async getAIConversationHistory(params: {
    limit?: number;
    page?: number;
  } = {}): Promise<APIResponse<any[]>> {
    const response = await this.api.get<APIResponse<any[]>>('/ai/conversations', { params });
    return response.data;
  }

  async getAIInsights(timeframe: string = '7d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/ai/insights?timeframe=${timeframe}`);
    return response.data;
  }

  // Analytics Endpoints
  async getDashboardAnalytics(timeframe: string = '30d'): Promise<APIResponse<Analytics>> {
    const response = await this.api.get<APIResponse<Analytics>>(`/analytics/dashboard?timeframe=${timeframe}`);
    return response.data;
  }

  async getWellnessReport(timeframe: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/analytics/wellness-report?timeframe=${timeframe}`);
    return response.data;
  }

  async getMoodAnalytics(timeframe: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/analytics/mood?timeframe=${timeframe}`);
    return response.data;
  }

  async getMeditationAnalytics(timeframe: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/analytics/meditation?timeframe=${timeframe}`);
    return response.data;
  }

  async getHabitAnalytics(timeframe: string = '30d'): Promise<APIResponse<any>> {
    const response = await this.api.get<APIResponse<any>>(`/analytics/habits?timeframe=${timeframe}`);
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<APIResponse> {
    const response = await this.api.get<APIResponse>('/health');
    return response.data;
  }
}

// Create and export singleton instance
const apiService = new APIService();
export default apiService;