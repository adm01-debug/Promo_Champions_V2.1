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
    return circuit.halfOpenAttempts < HALF_OPEN_MAX;
  }

  it('should start in CLOSED state', () => {
    const circuit = createCircuit();
    expect(circuit.state).toBe('CLOSED');
    expect(circuit.failures).toBe(0);
  });

  it('should remain CLOSED below threshold', () => {
    let circuit = createCircuit();
    circuit = recordFailure(circuit, THRESHOLD);
    expect(circuit.state).toBe('CLOSED');
    expect(circuit.failures).toBe(1);

    circuit = recordFailure(circuit, THRESHOLD);
    expect(circuit.state).toBe('CLOSED');
    expect(circuit.failures).toBe(2);
  });

  it('should transition to OPEN at threshold', () => {
    let circuit = createCircuit();
    for (let i = 0; i < THRESHOLD; i++) {
      circuit = recordFailure(circuit, THRESHOLD);
    }
    expect(circuit.state).toBe('OPEN');
    expect(circuit.failures).toBe(THRESHOLD);
  });

  it('should block requests when OPEN', () => {
    const circuit: CircuitBreakerState = {
      state: 'OPEN',
      failures: THRESHOLD,
      lastFailure: Date.now(),
      halfOpenAttempts: 0,
    };
    expect(shouldAllow(circuit, RESET_TIMEOUT)).toBe(false);
  });

  it('should allow requests when OPEN timeout expired', () => {
    const circuit: CircuitBreakerState = {
      state: 'OPEN',
      failures: THRESHOLD,
      lastFailure: Date.now() - (RESET_TIMEOUT * 2),
      halfOpenAttempts: 0,
    };
    expect(shouldAllow(circuit, RESET_TIMEOUT)).toBe(true);
  });

  it('should recover from HALF_OPEN on success', () => {
    const circuit: CircuitBreakerState = {
      state: 'HALF_OPEN',
      failures: THRESHOLD,
      lastFailure: Date.now() - (RESET_TIMEOUT * 2),
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
    expect(shouldAllow(createCircuit(), RESET_TIMEOUT)).toBe(true);
  });

  it('should limit HALF_OPEN attempts', () => {
    const circuit: CircuitBreakerState = {
      state: 'HALF_OPEN',
      failures: THRESHOLD,
      lastFailure: null,
      halfOpenAttempts: HALF_OPEN_MAX,
    };
    expect(shouldAllow(circuit, RESET_TIMEOUT)).toBe(false);
  });
});

// Test Backoff Delay — deterministic via injected rand (no Math.random).
describe('calculateBackoffDelay', () => {
  const { baseDelay: BASE, maxDelay: MAX, backoffMultiplier: MULT } = RETRY_DEFAULTS;

  it('should return base delay on first attempt (rand=0 → exact base)', () => {
    expect(calculateBackoffDelay(1, BASE, MAX, MULT, constRand(0))).toBe(BASE);
  });

  it('should respect upper jitter bound on first attempt (rand≈1)', () => {
    const delay = calculateBackoffDelay(1, BASE, MAX, MULT, constRand(MAX_RAND));
    expect(delay).toBeGreaterThanOrEqual(BASE);
    expect(delay).toBeLessThanOrEqual(BASE * (1 + JITTER_FACTOR));
  });

  it('should increase delay exponentially with fixed rand', () => {
    const r = constRand(0.5);
    const d1 = calculateBackoffDelay(1, BASE, MAX, MULT, r);
    const d2 = calculateBackoffDelay(2, BASE, MAX, MULT, r);
    const d3 = calculateBackoffDelay(3, BASE, MAX, MULT, r);
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
    // Exact ratio with constant rand: delay grows by exactly MULT.
    expect(d2 / d1).toBeCloseTo(MULT, 9);
    expect(d3 / d2).toBeCloseTo(MULT, 9);
  });

  it('should cap at max delay even with maximum jitter', () => {
    const delay = calculateBackoffDelay(20, BASE, 5000, MULT, constRand(MAX_RAND));
    expect(delay).toBe(5000);
  });

  it('should handle zero base delay deterministically', () => {
    for (const r of [0, 0.5, MAX_RAND]) {
      expect(calculateBackoffDelay(1, 0, MAX, MULT, constRand(r))).toBe(0);
    }
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
