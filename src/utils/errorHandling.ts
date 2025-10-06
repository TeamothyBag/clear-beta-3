import { useCallback, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { errorUtils } from '../utils';

// Global error handler
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: Array<{ error: any; context?: string; timestamp: Date }> = [];
  private maxQueueSize = 50;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  // Log error to queue and external services
  logError(error: any, context?: string): void {
    const errorEntry = {
      error,
      context,
      timestamp: new Date(),
    };

    // Add to queue
    this.errorQueue.unshift(errorEntry);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Unknown'}] Error:`, error);
    }

    // Send to monitoring service (e.g., Sentry, LogRocket)
    this.sendToMonitoring(errorEntry);
  }

  private sendToMonitoring(errorEntry: any): void {
    // Implement integration with monitoring service
    // Example: Sentry.captureException(errorEntry.error);
    
    // For now, just log to console
    console.warn('Error logged:', errorEntry);
  }

  // Get recent errors for debugging
  getRecentErrors(): Array<{ error: any; context?: string; timestamp: Date }> {
    return this.errorQueue.slice(0, 10);
  }

  // Clear error queue
  clearErrors(): void {
    this.errorQueue = [];
  }
}

// Hook for handling errors in components
export function useErrorHandler() {
  const [errors, setErrors] = useState<Map<string, any>>(new Map());
  const { toast } = useToast();
  const errorHandler = GlobalErrorHandler.getInstance();

  const handleError = useCallback((error: any, context?: string, showToast: boolean = true) => {
    const errorKey = context || 'general';
    
    // Log to global handler
    errorHandler.logError(error, context);
    
    // Update local error state
    setErrors(prev => new Map(prev.set(errorKey, error)));
    
    // Show toast notification
    if (showToast) {
      const formattedError = errorUtils.formatError(error);
      toast({
        title: formattedError.title,
        description: formattedError.message,
        variant: formattedError.type === 'error' ? 'destructive' : 'default',
      });
    }
  }, [toast, errorHandler]);

  const clearError = useCallback((context?: string) => {
    if (context) {
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(context);
        return newErrors;
      });
    } else {
      setErrors(new Map());
    }
  }, []);

  const getError = useCallback((context: string) => {
    return errors.get(context);
  }, [errors]);

  const hasError = useCallback((context?: string) => {
    if (context) {
      return errors.has(context);
    }
    return errors.size > 0;
  }, [errors]);

  return {
    handleError,
    clearError,
    getError,
    hasError,
    errors: Array.from(errors.entries()),
  };
}

// Wrapper for async operations with error handling
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  context?: string,
  onError?: (error: any) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const errorHandler = GlobalErrorHandler.getInstance();
      errorHandler.logError(error, context);
      
      if (onError) {
        onError(error);
      } else {
        // Re-throw if no custom error handler
        throw error;
      }
    }
  }) as T;
}

// Network error retry utility
export function useRetry() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { handleError } = useErrorHandler();

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: string
  ): Promise<T> => {
    setIsRetrying(true);
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setRetryCount(0);
        setIsRetrying(false);
        return result;
      } catch (error) {
        setRetryCount(attempt + 1);
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          handleError(error, context);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    setIsRetrying(false);
    throw new Error('Max retries exceeded');
  }, [handleError]);

  return {
    retry,
    retryCount,
    isRetrying,
  };
}

// Global error event listeners
export function setupGlobalErrorHandlers(): void {
  const errorHandler = GlobalErrorHandler.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(event.reason, 'Unhandled Promise Rejection');
    event.preventDefault();
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error, 'JavaScript Error');
  });

  // Handle React error boundaries (if not caught)
  window.addEventListener('error', (event) => {
    if (event.error?.name === 'ChunkLoadError') {
      // Handle chunk load errors (common in SPAs)
      window.location.reload();
    }
  });
}