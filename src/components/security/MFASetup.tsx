import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useMFA } from "@/hooks/useMFA";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  QrCode,
  Phone,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export const MFASetup = () => {
  const {
    settings,
    isLoading,
    isMFAEnabled,
    qrCodeUrl,
    initializeTOTP,
    verifyAndEnableTOTP,
    disableTOTP,
    setupSMS,
    verifySMSCode,
    disableSMS,
    regenerateBackupCodes,
    setPreferredMethod,
  } = useMFA();

  const [totpCode, setTotpCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleInitializeTOTP = async () => {
    setIsSettingUp(true);
    await initializeTOTP();
    setIsSettingUp(false);
  };

  const handleVerifyTOTP = async () => {
    if (totpCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }
    const success = await verifyAndEnableTOTP(totpCode);
    if (success) {
      setTotpCode("");
      setShowBackupCodes(true);
    }
  };

  const handleSetupSMS = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Número de telefone inválido");
      return;
    }
    await setupSMS(phoneNumber);
  };

  const handleVerifySMS = async () => {
    if (smsCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos");
      return;
    }
    const success = await verifySMSCode(smsCode);
    if (success) {
      setSmsCode("");
      setShowBackupCodes(true);
    }
  };

  const copyBackupCodes = () => {
    if (settings?.backup_codes) {
      navigator.clipboard.writeText(settings.backup_codes.join("\n"));
      toast.success("Códigos copiados!");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Autenticação Multi-Fator (MFA)</CardTitle>
            </div>
            <Badge variant={isMFAEnabled ? "default" : "secondary"}>
              {isMFAEnabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMFAEnabled ? (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">MFA Ativo</AlertTitle>
              <AlertDescription>
                Sua conta está protegida com autenticação de dois fatores.
                {settings?.totp_enabled && " (TOTP)"}
                {settings?.sms_enabled && " (SMS)"}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertTitle className="text-yellow-500">MFA Inativo</AlertTitle>
              <AlertDescription>
                Recomendamos ativar o MFA para maior segurança.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Setup Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar MFA</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="totp">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                TOTP
              </TabsTrigger>
              <TabsTrigger value="sms" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Backup
              </TabsTrigger>
            </TabsList>

            {/* TOTP Tab */}
            <TabsContent value="totp" className="space-y-4 mt-4">
              {settings?.totp_enabled ? (
                <div className="space-y-4">
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle>TOTP Ativo</AlertTitle>
                    <AlertDescription>
                      TOTP está ativo e configurado
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Método preferido</Label>
                      <Switch 
                        checked={settings.preferred_method === 'totp'}
                        onCheckedChange={(checked) => setPreferredMethod(checked ? 'totp' : 'sms')}
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={disableTOTP}>
                      Desativar TOTP
                    </Button>
                  </div>
                </div>
              ) : qrCodeUrl ? (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                      alt="QR Code TOTP"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie o QR code com seu app autenticador (Google Authenticator, Authy, etc.)
                  </p>
                  <div className="space-y-2">
                    <Label>Digite o código de 6 dígitos</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button onClick={handleVerifyTOTP}>
                        Verificar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Use um aplicativo autenticador para gerar códigos de verificação
                  </p>
                  <Button onClick={handleInitializeTOTP} disabled={isSettingUp}>
                    {isSettingUp ? "Configurando..." : "Configurar TOTP"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* SMS Tab */}
            <TabsContent value="sms" className="space-y-4 mt-4">
              {settings?.sms_enabled ? (
                <div className="space-y-4">
                  <Alert className="bg-green-500/10 border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle>SMS Ativo</AlertTitle>
                    <AlertDescription>
                      Número: {settings.phone_number}
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label>Método preferido</Label>
                      <Switch 
                        checked={settings.preferred_method === 'sms'}
                        onCheckedChange={(checked) => setPreferredMethod(checked ? 'sms' : 'totp')}
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={disableSMS}>
                      Desativar SMS
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número de telefone</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                      <Button onClick={handleSetupSMS}>
                        Enviar código
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Código de verificação</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="000000"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-lg tracking-widest"
                      />
                      <Button onClick={handleVerifySMS}>
                        Verificar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Backup Codes Tab */}
            <TabsContent value="backup" className="space-y-4 mt-4">
              {settings?.backup_codes && settings.backup_codes.length > 0 ? (
                <div className="space-y-4">
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertTitle>Códigos de Backup</AlertTitle>
                    <AlertDescription>
                      Guarde esses códigos em um lugar seguro. Cada código só pode ser usado uma vez.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    {settings.backup_codes.map((code, i) => (
                      <div key={i} className="p-2 bg-background rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={copyBackupCodes} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                    <Button variant="outline" onClick={regenerateBackupCodes} className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerar
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Restantes: {settings.backup_codes.length} de 10 códigos
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Os códigos de backup serão gerados quando você ativar o MFA
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
