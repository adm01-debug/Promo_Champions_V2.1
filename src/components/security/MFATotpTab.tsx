import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Smartphone, QrCode } from "lucide-react";
import { toast } from "sonner";

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
  totpEnabled, preferredMethod, qrCodeUrl,
  onInitialize, onVerify, onDisable, onSetPreferred,
}: MFATotpTabProps) {
  const [totpCode, setTotpCode] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleInit = async () => {
    setIsSettingUp(true);
    await onInitialize();
    setIsSettingUp(false);
  };

  const handleVerify = async () => {
    if (totpCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }
    const success = await onVerify(totpCode);
    if (success) setTotpCode("");
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
            <Switch checked={preferredMethod === 'totp'} onCheckedChange={(checked) => onSetPreferred(checked ? 'totp' : 'sms')} />
          </div>
          <Button variant="destructive" size="sm" onClick={onDisable}>Desativar TOTP</Button>
        </div>
      </div>
    );
  }

  if (qrCodeUrl) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`} alt="QR Code TOTP" className="w-48 h-48" />
        </div>
        <p className="text-sm text-muted-foreground text-center">Escaneie o QR code com seu app autenticador (Google Authenticator, Authy, etc.)</p>
        <div className="space-y-2">
          <Label>Digite o código de 6 dígitos</Label>
          <div className="flex gap-2">
            <Input type="text" placeholder="000000" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="text-center text-lg tracking-widest" />
            <Button onClick={handleVerify}>Verificar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">Use um aplicativo autenticador para gerar códigos de verificação</p>
      <Button onClick={handleInit} disabled={isSettingUp}>{isSettingUp ? "Configurando..." : "Configurar TOTP"}</Button>
    </div>
  );
});
