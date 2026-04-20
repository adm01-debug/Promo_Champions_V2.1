import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_WL_FILTERS,
  filtersToParams,
  paramsToFilters,
  type WinLossFilterState,
} from "@/components/win-loss/winLossFiltersHelpers";

export function useWinLossFilters() {
  const [sp, setSp] = useSearchParams();

  const filters = useMemo<WinLossFilterState>(
    () => (sp.toString() ? paramsToFilters(sp) : DEFAULT_WL_FILTERS),
    [sp],
  );

  const setFilters = useCallback(
    (patch: Partial<WinLossFilterState>) => {
      const next = { ...filters, ...patch };
      setSp(filtersToParams(next), { replace: true });
    },
    [filters, setSp],
  );

  const reset = useCallback(() => setSp(new URLSearchParams(), { replace: true }), [setSp]);

  return { filters, setFilters, reset };
}
