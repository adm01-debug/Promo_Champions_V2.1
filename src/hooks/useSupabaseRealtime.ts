import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export function useSupabaseRealtime<T>(
  table: string,
  event: PostgresChangeEvent = '*',
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const ch = supabase
      .channel(`${table}_${event}`)
      .on(
        'postgres_changes' as any,
        { event, schema: 'public', table },
        callback as any
      )
      .subscribe();

    setChannel(ch);

    return () => {
      supabase.removeChannel(ch);
    };
  }, [table, event, callback]);

  return channel;
}
