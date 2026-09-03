import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface MFATotpTabProps {
  totpEnabled: boolean;
  preferredMethod?: string;
  qrCodeUrl: string | null;
  onInitialize: () => Promise<unknown>;
  onVerify: (code: string) => Promise<boolean>;
  onDisable: () => void;
  onSetPreferred: (method: string) => void;
}

export const MFATotpTab = React.memo(function MFATotpTab({
  totpEnabled,
  preferredMethod,
  qrCodeUrl,
  onInitialize,
  onVerify,
  onDisable,
  onSetPreferred,
}: MFATotpTabProps) {
  const [totpCode, setTotpCode] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  // QR gerado LOCALMENTE (lib qrcode → data URI). O otpauth:// contém o
  // segredo TOTP — nunca pode sair para um serviço externo de QR.
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    setQrFailed(false);
    if (!qrCodeUrl) {
      setQrDataUrl(null);
      return undefined;
    }
    import('qrcode')
      .then(QRCode => QRCode.toDataURL(qrCodeUrl, { width: 200, margin: 1 }))
      .then(url => {
        if (mounted) setQrDataUrl(url);
      })
      .catch(() => {
        if (mounted) {
          setQrDataUrl(null);
          setQrFailed(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, [qrCodeUrl]);

  const manualSecret = qrCodeUrl ? (/[?&]secret=([A-Z2-7]+)/i.exec(qrCodeUrl)?.[1] ?? null) : null;

  const handleInit = async () => {
    setIsSettingUp(true);
    await onInitialize();
    setIsSettingUp(false);
  };

  const handleVerify = async () => {
    if (totpCode.length !== 6) {
      toast.error('Código deve ter 6 dígitos');
      return;
    }
    const success = await onVerify(totpCode);
    if (success) setTotpCode('');
  };

  if (totpEnabled) {
    return (
      <div className="space-y-4">
        <Alert className="bg-status-success/10 border-status-success/20">
          <CheckCircle2 className="h-4 w-4 text-status-success" />
          <AlertTitle>TOTP Ativo</AlertTitle>
          <AlertDescription>TOTP está ativo e configurado</AlertDescription>
        </Alert>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Método preferido</Label>
            <Switch
              checked={preferredMethod === 'totp'}
              onCheckedChange={checked => onSetPreferred(checked ? 'totp' : 'sms')}
            />
          </div>
          <Button variant="destructive" size="sm" onClick={onDisable}>
            Desativar TOTP
          </Button>
        </div>
      </div>
    );
  }

  if (qrCodeUrl) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center p-4 bg-background rounded-lg">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code TOTP" className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-muted-foreground text-center px-4">
              {qrFailed
                ? 'Não foi possível gerar o QR — use a chave manual abaixo'
                : 'Gerando QR code…'}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Escaneie o QR code com seu app autenticador (Google Authenticator, Authy, etc.)
        </p>
        {manualSecret && (
          <p className="text-xs text-muted-foreground text-center">
            Ou digite a chave manualmente:{' '}
            <code className="font-mono select-all break-all">{manualSecret}</code>
          </p>
        )}
        <div className="space-y-2">
          <Label>Digite o código de 6 dígitos</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="000000"
              value={totpCode}
              onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button onClick={handleVerify}>Verificar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">
        Use um aplicativo autenticador para gerar códigos de verificação
      </p>
      <Button onClick={handleInit} disabled={isSettingUp}>
        {isSettingUp ? 'Configurando...' : 'Configurar TOTP'}
      </Button>
    </div>
  );
});
