import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        blockedIPs?.filter((ip: any) => {
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
