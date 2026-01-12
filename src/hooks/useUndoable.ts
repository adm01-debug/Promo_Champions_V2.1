import { useState, useCallback, useRef } from 'react';

interface UndoableAction<T> {
  id: string;
  description: string;
  execute: () => Promise<T> | T;
  undo: () => Promise<void> | void;
  timestamp: number;
}

interface UseUndoableOptions {
  maxHistory?: number;
  undoTimeout?: number; // Time in ms before action becomes permanent
}

/**
 * useUndoable - Hook for managing undoable actions
 * Provides undo/redo functionality with timeout-based permanent commits
 */
export function useUndoable<T = void>(options: UseUndoableOptions = {}) {
  const { maxHistory = 10, undoTimeout = 5000 } = options;
  
  const [history, setHistory] = useState<UndoableAction<T>[]>([]);
  const [pendingAction, setPendingAction] = useState<UndoableAction<T> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Execute an action with undo capability
  const execute = useCallback(async (
    description: string,
    executeFn: () => Promise<T> | T,
    undoFn: () => Promise<void> | void
  ): Promise<T> => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If there's a pending action, commit it to history
    if (pendingAction) {
      setHistory(prev => [pendingAction, ...prev].slice(0, maxHistory));
    }

    const action: UndoableAction<T> = {
      id: crypto.randomUUID(),
      description,
      execute: executeFn,
      undo: undoFn,
      timestamp: Date.now(),
    };

    // Execute the action
    const result = await executeFn();

    // Set as pending (can be undone)
    setPendingAction(action);

    // Start timeout for permanent commit
    timeoutRef.current = setTimeout(() => {
      setHistory(prev => [action, ...prev].slice(0, maxHistory));
      setPendingAction(null);
    }, undoTimeout);

    return result;
  }, [pendingAction, maxHistory, undoTimeout]);

  // Undo the pending action
  const undo = useCallback(async () => {
    if (!pendingAction) return false;

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await pendingAction.undo();
      setPendingAction(null);
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Undo failed:', error);
      }
      return false;
    }
  }, [pendingAction]);

  // Cancel pending action timeout (make permanent immediately)
  const commit = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (pendingAction) {
      setHistory(prev => [pendingAction, ...prev].slice(0, maxHistory));
      setPendingAction(null);
    }
  }, [pendingAction, maxHistory]);

  // Clear all history
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHistory([]);
    setPendingAction(null);
  }, []);

  return {
    execute,
    undo,
    commit,
    clear,
    canUndo: !!pendingAction,
    pendingAction,
    history,
    remainingTime: pendingAction 
      ? Math.max(0, undoTimeout - (Date.now() - pendingAction.timestamp)) 
      : 0,
  };
}
