import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenMaxAttempts?: number;
  onStateChange?: (state: CircuitState, previousState: CircuitState) => void;
  onOpen?: (failures: number) => void;
  onClose?: () => void;
  persistEvents?: boolean; // Enable database persistence
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailure: number | null;
  halfOpenAttempts: number;
}

const DEFAULT_CONFIG: Required<Omit<CircuitBreakerConfig, 'onStateChange' | 'onOpen' | 'onClose'>> = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  halfOpenMaxAttempts: 3,
  persistEvents: true,
};

// Global circuit breaker registry
const circuitBreakers = new Map<string, CircuitBreakerState>();

function getOrCreateCircuit(name: string): CircuitBreakerState {
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

export function useCircuitBreaker(name: string, config: CircuitBreakerConfig = {}) {
  const {
    failureThreshold = DEFAULT_CONFIG.failureThreshold,
    resetTimeout = DEFAULT_CONFIG.resetTimeout,
    halfOpenMaxAttempts = DEFAULT_CONFIG.halfOpenMaxAttempts,
    onStateChange,
    onOpen,
    onClose,
  } = config;

  const [, forceUpdate] = useState({});
  const configRef = useRef({ onStateChange, onOpen, onClose });
  configRef.current = { onStateChange, onOpen, onClose };

  const getState = useCallback((): CircuitBreakerState => {
    return getOrCreateCircuit(name);
  }, [name]);

  const setState = useCallback((updates: Partial<CircuitBreakerState>) => {
    const current = getOrCreateCircuit(name);
    const previousState = current.state;
    Object.assign(current, updates);
    
    if (updates.state && updates.state !== previousState) {
      configRef.current.onStateChange?.(updates.state, previousState);
      
      if (updates.state === 'OPEN') {
        configRef.current.onOpen?.(current.failures);
      } else if (updates.state === 'CLOSED') {
        configRef.current.onClose?.();
      }
    }
    
    forceUpdate({});
  }, [name]);

  const shouldAllowRequest = useCallback((): boolean => {
    const circuit = getState();

    if (circuit.state === 'CLOSED') {
      return true;
    }

    if (circuit.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - (circuit.lastFailure || 0);
      
      if (timeSinceLastFailure >= resetTimeout) {
        setState({ state: 'HALF_OPEN', halfOpenAttempts: 0 });
        return true;
      }
      
      return false;
    }

    // HALF_OPEN: allow limited attempts
    return circuit.halfOpenAttempts < halfOpenMaxAttempts;
  }, [getState, setState, resetTimeout, halfOpenMaxAttempts]);

  const recordSuccess = useCallback(() => {
    const circuit = getState();
    
    if (circuit.state === 'HALF_OPEN') {
      setState({
        state: 'CLOSED',
        failures: 0,
        lastFailure: null,
        halfOpenAttempts: 0,
      });
    } else if (circuit.state === 'CLOSED' && circuit.failures > 0) {
      // Gradually reduce failure count on success
      setState({ failures: Math.max(0, circuit.failures - 1) });
    }
  }, [getState, setState]);

  const recordFailure = useCallback(() => {
    const circuit = getState();
    const newFailures = circuit.failures + 1;
    
    if (circuit.state === 'HALF_OPEN') {
      const newHalfOpenAttempts = circuit.halfOpenAttempts + 1;
      
      if (newHalfOpenAttempts >= halfOpenMaxAttempts) {
        setState({
          state: 'OPEN',
          failures: newFailures,
          lastFailure: Date.now(),
          halfOpenAttempts: 0,
        });
      } else {
        setState({
          failures: newFailures,
          halfOpenAttempts: newHalfOpenAttempts,
        });
      }
    } else if (newFailures >= failureThreshold) {
      setState({
        state: 'OPEN',
        failures: newFailures,
        lastFailure: Date.now(),
      });
    } else {
      setState({ failures: newFailures, lastFailure: Date.now() });
    }
  }, [getState, setState, failureThreshold, halfOpenMaxAttempts]);

  const reset = useCallback(() => {
    setState({
      state: 'CLOSED',
      failures: 0,
      lastFailure: null,
      halfOpenAttempts: 0,
    });
  }, [setState]);

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    if (!shouldAllowRequest()) {
      throw new CircuitBreakerError(name);
    }

    try {
      const result = await fn();
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure();
      throw error;
    }
  }, [name, shouldAllowRequest, recordSuccess, recordFailure]);

  return {
    execute,
    state: getState().state,
    failures: getState().failures,
    isOpen: getState().state === 'OPEN',
    isClosed: getState().state === 'CLOSED',
    isHalfOpen: getState().state === 'HALF_OPEN',
    reset,
    shouldAllowRequest,
    recordSuccess,
    recordFailure,
  };
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

  // Check if request should be allowed
  if (circuit.state === 'OPEN') {
    const timeSinceLastFailure = Date.now() - (circuit.lastFailure || 0);
    
    if (timeSinceLastFailure >= resetTimeout) {
      circuit.state = 'HALF_OPEN';
      circuit.halfOpenAttempts = 0;
      
      // Log state transition
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
        
        // Log recovery
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
          
          // Log reopening
          if (persistEvents) {
            logCircuitEvent(circuitName, 'opened', 'HALF_OPEN', 'OPEN', circuit.failures);
          }
        } else if (persistEvents) {
          // Log failure during recovery
          logCircuitEvent(circuitName, 'failure', 'HALF_OPEN', 'HALF_OPEN', circuit.failures);
        }
      } else if (circuit.failures >= failureThreshold) {
        circuit.state = 'OPEN';
        
        if (import.meta.env.DEV) {
          console.warn(`[CircuitBreaker] "${circuitName}" opened after ${circuit.failures} failures`);
        }
        
        toast.warning(`Serviço temporariamente indisponível. Tentando novamente em ${resetTimeout / 1000}s...`);
        
        // Log opening
        if (persistEvents) {
          logCircuitEvent(circuitName, 'opened', previousState, 'OPEN', circuit.failures);
        }
      } else if (persistEvents) {
        // Log failure
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

// Log event to database (fire-and-forget)
async function logCircuitEvent(
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
    // Silent fail - don't break the circuit breaker for logging failures
    if (import.meta.env.DEV) {
      console.warn('[CircuitBreaker] Failed to log event:', error);
    }
  }
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
    
    // Log reset event
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
    
    // Log reset event for each
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
