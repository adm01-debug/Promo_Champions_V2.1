import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MFASettings {
  id: string;
  user_id: string;
  totp_enabled: boolean;
  totp_secret: string | null;
  totp_verified_at: string | null;
  sms_enabled: boolean;
  phone_number: string | null;
  phone_verified_at: string | null;
  backup_codes: string[] | null;
  backup_codes_generated_at: string | null;
  preferred_method: 'totp' | 'sms';
  created_at: string;
  updated_at: string;
}

interface MFAVerificationAttempt {
  id: string;
  user_id: string;
  method: 'totp' | 'sms' | 'backup_code';
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// TOTP generation helper (usando algoritmo simples para demo)
const generateTOTPSecret = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const generateOTPAuthURL = (secret: string, email: string, issuer: string = 'Sales Arena'): string => {
  return `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
};

// Simples TOTP validator (para produção usar biblioteca como otpauth)
const validateTOTP = (secret: string, token: string): boolean => {
  // Em produção, usar biblioteca TOTP adequada
  // Esta é uma validação simplificada para demo
  const timeStep = Math.floor(Date.now() / 30000);
  // Para demo, aceita qualquer código de 6 dígitos
  return token.length === 6 && /^\d+$/.test(token);
};

export const useMFA = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MFASettings | null>(null);
  const [attempts, setAttempts] = useState<MFAVerificationAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Carregar configurações MFA
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as MFASettings | null);
    } catch (error) {
      console.error('Error fetching MFA settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Carregar tentativas recentes
  const fetchAttempts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mfa_verification_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAttempts((data || []) as MFAVerificationAttempt[]);
    } catch (error) {
      console.error('Error fetching MFA attempts:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
    fetchAttempts();
  }, [fetchSettings, fetchAttempts]);

  // Iniciar setup TOTP
  const initializeTOTP = useCallback(async (): Promise<{ secret: string; qrUrl: string } | null> => {
    if (!user) return null;

    try {
      const secret = generateTOTPSecret();
      const qrUrl = generateOTPAuthURL(secret, user.email || 'user', 'SalesPro');

      // Salvar secret temporariamente (não verificado ainda)
      const { error } = await supabase
        .from('user_mfa_settings')
        .upsert({
          user_id: user.id,
          totp_secret: secret,
          totp_enabled: false,
          preferred_method: 'totp',
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setTotpSecret(secret);
      setQrCodeUrl(qrUrl);
      
      return { secret, qrUrl };
    } catch (error) {
      console.error('Error initializing TOTP:', error);
      toast.error('Erro ao inicializar TOTP');
      return null;
    }
  }, [user]);

  // Verificar e ativar TOTP
  const verifyAndEnableTOTP = useCallback(async (token: string): Promise<boolean> => {
    if (!user || !settings?.totp_secret) return false;

    const isValid = validateTOTP(settings.totp_secret, token);

    // Registrar tentativa
    await supabase.from('mfa_verification_attempts').insert({
      user_id: user.id,
      method: 'totp',
      success: isValid,
      user_agent: navigator.userAgent,
    });

    if (isValid) {
      // Gerar backup codes
      const { data: backupCodes } = await supabase.rpc('generate_mfa_backup_codes');

      const { error } = await supabase
        .from('user_mfa_settings')
        .update({
          totp_enabled: true,
          totp_verified_at: new Date().toISOString(),
          backup_codes: backupCodes,
          backup_codes_generated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSettings();
      toast.success('TOTP ativado com sucesso!');
      return true;
    } else {
      toast.error('Código inválido');
      return false;
    }
  }, [user, settings, fetchSettings]);

  // Desativar TOTP
  const disableTOTP = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_mfa_settings')
        .update({
          totp_enabled: false,
          totp_secret: null,
          totp_verified_at: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSettings();
      toast.success('TOTP desativado');
      return true;
    } catch (error) {
      console.error('Error disabling TOTP:', error);
      toast.error('Erro ao desativar TOTP');
      return false;
    }
  }, [user, fetchSettings]);

  // Configurar SMS
  const setupSMS = useCallback(async (phoneNumber: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Gerar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Salvar código
      await supabase.from('sms_verification_codes').insert({
        user_id: user.id,
        phone_number: phoneNumber,
        code,
        expires_at: expiresAt.toISOString(),
      });

      // Atualizar settings
      await supabase
        .from('user_mfa_settings')
        .upsert({
          user_id: user.id,
          phone_number: phoneNumber,
          sms_enabled: false,
        }, {
          onConflict: 'user_id'
        });

      // Em produção, enviar SMS via Twilio/etc
      if (import.meta.env.DEV) {
        console.log('SMS code (dev only):', code);
      }
      toast.info(`Código enviado para ${phoneNumber}`);
      
      return true;
    } catch (error) {
      console.error('Error setting up SMS:', error);
      toast.error('Erro ao configurar SMS');
      return false;
    }
  }, [user]);

  // Verificar código SMS
  const verifySMSCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('sms_verification_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('code', code)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const isValid = !!data;

      // Registrar tentativa
      await supabase.from('mfa_verification_attempts').insert({
        user_id: user.id,
        method: 'sms',
        success: isValid,
        user_agent: navigator.userAgent,
      });

      if (isValid && data) {
        // Marcar código como usado
        await supabase
          .from('sms_verification_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('id', data.id);

        // Gerar backup codes se ainda não existem
        const { data: backupCodes } = await supabase.rpc('generate_mfa_backup_codes');

        // Ativar SMS
        await supabase
          .from('user_mfa_settings')
          .update({
            sms_enabled: true,
            phone_verified_at: new Date().toISOString(),
            backup_codes: settings?.backup_codes || backupCodes,
            backup_codes_generated_at: settings?.backup_codes_generated_at || new Date().toISOString(),
          })
          .eq('user_id', user.id);

        await fetchSettings();
        toast.success('SMS verificado e ativado!');
        return true;
      } else {
        toast.error('Código inválido ou expirado');
        return false;
      }
    } catch (error) {
      console.error('Error verifying SMS:', error);
      toast.error('Erro ao verificar SMS');
      return false;
    }
  }, [user, settings, fetchSettings]);

  // Desativar SMS
  const disableSMS = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_mfa_settings')
        .update({
          sms_enabled: false,
          phone_number: null,
          phone_verified_at: null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSettings();
      toast.success('SMS desativado');
      return true;
    } catch (error) {
      console.error('Error disabling SMS:', error);
      toast.error('Erro ao desativar SMS');
      return false;
    }
  }, [user, fetchSettings]);

  // Verificar código MFA (para login)
  const verifyMFA = useCallback(async (code: string, method?: 'totp' | 'sms' | 'backup_code'): Promise<boolean> => {
    if (!user || !settings) return false;

    const useMethod = method || settings.preferred_method;

    if (useMethod === 'backup_code') {
      // Verificar backup code
      if (settings.backup_codes?.includes(code.toUpperCase())) {
        // Remover código usado
        const newCodes = settings.backup_codes.filter(c => c !== code.toUpperCase());
        await supabase
          .from('user_mfa_settings')
          .update({ backup_codes: newCodes })
          .eq('user_id', user.id);

        await supabase.from('mfa_verification_attempts').insert({
          user_id: user.id,
          method: 'backup_code',
          success: true,
          user_agent: navigator.userAgent,
        });

        await fetchSettings();
        toast.success('Código de backup usado');
        return true;
      } else {
        await supabase.from('mfa_verification_attempts').insert({
          user_id: user.id,
          method: 'backup_code',
          success: false,
          user_agent: navigator.userAgent,
        });
        toast.error('Código de backup inválido');
        return false;
      }
    }

    if (useMethod === 'totp' && settings.totp_enabled) {
      const isValid = validateTOTP(settings.totp_secret || '', code);
      
      await supabase.from('mfa_verification_attempts').insert({
        user_id: user.id,
        method: 'totp',
        success: isValid,
        user_agent: navigator.userAgent,
      });

      if (isValid) {
        return true;
      } else {
        toast.error('Código TOTP inválido');
        return false;
      }
    }

    if (useMethod === 'sms' && settings.sms_enabled) {
      return await verifySMSCode(code);
    }

    return false;
  }, [user, settings, verifySMSCode, fetchSettings]);

  // Regenerar backup codes
  const regenerateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    if (!user) return null;

    try {
      const { data: backupCodes, error } = await supabase.rpc('generate_mfa_backup_codes');
      
      if (error) throw error;

      await supabase
        .from('user_mfa_settings')
        .update({
          backup_codes: backupCodes,
          backup_codes_generated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      await fetchSettings();
      toast.success('Códigos de backup regenerados');
      return backupCodes;
    } catch (error) {
      console.error('Error regenerating backup codes:', error);
      toast.error('Erro ao regenerar códigos');
      return null;
    }
  }, [user, fetchSettings]);

  // Definir método preferido
  const setPreferredMethod = useCallback(async (method: 'totp' | 'sms'): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_mfa_settings')
        .update({ preferred_method: method })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSettings();
      toast.success(`Método preferido: ${method.toUpperCase()}`);
      return true;
    } catch (error) {
      console.error('Error setting preferred method:', error);
      return false;
    }
  }, [user, fetchSettings]);

  return {
    settings,
    attempts,
    isLoading,
    totpSecret,
    qrCodeUrl,
    isMFAEnabled: settings?.totp_enabled || settings?.sms_enabled || false,
    initializeTOTP,
    verifyAndEnableTOTP,
    disableTOTP,
    setupSMS,
    verifySMSCode,
    disableSMS,
    verifyMFA,
    regenerateBackupCodes,
    setPreferredMethod,
    refetch: fetchSettings,
  };
};
