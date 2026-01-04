// Real-time Collaboration System
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';

export interface PresenceState {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  online_at: string;
  cursor?: { x: number; y: number };
  editing?: string; // field being edited
}

export const useCollaboration = (documentId: string) => {
  const { user } = useUser();
  const [presence, setPresence] = useState<PresenceState[]>([]);
  
  useEffect(() => {
    if (!user || !documentId) return;
    
    const channel = supabase.channel(`document:${documentId}`);
    
    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as PresenceState[];
        setPresence(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            user_name: user.email || 'Anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });
    
    return () => {
      channel.unsubscribe();
    };
  }, [user, documentId]);
  
  const updateCursor = (x: number, y: number) => {
    const channel = supabase.channel(`document:${documentId}`);
    channel.track({
      cursor: { x, y },
    });
  };
  
  const updateEditing = (field: string | null) => {
    const channel = supabase.channel(`document:${documentId}`);
    channel.track({
      editing: field,
    });
  };
  
  return {
    presence,
    updateCursor,
    updateEditing,
  };
};
