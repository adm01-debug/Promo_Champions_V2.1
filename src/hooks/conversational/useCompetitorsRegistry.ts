import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { chunkedIn } from '@/lib/supabase/chunkedIn';
import { toast } from 'sonner';

export interface CompetitorRegistry {
  id: string;
  owner_id: string | null;
  name: string;
  aliases: string[];
  default_battle_card_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCompetitorsRegistry() {
  return useQuery({
    queryKey: ['competitors-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitors_registry')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data as CompetitorRegistry[]) ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface CompetitorMarketIntel {
  id: string;
  name: string;
  aliases: string[];
  /** Menções em gravações de call visíveis ao usuário (RLS de competitor_mentions). */
  mentions: number;
  battleCard: { id: string; title: string; file_url: string | null } | null;
}

/**
 * Inteligência de mercado real: concorrentes ativos do registro, quantas vezes
 * foram citados nas calls (competitor_mentions) e o battle card vinculado
 * (sales_enablement_assets via default_battle_card_id).
 */
export function useCompetitorMarketIntel() {
  return useQuery({
    queryKey: ['competitor-market-intel'],
    queryFn: async (): Promise<CompetitorMarketIntel[]> => {
      const { data, error } = await supabase
        .from('competitors_registry')
        .select('id, name, aliases, default_battle_card_id')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      const competitors = data ?? [];
      if (competitors.length === 0) return [];

      const cardIds = [
        ...new Set(
          competitors
            .map(c => c.default_battle_card_id)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      const [cards, mentionCounts] = await Promise.all([
        chunkedIn(cardIds, chunk =>
          supabase
            .from('sales_enablement_assets')
            .select('id, title, file_url')
            .in('id', chunk as string[])
            .eq('is_active', true)
        ),
        Promise.all(
          competitors.map(async c => {
            const { count, error: countError } = await supabase
              .from('competitor_mentions')
              .select('id', { count: 'exact', head: true })
              .eq('competitor_id', c.id);
            if (countError) throw countError;
            return count ?? 0;
          })
        ),
      ]);
      const cardsById = new Map(cards.map(card => [card.id, card] as const));

      return competitors
        .map((c, index) => ({
          id: c.id,
          name: c.name,
          aliases: c.aliases ?? [],
          mentions: mentionCounts[index] ?? 0,
          battleCard: c.default_battle_card_id
            ? (cardsById.get(c.default_battle_card_id) ?? null)
            : null,
        }))
        .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<CompetitorRegistry> & { name: string }) => {
      const payload = {
        id: input.id,
        name: input.name,
        aliases: input.aliases ?? [],
        default_battle_card_id: input.default_battle_card_id ?? null,
        is_active: input.is_active ?? true,
      };
      const { data, error } = await supabase
        .from('competitors_registry')
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as CompetitorRegistry;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors-registry'] });
      qc.invalidateQueries({ queryKey: ['competitor-market-intel'] });
      toast.success('Competidor salvo');
    },
    onError: e => toast.error(e instanceof Error ? e.message : 'Erro ao salvar'),
  });
}

export function useDeleteCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('competitors_registry').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors-registry'] });
      qc.invalidateQueries({ queryKey: ['competitor-market-intel'] });
      toast.success('Competidor removido');
    },
    onError: e => toast.error(e instanceof Error ? e.message : 'Erro ao remover'),
  });
}
