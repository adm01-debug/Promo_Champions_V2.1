// Melhoria 82 - use2FA Hook
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

interface Use2FAReturn {
  enabled: boolean;
  secret: string | null;
  qrCode: string | null;
  backupCodes: string[];
  setup: () => Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  verify: (code: string) => Promise<boolean>;
  disable: () => Promise<void>;
}

export const use2FA = (): Use2FAReturn => {
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const generateBackupCodes = (): string[] => {
    return Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  };

  const setup = async () => {
    // Gerar secret
    const totp = new OTPAuth.TOTP({
      issuer: 'SalesPro',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });

    const newSecret = totp.secret.base32;
    const codes = generateBackupCodes();

    // Gerar QR Code
    const otpauthURL = totp.toString();
    const qr = await QRCode.toDataURL(otpauthURL);

    // Salvar no banco (ainda desabilitado até verificar)
    await supabase.from('user_2fa').upsert({
      user_id: user.id,
      secret: newSecret,
      backup_codes: codes,
      enabled: false,
    });

    setSecret(newSecret);
    setQrCode(qr);
    setBackupCodes(codes);

    return { secret: newSecret, qrCode: qr, backupCodes: codes };
  };

  const verify = async (code: string): Promise<boolean> => {
    if (!secret) throw new Error('2FA not set up');

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      digits: 6,
      period: 30,
    });

    const isValid = totp.validate({ token: code, window: 1 }) !== null;

    // Log tentativa
    await supabase.from('2fa_verification_attempts').insert({
      user_id: user.id,
      success: isValid,
      ip_address: /* get client IP */,
    });

    if (isValid) {
      // Habilitar 2FA
      await supabase.from('user_2fa').update({ enabled: true }).eq('user_id', user.id);
      setEnabled(true);
    }

    return isValid;
  };

  const disable = async () => {
    await supabase.from('user_2fa').update({ enabled: false }).eq('user_id', user.id);
    setEnabled(false);
  };

  return { enabled, secret, qrCode, backupCodes, setup, verify, disable };
};
