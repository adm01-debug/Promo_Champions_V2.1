import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { withCircuitBreaker, CircuitBreakerError } from "@/hooks/useCircuitBreaker";

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (attemptNumber: number, error: Error, delay: number) => void;
}

interface CircuitBreakerConfig {
  enabled?: boolean;
  name?: string;
  failureThreshold?: number;
  resetTimeout?: number;
}

// Exported as the single source of truth for default retry behavior.
// Tests must reference these instead of duplicating literals.
export const RETRY_DEFAULTS: Required<Omit<RetryConfig, 'onRetry' | 'retryCondition'>> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
};
const DEFAULT_RETRY_CONFIG = RETRY_DEFAULTS;

// Maximum jitter as a fraction of the exponential delay (0.3 = up to +30%).
// Exported so tests and callers can reference the single source of truth.
export const JITTER_FACTOR = 0.3;

// Calculate delay with exponential backoff and jitter.
// `rand` is injectable to allow deterministic testing of the jitter range.
// Default uses Math.random for production behavior (fully backwards compatible).
export function calculateBackoffDelay(
  attemptNumber: number,
  baseDelay: number,
  maxDelay: number,
  multiplier: number,
  rand: () => number = Math.random,
): number {
  const exponentialDelay = baseDelay * Math.pow(multiplier, attemptNumber - 1);
  const jitter = rand() * JITTER_FACTOR * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
}

// Check if error is retryable (network errors, 5xx server errors)
export function isRetryableError(error: Error): boolean {
  // Circuit breaker errors should not be retried
  if (error instanceof CircuitBreakerError) {
    return false;
  }

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

// Hook for mutations with automatic retry and circuit breaker
export function useRetryMutation<TData, TError extends Error, TVariables, TContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables, TContext> & {
    retryConfig?: RetryConfig;
    circuitBreaker?: CircuitBreakerConfig;
    showRetryToast?: boolean;
  }
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { retryConfig, circuitBreaker, showRetryToast = true, ...mutationOptions } = options || {};

  const wrappedMutationFn = async (variables: TVariables): Promise<TData> => {
    const executeWithRetry = () => withRetry(
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

    // Wrap with circuit breaker if enabled
    if (circuitBreaker?.enabled && circuitBreaker.name) {
      return withCircuitBreaker(executeWithRetry, circuitBreaker.name, {
        failureThreshold: circuitBreaker.failureThreshold,
        resetTimeout: circuitBreaker.resetTimeout,
      });
    }

    return executeWithRetry();
  };

  return useMutation({
    ...mutationOptions,
    mutationFn: wrappedMutationFn,
  });
}

// Create retry-enabled mutation options
export function createRetryMutationOptions<TData, _TError extends Error, TVariables>(
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
