import { useCallback, useRef, useEffect } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, nextDelay: number) => void;
}

interface UseRetryReturn<T extends unknown[], R> {
  execute: (...args: T) => Promise<R>;
  cancel: () => void;
  isRetrying: boolean;
  retryCount: number;
}

export function useRetry<T extends unknown[], R>(
  asyncFn: (...args: T) => Promise<R>,
  options: UseRetryOptions = {}
): UseRetryReturn<T, R> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    retryCondition = () => true,
    onRetry,
  } = options;

  const retryCountRef = useRef(0);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const execute = useCallback(
    async (...args: T): Promise<R> => {
      cancelledRef.current = false;
      retryCountRef.current = 0;

      const attempt = async (delay: number): Promise<R> => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));

          if (
            cancelledRef.current ||
            retryCountRef.current >= maxRetries ||
            !retryCondition(err, retryCountRef.current)
          ) {
            throw err;
          }

          retryCountRef.current++;
          const nextDelay = Math.min(delay * backoffMultiplier, maxDelay);

          onRetry?.(err, retryCountRef.current, nextDelay);

          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(resolve, delay);
          });

          if (cancelledRef.current) {
            throw new Error('Retry cancelled');
          }

          return attempt(nextDelay);
        }
      };

      return attempt(initialDelay);
    },
    [asyncFn, maxRetries, initialDelay, maxDelay, backoffMultiplier, retryCondition, onRetry]
  );

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute,
    cancel,
    isRetrying: retryCountRef.current > 0,
    retryCount: retryCountRef.current,
  };
}
