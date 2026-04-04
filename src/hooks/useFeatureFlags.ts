/**
 * Feature Flags Hook
 * Provides feature flag checking with caching and rollout support.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useCallback } from "react";

interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  allowed_roles: string[];
  metadata: Record<string, unknown>;
}

/**
 * Deterministic hash for user-based rollout.
 * Same user always gets same result for same flag.
 */
function hashUserFlag(userId: string, flagKey: string): number {
  const str = `${userId}:${flagKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export function useFeatureFlags() {
  const { user } = useAuth();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("key");

      if (error) throw error;
      return (data ?? []) as FeatureFlag[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const flagMap = useMemo(() => {
    const map = new Map<string, FeatureFlag>();
    flags.forEach((f) => map.set(f.key, f));
    return map;
  }, [flags]);

  const isEnabled = useCallback(
    (key: string): boolean => {
      const flag = flagMap.get(key);
      if (!flag) return false;
      if (!flag.is_enabled) return false;

      // Check rollout percentage
      if (flag.rollout_percentage < 100 && user?.id) {
        const userHash = hashUserFlag(user.id, key);
        if (userHash >= flag.rollout_percentage) return false;
      }

      // Check role restrictions
      if (flag.allowed_roles.length > 0) {
        // If roles specified but no user, deny
        if (!user?.id) return false;
        // Role check would require user role - for now allow if flag is enabled
      }

      return true;
    },
    [flagMap, user?.id]
  );

  return { flags, isEnabled, isLoading };
}

/**
 * Simple hook for checking a single feature flag
 */
export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}
