import { io, Socket } from 'socket.io-client';
import { User, MoodEntry, Habit, HabitCompletion, CrisisAlert } from '../types/api';

// Socket.IO event types
export interface SocketEvents {
  // Authentication events
  authenticate: (token: string) => void;
  authenticated: (user: User) => void;
  'auth-error': (error: string) => void;

  // Mood tracking events
  'mood-update': (moodEntry: MoodEntry) => void;
  'mood-reminder': () => void;

  // Habit tracking events
  'habit-completed': (completion: HabitCompletion) => void;
  'habit-reminder': (habit: Habit) => void;
  'streak-milestone': (habit: Habit, streak: number) => void;

  // Crisis support events
  'crisis-alert': (alert: CrisisAlert) => void;
  'crisis-support-available': () => void;

  // Wellness insights
  'wellness-insight': (insight: {
    type: 'mood' | 'habit' | 'meditation' | 'general';
    title: string;
    message: string;
    data?: any;
  }) => void;

  // Notifications
  'notification': (notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    data?: any;
  }) => void;

  // App updates
  'user-updated': (user: Partial<User>) => void;
  'settings-sync': (settings: any) => void;

  // Connection events
  connect: () => void;
  disconnect: (reason: string) => void;
  'connect_error': (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  // Initialize socket connection
  connect(): void {
    if (this.socket?.connected) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 
                     (import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  // Set up default event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.emit('connect');
      
      // Auto-authenticate if token exists
      const token = localStorage.getItem('token');
      if (token) {
        this.authenticate(token);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.emit('connect_error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnect', attemptNumber);
    });

    // Set up wellness-specific handlers
    this.setupWellnessHandlers();
  }

  // Set up wellness-specific event handlers
  private setupWellnessHandlers(): void {
    if (!this.socket) return;

    // Authentication
    this.socket.on('authenticated', (user: User) => {
      console.log('Socket authenticated for user:', user.email);
      this.emit('authenticated', user);
    });

    this.socket.on('auth-error', (error: string) => {
      console.error('Socket auth error:', error);
      this.emit('auth-error', error);
    });

    // Mood tracking
    this.socket.on('mood-update', (moodEntry: MoodEntry) => {
      this.emit('mood-update', moodEntry);
    });

    this.socket.on('mood-reminder', () => {
      this.emit('mood-reminder');
    });

    // Habit tracking
    this.socket.on('habit-completed', (completion: HabitCompletion) => {
      this.emit('habit-completed', completion);
    });

    this.socket.on('habit-reminder', (habit: Habit) => {
      this.emit('habit-reminder', habit);
    });

    this.socket.on('streak-milestone', (habit: Habit, streak: number) => {
      this.emit('streak-milestone', habit, streak);
    });

    // Crisis support
    this.socket.on('crisis-alert', (alert: CrisisAlert) => {
      this.emit('crisis-alert', alert);
    });

    this.socket.on('crisis-support-available', () => {
      this.emit('crisis-support-available');
    });

    // Wellness insights
    this.socket.on('wellness-insight', (insight: any) => {
      this.emit('wellness-insight', insight);
    });

    // Notifications
    this.socket.on('notification', (notification: any) => {
      this.emit('notification', notification);
    });

    // User updates
    this.socket.on('user-updated', (user: Partial<User>) => {
      this.emit('user-updated', user);
    });

    this.socket.on('settings-sync', (settings: any) => {
      this.emit('settings-sync', settings);
    });
  }

  // Authenticate with the server
  authenticate(token: string): void {
    if (this.socket?.connected) {
      this.socket.emit('authenticate', token);
    }
  }

  // Add event listener
  on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): void {
    const eventName = event as string;
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    this.listeners.get(eventName)!.push(listener);
  }

  // Remove event listener
  off<K extends keyof SocketEvents>(event: K, listener?: SocketEvents[K]): void {
    const eventName = event as string;
    const eventListeners = this.listeners.get(eventName);
    
    if (!eventListeners) return;
    
    if (listener) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    } else {
      this.listeners.set(eventName, []);
    }
  }

  // Emit event to listeners
  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send mood update
  sendMoodUpdate(moodEntry: Omit<MoodEntry, '_id' | 'userId' | 'createdAt' | 'updatedAt'>): void {
    if (this.socket?.connected) {
      this.socket.emit('mood-update', moodEntry);
    }
  }

  // Send habit completion
  sendHabitCompletion(habitId: string, notes?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('habit-completed', { habitId, notes });
    }
  }

  // Send crisis alert
  sendCrisisAlert(severity: 'low' | 'medium' | 'high', message?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('crisis-alert', { severity, message });
    }
  }

  // Request support
  requestSupport(type: 'mood' | 'crisis' | 'general', message?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('request-support', { type, message });
    }
  }

  // Join user-specific room for targeted events
  joinUserRoom(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Leave user-specific room
  leaveUserRoom(userId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-user-room', userId);
    }
  }

  // Get connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  get socketId(): string | undefined {
    return this.socket?.id;
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Reconnect socket
  reconnect(): void {
    this.disconnect();
    this.connect();
  }
}

