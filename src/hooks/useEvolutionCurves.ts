import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

interface EvolutionPoint {
  date: string;
  [salespersonName: string]: number | string;
}

export function useEvolutionCurves(periodDays: number = 30, selectedIds: string[] = []) {
  const startDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - periodDays);
    return d.toISOString().split('T')[0];
  }, [periodDays]);

  const { data: salespeople } = useQuery({
    queryKey: ['evolution-salespeople'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespeople')
        .select('id, name')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: sales, isLoading } = useQuery({
    queryKey: ['evolution-sales', startDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('salesperson_id, amount, status, created_at')
        .gte('created_at', startDate)
        .in('status', ['won', 'closed']);
      if (error) throw error;
      return data || [];
    },
  });

  const chartData = useMemo((): EvolutionPoint[] => {
    if (!salespeople || !sales) return [];

    const filteredPeople = selectedIds.length > 0
      ? salespeople.filter(sp => selectedIds.includes(sp.id))
      : salespeople;

    // Group sales by day and salesperson
    const days = new Map<string, Record<string, number>>();

    // Generate all days in range
    const start = new Date(startDate);
    const end = new Date();
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const entry: Record<string, number> = {};
      filteredPeople.forEach(sp => { entry[sp.name] = 0; });
      days.set(key, entry);
    }

    // Accumulate revenue
    sales.forEach(sale => {
      if (!sale.salesperson_id) return;
      const sp = filteredPeople.find(s => s.id === sale.salesperson_id);
      if (!sp) return;
      const day = sale.created_at.split('T')[0];
      const entry = days.get(day);
      if (entry) {
        entry[sp.name] = (entry[sp.name] || 0) + (sale.amount || 0);
      }
    });

    // Convert to cumulative
    const cumulative: Record<string, number> = {};
    filteredPeople.forEach(sp => { cumulative[sp.name] = 0; });

    return Array.from(days.entries()).map(([date, dailyValues]) => {
      const point: EvolutionPoint = { date };
      filteredPeople.forEach(sp => {
        cumulative[sp.name] += dailyValues[sp.name] || 0;
        point[sp.name] = cumulative[sp.name];
      });
      return point;
    });
  }, [salespeople, sales, selectedIds, startDate]);

  return {
    chartData,
    salespeople: salespeople || [],
    isLoading,
  };
}
