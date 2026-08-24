import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RaceLeaderboardEntry } from "@/hooks/race/useRaceLeaderboard";

export interface MyRival {
  rival_car_id: string;
  rival_name: string;
  rival_avatar: string | null;
  rival_car_number: number;
  my_progress: number;
  rival_progress: number;
  gap_pct: number; // positivo = você está acima
}

/**
 * Identifica rival do usuário atual:
 * 1. Se houver rivalidade persistente salva, usa-a.
 * 2. Caso contrário, escolhe o adjacente no ranking (1 acima ou 1 abaixo, alterna por season).
 */
export function useMyRival(args: {
  seasonId?: string;
  myCarId?: string;
  entries: RaceLeaderboardEntry[];
}) {
  const { seasonId, myCarId, entries } = args;

  return useQuery({
    queryKey: ['my-rival', seasonId, myCarId, entries.length],
    queryFn: async (): Promise<MyRival | null> => {
      if (!seasonId || !myCarId || entries.length < 2) return null;

      const myIdx = entries.findIndex((e) => e.car_id === myCarId);
      if (myIdx === -1) return null;
      const me = entries[myIdx];

      // 1. Tenta rivalidade persistente
      const { data: saved } = await supabase
        .from('race_rivalries_persistent')
        .select('rival_car_id')
        .eq('season_id', seasonId)
        .eq('car_id', myCarId)
        .maybeSingle();

      let rivalId = saved?.rival_car_id as string | undefined;

      // 2. Adjacente: prioriza o de cima; se for líder, pega o abaixo.
      if (!rivalId) {
        const adj = myIdx > 0 ? entries[myIdx - 1] : entries[myIdx + 1];
        rivalId = adj?.car_id;
      }

      if (!rivalId) return null;
      const rival = entries.find((e) => e.car_id === rivalId);
      if (!rival) return null;

      const myProgress = Number(me.progress);
      const rivalProgress = Number(rival.progress);

      return {
        rival_car_id: rival.car_id,
        rival_name: rival.salesperson_name,
        rival_avatar: rival.avatar_url,
        rival_car_number: rival.car_number,
        my_progress: myProgress,
        rival_progress: rivalProgress,
        gap_pct: (myProgress - rivalProgress) * 100,
      };
    },
    enabled: !!seasonId && !!myCarId && entries.length > 1,
    staleTime: 15_000,
  });
}

export function useSetMyRival() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { season_id: string; car_id: string; rival_car_id: string }) => {
      const { error } = await supabase
        .from('race_rivalries_persistent')
        .upsert(input, { onConflict: 'season_id,car_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('⚔️ Rival definido!');
      qc.invalidateQueries({ queryKey: ['my-rival'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao definir rival'),
  });
}
