import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ICPParameters {
  id: string;
  target_industries: string[];
  min_capital: number;
  min_employees: number;
  preferred_niches: string[];
  weight_industry: number;
  weight_capital: number;
  weight_employees: number;
  weight_niche: number;
}

export function useICPConfig() {
  return useQuery({
    queryKey: ["icp-parameters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icp_parameters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ICPParameters | null;
    },
  });
}

export function useUpdateICPConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Partial<ICPParameters>) => {
      const { data: existing } = await supabase
        .from("icp_parameters")
        .select("id")
        .limit(1)
        .maybeSingle();

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from("icp_parameters")
          .update(params)
          .eq("id", existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("icp_parameters")
          .insert([params]);
        error = insertError;
      }

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["icp-parameters"] });
      queryClient.invalidateQueries({ queryKey: ["icp-data"] });
      toast.success("Parâmetros ICP atualizados com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar parâmetros");
      console.error(error);
    },
  });
}
