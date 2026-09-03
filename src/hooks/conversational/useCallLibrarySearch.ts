import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export interface CallLibraryResult {
  id: string;
  title: string;
  recorded_at: string;
  duration_seconds: number;
  salesperson_id: string;
  status: string;
  rank: number;
  snippet: string;
}

export function useSearchCallLibrary(query: string, limit = 20) {
  const debounced = useDebouncedValue(query, 350);
  return useQuery({
    queryKey: ["call-library-search", debounced, limit],
    queryFn: async (): Promise<CallLibraryResult[]> => {
      if (!debounced.trim()) return [];
      const { data, error } = await supabase.rpc("search_call_library", {
        _query: debounced,
        _limit: limit,
      });
      if (error) throw error;
      return (data as CallLibraryResult[]) ?? [];
    },
    enabled: debounced.trim().length > 1,
    staleTime: 60_000,
  });
}
