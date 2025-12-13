import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DealProbability {
  probability: number;
  factors: string[];
}

export const useDealProbabilities = (dealIds: string[]) => {
  return useQuery({
    queryKey: ["deal-probabilities", dealIds],
    queryFn: async () => {
      if (dealIds.length === 0) return {};

      const { data, error } = await supabase.functions.invoke("deal-probability", {
        body: { dealIds },
      });

      if (error) {
        console.error("Error fetching deal probabilities:", error);
        throw error;
      }

      return data.probabilities as Record<string, DealProbability>;
    },
    enabled: dealIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
