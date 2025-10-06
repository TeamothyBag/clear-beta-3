import { useState, useEffect, useCallback } from 'react';
import { APIError } from '@/types/api';

// Generic API hook for handling loading, error, and data states
export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    retry,
    reset,
    execute,
  };
}

// Hook for handling async operations with loading and error states
export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: T): Promise<R | undefined> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation(...args);
      return result;
    } catch (err) {
      const apiError = err as APIError;
      setError(apiError.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [operation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    clearError,
  };
}

// Hook for debounced values (useful for search/filtering)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for local storage state management
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Hook for handling pagination
export function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToNext = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPrevious = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    reset,
  };
}

// Hook for managing form state with validation
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | undefined>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const setTouched = useCallback((name: keyof T, isTouched: boolean = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validate = useCallback((name?: keyof T) => {
    if (!validationRules) return true;

    const fieldsToValidate = name ? [name] : Object.keys(validationRules) as (keyof T)[];
    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    fieldsToValidate.forEach(field => {
      const rule = validationRules[field];
      if (rule) {
        const error = rule(values[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    if (name) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    } else {
      setErrors(newErrors);
    }

    return isValid;
  }, [values, validationRules]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>);
      setTouchedState(allTouched);

      // Validate all fields
      if (validate()) {
        await onSubmit(values);
      }
    };
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  const getFieldProps = useCallback((name: keyof T) => ({
    value: values[name] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(name, e.target.value);
    },
    onBlur: () => {
      setTouched(name, true);
      validate(name);
    },
    error: touched[name] ? errors[name] : undefined,
  }), [values, touched, errors, setValue, validate]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    setTouched,
    validate,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

// Hook for managing arrays (useful for dynamic forms)
export function useArray<T>(initialArray: T[] = []) {
  const [items, setItems] = useState<T[]>(initialArray);

  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const remove = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const update = useCallback((index: number, item: T) => {
    setItems(prev => prev.map((prevItem, i) => i === index ? item : prevItem));
  }, []);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const item = newItems.splice(fromIndex, 1)[0];
      newItems.splice(toIndex, 0, item);
      return newItems;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const reset = useCallback(() => {
    setItems(initialArray);
  }, [initialArray]);

  return {
    items,
    add,
    remove,
    update,
    move,
    clear,
    reset,
    setItems,
  };
}

// Hook for handling timers/intervals
export function useTimer(
  callback: () => void,
  delay: number | null,
  immediate: boolean = false
) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (delay === null || !isRunning) return;

    if (immediate) {
      callback();
    }

    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [callback, delay, isRunning, immediate]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  return {
    isRunning,
    start,
    stop,
    toggle,
  };
}

// Hook for handling previous values
export function usePrevious<T>(value: T): T | undefined {
  const ref = useState<T | undefined>(undefined);
  
  useEffect(() => {
    ref[1](value);
  });
  
  return ref[0];
}

// Hook for tracking component mount status
export function useMountedRef() {
  const mountedRef = useState(false);
  
  useEffect(() => {
    mountedRef[1](true);
    return () => {
      mountedRef[1](false);
    };
  }, []);
  
  return mountedRef[0];
}