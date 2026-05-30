import { useEffect, useRef, useCallback } from 'react';

export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback((): AbortSignal => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller.signal;
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { getSignal };
}

export function useMountedRef() {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
}
