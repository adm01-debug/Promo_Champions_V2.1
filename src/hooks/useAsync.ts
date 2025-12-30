import { useState, useCallback, useRef, useEffect } from 'react';

type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsync<T extends any[], R>(
  asyncFunction: AsyncFunction<T, R>,
  options: UseAsyncOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseAsyncState<R>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });

  const mountedRef = useRef(true);

  const execute = useCallback(async (...args: T) => {
    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }));

    try {
      const data = await asyncFunction(...args);
      
      if (mountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false
        });
        onSuccess?.(data);
      }
      
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (mountedRef.current) {
        setState({
          data: null,
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true
        });
        onError?.(err);
      }
      
      throw err;
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false
    });
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook for handling form submissions
interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}

export function useFormSubmit<T>(
  submitFn: () => Promise<T>,
  options: UseFormSubmitOptions<T> = {}
) {
  const { onSuccess, onError, resetOnSuccess = false } = options;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = await submitFn();
      setIsSuccess(true);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [submitFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsSubmitting(false);
  }, []);

  return {
    submit,
    reset,
    isSubmitting,
    error,
    isSuccess
  };
}
