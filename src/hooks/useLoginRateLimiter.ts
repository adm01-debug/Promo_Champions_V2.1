import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_ATTEMPTS = 5;

interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attempts: number;
}

interface LoginAttemptResult {
  canAttempt: boolean;
  lockoutStatus: LockoutStatus;
}

export function useLoginRateLimiter() {
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>({
    isLocked: false,
    remainingSeconds: 0,
    attempts: 0,
  });

  const checkLoginAttempts = useCallback(async (email: string): Promise<LoginAttemptResult> => {
    const normalizedEmail = email.toLowerCase().trim();

    const { data, error } = await supabase.rpc("get_login_lockout_status", {
      p_email: normalizedEmail,
    });

    if (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao verificar tentativas de login:", error);
      }
      return { canAttempt: true, lockoutStatus: { isLocked: false, remainingSeconds: 0, attempts: 0 } };
    }

    const row = data?.[0];
    const attempts = row?.attempts ?? 0;
    const lockoutEnd = row?.lockout_until ? Date.parse(row.lockout_until) : Number.NaN;
    const remainingSeconds = Number.isFinite(lockoutEnd)
      ? Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000))
      : 0;
    const status = {
      isLocked: remainingSeconds > 0,
      remainingSeconds,
      attempts,
    };
    setLockoutStatus(status);
    return { canAttempt: !status.isLocked, lockoutStatus: status };
  }, []);

  const recordLoginAttempt = useCallback(async (
    email: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> => {
    const normalizedEmail = email.toLowerCase().trim();

    const { error } = success
      ? await supabase.rpc("record_successful_login_attempt", {
          p_user_agent: navigator.userAgent,
        })
      : await supabase.rpc("record_failed_login_attempt", {
          p_email: normalizedEmail,
          p_failure_reason: failureReason || null,
          p_user_agent: navigator.userAgent,
        });

    if (error && import.meta.env.DEV) {
      console.error("Erro ao registrar tentativa de login:", error);
    }

    if (!success) {
      await checkLoginAttempts(normalizedEmail);
    } else {
      setLockoutStatus({ isLocked: false, remainingSeconds: 0, attempts: 0 });
    }
  }, [checkLoginAttempts]);

  const formatRemainingTime = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }, []);

  return {
    lockoutStatus,
    checkLoginAttempts,
    recordLoginAttempt,
    formatRemainingTime,
    MAX_ATTEMPTS,
  };
}
