import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RaceCar {
  id: string;
  salesperson_id: string;
  car_number: number;
  primary_color: string;
  secondary_color: string;
  car_style: 'f1' | 'stock' | 'kart';
  preset_id: string | null;
  nickname: string | null;
  victory_quote: string | null;
  total_races: number;
  total_wins: number;
  total_overtakes: number;
}

export type RaceCarInput = Omit<Partial<RaceCar>, 'id' | 'salesperson_id' | 'total_races' | 'total_wins' | 'total_overtakes'>;

async function getMySalespersonId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('salespeople').select('id').eq('auth_user_id', user.id).maybeSingle();
  return data?.id ?? null;
}

export function useMyRaceCar() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['my-race-car'],
    queryFn: async (): Promise<RaceCar | null> => {
      const salespersonId = await getMySalespersonId();
      if (!salespersonId) return null;
      const { data, error } = await supabase
        .from('race_cars')
        .select('*')
        .eq('salesperson_id', salespersonId)
        .maybeSingle();
      if (error) throw error;
      return data as RaceCar | null;
    },
    staleTime: 60_000,
  });

  const upsert = useMutation({
    mutationFn: async (input: RaceCarInput & { car_number: number }) => {
      const salespersonId = await getMySalespersonId();
      if (!salespersonId) throw new Error('Vendedor não encontrado');
      const payload = { ...input, salesperson_id: salespersonId };
      const { data, error } = await supabase
        .from('race_cars')
        .upsert(payload, { onConflict: 'salesperson_id' })
        .select()
        .single();
      if (error) throw error;
      return data as RaceCar;
    },
    onSuccess: () => {
      toast.success('🏎️ Carro atualizado!');
      queryClient.invalidateQueries({ queryKey: ['my-race-car'] });
      queryClient.invalidateQueries({ queryKey: ['race-leaderboard'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao salvar carro'),
  });

  return { ...query, upsert };
}
