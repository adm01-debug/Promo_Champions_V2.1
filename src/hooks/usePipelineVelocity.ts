import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WON_SALE_STATUSES, LOST_SALE_STATUSES } from '@/constants';
import { winRate } from '@/lib/winRate';
import { startOfMonth, endOfMonth, differenceInHours } from 'date-fns';

export interface VelocityData {
  salespersonId: string;
  salespersonName: string;
  avgCycleDays: number;
  avgStageHours: Record<string, number>;
  dealsWon: number;
  avgDealSize: number;
  velocityScore: number; // (deals × avg size × win rate) / cycle days
  winRate: number;
  rank: number;
}

export function usePipelineVelocity() {
  // A chave inclui o usuario: RLS muda a visibilidade por sessao e o
  // QueryClient global (staleTime 10min) nao pode servir dados da sessao
  // anterior.
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pipeline-velocity', user?.id],
    queryFn: async (): Promise<VelocityData[]> => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const [spResult, stageResult, salesResult, lostSalesResult] = await Promise.all([
        supabase.from('salespeople').select('id, name').eq('is_active', true),
        supabase
          .from('deal_stage_history')
          .select('sale_id, stage, entered_at, exited_at')
          .gte('entered_at', monthStart.toISOString())
          .lte('entered_at', monthEnd.toISOString()),
        supabase
          .from('sales')
          .select('id, salesperson_id, amount, status, created_at')
          .in('status', [...WON_SALE_STATUSES])
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString()),
        supabase
          .from('sales')
          .select('id, salesperson_id, status')
          .in('status', [...LOST_SALE_STATUSES])
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString()),
      ]);

      if (spResult.error) throw spResult.error;
      if (stageResult.error) throw stageResult.error;
      if (salesResult.error) throw salesResult.error;
      if (lostSalesResult.error) throw lostSalesResult.error;

      const salespeople = spResult.data || [];
      const stageHistory = stageResult.data || [];
      const completedSales = salesResult.data || [];
      const lostSales = lostSalesResult.data || [];

      const results: VelocityData[] = salespeople.map(sp => {
        const spCompleted = completedSales.filter(s => s.salesperson_id === sp.id);
        const spLost = lostSales.filter(s => s.salesperson_id === sp.id);
        const totalRevenue = spCompleted.reduce((sum, s) => sum + Number(s.amount), 0);
        const avgDealSize =
          spCompleted.length > 0 ? totalRevenue / spCompleted.length : 0;
        // Win rate decidido: só wins e losses entram no denominador —
        // vendas abertas não são derrota (contrato de src/lib/winRate.ts).
        const rate = winRate(spCompleted.length, spLost.length) / 100;

        // Calculate avg cycle time from stage history
        const stageHoursMap: Record<string, number[]> = {};
        let totalCycleHours = 0;
        let cycleCount = 0;

        spCompleted.forEach(sale => {
          const stages = stageHistory
            .filter(sh => sh.sale_id === sale.id)
            .sort(
              (a, b) =>
                new Date(a.entered_at).getTime() - new Date(b.entered_at).getTime()
            );

          if (stages.length > 0) {
            const firstEntry = new Date(stages[0].entered_at);
            const lastExit = stages[stages.length - 1].exited_at
              ? new Date(stages[stages.length - 1].exited_at!)
              : now;
            totalCycleHours += differenceInHours(lastExit, firstEntry);
            cycleCount++;
          }

          stages.forEach(sh => {
            if (sh.exited_at) {
              const hours = differenceInHours(
                new Date(sh.exited_at),
                new Date(sh.entered_at)
              );
              if (!stageHoursMap[sh.stage]) stageHoursMap[sh.stage] = [];
              stageHoursMap[sh.stage].push(hours);
            }
          });
        });

        const avgCycleDays = cycleCount > 0 ? totalCycleHours / cycleCount / 24 : 0;
        const avgStageHours: Record<string, number> = {};
        Object.entries(stageHoursMap).forEach(([stage, hours]) => {
          avgStageHours[stage] = hours.reduce((a, b) => a + b, 0) / hours.length;
        });

        // Velocity Score = (deals × avg deal size × win rate) / max(cycle days, 1)
        const velocityScore =
          avgCycleDays > 0
            ? (spCompleted.length * avgDealSize * rate) / avgCycleDays
            : spCompleted.length * avgDealSize * rate;

        return {
          salespersonId: sp.id,
          salespersonName: sp.name,
          avgCycleDays: Math.round(avgCycleDays * 10) / 10,
          avgStageHours,
          dealsWon: spCompleted.length,
          avgDealSize: Math.round(avgDealSize),
          velocityScore: Math.round(velocityScore),
          winRate: Math.round(rate * 100),
          rank: 0,
        };
      });

      results.sort((a, b) => b.velocityScore - a.velocityScore);
      results.forEach((r, i) => (r.rank = i + 1));

      return results;
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });
}
