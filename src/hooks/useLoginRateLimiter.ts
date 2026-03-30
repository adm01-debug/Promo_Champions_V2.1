import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_SECONDS = 30; // 30 segundos base

interface LockoutStatus {
  isLocked: boolean;
  remainingSeconds: number;
  attempts: number;
}

interface LoginAttemptResult {
  canAttempt: boolean;
  lockoutStatus: LockoutStatus;
}

// Calcula o tempo de bloqueio com progressão exponencial
// 1ª série: 30s, 2ª: 60s, 3ª: 120s, 4ª: 240s, etc.
const calculateLockoutDuration = (failedSeries: number): number => {
  return BASE_LOCKOUT_SECONDS * Math.pow(2, failedSeries - 1);
};

export function useLoginRateLimiter() {
  const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus>({
    isLocked: false,
    remainingSeconds: 0,
    attempts: 0,
  });

  const checkLoginAttempts = useCallback(async (email: string): Promise<LoginAttemptResult> => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Buscar tentativas recentes (últimas 24 horas)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: attempts, error } = await supabase
      .from("login_attempts")
      .select("*")
      .eq("email", normalizedEmail)
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao verificar tentativas de login:", error);
      }
      return { canAttempt: true, lockoutStatus: { isLocked: false, remainingSeconds: 0, attempts: 0 } };
    }

    // Contar tentativas falhadas consecutivas recentes
    let consecutiveFailures = 0;
    let lastSuccessTime: Date | null = null;

    for (const attempt of attempts || []) {
      if (attempt.success) {
        lastSuccessTime = new Date(attempt.created_at);
        break;
      }
      consecutiveFailures++;
    }

    // Se houver menos de MAX_ATTEMPTS falhas consecutivas, permitir
    if (consecutiveFailures < MAX_ATTEMPTS) {
      const status = { isLocked: false, remainingSeconds: 0, attempts: consecutiveFailures };
      setLockoutStatus(status);
      return { canAttempt: true, lockoutStatus: status };
    }

    // Calcular quantas "séries" de bloqueio já ocorreram
    const failedSeries = Math.floor(consecutiveFailures / MAX_ATTEMPTS);
    const lockoutDuration = calculateLockoutDuration(failedSeries);

    // Verificar quando foi a última tentativa falhada
    const lastFailedAttempt = attempts?.[0];
    if (!lastFailedAttempt) {
      const status = { isLocked: false, remainingSeconds: 0, attempts: 0 };
      setLockoutStatus(status);
      return { canAttempt: true, lockoutStatus: status };
    }

    const lastAttemptTime = new Date(lastFailedAttempt.created_at);
    const lockoutEndTime = new Date(lastAttemptTime.getTime() + lockoutDuration * 1000);
    const now = new Date();

    if (now < lockoutEndTime) {
      const remainingSeconds = Math.ceil((lockoutEndTime.getTime() - now.getTime()) / 1000);
      const status = { isLocked: true, remainingSeconds, attempts: consecutiveFailures };
      setLockoutStatus(status);
      return { canAttempt: false, lockoutStatus: status };
    }

    const status = { isLocked: false, remainingSeconds: 0, attempts: consecutiveFailures };
    setLockoutStatus(status);
    return { canAttempt: true, lockoutStatus: status };
  }, []);

  const recordLoginAttempt = useCallback(async (
    email: string,
    success: boolean,
    failureReason?: string
  ): Promise<void> => {
    const normalizedEmail = email.toLowerCase().trim();

    await supabase.from("login_attempts").insert({
      email: normalizedEmail,
      success,
      failure_reason: failureReason || null,
      ip_address: null, // Seria necessário uma edge function para obter o IP real
      user_agent: navigator.userAgent,
    });

    // Atualizar status após registro
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
