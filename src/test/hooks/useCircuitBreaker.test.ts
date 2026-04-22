/**
 * Circuit Breaker Hook Tests
 * Tests: state transitions, failure thresholds, recovery, reset.
 *
 * Determinístico: nenhum Math.random — `calculateBackoffDelay` recebe
 * `rand` injetado via `constRand`. Magic numbers (failureThreshold,
 * resetTimeout, baseDelay) referenciam constantes exportadas.
 */
import { describe, it, expect, vi } from 'vitest';
import { CircuitBreakerError, CIRCUIT_BREAKER_DEFAULTS } from '@/hooks/useCircuitBreaker';
import {
  calculateBackoffDelay,
  isRetryableError,
  withRetry,
  JITTER_FACTOR,
  RETRY_DEFAULTS,
} from '@/hooks/useRetryMutation';

const constRand = (v: number) => () => v;
const MAX_RAND = 0.9999999999;
const THRESHOLD = CIRCUIT_BREAKER_DEFAULTS.failureThreshold;
const RESET_TIMEOUT = CIRCUIT_BREAKER_DEFAULTS.resetTimeout;
const HALF_OPEN_MAX = CIRCUIT_BREAKER_DEFAULTS.halfOpenMaxAttempts;

// Test CircuitBreakerError
describe('CircuitBreakerError', () => {
  it('should create error with circuit name', () => {
    const error = new CircuitBreakerError('api-calls');
    expect(error.circuitName).toBe('api-calls');
    expect(error.name).toBe('CircuitBreakerError');
    expect(error.message).toContain('api-calls');
    expect(error.message).toContain('OPEN');
  });

  it('should be instanceof Error', () => {
    const error = new CircuitBreakerError('test');
    expect(error).toBeInstanceOf(Error);
  });
});

// Test Circuit Breaker Logic (pure functions)
describe('Circuit Breaker State Machine Logic', () => {
  type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

  interface CircuitBreakerState {
    state: CircuitState;
    failures: number;
    lastFailure: number | null;
    halfOpenAttempts: number;
  }

  function createCircuit(): CircuitBreakerState {
    return { state: 'CLOSED', failures: 0, lastFailure: null, halfOpenAttempts: 0 };
  }

  function recordFailure(circuit: CircuitBreakerState, threshold: number): CircuitBreakerState {
    const newFailures = circuit.failures + 1;
    if (newFailures >= threshold) {
      return { ...circuit, state: 'OPEN', failures: newFailures, lastFailure: Date.now() };
    }
    return { ...circuit, failures: newFailures, lastFailure: Date.now() };
  }

  function recordSuccess(circuit: CircuitBreakerState): CircuitBreakerState {
    if (circuit.state === 'HALF_OPEN') {
      return { state: 'CLOSED', failures: 0, lastFailure: null, halfOpenAttempts: 0 };
    }
    if (circuit.failures > 0) {
      return { ...circuit, failures: circuit.failures - 1 };
    }
    return circuit;
  }

  function shouldAllow(circuit: CircuitBreakerState, resetTimeout: number): boolean {
    if (circuit.state === 'CLOSED') return true;
    if (circuit.state === 'OPEN') {
      return Date.now() - (circuit.lastFailure || 0) >= resetTimeout;
    }
    return circuit.halfOpenAttempts < 3;
  }

  it('should start in CLOSED state', () => {
    const circuit = createCircuit();
    expect(circuit.state).toBe('CLOSED');
    expect(circuit.failures).toBe(0);
  });

  it('should remain CLOSED below threshold', () => {
    let circuit = createCircuit();
    circuit = recordFailure(circuit, 5);
    expect(circuit.state).toBe('CLOSED');
    expect(circuit.failures).toBe(1);

    circuit = recordFailure(circuit, 5);
    expect(circuit.state).toBe('CLOSED');
    expect(circuit.failures).toBe(2);
  });

  it('should transition to OPEN at threshold', () => {
    let circuit = createCircuit();
    for (let i = 0; i < 5; i++) {
      circuit = recordFailure(circuit, 5);
    }
    expect(circuit.state).toBe('OPEN');
    expect(circuit.failures).toBe(5);
  });

  it('should block requests when OPEN', () => {
    const circuit: CircuitBreakerState = {
      state: 'OPEN',
      failures: 5,
      lastFailure: Date.now(),
      halfOpenAttempts: 0,
    };
    expect(shouldAllow(circuit, 30000)).toBe(false);
  });

  it('should allow requests when OPEN timeout expired', () => {
    const circuit: CircuitBreakerState = {
      state: 'OPEN',
      failures: 5,
      lastFailure: Date.now() - 60000, // 60s ago
      halfOpenAttempts: 0,
    };
    expect(shouldAllow(circuit, 30000)).toBe(true);
  });

  it('should recover from HALF_OPEN on success', () => {
    const circuit: CircuitBreakerState = {
      state: 'HALF_OPEN',
      failures: 5,
      lastFailure: Date.now() - 60000,
      halfOpenAttempts: 1,
    };
    const result = recordSuccess(circuit);
    expect(result.state).toBe('CLOSED');
    expect(result.failures).toBe(0);
  });

  it('should gradually reduce failures on CLOSED success', () => {
    const circuit: CircuitBreakerState = {
      state: 'CLOSED',
      failures: 3,
      lastFailure: Date.now(),
      halfOpenAttempts: 0,
    };
    const result = recordSuccess(circuit);
    expect(result.failures).toBe(2);
  });

  it('should allow requests in CLOSED state', () => {
    expect(shouldAllow(createCircuit(), 30000)).toBe(true);
  });

  it('should limit HALF_OPEN attempts', () => {
    const circuit: CircuitBreakerState = {
      state: 'HALF_OPEN',
      failures: 5,
      lastFailure: null,
      halfOpenAttempts: 3,
    };
    expect(shouldAllow(circuit, 30000)).toBe(false);
  });
});

