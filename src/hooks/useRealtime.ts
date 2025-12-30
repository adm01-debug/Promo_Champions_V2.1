import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions<T> {
  table: string;
  schema?: string;
  event?: RealtimeEvent;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { old: T; new: T }) => void;
  onDelete?: (payload: T) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription<T extends Record<string, any>>(
  options: UseRealtimeOptions<T>
) {
  const {
    table,
    schema = 'public',
    event = '*',
    filter,
    onInsert,
    onUpdate,
    onDelete,
    enabled = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const channelName = `${table}-${Date.now()}`;
    
    const channelConfig: any = {
      event,
      schema,
      table
    };
    
    if (filter) {
      channelConfig.filter = filter;
    }
    
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes' as any,
        channelConfig,
        (payload: any) => {
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload.new as T);
              break;
            case 'UPDATE':
              onUpdate?.({ old: payload.old as T, new: payload.new as T });
              break;
            case 'DELETE':
              onDelete?.(payload.old as T);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError(new Error('Realtime channel error'));
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, schema, event, filter, onInsert, onUpdate, onDelete, enabled]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return { isConnected, error, unsubscribe };
}

// Hook for optimistic updates with realtime sync
interface UseOptimisticListOptions<T> {
  initialData: T[];
  idKey?: keyof T;
}

export function useOptimisticList<T extends Record<string, any>>({
  initialData,
  idKey = 'id' as keyof T
}: UseOptimisticListOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [pendingItems, setPendingItems] = useState<Set<string>>(new Set());

  // Sync with initial data when it changes
  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  const addOptimistic = useCallback((item: T) => {
    const id = String(item[idKey]);
    setItems(prev => [item, ...prev]);
    setPendingItems(prev => new Set(prev).add(id));
    return id;
  }, [idKey]);

  const updateOptimistic = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      String(item[idKey]) === id ? { ...item, ...updates } : item
    ));
    setPendingItems(prev => new Set(prev).add(id));
  }, [idKey]);

  const removeOptimistic = useCallback((id: string) => {
    setItems(prev => prev.filter(item => String(item[idKey]) !== id));
    setPendingItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [idKey]);

  const confirmOptimistic = useCallback((id: string) => {
    setPendingItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const revertOptimistic = useCallback((id: string, originalItem?: T) => {
    if (originalItem) {
      setItems(prev => prev.map(item =>
        String(item[idKey]) === id ? originalItem : item
      ));
    } else {
      setItems(prev => prev.filter(item => String(item[idKey]) !== id));
    }
    setPendingItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, [idKey]);

  const isPending = useCallback((id: string) => pendingItems.has(id), [pendingItems]);

  return {
    items,
    setItems,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
    confirmOptimistic,
    revertOptimistic,
    isPending,
    hasPendingItems: pendingItems.size > 0
  };
}
