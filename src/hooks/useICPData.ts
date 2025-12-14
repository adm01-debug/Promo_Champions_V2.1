import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ICPData {
  id: string;
  client_id: string;
  bitrix_id: string | null;
  ramo_atividade: string | null;
  grupo_nicho: string | null;
  capital_social: number | null;
  num_colaboradores: number | null;
  is_icp_match: boolean;
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
        .single();

      if (error && error.code !== "PGRST116") throw error;
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
          client:clients(name)
        `);

      if (error) throw error;

      const nameMap = new Map<string, ICPData>();
      data?.forEach((item: any) => {
        if (item.client?.name) {
          nameMap.set(item.client.name.toLowerCase(), item);
        }
      });

      return nameMap;
    },
    staleTime: 60000,
  });
}