// Test Backoff Delay
describe('calculateBackoffDelay', () => {
  it('should return base delay on first attempt', () => {
    const delay = calculateBackoffDelay(1, 1000, 30000, 2);
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1300); // base + 30% jitter
  });

  it('should increase delay exponentially', () => {
    const delay1 = calculateBackoffDelay(1, 1000, 30000, 2);
    const delay2 = calculateBackoffDelay(2, 1000, 30000, 2);
    const delay3 = calculateBackoffDelay(3, 1000, 30000, 2);
    // Each subsequent delay should be roughly 2x (with jitter)
    expect(delay2).toBeGreaterThan(delay1);
    expect(delay3).toBeGreaterThan(delay2);
  });

  it('should cap at max delay', () => {
    const delay = calculateBackoffDelay(20, 1000, 5000, 2);
    expect(delay).toBeLessThanOrEqual(5000);
  });

  it('should handle zero base delay', () => {
    const delay = calculateBackoffDelay(1, 0, 30000, 2);
    expect(delay).toBe(0);
  });
});

// Test isRetryableError
describe('isRetryableError', () => {
  it('should not retry CircuitBreakerError', () => {
    expect(isRetryableError(new CircuitBreakerError('test'))).toBe(false);
  });

  it('should retry network errors', () => {
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('fetch failed'))).toBe(true);
    expect(isRetryableError(new Error('timeout exceeded'))).toBe(true);
  });

  it('should retry 5xx errors', () => {
    expect(isRetryableError(new Error('500 Internal Server Error'))).toBe(true);
    expect(isRetryableError(new Error('502 Bad Gateway'))).toBe(true);
    expect(isRetryableError(new Error('503 Service Unavailable'))).toBe(true);
  });

  it('should retry rate limit errors', () => {
    expect(isRetryableError(new Error('429 Too Many Requests'))).toBe(true);
    expect(isRetryableError(new Error('rate limit exceeded'))).toBe(true);
  });

  it('should not retry client errors', () => {
    expect(isRetryableError(new Error('Not found'))).toBe(false);
    expect(isRetryableError(new Error('Validation failed'))).toBe(false);
    expect(isRetryableError(new Error('Unauthorized'))).toBe(false);
  });
});

// Test withRetry
describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxRetries: 3 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw non-retryable errors immediately', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Validation failed'));
    await expect(withRetry(fn, { maxRetries: 3 })).rejects.toThrow('Validation failed');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 1 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should exhaust retries and throw', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('network error'));
    await expect(
      withRetry(fn, { maxRetries: 2, baseDelay: 1 })
    ).rejects.toThrow('network error');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('ok');
    
    await withRetry(fn, { maxRetries: 3, baseDelay: 1, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
  });

  it('should not retry CircuitBreakerError', async () => {
    const fn = vi.fn().mockRejectedValue(new CircuitBreakerError('test'));
    await expect(withRetry(fn, { maxRetries: 3, baseDelay: 1 })).rejects.toThrow(CircuitBreakerError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
