import { useCallback, useRef, useState } from 'react';
import {
  CircuitBreakerError,
  CircuitBreakerConfig,
  getOrCreateCircuit,
  CircuitBreakerState,
} from './circuitBreakerUtils';

// Re-export everything from utils for backward compatibility
export { CircuitBreakerError, withCircuitBreaker, getAllCircuitStates, resetCircuit, resetAllCircuits } from './circuitBreakerUtils';
export { DEFAULT_CONFIG as CIRCUIT_BREAKER_DEFAULTS } from './circuitBreakerUtils';

import { DEFAULT_CONFIG } from './circuitBreakerUtils';

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
      if (updates.state === 'OPEN') configRef.current.onOpen?.(current.failures);
      else if (updates.state === 'CLOSED') configRef.current.onClose?.();
    }
    
    forceUpdate({});
  }, [name]);

  const shouldAllowRequest = useCallback((): boolean => {
    const circuit = getState();
    if (circuit.state === 'CLOSED') return true;
    if (circuit.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - (circuit.lastFailure || 0);
      if (timeSinceLastFailure >= resetTimeout) {
        setState({ state: 'HALF_OPEN', halfOpenAttempts: 0 });
        return true;
      }
      return false;
    }
    return circuit.halfOpenAttempts < halfOpenMaxAttempts;
  }, [getState, setState, resetTimeout, halfOpenMaxAttempts]);

  const recordSuccess = useCallback(() => {
    const circuit = getState();
    if (circuit.state === 'HALF_OPEN') {
      setState({ state: 'CLOSED', failures: 0, lastFailure: null, halfOpenAttempts: 0 });
    } else if (circuit.state === 'CLOSED' && circuit.failures > 0) {
      setState({ failures: Math.max(0, circuit.failures - 1) });
    }
  }, [getState, setState]);

  const recordFailure = useCallback(() => {
    const circuit = getState();
    const newFailures = circuit.failures + 1;
    if (circuit.state === 'HALF_OPEN') {
      const newHalfOpenAttempts = circuit.halfOpenAttempts + 1;
      if (newHalfOpenAttempts >= halfOpenMaxAttempts) {
        setState({ state: 'OPEN', failures: newFailures, lastFailure: Date.now(), halfOpenAttempts: 0 });
      } else {
        setState({ failures: newFailures, halfOpenAttempts: newHalfOpenAttempts });
      }
    } else if (newFailures >= failureThreshold) {
      setState({ state: 'OPEN', failures: newFailures, lastFailure: Date.now() });
    } else {
      setState({ failures: newFailures, lastFailure: Date.now() });
    }
  }, [getState, setState, failureThreshold, halfOpenMaxAttempts]);

  const reset = useCallback(() => {
    setState({ state: 'CLOSED', failures: 0, lastFailure: null, halfOpenAttempts: 0 });
  }, [setState]);

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    if (!shouldAllowRequest()) throw new CircuitBreakerError(name);
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
