import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_by: string | null;
  blocked_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  block_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

// Hook para IPs bloqueados
export function useBlockedIPs() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: blockedIPs, isLoading } = useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      return data as BlockedIP[];
    },
  });

  const blockIP = useMutation({
    mutationFn: async ({
      ip_address,
      reason,
      expires_at,
      is_permanent,
    }: {
      ip_address: string;
      reason: string;
      expires_at?: string;
      is_permanent?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .upsert(
          {
            ip_address,
            reason,
            blocked_by: user?.id,
            expires_at: is_permanent ? null : expires_at,
            is_permanent: is_permanent ?? false,
          },
          { onConflict: "ip_address" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast.success("IP bloqueado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao bloquear IP");
    },
  });

  const unblockIP = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blocked_ips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast.success("IP desbloqueado");
    },
    onError: () => {
      toast.error("Erro ao desbloquear IP");
    },
  });

  // Filtrar IPs ativos (não expirados)
  const activeBlockedIPs = blockedIPs?.filter((ip) => {
    if (ip.is_permanent) return true;
    if (!ip.expires_at) return true;
    return new Date(ip.expires_at) > new Date();
  });

  return {
    blockedIPs,
    activeBlockedIPs,
    isLoading,
    blockIP: blockIP.mutate,
    unblockIP: unblockIP.mutate,
    isBlocking: blockIP.isPending,
    isUnblocking: unblockIP.isPending,
  };
}

// Hook para whitelist de IPs
export function useIPWhitelist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: whitelist, isLoading } = useQuery({
    queryKey: ["ip-whitelist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_whitelist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WhitelistedIP[];
    },
  });

  const addToWhitelist = useMutation({
    mutationFn: async ({
      ip_address,
      description,
    }: {
      ip_address: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("ip_whitelist")
        .insert({
          ip_address,
          description,
          added_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast.success("IP adicionado à whitelist");
    },
    onError: () => {
      toast.error("Erro ao adicionar IP");
    },
  });

  const removeFromWhitelist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ip_whitelist").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast.success("IP removido da whitelist");
    },
    onError: () => {
      toast.error("Erro ao remover IP");
    },
  });

  return {
    whitelist,
    isLoading,
    addToWhitelist: addToWhitelist.mutate,
    removeFromWhitelist: removeFromWhitelist.mutate,
    isAdding: addToWhitelist.isPending,
    isRemoving: removeFromWhitelist.isPending,
  };
}

// Hook para verificar se um IP está bloqueado
export function useCheckIPStatus() {
  const checkIP = async (ip: string) => {
    const [{ data: isBlocked }, { data: isWhitelisted }] = await Promise.all([
      supabase.rpc("is_ip_blocked", { check_ip: ip }),
      supabase.rpc("is_ip_whitelisted", { check_ip: ip }),
    ]);

    return {
      isBlocked: isBlocked ?? false,
      isWhitelisted: isWhitelisted ?? false,
    };
  };

  return { checkIP };
}

// Hook para tentativas de login
export function useLoginAttempts(filters?: { email?: string; limit?: number }) {
  return useQuery({
    queryKey: ["login-attempts", filters],
    queryFn: async () => {
      let query = supabase
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters?.limit ?? 100);

      if (filters?.email) {
        query = query.eq("email", filters.email);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Hook para registrar tentativa de login
export function useLogLoginAttempt() {
  const logAttempt = async ({
    email,
    ip_address,
    user_agent,
    success,
    failure_reason,
  }: {
    email: string;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
    failure_reason?: string;
  }) => {
    await supabase.from("login_attempts").insert({
      email,
      ip_address,
      user_agent,
      success,
      failure_reason,
    });
  };

  return { logAttempt };
}

// Hook para estatísticas de segurança
export function useSecurityStats() {
  return useQuery({
    queryKey: ["security-stats"],
    queryFn: async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [
        { data: blockedIPs },
        { data: whitelistCount },
        { data: loginAttempts },
        { data: rateLimitLogs },
      ] = await Promise.all([
        supabase.from("blocked_ips").select("id, is_permanent, expires_at"),
        supabase.from("ip_whitelist").select("id"),
        supabase
          .from("login_attempts")
          .select("success")
          .gte("created_at", oneDayAgo.toISOString()),
        supabase
          .from("rate_limit_logs")
          .select("blocked")
          .gte("created_at", oneDayAgo.toISOString()),
      ]);

      const activeBlocked =
        blockedIPs?.filter((ip) => {
          if (ip.is_permanent) return true;
          if (!ip.expires_at) return true;
          return new Date(ip.expires_at) > now;
        }).length ?? 0;

      const failedLogins = loginAttempts?.filter((a) => !a.success).length ?? 0;
      const successLogins = loginAttempts?.filter((a) => a.success).length ?? 0;
      const blockedRequests = rateLimitLogs?.filter((l) => l.blocked).length ?? 0;

      return {
        activeBlockedIPs: activeBlocked,
        totalBlockedIPs: blockedIPs?.length ?? 0,
        whitelistedIPs: whitelistCount?.length ?? 0,
        failedLogins24h: failedLogins,
        successLogins24h: successLogins,
        blockedRequests24h: blockedRequests,
        loginSuccessRate:
          successLogins + failedLogins > 0
            ? Math.round((successLogins / (successLogins + failedLogins)) * 100)
            : 100,
      };
    },
    refetchInterval: 60000,
  });
}
