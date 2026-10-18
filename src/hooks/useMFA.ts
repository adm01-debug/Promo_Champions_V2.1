import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MFAStatus {
  totp_enabled: boolean;
  sms_enabled: boolean;
  preferred_method: string;
  migrated_to_native_mfa: boolean;
  needs_reenrollment: boolean;
}

export const useMFA = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  // Fator TOTP do MFA nativo (auth.mfa) em processo de enroll, aguardando
  // challengeAndVerify.
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [hasNativeTotp, setHasNativeTotp] = useState(false);
  // Códigos de recuperação retornados pela RPC regenerate_backup_codes — só
  // existem em memória, nesta sessão, para o usuário copiar.
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  // Identidade atual via ref: respostas atrasadas e callbacks de closures
  // antigas nunca escrevem estado de outro usuário nesta sessão.
  const userRef = useRef(user);
  userRef.current = user;
  const fetchedForUser = useRef<string | null>(null);

  // Fetch MFA status via secure RPC (no secrets exposed)
  const fetchStatus = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser) {
      // Sem usuário: limpa TODO estado sensível — códigos de recuperação e
      // status não podem sobreviver a logout/troca de sessão.
      fetchedForUser.current = null;
      setStatus(null);
      setHasNativeTotp(false);
      setBackupCodes(null);
      setQrCodeUrl(null);
      setTotpFactorId(null);
      setIsLoading(false);
      return;
    }

    const uid = currentUser.id;
    const isCurrent = () => userRef.current?.id === uid;

    if (fetchedForUser.current !== uid) {
      // Troca de usuário: zera o estado do usuário anterior antes de buscar.
      fetchedForUser.current = uid;
      setStatus(null);
      setHasNativeTotp(false);
      setBackupCodes(null);
      setQrCodeUrl(null);
      setTotpFactorId(null);
      setIsLoading(true);
    }

    try {
      const [statusRes, factorsRes] = await Promise.all([
        supabase.rpc('get_mfa_status'),
        supabase.auth.mfa.listFactors(),
      ]);
      if (statusRes.error) throw statusRes.error;

      const row = Array.isArray(statusRes.data) ? statusRes.data[0] : statusRes.data;
      if (isCurrent()) {
        setStatus(row as MFAStatus | null);
        setHasNativeTotp(
          factorsRes.data?.totp?.some(f => f.status === 'verified') ?? false
        );
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching MFA status:', error);
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [user?.id, fetchStatus]);

  // Enroll TOTP no MFA nativo do Supabase (auth.mfa). O segredo é gerado pelo
  // GoTrue e nunca é gravado em plaintext em tabela pública. Retorna a URI
  // otpauth:// para o QR ser gerado localmente pelo componente.
  const initializeTOTP = useCallback(async (): Promise<{ qrUrl: string } | null> => {
    const uid = user?.id;
    if (!uid) return null;

    try {
      // Limpa enrolls abandonados para não acumular fatores não verificados.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      for (const factor of factors?.totp ?? []) {
        if (factor.status !== 'verified') {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'App autenticador',
      });

      if (error) throw error;
      if (data.type !== 'totp') throw new Error('Tipo de fator inesperado');
      // Usuário trocou no meio do enroll: o fator pertence a outra sessão,
      // não publica QR/fator na tela atual.
      if (userRef.current?.id !== uid) return null;

      setTotpFactorId(data.id);
      setQrCodeUrl(data.totp.uri);
      return { qrUrl: data.totp.uri };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error initializing TOTP:', error);
      }
      toast.error('Erro ao inicializar TOTP');
      return null;
    }
  }, [user]);

  // Verifica o código e conclui o enroll nativo (challengeAndVerify).
  const verifyAndEnableTOTP = useCallback(
    async (token: string): Promise<boolean> => {
      const uid = user?.id;
      if (!uid) return false;

      if (!totpFactorId) {
        toast.error('Inicie a configuração novamente');
        return false;
      }

      try {
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: totpFactorId,
          code: token.replace(/\s/g, ''),
        });

        if (error) throw error;
        if (userRef.current?.id !== uid) return false;

        setTotpFactorId(null);
        setQrCodeUrl(null);
        // Marca a migração do fluxo legado para apagar o banner de re-enroll.
        await supabase
          .from('user_mfa_settings')
          .upsert(
            { user_id: uid, migrated_to_native_mfa: true },
            { onConflict: 'user_id' }
          );

        await fetchStatus();
        toast.success('TOTP ativado com sucesso!');
        return true;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying TOTP:', error);
        }
        toast.error('Código inválido');
        return false;
      }
    },
    [user, totpFactorId, fetchStatus]
  );

  // Desativa TOTP: remove os fatores nativos verificados e limpa o registro
  // legado (totp_enabled/secret) via RPC.
  const disableTOTP = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      for (const factor of factors?.totp ?? []) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw error;
      }

      const { data, error } = await supabase.rpc('disable_totp');
      if (error) throw error;
      await fetchStatus();
      toast.success('TOTP desativado');
      return !!data || hasNativeTotp;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error disabling TOTP:', error);
      }
      toast.error('Erro ao desativar TOTP');
      return false;
    }
  }, [user, fetchStatus, hasNativeTotp]);

  // Setup SMS via server-side RPC (code generated server-side)
  const setupSMS = useCallback(
    async (phoneNumber: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { data, error } = await supabase.rpc('setup_sms_mfa', {
          p_phone: phoneNumber,
        });

        if (error) throw error;
        toast.info(`Código enviado para ${phoneNumber}`);
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting up SMS:', error);
        }
        toast.error('Erro ao configurar SMS');
        return false;
      }
    },
    [user]
  );

  // Verify SMS code via server-side RPC
  const verifySMSCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { data, error } = await supabase.rpc('verify_and_enable_sms', {
          p_code: code,
        });

        if (error) throw error;

        if (data) {
          await fetchStatus();
          toast.success('SMS verificado e ativado!');
          return true;
        } else {
          toast.error('Código inválido ou expirado');
          return false;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying SMS:', error);
        }
        toast.error('Erro ao verificar SMS');
        return false;
      }
    },
    [user, fetchStatus]
  );

  // Disable SMS via server-side RPC
  const disableSMS = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('disable_sms');
      if (error) throw error;
      await fetchStatus();
      toast.success('SMS desativado');
      return !!data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error disabling SMS:', error);
      }
      toast.error('Erro ao desativar SMS');
      return false;
    }
  }, [user, fetchStatus]);

  // Verify MFA code (for login) via server-side RPC
  const verifyMFA = useCallback(
    async (code: string, method?: 'totp' | 'sms' | 'backup_code'): Promise<boolean> => {
      if (!user) return false;

      try {
        const { data, error } = await supabase.rpc('verify_mfa_code', {
          p_code: method === 'backup_code' ? code.toUpperCase() : code,
          p_method: method || undefined,
        });

        if (error) throw error;

        if (data) {
          if (method === 'backup_code') {
            toast.success('Código de backup usado');
          }
          return true;
        } else {
          toast.error('Código inválido');
          return false;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error verifying MFA:', error);
        }
        toast.error('Erro na verificação MFA');
        return false;
      }
    },
    [user]
  );

  // Regenerate backup codes via server-side RPC
  const regenerateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    const uid = user?.id;
    if (!uid) return null;

    try {
      const { data, error } = await supabase.rpc('regenerate_backup_codes');
      if (error) throw error;
      // Códigos de recuperação do usuário anterior não podem ser exibidos
      // na sessão nova.
      if (userRef.current?.id !== uid) return null;
      setBackupCodes((data as string[] | null) ?? null);
      await fetchStatus();
      toast.success('Códigos de backup regenerados');
      return data as string[];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error regenerating backup codes:', error);
      }
      toast.error('Erro ao regenerar códigos');
      return null;
    }
  }, [user, fetchStatus]);

  // Set preferred method via server-side RPC
  const setPreferredMethod = useCallback(
    async (method: 'totp' | 'sms'): Promise<boolean> => {
      if (!user) return false;

      try {
        const { data, error } = await supabase.rpc('set_mfa_preferred_method', {
          p_method: method,
        });

        if (error) throw error;
        await fetchStatus();
        toast.success(`Método preferido: ${method.toUpperCase()}`);
        return !!data;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error setting preferred method:', error);
        }
        return false;
      }
    },
    [user, fetchStatus]
  );

  // Usuário com TOTP só no fluxo legado precisa re-enrolar no nativo — o
  // login só valida fatores GoTrue (AAL2), então o legado não protege mais.
  const needsReenrollment = (status?.needs_reenrollment ?? false) && !hasNativeTotp;

  return {
    settings: status
      ? {
          totp_enabled: hasNativeTotp,
          sms_enabled: status.sms_enabled,
          preferred_method: status.preferred_method,
          totp_secret: null as string | null,
          backup_codes: backupCodes,
        }
      : null,
    attempts: [] as string[],
    isLoading,
    totpSecret: null as string | null,
    qrCodeUrl,
    isMFAEnabled: hasNativeTotp || status?.sms_enabled || false,
    needsReenrollment,
    initializeTOTP,
    verifyAndEnableTOTP,
    disableTOTP,
    setupSMS,
    verifySMSCode,
    disableSMS,
    verifyMFA,
    regenerateBackupCodes,
    setPreferredMethod,
    refetch: fetchStatus,
  };
};
