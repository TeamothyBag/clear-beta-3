// Date and time utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'relative') {
      return getRelativeTime(d);
    }
    
    const options: Intl.DateTimeFormatOptions = format === 'short' 
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    return d.toLocaleDateString('en-US', options);
  },

  // Format time for display
  formatTime: (date: Date | string, format: '12h' | '24h' = '12h'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const options: Intl.DateTimeFormatOptions = format === '12h'
      ? { hour: 'numeric', minute: '2-digit', hour12: true }
      : { hour: '2-digit', minute: '2-digit', hour12: false };
    
    return d.toLocaleTimeString('en-US', options);
  },

  // Format date and time together
  formatDateTime: (date: Date | string, format: 'short' | 'long' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const dateStr = dateUtils.formatDate(d, format);
    const timeStr = dateUtils.formatTime(d);
    
    return `${dateStr} at ${timeStr}`;
  },

  // Get relative time (e.g., "2 hours ago", "in 3 days")
  getRelativeTime: (date: Date | string): string => {
    return getRelativeTime(typeof date === 'string' ? new Date(date) : date);
  },

  // Check if date is today
  isToday: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return d.toDateString() === today.toDateString();
  },

  // Check if date is this week
  isThisWeek: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return d >= startOfWeek && d <= endOfWeek;
  },

  // Get start of day
  startOfDay: (date: Date | string): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  // Get end of day
  endOfDay: (date: Date | string): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  // Get days between two dates
  daysBetween: (date1: Date | string, date2: Date | string): number => {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    const timeDiff = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  },

  // Add days to date
  addDays: (date: Date | string, days: number): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  // Get week start date
  getWeekStart: (date: Date | string): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  },

  // Get month start date
  getMonthStart: (date: Date | string): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  },
};

// Helper function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// Validation utilities
export const validationUtils = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  isValidPassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Phone number validation (basic US format)
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  },

  // Name validation
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name);
  },

  // Required field validation
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Number range validation
  isInRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  // Date validation
  isValidDate: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d instanceof Date && !isNaN(d.getTime());
  },

  // Age validation (18+ for adult content)
  isValidAge: (birthDate: Date | string): boolean => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 13; // Minimum age requirement
    }
    
    return age >= 13;
  },
};

// Data formatting utilities
export const formatUtils = {
  // Format numbers with appropriate units
  formatNumber: (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  // Format percentages
  formatPercentage: (value: number, total: number, decimals: number = 1): string => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return `${formatUtils.formatNumber(percentage, decimals)}%`;
  },

  // Format duration in minutes to human readable
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  },

  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Convert camelCase to Title Case
  camelToTitle: (str: string): string => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  },

  // Truncate text with ellipsis
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },

  // Generate initials from name
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  },
};

// Color and theme utilities
export const colorUtils = {
  // Get mood color based on value (1-10 scale)
  getMoodColor: (mood: number): string => {
    if (mood <= 3) return 'hsl(var(--destructive))';
    if (mood <= 5) return 'hsl(var(--warning))';
    if (mood <= 7) return 'hsl(var(--primary))';
    return 'hsl(var(--success))';
  },

  // Get habit category color
  getHabitCategoryColor: (category: string): string => {
    const colors: Record<string, string> = {
      health: 'hsl(var(--success))',
      mental_wellness: 'hsl(var(--primary))',
      productivity: 'hsl(var(--warning))',
      social: 'hsl(var(--accent))',
      learning: 'hsl(var(--secondary))',
      spiritual: 'hsl(var(--muted))',
      physical: 'hsl(var(--success))',
      other: 'hsl(var(--muted-foreground))',
    };
    
    return colors[category] || colors.other;
  },

  // Generate consistent color from string (for avatars, etc.)
  getStringColor: (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  },

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },
};

// Storage utilities
export const storageUtils = {
  // Safe localStorage operations
  setItem: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
};

// Error handling utilities
export const errorUtils = {
  // Extract meaningful error message
  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.data?.message) return error.data.message;
    return 'An unexpected error occurred';
  },

  // Check if error is a network error
  isNetworkError: (error: any): boolean => {
    return (
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.includes('Network Error') ||
      error?.message?.includes('Failed to fetch') ||
      !navigator.onLine
    );
  },

  // Check if error is an authentication error
  isAuthError: (error: any): boolean => {
    return error?.statusCode === 401 || error?.code === 'UNAUTHORIZED';
  },

  // Check if error is a validation error
  isValidationError: (error: any): boolean => {
    return error?.statusCode === 400 || error?.code === 'VALIDATION_ERROR';
  },

  // Format error for display
  formatError: (error: any): { title: string; message: string; type: 'error' | 'warning' | 'info' } => {
    const message = errorUtils.getErrorMessage(error);
    
    if (errorUtils.isNetworkError(error)) {
      return {
        title: 'Connection Issue',
        message: 'Please check your internet connection and try again.',
        type: 'warning',
      };
    }
    
    if (errorUtils.isAuthError(error)) {
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        type: 'info',
      };
    }
    
    if (errorUtils.isValidationError(error)) {
      return {
        title: 'Validation Error',
        message,
        type: 'warning',
      };
    }
    
    return {
      title: 'Error',
      message,
      type: 'error',
    };
  },
};

// Wellness-specific utilities
export const wellnessUtils = {
  // Get mood emoji
  getMoodEmoji: (mood: number): string => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😔';
    if (mood <= 5) return '😐';
    if (mood <= 7) return '🙂';
    if (mood <= 8) return '😊';
    return '😄';
  },

  // Get mood label
  getMoodLabel: (mood: number): string => {
    if (mood <= 2) return 'Very Low';
    if (mood <= 4) return 'Low';
    if (mood <= 5) return 'Neutral';
    if (mood <= 7) return 'Good';
    if (mood <= 8) return 'Great';
    return 'Excellent';
  },

  // Calculate streak
  calculateStreak: (dates: Date[]): number => {
    if (dates.length === 0) return 0;
    
    const sortedDates = dates
      .map(d => dateUtils.startOfDay(d))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 1;
    let currentDate = sortedDates[0];
    
    for (let i = 1; i < sortedDates.length; i++) {
      const expectedDate = dateUtils.addDays(currentDate, -1);
      
      if (sortedDates[i].getTime() === expectedDate.getTime()) {
        streak++;
        currentDate = sortedDates[i];
      } else {
        break;
      }
    }
    
    return streak;
  },

  // Get wellness level
  getWellnessLevel: (score: number): { level: string; color: string; description: string } => {
    if (score >= 80) {
      return {
        level: 'Excellent',
        color: 'hsl(var(--success))',
        description: 'You\'re doing fantastic! Keep up the great work.',
      };
    }
    
    if (score >= 60) {
      return {
        level: 'Good',
        color: 'hsl(var(--primary))',
        description: 'You\'re on the right track. Small improvements can make a big difference.',
      };
    }
    
    if (score >= 40) {
      return {
        level: 'Fair',
        color: 'hsl(var(--warning))',
        description: 'There\'s room for improvement. Focus on building consistent habits.',
      };
    }
    
    return {
      level: 'Needs Attention',
      color: 'hsl(var(--destructive))',
      description: 'Consider reaching out for support and focusing on self-care.',
    };
  },
};