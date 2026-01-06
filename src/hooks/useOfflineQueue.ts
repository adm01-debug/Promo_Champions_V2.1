import { useState, useCallback, useEffect } from 'react';

export interface QueuedAction<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineQueueOptions {
  storageKey?: string;
  maxRetries?: number;
  onProcess?: (action: QueuedAction) => Promise<void>;
  onError?: (action: QueuedAction, error: Error) => void;
  onSuccess?: (action: QueuedAction) => void;
}

const STORAGE_KEY = 'offline_action_queue';

export function useOfflineQueue<T = unknown>(options: OfflineQueueOptions = {}) {
  const {
    storageKey = STORAGE_KEY,
    maxRetries = 3,
    onProcess,
    onError,
    onSuccess,
  } = options;

  const [queue, setQueue] = useState<QueuedAction<T>[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Persist queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }, [queue, storageKey]);

  const addToQueue = useCallback((type: string, payload: T): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const action: QueuedAction<T> = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
    };

    setQueue(prev => [...prev, action]);
    return id;
  }, [maxRetries]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(action => action.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing || queue.length === 0 || !onProcess) return;

    setIsProcessing(true);

    const processableQueue = [...queue];
    const failedActions: QueuedAction<T>[] = [];

    for (const action of processableQueue) {
      try {
        await onProcess(action as QueuedAction);
        onSuccess?.(action as QueuedAction);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        
        if (action.retryCount < action.maxRetries) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1,
          });
        } else {
          onError?.(action as QueuedAction, err);
        }
      }
    }

    setQueue(failedActions);
    setIsProcessing(false);
  }, [isProcessing, queue, onProcess, onSuccess, onError]);

  // Auto-process when online
  useEffect(() => {
    const handleOnline = () => {
      if (queue.length > 0) {
        processQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queue.length, processQueue]);

  return {
    queue,
    isProcessing,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
    queueSize: queue.length,
    hasQueuedActions: queue.length > 0,
  };
}

// Specific queue for mutations
export function useMutationQueue() {
  const queue = useOfflineQueue<{
    table: string;
    operation: 'insert' | 'update' | 'delete';
    data: Record<string, unknown>;
  }>({
    storageKey: 'mutation_queue',
    maxRetries: 5,
  });

  const queueInsert = useCallback((table: string, data: Record<string, unknown>) => {
    return queue.addToQueue('mutation', { table, operation: 'insert', data });
  }, [queue]);

  const queueUpdate = useCallback((table: string, data: Record<string, unknown>) => {
    return queue.addToQueue('mutation', { table, operation: 'update', data });
  }, [queue]);

  const queueDelete = useCallback((table: string, data: Record<string, unknown>) => {
    return queue.addToQueue('mutation', { table, operation: 'delete', data });
  }, [queue]);

  return {
    ...queue,
    queueInsert,
    queueUpdate,
    queueDelete,
  };
}
