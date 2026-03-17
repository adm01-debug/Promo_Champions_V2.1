import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface ChatMessage {
  id: string;
  salesperson_id: string;
  message: string;
  message_type: string;
  target_salesperson_id: string | null;
  matchup_id: string | null;
  reactions: Record<string, string[]>;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string | null;
}

export function useCompetitiveChat() {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['competitive-chat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitive_chat_messages')
        .select('*, sender:salesperson_id(name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map((m: any) => ({
        ...m,
        sender_name: m.sender?.name || 'Anônimo',
        sender_avatar: m.sender?.avatar_url,
        reactions: m.reactions || {},
      })).reverse() as ChatMessage[];
    },
    refetchInterval: 15000,
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('competitive-chat-rt')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'competitive_chat_messages',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['competitive-chat'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ salespersonId, message, type = 'chat', targetId, matchupId }: {
      salespersonId: string;
      message: string;
      type?: string;
      targetId?: string;
      matchupId?: string;
    }) => {
      const { error } = await supabase
        .from('competitive_chat_messages')
        .insert({
          salesperson_id: salespersonId,
          message,
          message_type: type,
          target_salesperson_id: targetId || null,
          matchup_id: matchupId || null,
        });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitive-chat'] }),
  });

  const addReaction = useMutation({
    mutationFn: async ({ messageId, salespersonId, emoji }: {
      messageId: string;
      salespersonId: string;
      emoji: string;
    }) => {
      // Get current reactions
      const { data: msg } = await supabase
        .from('competitive_chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();
      
      const reactions = (msg?.reactions as Record<string, string[]>) || {};
      if (!reactions[emoji]) reactions[emoji] = [];
      
      const idx = reactions[emoji].indexOf(salespersonId);
      if (idx >= 0) {
        reactions[emoji].splice(idx, 1);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji].push(salespersonId);
      }

      const { error } = await supabase
        .from('competitive_chat_messages')
        .update({ reactions })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['competitive-chat'] }),
  });

  return { messages: messages || [], isLoading, sendMessage, addReaction };
}
