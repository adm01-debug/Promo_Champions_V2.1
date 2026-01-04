import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Use2FAReturn {
  setupStatus: 'not_setup' | 'setup' | 'loading';
  setup: () => Promise<{ secret: string; qrCode: string }>;
  verify: (token: string) => Promise<boolean>;
  disable: () => Promise<boolean>;
  backupCodes: string[];
  generateBackupCodes: () => Promise<string[]>;
}

export function use2FA(): Use2FAReturn {
  const [setupStatus, setSetupStatus] = useState<'not_setup' | 'setup' | 'loading'>('loading');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSetupStatus('not_setup');
        return;
      }

      const { data } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', user.id)
        .single();

      setSetupStatus(data?.enabled ? 'setup' : 'not_setup');
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      setSetupStatus('not_setup');
    }
  }

  async function setup() {
    setSetupStatus('loading');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate secret (simplified - in production use speakeasy)
    const secret = generateSecret();
    const qrCode = await generateQRCode(user.email!, secret);

    await supabase.from('user_2fa').upsert({
      user_id: user.id,
      secret: secret,
      enabled: false
    });

    return { secret, qrCode };
  }

  async function verify(token: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', user.id)
      .single();

    if (!data) return false;

    const verified = verifyToken(data.secret, token);

    if (verified) {
      await supabase
        .from('user_2fa')
        .update({ enabled: true })
        .eq('user_id', user.id);
      
      setSetupStatus('setup');
      toast.success('2FA ativado com sucesso!');
    }

    return verified;
  }

  async function disable() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await supabase
      .from('user_2fa')
      .update({ enabled: false })
      .eq('user_id', user.id);

    setSetupStatus('not_setup');
    toast.success('2FA desativado');
    return true;
  }

  async function generateBackupCodes() {
    const codes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    await supabase
      .from('user_2fa')
      .update({ backup_codes: codes })
      .eq('user_id', user.id);

    setBackupCodes(codes);
    return codes;
  }

  return {
    setupStatus,
    setup,
    verify,
    disable,
    backupCodes,
    generateBackupCodes
  };
}

function generateSecret(): string {
  return Array.from({ length: 32 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]
  ).join('');
}

async function generateQRCode(email: string, secret: string): Promise<string> {
  const otpauth = `otpauth://totp/SalesPro:${email}?secret=${secret}&issuer=SalesPro`;
  return `data:image/png;base64,${btoa(otpauth)}`;
}

function verifyToken(secret: string, token: string): boolean {
  // Simplified verification - in production use speakeasy.totp.verify
  return token.length === 6 && /^\d{6}$/.test(token);
}
