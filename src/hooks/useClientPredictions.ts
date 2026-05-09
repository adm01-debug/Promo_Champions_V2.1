import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, addDays } from 'date-fns';

export interface ClientPrediction {
  clientId: string;
  nextPurchaseDate: Date | null;
  confidence: number;
  averageIntervalDays: number;
  daysToNextPurchase: number;
  urgency: 'low' | 'medium' | 'high';
}

export const useClientPredictions = () => {
  return useQuery<Record<string, ClientPrediction>>({
    queryKey: ['client-predictions'],
    queryFn: async (): Promise<Record<string, ClientPrediction>> => {
      // 1. Get all sales to calculate intervals
      const { data: sales, error } = await supabase
        .from('sales')
        .select('client_id, created_at')
        .order('created_at', { ascending: true });

      if (error || !sales) return {};

      const clientPurchases: Record<string, Date[]> = {};
      sales.forEach(s => {
        if (s.client_id) {
          if (!clientPurchases[s.client_id]) clientPurchases[s.client_id] = [];
          clientPurchases[s.client_id].push(new Date(s.created_at));
        }
      });

      const predictions: Record<string, ClientPrediction> = {};
      const now = new Date();

      Object.entries(clientPurchases).forEach(([clientId, dates]) => {
        if (dates.length < 2) {
          predictions[clientId] = {
            clientId,
            nextPurchaseDate: null,
            confidence: 0,
            averageIntervalDays: 0,
            daysToNextPurchase: 0,
            urgency: 'low'
          };
          return;
        }

        // Calculate intervals
        const intervals: number[] = [];
        for (let i = 1; i < dates.length; i++) {
          intervals.push(differenceInDays(dates[i], dates[i-1]));
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const lastPurchase = dates[dates.length - 1];
        const nextDate = addDays(lastPurchase, Math.round(avgInterval));
        const daysToNext = differenceInDays(nextDate, now);

        let urgency: 'low' | 'medium' | 'high' = 'low';
        if (daysToNext <= 3) urgency = 'high';
        else if (daysToNext <= 7) urgency = 'medium';

        predictions[clientId] = {
          clientId,
          nextPurchaseDate: nextDate,
          confidence: Math.min(dates.length * 0.2, 0.95), // More purchases = more confidence
          averageIntervalDays: Math.round(avgInterval),
          daysToNextPurchase: daysToNext,
          urgency
        };
      });

      return predictions;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
