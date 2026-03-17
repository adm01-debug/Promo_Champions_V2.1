import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RateLimitSetting {
  id: string;
  action: string;
  max_requests: number;
  window_seconds: number;
  block_duration_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RateLimitLog {
  id: string;
  identifier: string;
  identifier_type: string;
  action: string;
  request_count: number;
  blocked: boolean;
  created_at: string;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

// Hook para verificar rate limit
export function useRateLimitCheck() {
  const checkRateLimit = async (
    identifier: string,
    action: string
  ): Promise<RateLimitCheckResult> => {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_action: action,
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error("Error checking rate limit:", error);
      }
      return { allowed: true, remaining: 999, reset_at: new Date().toISOString() };
    }

    const result = data?.[0];
    return {
      allowed: result?.allowed ?? true,
      remaining: result?.remaining ?? 999,
      reset_at: result?.reset_at ?? new Date().toISOString(),
    };
  };

  const logRateLimitAttempt = async (
    identifier: string,
    identifierType: "ip" | "user" | "email",
    action: string,
    blocked: boolean = false
  ) => {
    await supabase.rpc("log_rate_limit", {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_action: action,
      p_blocked: blocked,
    });
  };

  return { checkRateLimit, logRateLimitAttempt };
}

// Hook para gerenciar configurações de rate limit
export function useRateLimitSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["rate-limit-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_limit_settings")
        .select("*")
        .order("action");

      if (error) throw error;
      return data as RateLimitSetting[];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async (setting: Partial<RateLimitSetting> & { id: string }) => {
      const { data, error } = await supabase
        .from("rate_limit_settings")
        .update({
          max_requests: setting.max_requests,
          window_seconds: setting.window_seconds,
          block_duration_seconds: setting.block_duration_seconds,
          is_active: setting.is_active,
        })
        .eq("id", setting.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rate-limit-settings"] });
      toast.success("Configuração atualizada");
    },
    onError: () => {
      toast.error("Erro ao atualizar configuração");
    },
  });

  return {
    settings,
    isLoading,
    updateSetting: updateSetting.mutate,
    isUpdating: updateSetting.isPending,
  };
}

// Hook para logs de rate limit
export function useRateLimitLogs(filters?: {
  action?: string;
  blocked?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["rate-limit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("rate_limit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters?.limit ?? 100);

      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.blocked !== undefined) {
        query = query.eq("blocked", filters.blocked);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RateLimitLog[];
    },
  });
}

// Hook para estatísticas de rate limit
export function useRateLimitStats() {
  return useQuery({
    queryKey: ["rate-limit-stats"],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Logs da última hora
      const { data: lastHour, error: hourError } = await supabase
        .from("rate_limit_logs")
        .select("action, blocked")
        .gte("created_at", oneHourAgo.toISOString());

      // Logs do último dia
      const { data: lastDay, error: dayError } = await supabase
        .from("rate_limit_logs")
        .select("action, blocked")
        .gte("created_at", oneDayAgo.toISOString());

      if (hourError || dayError) {
        throw hourError || dayError;
      }

      const hourlyTotal = lastHour?.length ?? 0;
      const hourlyBlocked = lastHour?.filter((l) => l.blocked).length ?? 0;
      const dailyTotal = lastDay?.length ?? 0;
      const dailyBlocked = lastDay?.filter((l) => l.blocked).length ?? 0;

      // Agrupar por ação
      const byAction: Record<string, { total: number; blocked: number }> = {};
      lastDay?.forEach((log) => {
        if (!byAction[log.action]) {
          byAction[log.action] = { total: 0, blocked: 0 };
        }
        byAction[log.action].total++;
        if (log.blocked) byAction[log.action].blocked++;
      });

      return {
        hourly: { total: hourlyTotal, blocked: hourlyBlocked },
        daily: { total: dailyTotal, blocked: dailyBlocked },
        byAction,
      };
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
