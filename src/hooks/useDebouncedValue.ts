import { useEffect, useState } from "react";

/**
 * Returns `value` after it has been stable for `delayMs`.
 *
 * Useful for coalescing rapid prop/state changes (e.g. filter toggles) before
 * triggering expensive downstream work like recomputing a regression or
 * remounting a chart. The first render returns the initial `value` synchronously,
 * so consumers don't see an undefined/empty intermediate state.
 */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
