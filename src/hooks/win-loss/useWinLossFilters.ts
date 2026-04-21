import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_WL_FILTERS,
  filtersToParams,
  paramsToFilters,
  type WinLossFilterState,
} from "@/components/win-loss/winLossFiltersHelpers";

const DEBOUNCE_MS = 250;

export function useWinLossFilters() {
  const [sp, setSp] = useSearchParams();

  const urlFilters = useMemo<WinLossFilterState>(
    () => (sp.toString() ? paramsToFilters(sp) : DEFAULT_WL_FILTERS),
    [sp],
  );

  // Local optimistic state for instant UI feedback
  const [localFilters, setLocalFilters] = useState<WinLossFilterState>(urlFilters);

  // Sync local → URL when URL changes externally (back/forward, saved view)
  useEffect(() => {
    setLocalFilters(urlFilters);
  }, [urlFilters]);

  // Debounced URL sync
  useEffect(() => {
    const t = window.setTimeout(() => {
      const nextParams = filtersToParams(localFilters).toString();
      if (nextParams !== sp.toString()) {
        setSp(filtersToParams(localFilters), { replace: true });
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters]);

  const setFilters = useCallback((patch: Partial<WinLossFilterState>) => {
    setLocalFilters(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setLocalFilters(DEFAULT_WL_FILTERS);
    setSp(new URLSearchParams(), { replace: true });
  }, [setSp]);

  return { filters: localFilters, setFilters, reset };
}
