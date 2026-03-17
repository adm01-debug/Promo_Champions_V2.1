import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useVictoryFeed(limit = 20) {
  const queryClient = useQueryClient();

  const { data: feedItems, isLoading } = useQuery({
    queryKey: ['victory-feed', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('victory_feed')
        .select(`
          *,
          salespeople:salesperson_id (name, role),
          feed_reactions (id, reaction, salesperson_id),
          feed_comments (id, content, salesperson_id, created_at, salespeople:salesperson_id (name))
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('victory-feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'victory_feed' }, () => {
        queryClient.invalidateQueries({ queryKey: ['victory-feed'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const addReaction = useMutation({
    mutationFn: async ({ feedItemId, salespersonId, reaction }: { feedItemId: string; salespersonId: string; reaction: string }) => {
      // Toggle: if exists, remove; if not, add
      const { data: existing } = await supabase
        .from('feed_reactions')
        .select('id')
        .eq('feed_item_id', feedItemId)
        .eq('salesperson_id', salespersonId)
        .maybeSingle();

      if (existing) {
        await supabase.from('feed_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('feed_reactions').insert({ feed_item_id: feedItemId, salesperson_id: salespersonId, reaction });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['victory-feed'] }),
  });

  const addComment = useMutation({
    mutationFn: async ({ feedItemId, salespersonId, content }: { feedItemId: string; salespersonId: string; content: string }) => {
      const { error } = await supabase.from('feed_comments').insert({ feed_item_id: feedItemId, salesperson_id: salespersonId, content });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['victory-feed'] }),
  });

  const postVictory = useMutation({
    mutationFn: async (item: { salesperson_id: string; event_type: string; title: string; description?: string; value?: number }) => {
      const { error } = await supabase.from('victory_feed').insert(item);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['victory-feed'] }),
  });

  return { feedItems, isLoading, addReaction, addComment, postVictory };
}
