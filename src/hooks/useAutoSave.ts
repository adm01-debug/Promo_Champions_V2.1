import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: Error | null;
}

/**
 * useAutoSave - Automatically saves data after changes with debouncing
 */
export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
  });

  const debouncedData = useDebounce(data, debounceMs);
  const isFirstRender = useRef(true);
  const previousData = useRef<T | null>(null);

  const save = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, status: 'saving', error: null }));

    try {
      await onSave(dataToSave);
      setState({
        status: 'saved',
        lastSaved: new Date(),
        error: null,
      });

      // Reset to idle after showing "saved"
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'idle' }));
      }, 2000);
    } catch (error) {
      setState({
        status: 'error',
        lastSaved: state.lastSaved,
        error: error as Error,
      });
    }
  }, [enabled, onSave, state.lastSaved]);

  // Auto-save when debounced data changes
  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousData.current = debouncedData;
      return;
    }

    // Check if data actually changed
    const hasChanged = JSON.stringify(debouncedData) !== JSON.stringify(previousData.current);
    
    if (hasChanged && enabled) {
      previousData.current = debouncedData;
      save(debouncedData);
    }
  }, [debouncedData, save, enabled]);

  // Manual save
  const saveNow = useCallback(() => {
    previousData.current = data;
    save(data);
  }, [data, save]);

  return {
    ...state,
    saveNow,
    isSaving: state.status === 'saving',
    isSaved: state.status === 'saved',
    hasError: state.status === 'error',
  };
}