// Create singleton instance
export const socketService = new SocketService();

// React hook for using socket in components
import { useEffect, useRef, useCallback } from 'react';

export function useSocket() {
  const listenersRef = useRef<Map<string, Function>>(new Map());

  // Add event listener
  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    listener: SocketEvents[K]
  ) => {
    const eventName = event as string;
    socketService.on(event, listener);
    listenersRef.current.set(eventName, listener);
  }, []);

  // Remove event listener
  const off = useCallback(<K extends keyof SocketEvents>(
    event: K,
    listener?: SocketEvents[K]
  ) => {
    const eventName = event as string;
    const storedListener = listener || listenersRef.current.get(eventName);
    if (storedListener) {
      socketService.off(event, storedListener as SocketEvents[K]);
      listenersRef.current.delete(eventName);
    }
  }, []);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      listenersRef.current.forEach((listener, event) => {
        socketService.off(event as keyof SocketEvents, listener as any);
      });
      listenersRef.current.clear();
    };
  }, []);

  return {
    // Connection status
    isConnected: socketService.isConnected,
    socketId: socketService.socketId,
    
    // Event handling
    on,
    off,
    
    // Wellness actions
    sendMoodUpdate: socketService.sendMoodUpdate.bind(socketService),
    sendHabitCompletion: socketService.sendHabitCompletion.bind(socketService),
    sendCrisisAlert: socketService.sendCrisisAlert.bind(socketService),
    requestSupport: socketService.requestSupport.bind(socketService),
    
    // Authentication
    authenticate: socketService.authenticate.bind(socketService),
    
    // Room management
    joinUserRoom: socketService.joinUserRoom.bind(socketService),
    leaveUserRoom: socketService.leaveUserRoom.bind(socketService),
    
    // Connection management
    reconnect: socketService.reconnect.bind(socketService),
    disconnect: socketService.disconnect.bind(socketService),
  };
}

// Specific hooks for different features
export function useMoodSocket() {
  const { on, off, sendMoodUpdate, isConnected } = useSocket();
  
  const onMoodUpdate = useCallback((callback: (mood: MoodEntry) => void) => {
    on('mood-update', callback);
    return () => off('mood-update', callback);
  }, [on, off]);
  
  const onMoodReminder = useCallback((callback: () => void) => {
    on('mood-reminder', callback);
    return () => off('mood-reminder', callback);
  }, [on, off]);
  
  return {
    isConnected,
    sendMoodUpdate,
    onMoodUpdate,
    onMoodReminder,
  };
}

export function useHabitSocket() {
  const { on, off, sendHabitCompletion, isConnected } = useSocket();
  
  const onHabitCompleted = useCallback((callback: (completion: HabitCompletion) => void) => {
    on('habit-completed', callback);
    return () => off('habit-completed', callback);
  }, [on, off]);
  
  const onHabitReminder = useCallback((callback: (habit: Habit) => void) => {
    on('habit-reminder', callback);
    return () => off('habit-reminder', callback);
  }, [on, off]);
  
  const onStreakMilestone = useCallback((callback: (habit: Habit, streak: number) => void) => {
    on('streak-milestone', callback);
    return () => off('streak-milestone', callback);
  }, [on, off]);
  
  return {
    isConnected,
    sendHabitCompletion,
    onHabitCompleted,
    onHabitReminder,
    onStreakMilestone,
  };
}

export function useCrisisSocket() {
  const { on, off, sendCrisisAlert, requestSupport, isConnected } = useSocket();
  
  const onCrisisAlert = useCallback((callback: (alert: CrisisAlert) => void) => {
    on('crisis-alert', callback);
    return () => off('crisis-alert', callback);
  }, [on, off]);
  
  const onSupportAvailable = useCallback((callback: () => void) => {
    on('crisis-support-available', callback);
    return () => off('crisis-support-available', callback);
  }, [on, off]);
  
  return {
    isConnected,
    sendCrisisAlert,
    requestSupport,
    onCrisisAlert,
    onSupportAvailable,
  };
}

export function useNotificationSocket() {
  const { on, off, isConnected } = useSocket();
  
  const onNotification = useCallback((callback: (notification: any) => void) => {
    on('notification', callback);
    return () => off('notification', callback);
  }, [on, off]);
  
  const onWellnessInsight = useCallback((callback: (insight: any) => void) => {
    on('wellness-insight', callback);
    return () => off('wellness-insight', callback);
  }, [on, off]);
  
  return {
    isConnected,
    onNotification,
    onWellnessInsight,
  };
}