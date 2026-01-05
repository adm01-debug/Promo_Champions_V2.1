import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { use2FA } from '@/hooks/use2FA';
import { Shield, Key, Download, Check } from 'lucide-react';

export const TwoFactorSetup = () => {
  const { status, setup, verify, disable } = use2FA();
  const [verifyToken, setVerifyToken] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleSetup = async () => {
    await setup.mutateAsync();
    setShowBackupCodes(true);
  };

  const handleVerify = async () => {
    const isValid = await verify.mutateAsync(verifyToken);
    if (isValid) {
      setVerifyToken('');
    }
  };

  if (status?.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            2FA Ativado
          </CardTitle>
          <CardDescription>
            Sua conta está protegida com autenticação de dois fatores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Check className="w-4 h-4" />
            <AlertDescription>
              Última verificação: {status.lastVerified?.toLocaleDateString()}
            </AlertDescription>
          </Alert>

          <Button
            variant="destructive"
            onClick={() => disable.mutate()}
            disabled={disable.isPending}
          >
            Desabilitar 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (setup.data && !status?.enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configure 2FA</CardTitle>
          <CardDescription>
            Escaneie o QR code com seu app autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <img src={setup.data.qrCode} alt="QR Code 2FA" className="w-64 h-64" />
          </div>

          {showBackupCodes && (
            <Alert>
              <Download className="w-4 h-4" />
              <AlertDescription>
                <p className="font-bold mb-2">Códigos de Backup:</p>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setup.data.backupCodes.map((code) => (
                    <div key={code}>{code}</div>
                  ))}
                </div>
                <p className="text-xs mt-2">
                  Guarde estes códigos em local seguro!
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Código de Verificação</label>
            <Input
              type="text"
              placeholder="000000"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={verify.isPending || verifyToken.length !== 6}
            className="w-full"
          >
            {verify.isPending ? 'Verificando...' : 'Ativar 2FA'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Autenticação de Dois Fatores
        </CardTitle>
        <CardDescription>
          Adicione uma camada extra de segurança à sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Como funciona?</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Instale um app autenticador (Google Authenticator, Authy)</li>
            <li>Escaneie o QR code gerado</li>
            <li>Digite o código de 6 dígitos para ativar</li>
          </ul>
        </div>

        <Button
          onClick={handleSetup}
          disabled={setup.isPending}
          className="w-full"
        >
          {setup.isPending ? 'Configurando...' : 'Configurar 2FA'}
        </Button>
      </CardContent>
    </Card>
  );
};
