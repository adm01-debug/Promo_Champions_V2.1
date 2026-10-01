import { useQuery } from "@tanstack/react-query";
import { comboService, COMBO_TIERS } from "@/services/comboService";

export { COMBO_TIERS };

export function useTodayCombo(salespersonId?: string) {
  return useQuery({
    queryKey: ["combo", "today", salespersonId],
    queryFn: () => comboService.getTodayCombo(salespersonId!),
    enabled: !!salespersonId,
    refetchInterval: 30000,
  });
}

