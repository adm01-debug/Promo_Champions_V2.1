import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MFAStatus {
  totp_enabled: boolean;
  sms_enabled: boolean;
  preferred_method: string;
}

export const useMFA = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Fetch MFA status via secure RPC (no secrets exposed)
  const fetchStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_mfa_status');
      if (error) throw error;
      
      const row = Array.isArray(data) ? data[0] : data;
      setStatus(row as MFAStatus | null);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching MFA status:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Initialize TOTP via server-side RPC (secret never leaves server)
  const initializeTOTP = useCallback(async (): Promise<{ qrUrl: string } | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('initialize_totp', {
        p_email: user.email || 'user',
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      const qrUrl = row?.qr_url || '';
      setQrCodeUrl(qrUrl);
      return { qrUrl };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error initializing TOTP:', error);
      }
      toast.error('Erro ao inicializar TOTP');
      return null;
    }
  }, [user]);

  // Verify and enable TOTP via server-side RPC
  const verifyAndEnableTOTP = useCallback(async (token: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('verify_and_enable_totp', {
        p_token: token,
      });

      if (error) throw error;

      const result = data as { success: boolean; backup_codes?: string[]; error?: string };
      
      if (result.success) {
        await fetchStatus();
        toast.success('TOTP ativado com sucesso!');
        return true;
      } else {
        toast.error(result.error || 'Código inválido');
        return false;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error verifying TOTP:', error);
      }
      toast.error('Erro ao verificar TOTP');
      return false;
    }
  }, [user, fetchStatus]);

  // Disable TOTP via server-side RPC
  const disableTOTP = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('disable_totp');
      if (error) throw error;
      await fetchStatus();
      toast.success('TOTP desativado');
      return !!data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error disabling TOTP:', error);
      }
      toast.error('Erro ao desativar TOTP');
      return false;
    }
  }, [user, fetchStatus]);

  // Setup SMS via server-side RPC (code generated server-side)
  const setupSMS = useCallback(async (phoneNumber: string): Promise<boolean> => {
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
  }, [user]);

  // Verify SMS code via server-side RPC
  const verifySMSCode = useCallback(async (code: string): Promise<boolean> => {
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
  }, [user, fetchStatus]);

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
  const verifyMFA = useCallback(async (code: string, method?: 'totp' | 'sms' | 'backup_code'): Promise<boolean> => {
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
  }, [user]);

  // Regenerate backup codes via server-side RPC
  const regenerateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('regenerate_backup_codes');
      if (error) throw error;
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
  const setPreferredMethod = useCallback(async (method: 'totp' | 'sms'): Promise<boolean> => {
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
  }, [user, fetchStatus]);

  return {
    settings: status ? {
      totp_enabled: status.totp_enabled,
      sms_enabled: status.sms_enabled,
      preferred_method: status.preferred_method,
      totp_secret: null as string | null,
      backup_codes: null as string[] | null,
    } : null,
    attempts: [] as string[],
    isLoading,
    totpSecret: null as string | null,
    qrCodeUrl,
    isMFAEnabled: status?.totp_enabled || status?.sms_enabled || false,
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
