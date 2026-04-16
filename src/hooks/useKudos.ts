import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Kudos {
  id: string;
  from_salesperson_id: string;
  to_salesperson_id: string;
  message: string;
  kudos_type: string;
  is_pinned: boolean;
  created_at: string;
  from_name?: string;
  from_avatar?: string | null;
  to_name?: string;
  to_avatar?: string | null;
}

const KUDOS_TYPES: Record<string, { label: string; emoji: string }> = {
  recognition: { label: 'Reconhecimento', emoji: '⭐' },
  teamwork: { label: 'Trabalho em Equipe', emoji: '🤝' },
  innovation: { label: 'Inovação', emoji: '💡' },
  closing: { label: 'Fechamento Top', emoji: '🔥' },
  mentoring: { label: 'Mentoria', emoji: '🎓' },
};

export function useKudos() {
  const queryClient = useQueryClient();

  const { data: kudos, isLoading } = useQuery({
    queryKey: ['kudos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kudos')
        .select('*, from:from_salesperson_id(name, avatar_url), to:to_salesperson_id(name, avatar_url)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data || []).map((k) => ({
        ...k,
        from_name: (k.from as Record<string, string> | null)?.name || 'Alguém',
        from_avatar: (k.from as Record<string, string> | null)?.avatar_url,
        to_name: (k.to as Record<string, string> | null)?.name || 'Alguém',
        to_avatar: (k.to as Record<string, string> | null)?.avatar_url,
      })) as Kudos[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('kudos-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kudos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['kudos'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const sendKudos = useMutation({
    mutationFn: async ({ fromId, toId, message, type = 'recognition' }: {
      fromId: string; toId: string; message: string; type?: string;
    }) => {
      const { error } = await supabase.from('kudos').insert({
        from_salesperson_id: fromId,
        to_salesperson_id: toId,
        message,
        kudos_type: type,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kudos'] }),
  });

  return { kudos: kudos || [], isLoading, sendKudos, KUDOS_TYPES };
}
