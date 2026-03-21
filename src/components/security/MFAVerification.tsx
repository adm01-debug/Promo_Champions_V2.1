import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMFA } from "@/hooks/useMFA";
import { useState } from "react";
import { Lock, QrCode, Phone, Key, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const MFAVerification = ({ onSuccess, onCancel }: MFAVerificationProps) => {
  const { settings, verifyMFA, isLoading } = useMFA();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'totp' | 'sms' | 'backup'>(
    (settings?.preferred_method === 'totp' || settings?.preferred_method === 'sms') 
      ? settings.preferred_method 
      : 'totp'
  );

  const handleVerify = async () => {
    if (code.length < 6) {
      toast.error("Código inválido");
      return;
    }

    setIsVerifying(true);
    
    const method = activeTab === 'backup' ? 'backup_code' : activeTab;
    const success = await verifyMFA(code, method);
    
    if (success) {
      onSuccess();
    }
    
    setIsVerifying(false);
    setCode("");
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>Verificação em Duas Etapas</CardTitle>
        <CardDescription>
          Digite o código de verificação para continuar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            {settings?.totp_enabled && (
              <TabsTrigger value="totp" className="flex items-center gap-1">
                <QrCode className="h-4 w-4" />
                App
              </TabsTrigger>
            )}
            {settings?.sms_enabled && (
              <TabsTrigger value="sms" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                SMS
              </TabsTrigger>
            )}
            <TabsTrigger value="backup" className="flex items-center gap-1">
              <Key className="h-4 w-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            <TabsContent value="totp" className="mt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Abra seu aplicativo autenticador e digite o código de 6 dígitos.
              </p>
            </TabsContent>

            <TabsContent value="sms" className="mt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Um código foi enviado para {settings?.phone_number ? 
                  `***${settings.phone_number.slice(-4)}` : 'seu telefone'}.
              </p>
            </TabsContent>

            <TabsContent value="backup" className="mt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Use um dos seus códigos de backup de 8 caracteres.
              </p>
            </TabsContent>

            <div className="space-y-2">
              <Label htmlFor="code">Código de verificação</Label>
              <Input
                id="code"
                type="text"
                placeholder={activeTab === 'backup' ? "XXXXXXXX" : "000000"}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={activeTab === 'backup' ? 8 : 6}
                className="text-center text-lg tracking-widest"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleVerify}
              disabled={isVerifying || code.length < 6}
            >
              {isVerifying ? "Verificando..." : "Verificar"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {onCancel && (
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
