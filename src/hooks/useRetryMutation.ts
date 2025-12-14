import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attemptNumber: number, error: Error, delay: number) => void;
}

const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'onRetry' | 'retryCondition'>> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};

// Calculate delay with exponential backoff and jitter
export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number
): number {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attemptNumber - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // Add up to 30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

// Check if error is retryable (network errors, 5xx server errors)
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return true;
  }
  
  // Server errors (5xx)
  if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
    return true;
  }
  
  // Rate limiting
  if (message.includes('429') || message.includes('rate limit')) {
    return true;
  }
  
  return false;
}

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper for async functions
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
    baseDelay = DEFAULT_RETRY_CONFIG.baseDelay,
    maxDelay = DEFAULT_RETRY_CONFIG.maxDelay,
    backoffMultiplier = DEFAULT_RETRY_CONFIG.backoffMultiplier,
    retryCondition = isRetryableError,
    onRetry,
  } = config;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt or error is not retryable, throw
      if (attempt > maxRetries || !retryCondition(lastError)) {
        throw lastError;
      }

      const delay = calculateBackoffDelay(attempt, baseDelay, maxDelay, backoffMultiplier);

      if (onRetry) {
        onRetry(attempt, lastError, delay);
      }

      if (import.meta.env.DEV) {
        console.warn(
          `[Retry] Attempt ${attempt}/${maxRetries} failed. Retrying in ${Math.round(delay)}ms...`,
          lastError.message
        );
      }

      await sleep(delay);
    }
  }

  throw lastError!;
}

// Hook for mutations with automatic retry
export function useRetryMutation<TData, TError extends Error, TVariables, TContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext> & {
    retryConfig?: RetryConfig;
    showRetryToast?: boolean;
  }
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { retryConfig, showRetryToast = true, ...mutationOptions } = options || {};

  const wrappedMutationFn = async (variables: TVariables): Promise<TData> => {
    return withRetry(
      () => mutationFn(variables),
      {
        ...retryConfig,
        onRetry: (attempt, error, delay) => {
          retryConfig?.onRetry?.(attempt, error, delay);
          
          if (showRetryToast) {
            toast.info(`Tentativa ${attempt} falhou. Tentando novamente em ${Math.round(delay / 1000)}s...`, {
              duration: delay,
            });
          }
        },
      }
    );
  };

  return useMutation({
    ...mutationOptions,
    mutationFn: wrappedMutationFn,
  });
}

// Create retry-enabled mutation options
export function createRetryMutationOptions<TData, TError extends Error, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  retryConfig?: RetryConfig
): { mutationFn: (variables: TVariables) => Promise<TData> } {
  return {
    mutationFn: (variables: TVariables) =>
      withRetry(() => mutationFn(variables), retryConfig),
  };
}

// Global retry configuration
let globalRetryConfig: RetryConfig = { ...DEFAULT_RETRY_CONFIG };

export function configureGlobalRetry(config: Partial<RetryConfig>): void {
  globalRetryConfig = { ...globalRetryConfig, ...config };
}

export function getGlobalRetryConfig(): RetryConfig {
  return { ...globalRetryConfig };
}

// Expose for debugging in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as { __retryConfig: unknown }).__retryConfig = {
    configure: configureGlobalRetry,
    getConfig: getGlobalRetryConfig,
    defaults: DEFAULT_RETRY_CONFIG,
  };
}
