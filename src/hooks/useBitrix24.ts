import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface BitrixConnectionStatus {
  connected: boolean;
  needsReauth: boolean;
  domain: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  result?: Record<string, number>;
  error?: string;
  timestamp: string;
}

interface SyncLog {
  id: string;
  sync_type: string;
  status: string;
  companies_from_bitrix: number;
  companies_to_bitrix: number;
  deals_from_bitrix: number;
  deals_to_bitrix: number;
  error_message: string | null;
  duration_ms: number;
  triggered_by: string;
  created_at: string;
}

export function useBitrix24() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: connectionStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["bitrix24-status"],
    queryFn: async (): Promise<BitrixConnectionStatus> => {
      const { data, error } = await supabase.functions.invoke("bitrix24-oauth");
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error checking Bitrix24 status:", error);
        }
        return { connected: false, needsReauth: false, domain: "" };
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: syncLogs, isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ["bitrix24-sync-logs"],
    queryFn: async (): Promise<SyncLog[]> => {
      const { data, error } = await supabase
        .from("bitrix24_sync_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching sync logs:", error);
        }
        return [];
      }
      
      return data as SyncLog[];
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const getAuthUrl = useMutation({
    mutationFn: async (): Promise<string> => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const authUrl = `${projectUrl}/functions/v1/bitrix24-oauth?action=authorize`;
      
      const response = await fetch(authUrl);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.authUrl;
    },
  });

  const authorize = async () => {
    try {
      const authUrl = await getAuthUrl.mutateAsync();
      window.open(authUrl, "_blank", "width=600,height=700");
      
      // Poll for connection status after authorization
      const pollInterval = setInterval(async () => {
        const result = await refetchStatus();
        if (result.data?.connected) {
          clearInterval(pollInterval);
          toast.success("Bitrix24 conectado com sucesso!");
        }
      }, 3000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error getting auth URL:", error);
      }
      toast.error("Erro ao iniciar autorização");
    }
  };

  const syncMutation = useMutation({
    mutationFn: async (action?: string): Promise<SyncResult> => {
      setIsSyncing(true);
      const { data, error } = await supabase.functions.invoke("bitrix24-sync", {
        body: { action: action || "sync-all", triggered_by: "manual" },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Sincronização concluída!", {
          description: `Empresas: ${data.result?.companiesFromBitrix || 0} importadas, ${data.result?.companiesToBitrix || 0} exportadas. Deals: ${data.result?.dealsFromBitrix || 0} importados, ${data.result?.dealsToBitrix || 0} exportados.`,
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["clients"] });
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        queryClient.invalidateQueries({ queryKey: ["pipeline"] });
        queryClient.invalidateQueries({ queryKey: ["bitrix24-sync-logs"] });
      } else {
        toast.error("Erro na sincronização", { description: data.error });
      }
    },
    onError: (error) => {
      toast.error("Erro na sincronização", { description: error.message });
      queryClient.invalidateQueries({ queryKey: ["bitrix24-sync-logs"] });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  const refreshToken = useMutation({
    mutationFn: async () => {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${projectUrl}/functions/v1/bitrix24-oauth?action=refresh`);
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
    },
    onSuccess: () => {
      toast.success("Token atualizado com sucesso!");
      refetchStatus();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar token", { description: error.message });
    },
  });

  return {
    connectionStatus,
    isLoadingStatus,
    isConnected: connectionStatus?.connected || false,
    needsReauth: connectionStatus?.needsReauth || false,
    domain: connectionStatus?.domain || "",
    authorize,
    isAuthorizing: getAuthUrl.isPending,
    sync: syncMutation.mutate,
    isSyncing,
    refreshToken: refreshToken.mutate,
    isRefreshing: refreshToken.isPending,
    refetchStatus,
    syncLogs: syncLogs || [],
    isLoadingLogs,
    refetchLogs,
  };
}
