import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useSupabaseRealtime<T>(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  callback: (payload: any) => void
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const ch = supabase
      .channel(`${table}_${event}`)
      .on('postgres_changes', { event, schema: 'public', table }, callback)
      .subscribe();

    setChannel(ch);

    return () => {
      supabase.removeChannel(ch);
    };
  }, [table, event]);

  return channel;
}
