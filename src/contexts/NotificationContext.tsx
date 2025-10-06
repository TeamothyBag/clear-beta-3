import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useToast } from '../hooks/use-toast';
import { useSocket } from '../services/socket';

// Notification types
export interface AppNotification {
  id: string;
  type: 'mood_reminder' | 'habit_reminder' | 'meditation_suggestion' | 'wellness_tip' | 'crisis_support' | 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  data?: any;
  read: boolean;
  persistent?: boolean; // Whether notification should persist until dismissed
  autoHideDelay?: number; // Auto-hide delay in ms (0 = no auto-hide)
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isEnabled: boolean;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: AppNotification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_ENABLED'; payload: boolean };

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setEnabled: (enabled: boolean) => void;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isEnabled: true,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };

    case 'REMOVE_NOTIFICATION':
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToRemove && !notificationToRemove.read
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };

    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    case 'SET_ENABLED':
      return {
        ...state,
        isEnabled: action.payload,
      };

    default:
      return state;
  }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { toast } = useToast();
  const { on, off } = useSocket();

  // Listen for socket notifications
  useEffect(() => {
    const handleNotification = (notification: any) => {
      addNotification({
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        priority: notification.priority || 'medium',
        data: notification.data,
        persistent: notification.persistent,
        autoHideDelay: notification.autoHideDelay,
      });
    };

    const handleWellnessInsight = (insight: any) => {
      addNotification({
        type: 'wellness_tip',
        title: insight.title || 'Wellness Insight',
        message: insight.message,
        priority: 'low',
        data: insight,
        autoHideDelay: 8000,
      });
    };

    on('notification', handleNotification);
    on('wellness-insight', handleWellnessInsight);

    return () => {
      off('notification', handleNotification);
      off('wellness-insight', handleWellnessInsight);
    };
  }, [on, off]);

  const addNotification = (notificationData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    if (!state.isEnabled) return;

    const notification: AppNotification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Show toast notification
    const variant = notification.type === 'error' ? 'destructive' : 'default';
    const duration = notification.autoHideDelay || (notification.persistent ? 0 : 5000);

    toast({
      title: notification.title,
      description: notification.message,
      variant,
      duration: duration === 0 ? undefined : duration,
    });

    // Auto-remove notification if specified
    if (notification.autoHideDelay && notification.autoHideDelay > 0) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.autoHideDelay);
    }

    // Browser notification for high priority items
    if (notification.priority === 'urgent' || notification.priority === 'high') {
      requestNotificationPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/placeholder.svg',
            tag: notification.id,
          });
        }
      });
    }
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const setEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_ENABLED', payload: enabled });
  };

  return (
    <NotificationContext.Provider
      value={{
        state,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        setEnabled,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Helper function to request notification permission
async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
}

export default NotificationContext;