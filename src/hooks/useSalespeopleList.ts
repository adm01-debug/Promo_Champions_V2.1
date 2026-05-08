import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalespersonOption {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string | null;
}

export const useSalespeopleList = () => {
  return useQuery({
    queryKey: ["salespeople-list-active"],
    queryFn: async (): Promise<SalespersonOption[]> => {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, avatar_url, role")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SalespersonOption[];
    },
    staleTime: 10 * 60 * 1000,
  });
};
