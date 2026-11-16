import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  // Erro da consulta de lockout — o fluxo é fail-open (canAttempt: true),
  // mas a UI pode avisar que a proteção está degradada.
  const [queryError, setQueryError] = useState<unknown>(null);
  // A consulta é disparada a cada mudança de e-mail; uma resposta atrasada
  // do e-mail anterior não pode sobrescrever o status do e-mail atual.
  const lastQueriedEmail = useRef<string | null>(null);
  // Contador de geração: cobre também A→B→A (duas consultas do MESMO
  // e-mail — a resposta tardia da primeira não pode sobrescrever a segunda).
  const querySeq = useRef(0);

  const checkLoginAttempts = useCallback(
    async (email: string): Promise<LoginAttemptResult> => {
      const normalizedEmail = email.toLowerCase().trim();
      lastQueriedEmail.current = normalizedEmail;
      const seq = ++querySeq.current;
      const isLatest = () =>
        seq === querySeq.current && lastQueriedEmail.current === normalizedEmail;

      const { data, error } = await supabase.rpc('get_login_lockout_status', {
        p_email: normalizedEmail,
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Erro ao verificar tentativas de login:', error);
        }
        // Falha aberta (canAttempt) e estado limpo na tela — manter o
        // lockout do e-mail anterior seria enganoso. Falha aberta é
        // decisão deliberada: fail-closed bloquearia todo login quando a
        // RPC cai. O chamador pode ler queryError para avisar a UI.
        if (isLatest()) {
          setQueryError(error);
          setLockoutStatus({ isLocked: false, remainingSeconds: 0, attempts: 0 });
        }
        return {
          canAttempt: true,
          lockoutStatus: { isLocked: false, remainingSeconds: 0, attempts: 0 },
        };
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
      if (isLatest()) {
        setQueryError(null);
        setLockoutStatus(status);
      }
      return { canAttempt: !status.isLocked, lockoutStatus: status };
    },
    []
  );

  const recordLoginAttempt = useCallback(
    async (email: string, success: boolean, failureReason?: string): Promise<void> => {
      const normalizedEmail = email.toLowerCase().trim();

      const { error } = success
        ? await supabase.rpc('record_successful_login_attempt', {
            p_user_agent: navigator.userAgent,
          })
        : await supabase.rpc('record_failed_login_attempt', {
            p_email: normalizedEmail,
            p_failure_reason: failureReason || undefined,
            p_user_agent: navigator.userAgent,
          });

      if (error && import.meta.env.DEV) {
        console.error('Erro ao registrar tentativa de login:', error);
      }

      // Se o usuario ja trocou o e-mail no campo, esta resposta tardia nao
      // pode deslocar o marcador nem limpar o lockout do e-mail atual.
      // lastQueriedEmail null = nenhuma consulta ainda — pode refrescar.
      if (
        lastQueriedEmail.current !== null &&
        lastQueriedEmail.current !== normalizedEmail
      )
        return;

      if (!success) {
        await checkLoginAttempts(normalizedEmail);
      } else {
        setLockoutStatus({ isLocked: false, remainingSeconds: 0, attempts: 0 });
      }
    },
    [checkLoginAttempts]
  );

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
    queryError,
    checkLoginAttempts,
    recordLoginAttempt,
    formatRemainingTime,
    MAX_ATTEMPTS,
  };
}
