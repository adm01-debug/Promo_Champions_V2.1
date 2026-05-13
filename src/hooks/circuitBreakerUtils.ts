import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailure: number | null;
  halfOpenAttempts: number;
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenMaxAttempts?: number;
  onStateChange?: (state: CircuitState, previousState: CircuitState) => void;
  onOpen?: (failures: number) => void;
  onClose?: () => void;
  persistEvents?: boolean;
}

export const DEFAULT_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenMaxAttempts: 3,
  persistEvents: true,
} as const;

// Global circuit breaker registry
export const circuitBreakers = new Map<string, CircuitBreakerState>();

export function getOrCreateCircuit(name: string): CircuitBreakerState {
  if (!circuitBreakers.has(name)) {
    circuitBreakers.set(name, {
      state: 'CLOSED',
      failures: 0,
      lastFailure: null,
      halfOpenAttempts: 0,
    });
  }
  return circuitBreakers.get(name)!;
}

export class CircuitBreakerError extends Error {
  constructor(public circuitName: string) {
    super(`Circuit breaker "${circuitName}" is OPEN. Service temporarily unavailable.`);
    this.name = 'CircuitBreakerError';
  }
}

// Log event to database (fire-and-forget)
export async function logCircuitEvent(
  circuitName: string,
  eventType: string,
  previousState?: string,
  newState?: string,
  failureCount?: number
): Promise<void> {
  try {
    await supabase.from('circuit_breaker_events').insert([{
      circuit_name: circuitName,
      event_type: eventType,
      previous_state: previousState || null,
      new_state: newState || null,
      failure_count: failureCount || 0,
      details: {},
    }]);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[CircuitBreaker] Failed to log event:', error);
    }
  }
}

// Wrapper for mutations with circuit breaker
export function withCircuitBreaker<T>(
  fn: () => Promise<T>,
  circuitName: string,
  config: CircuitBreakerConfig = {}
): Promise<T> {
  const {
    failureThreshold = DEFAULT_CONFIG.failureThreshold,
    resetTimeout = DEFAULT_CONFIG.resetTimeout,
    halfOpenMaxAttempts = DEFAULT_CONFIG.halfOpenMaxAttempts,
    persistEvents = DEFAULT_CONFIG.persistEvents,
  } = config;

  const circuit = getOrCreateCircuit(circuitName);
  const previousState = circuit.state;

  if (circuit.state === 'OPEN') {
    const timeSinceLastFailure = Date.now() - (circuit.lastFailure || 0);
    if (timeSinceLastFailure >= resetTimeout) {
      circuit.state = 'HALF_OPEN';
      circuit.halfOpenAttempts = 0;
      if (persistEvents) {
        logCircuitEvent(circuitName, 'half_open', 'OPEN', 'HALF_OPEN', circuit.failures);
      }
    } else {
      return Promise.reject(new CircuitBreakerError(circuitName));
    }
  }

  if (circuit.state === 'HALF_OPEN' && circuit.halfOpenAttempts >= halfOpenMaxAttempts) {
    return Promise.reject(new CircuitBreakerError(circuitName));
  }

  return fn()
    .then((result) => {
      if (circuit.state === 'HALF_OPEN') {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        circuit.lastFailure = null;
        circuit.halfOpenAttempts = 0;
        if (persistEvents) {
          logCircuitEvent(circuitName, 'closed', 'HALF_OPEN', 'CLOSED', 0);
        }
      } else if (circuit.failures > 0) {
        circuit.failures = Math.max(0, circuit.failures - 1);
      }
      return result;
    })
    .catch((error) => {
      circuit.failures += 1;
      circuit.lastFailure = Date.now();

      if (circuit.state === 'HALF_OPEN') {
        circuit.halfOpenAttempts += 1;
        if (circuit.halfOpenAttempts >= halfOpenMaxAttempts) {
          circuit.state = 'OPEN';
          if (persistEvents) {
            logCircuitEvent(circuitName, 'opened', 'HALF_OPEN', 'OPEN', circuit.failures);
          }
        } else if (persistEvents) {
          logCircuitEvent(circuitName, 'failure', 'HALF_OPEN', 'HALF_OPEN', circuit.failures);
        }
      } else if (circuit.failures >= failureThreshold) {
        circuit.state = 'OPEN';
        if (import.meta.env.DEV) {
          console.warn(`[CircuitBreaker] "${circuitName}" opened after ${circuit.failures} failures`);
        }
        toast.warning(`Serviço temporariamente indisponível. Tentando novamente em ${resetTimeout / 1000}s...`);
        if (persistEvents) {
          logCircuitEvent(circuitName, 'opened', previousState, 'OPEN', circuit.failures);
        }
      } else if (persistEvents) {
        logCircuitEvent(circuitName, 'failure', circuit.state, circuit.state, circuit.failures);
      }

      throw error;
    });
}

// Get all circuit breaker states (for debugging)
export function getAllCircuitStates(): Record<string, CircuitBreakerState> {
  const states: Record<string, CircuitBreakerState> = {};
  circuitBreakers.forEach((state, name) => {
    states[name] = { ...state };
  });
  return states;
}

// Reset a specific circuit
export function resetCircuit(name: string): void {
  const circuit = circuitBreakers.get(name);
  if (circuit) {
    const previousState = circuit.state;
    circuit.state = 'CLOSED';
    circuit.failures = 0;
    circuit.lastFailure = null;
    circuit.halfOpenAttempts = 0;
    logCircuitEvent(name, 'closed', previousState, 'CLOSED', 0);
  }
}

// Reset all circuits
export function resetAllCircuits(): void {
  circuitBreakers.forEach((circuit, name) => {
    const previousState = circuit.state;
    circuit.state = 'CLOSED';
    circuit.failures = 0;
    circuit.lastFailure = null;
    circuit.halfOpenAttempts = 0;
    if (previousState !== 'CLOSED') {
      logCircuitEvent(name, 'closed', previousState, 'CLOSED', 0);
    }
  });
}

// Expose for debugging in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as unknown as { __circuitBreakers: unknown }).__circuitBreakers = {
    getAll: getAllCircuitStates,
    reset: resetCircuit,
    resetAll: resetAllCircuits,
  };
}
