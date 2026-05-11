import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ICPData {
  id: string;
  client_id: string;
  bitrix_id: string | null;
  ramo_atividade: string | null;
  grupo_nicho: string | null;
  capital_social: number | null;
  num_colaboradores: number | null;
  is_icp_match: boolean | null;
  icp_score: number | null;
}

interface ICPDataWithClient extends ICPData {
  clients?: {
    name: string;
  } | null;
}

export function useICPData() {
  return useQuery({
    queryKey: ["icp-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icp_data")
        .select("*");

      if (error) throw error;
      return data as ICPData[];
    },
    staleTime: 60000,
  });
}

export function useICPDataByClientId(clientId: string | undefined) {
  return useQuery({
    queryKey: ["icp-data", clientId],
    queryFn: async () => {
      if (!clientId) return null;

      const { data, error } = await supabase
        .from("icp_data")
        .select("*")
        .eq("client_id", clientId)
        .maybeSingle();

      if (error) throw error;
      return data as ICPData | null;
    },
    enabled: !!clientId,
  });
}

export function useICPDataMap() {
  const { data: icpData, isLoading } = useICPData();

  const icpMap = new Map<string, ICPData>();
  icpData?.forEach((icp) => {
    icpMap.set(icp.client_id, icp);
  });

  return { icpMap, isLoading };
}

// Get ICP status by client name (for pipeline deals)
export function useICPByClientName() {
  return useQuery({
    queryKey: ["icp-by-client-name"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icp_data")
        .select(`
          *,
          clients(name)
        `);

      if (error) throw error;

      const nameMap = new Map<string, ICPData>();
      data?.forEach((item: ICPDataWithClient) => {
        if (item.clients?.name) {
          nameMap.set(item.clients.name.toLowerCase(), item);
        }
      });

      return nameMap;
    },
    staleTime: 60000,
  });
}

// Update ICP data
export function useUpdateICPData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      id: string;
      ramo_atividade?: string | null;
      grupo_nicho?: string | null;
      capital_social?: number | null;
      num_colaboradores?: number | null;
      is_icp_match?: boolean;
    }) => {
      const { id, ...data } = updates;
      const { error } = await supabase
        .from("icp_data")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["icp-data"] });
      queryClient.invalidateQueries({ queryKey: ["icp-by-client-name"] });
      toast.success("Dados ICP atualizados com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar dados ICP");
      if (import.meta.env.DEV) {
        if (import.meta.env.DEV) console.error("Error updating ICP data:", error);
      }
    },
  });
}
