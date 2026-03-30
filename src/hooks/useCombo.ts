import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comboService, COMBO_TIERS } from "@/services/comboService";
import { useState, useCallback } from "react";

let tierUpCallback: ((tier: number) => void) | null = null;

export function setTierUpCallback(cb: ((tier: number) => void) | null) {
  tierUpCallback = cb;
}

export { COMBO_TIERS };

export function useTodayCombo(salespersonId?: string) {
  return useQuery({
    queryKey: ["combo", "today", salespersonId],
    queryFn: () => comboService.getTodayCombo(salespersonId!),
    enabled: !!salespersonId,
    refetchInterval: 30000,
  });
}

export function useRegisterComboAction(salespersonId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => comboService.registerAction(salespersonId!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["combo", "today", salespersonId] });
      if (result.tierChanged && tierUpCallback) {
        tierUpCallback(result.newTier);
      }
    },
  });
}
