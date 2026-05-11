import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export type LeadSource = 'linkedin' | 'referral' | 'inbound' | 'outbound' | 'event' | 'website' | 'paid_ads' | 'other';

export const sourceLabels: Record<LeadSource, string> = {
  linkedin: "LinkedIn",
  referral: "Indicação",
  inbound: "Inbound",
  outbound: "Outbound",
  event: "Evento",
  website: "Website",
  paid_ads: "Anúncios Pagos",
  other: "Outros",
};

export const sourceColors: Record<LeadSource, string> = {
  linkedin: "#0077B5",
  referral: "#22c55e",
  inbound: "#8b5cf6",
  outbound: "#f97316",
  event: "#ec4899",
  website: "#3b82f6",
  paid_ads: "#eab308",
  other: "#6b7280",
};

interface SourceMetrics {
  source: LeadSource;
  totalLeads: number;
  qualifiedLeads: number;
  closedDeals: number;
  totalValue: number;
  closedValue: number;
  conversionRate: number;
  avgDealSize: number;
  percentageOfTotal: number;
  roi?: number;
  costPerLead?: number;
}

interface SourceAnalysis {
  sources: SourceMetrics[];
  totalLeads: number;
  totalClosed: number;
  totalValue: number;
  bestConversionSource: LeadSource | null;
  highestValueSource: LeadSource | null;
  highestVolumeSource: LeadSource | null;
  totalInvestment?: number;
}

export function useLeadSourceAnalysis(months: number = 3) {
  return useQuery({
    queryKey: ["lead-source-analysis", months],
    queryFn: async (): Promise<SourceAnalysis> => {
      const now = new Date();
      const startDate = startOfMonth(subMonths(now, months - 1));
      const endDate = endOfMonth(now);

      const { data: sales, error } = await supabase
        .from("sales")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (error) throw error;

      const { data: configs } = await supabase
        .from("lead_source_configs")
        .select("*");

      const configMap = new Map((configs || []).map(c => [c.source_name, c]));

      // Group by source
      const sourceMap = new Map<LeadSource, any[]>();
      
      (sales || []).forEach(sale => {
        const source = (sale.source || 'other') as LeadSource;
        const existing = sourceMap.get(source) || [];
        existing.push(sale);
        sourceMap.set(source, existing);
      });

      const totalLeads = sales?.length || 0;
      const totalClosed = sales?.filter(s => s.status === "completed").length || 0;
      const totalValue = sales?.filter(s => s.status === "completed")
        .reduce((sum, s) => sum + Number(s.amount), 0) || 0;

      // Calculate metrics per source
      const sources: SourceMetrics[] = [];
      
      for (const [source, sourceSales] of sourceMap.entries()) {
        const sourceTotal = sourceSales.length;
        const qualified = sourceSales.filter(s => 
          ["qualified", "proposal", "negotiation", "completed"].includes(s.status)
        ).length;
        const closed = sourceSales.filter(s => s.status === "completed").length;
        const closedValue = sourceSales
          .filter(s => s.status === "completed")
          .reduce((sum, s) => sum + Number(s.amount), 0);
        const totalSourceValue = sourceSales.reduce((sum, s) => sum + Number(s.amount), 0);

        const config = configMap.get(source);
        const monthlyBudget = config?.monthly_budget ? Number(config.monthly_budget) : 0;
        // Simplified investment over period
        const periodInvestment = monthlyBudget * months;

        sources.push({
          source,
          totalLeads: sourceTotal,
          qualifiedLeads: qualified,
          closedDeals: closed,
          totalValue: totalSourceValue,
          closedValue,
          conversionRate: sourceTotal > 0 ? (closed / sourceTotal) * 100 : 0,
          avgDealSize: closed > 0 ? closedValue / closed : 0,
          percentageOfTotal: totalLeads > 0 ? (sourceTotal / totalLeads) * 100 : 0,
          roi: periodInvestment > 0 ? closedValue / periodInvestment : undefined,
          costPerLead: sourceTotal > 0 ? periodInvestment / sourceTotal : undefined,
        });
      }

      // Sort by closed value descending
      sources.sort((a, b) => b.closedValue - a.closedValue);

      // Find best performers
      const bestConversion = sources.reduce((best, curr) => 
        (curr.conversionRate > (best?.conversionRate || 0) && curr.totalLeads >= 3) ? curr : best
      , null as SourceMetrics | null);

      const highestValue = sources.reduce((best, curr) => 
        curr.closedValue > (best?.closedValue || 0) ? curr : best
      , null as SourceMetrics | null);

      const highestVolume = sources.reduce((best, curr) => 
        curr.totalLeads > (best?.totalLeads || 0) ? curr : best
      , null as SourceMetrics | null);

      return {
        sources,
        totalLeads,
        totalClosed,
        totalValue,
        bestConversionSource: bestConversion?.source || null,
        highestValueSource: highestValue?.source || null,
        highestVolumeSource: highestVolume?.source || null,
        totalInvestment: Array.from(configMap.values()).reduce((sum, c) => sum + Number(c.monthly_budget || 0), 0) * months
      };
    },
  });
}

export function useLeadSourceTrend() {
  return useQuery({
    queryKey: ["lead-source-trend"],
    queryFn: async () => {
      const now = new Date();
      const months: { month: string; data: Record<LeadSource, number> }[] = [];

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);

        const { data: sales } = await supabase
          .from("sales")
          .select("source, status")
          .eq("status", "completed")
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());

        const sourceCount: Record<LeadSource, number> = {
          linkedin: 0, referral: 0, inbound: 0, outbound: 0,
          event: 0, website: 0, paid_ads: 0, other: 0,
        };

        (sales || []).forEach(sale => {
          const source = (sale.source || 'other') as LeadSource;
          sourceCount[source]++;
        });

        months.push({
          month: format(monthDate, "MMM"),
          data: sourceCount,
        });
      }

      return months;
    },
  });
}
