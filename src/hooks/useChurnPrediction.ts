import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';

interface ChurnRisk {
  clientName: string;
  lastPurchase: string;
  daysSinceLastPurchase: number;
  totalPurchases: number;
  totalRevenue: number;
  avgPurchaseInterval: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
}

interface ChurnAnalysis {
  atRisk: ChurnRisk[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    potentialRevenueLoss: number;
  };
}

export function useChurnPrediction() {
  return useQuery({
    queryKey: ['churn-prediction'],
    queryFn: async (): Promise<ChurnAnalysis> => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group sales by client
      const clientData = new Map<string, { 
        purchases: Date[];
        totalRevenue: number;
      }>();

      sales?.forEach(sale => {
        const existing = clientData.get(sale.client_name) || { 
          purchases: [],
          totalRevenue: 0,
        };
        clientData.set(sale.client_name, {
          purchases: [...existing.purchases, new Date(sale.created_at)],
          totalRevenue: existing.totalRevenue + Number(sale.amount),
        });
      });

      const today = new Date();
      const churnRisks: ChurnRisk[] = [];

      clientData.forEach((data, clientName) => {
        const sortedPurchases = data.purchases.sort((a, b) => a.getTime() - b.getTime());
        const lastPurchase = sortedPurchases[sortedPurchases.length - 1];
        const daysSinceLastPurchase = differenceInDays(today, lastPurchase);

        // Calculate average interval between purchases
        let avgInterval = 30; // default
        if (sortedPurchases.length > 1) {
          const intervals = [];
          for (let i = 1; i < sortedPurchases.length; i++) {
            intervals.push(differenceInDays(sortedPurchases[i], sortedPurchases[i - 1]));
          }
          avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        }

        // Calculate risk score (0-100)
        const intervalRatio = avgInterval > 0 ? daysSinceLastPurchase / avgInterval : 1;
        let riskScore = Math.min(100, Math.round(intervalRatio * 25));

        // Adjust based on purchase frequency
        if (data.purchases.length < 2) riskScore += 20;
        if (daysSinceLastPurchase > 90) riskScore += 15;
        if (daysSinceLastPurchase > 180) riskScore += 25;

        riskScore = Math.min(100, riskScore);

        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (riskScore >= 80) riskLevel = 'critical';
        else if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';

        churnRisks.push({
          clientName,
          lastPurchase: lastPurchase.toISOString(),
          daysSinceLastPurchase,
          totalPurchases: data.purchases.length,
          totalRevenue: data.totalRevenue,
          avgPurchaseInterval: Math.round(avgInterval),
          riskLevel,
          riskScore,
        });
      });

      // Sort by risk score descending
      churnRisks.sort((a, b) => b.riskScore - a.riskScore);

      const summary = {
        critical: churnRisks.filter(c => c.riskLevel === 'critical').length,
        high: churnRisks.filter(c => c.riskLevel === 'high').length,
        medium: churnRisks.filter(c => c.riskLevel === 'medium').length,
        low: churnRisks.filter(c => c.riskLevel === 'low').length,
        potentialRevenueLoss: churnRisks
          .filter(c => c.riskLevel === 'critical' || c.riskLevel === 'high')
          .reduce((sum, c) => sum + c.totalRevenue, 0),
      };

      return {
        atRisk: churnRisks,
        summary,
      };
    },
  });
}
