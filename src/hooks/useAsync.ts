import { useCallback, useRef, useState } from 'react';

type AsyncFn<T extends unknown[], R> = (...args: T) => Promise<R>;

interface UseAsyncOptions {
  onSuccess?: <T>(data: T) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

interface UseAsyncState<R> {
  data: R | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncReturn<T extends unknown[], R> extends UseAsyncState<R> {
  execute: (...args: T) => Promise<R | null>;
  reset: () => void;
}

export function useAsync<T extends unknown[], R>(
  asyncFn: AsyncFn<T, R>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T, R> {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<UseAsyncState<R>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const mountedRef = useRef(true);

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const result = await asyncFn(...args);

        if (mountedRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (mountedRef.current) {
          setState({
            data: null,
            error,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
          onError?.(error);
        }

        return null;
      } finally {
        if (mountedRef.current) {
          onSettled?.();
        }
      }
    },
    [asyncFn, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return { ...state, execute, reset };
}

// Debounced async hook
export function useDebounceAsync<T extends unknown[], R>(
  asyncFn: AsyncFn<T, R>,
  delay: number = 300,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T, R> {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { execute: baseExecute, ...rest } = useAsync(asyncFn, options);

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          const result = await baseExecute(...args);
          resolve(result);
        }, delay);
      });
    },
    [baseExecute, delay]
  );

  return { ...rest, execute };
}
