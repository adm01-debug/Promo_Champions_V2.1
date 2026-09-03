import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn, type PostgrestLike } from '@/lib/supabase/chunkedIn';
import { toast } from 'sonner';

export interface InsightComment {
  id: string;
  insight_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
}

interface RawComment {
  id: string;
  insight_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

const TABLE = 'win_loss_insight_comments';

export function useInsightComments(insightId: string | null) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['wl-insight-comments', insightId],
    enabled: !!insightId,
    queryFn: async (): Promise<InsightComment[]> => {
      if (!insightId) return [];

      /* eslint-disable no-restricted-syntax */
      const { data, error } = await (
        supabase as unknown as {
          from: (t: string) => {
            select: (s: string) => {
              eq: (
                col: string,
                v: string
              ) => {
                order: (
                  col: string,
                  opts: { ascending: boolean }
                ) => Promise<{ data: RawComment[] | null; error: Error | null }>;
              };
            };
          };
        }
      )
        .from(TABLE)
        .select('id, insight_id, author_id, body, created_at')
        .eq('insight_id', insightId)
        .order('created_at', { ascending: true });
      /* eslint-enable no-restricted-syntax */

      if (error) throw error;
      const rows: RawComment[] = data ?? [];
      if (!rows.length) return [];

      const authorIds = Array.from(new Set(rows.map(r => r.author_id)));
      const people = await chunkedIn<{
        id: string | null;
        name: string | null;
        avatar_url: string | null;
      }>(
        authorIds,
        chunk =>
          supabase // eslint-disable-line no-restricted-syntax
            .from('salespeople_public')
            .select('id, name, avatar_url')
            .in('id', chunk as string[]) as unknown as PostgrestLike<{
            id: string | null;
            name: string | null;
            avatar_url: string | null;
          }>,
        { parallel: true, label: 'insight-comments.authors' }
      );
      const map = new Map(people.map(p => [p.id, p]));

      return rows.map(r => ({
        ...r,
        author_name: map.get(r.author_id)?.name ?? 'Membro do time',
        author_avatar: map.get(r.author_id)?.avatar_url ?? null,
      }));
    },
    staleTime: 15_000,
  });

  // Realtime
  useEffect(() => {
    if (!insightId) return;
    const channel = supabase
      .channel(`insight-comments-${insightId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLE,
          filter: `insight_id=eq.${insightId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['wl-insight-comments', insightId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [insightId, qc]);

  const addMutation = useMutation({
    mutationFn: async (body: string) => {
      if (!insightId) throw new Error('Sem insight selecionado');
      const trimmed = body.trim();
      if (!trimmed) throw new Error('Comentário vazio');
      if (trimmed.length > 2000) throw new Error('Comentário muito longo (máx 2000)');

      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error('Não autenticado');

      /* eslint-disable no-restricted-syntax */
      const { error } = await (
        supabase as unknown as {
          from: (t: string) => {
            insert: (row: Record<string, unknown>) => Promise<{ error: Error | null }>;
          };
        }
      )
        .from(TABLE)
        .insert({ insight_id: insightId, author_id: uid, body: trimmed });
      /* eslint-enable no-restricted-syntax */

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wl-insight-comments', insightId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erro ao publicar comentário');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      /* eslint-disable no-restricted-syntax */
      const { error } = await (
        supabase as unknown as {
          from: (t: string) => {
            delete: () => {
              eq: (col: string, v: string) => Promise<{ error: Error | null }>;
            };
          };
        }
      )
        .from(TABLE)
        .delete()
        .eq('id', commentId);
      /* eslint-enable no-restricted-syntax */
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wl-insight-comments', insightId] });
    },
  });

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    remove: deleteMutation.mutateAsync,
  };
}
