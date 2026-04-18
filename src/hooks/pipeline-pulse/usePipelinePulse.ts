import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PulsePayload } from "@/components/pipeline-pulse/pulseHelpers";

export function usePipelinePulse() {
  return useQuery({
    queryKey: ["pipeline-pulse"],
    queryFn: async (): Promise<PulsePayload> => {
      const { data, error } = await supabase.functions.invoke("pipeline-pulse-aggregator", { body: {} });
      if (error) throw error;
      return data as PulsePayload;
    },
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}
