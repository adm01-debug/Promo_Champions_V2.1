import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingKPIs {
  total_revenue: number;
  deals_count: number;
  avg_ticket: number;
  avg_discount_pct: number;
  revenue_lost: number;
  alerted_deals: number;
  alert_ratio: number;
}

export interface DiscountBucket {
  label: string;
  count: number;
  revenue: number;
}

export interface TopDiscounter {
  salesperson_id: string;
  salesperson_name: string;
  deals_count: number;
  total_revenue: number;
  avg_ticket: number;
  avg_discount_pct: number;
  revenue_lost: number;
}

export interface ProductRecommendation {
  product_name: string;
  deals_count: number;
  avg_price: number;
  median_price: number;
  win_rate: number;
  recommended_price: number;
  uplift_pct: number;
}

export type PricingHealth = "excellent" | "healthy" | "warning" | "critical";

export interface PricingIntelligenceResponse {
  days: number;
  threshold: number;
  health: PricingHealth;
  kpis: PricingKPIs;
  distribution: DiscountBucket[];
  top_discounters: TopDiscounter[];
  product_recommendations: ProductRecommendation[];
}

export function usePricingIntelligence(days: 30 | 60 | 90 = 30) {
  return useQuery<PricingIntelligenceResponse>({
    queryKey: ["pricing-intelligence", days],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("pricing-intelligence", {
        body: undefined,
        method: "GET" as never,
      } as never).catch(async () => {
        // Fallback to direct fetch with query string (functions.invoke doesn't support GET query)
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pricing-intelligence?days=${days}`;
        const resp = await fetch(url, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
        if (!resp.ok) throw new Error(`Pricing intelligence failed: ${resp.status}`);
        return { data: await resp.json(), error: null };
      });
      if (error) throw error;
      return data as PricingIntelligenceResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
}
