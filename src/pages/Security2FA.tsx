import { use2FA } from '@/hooks/use2FA';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

export function Security2FA() {
  const { setupStatus, setup, verify, disable, backupCodes, generateBackupCodes } = use2FA();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');

  async function handleSetup() {
    setStep('setup');
    const data = await setup();
    setQrCode(data.qrCode);
    setSecret(data.secret);
  }

  async function handleVerify() {
    const success = await verify(verificationCode);
    if (success) {
      setStep('initial');
      await generateBackupCodes();
    } else {
      toast.error('Código inválido');
    }
  }

  if (setupStatus === 'loading') {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Autenticação de Dois Fatores</h1>

      {setupStatus === 'not_setup' && step === 'initial' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">2FA não configurado</h2>
          <p className="text-gray-600 mb-4">
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta.
          </p>
          <Button onClick={handleSetup}>Configurar 2FA</Button>
        </Card>
      )}

      {step === 'setup' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Passo 1: Escanear QR Code</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-4 rounded">
              <span className="text-gray-400">QR Code</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Ou digite o código manualmente:</p>
            <code className="bg-gray-100 px-4 py-2 rounded">{secret}</code>
          </div>
          <Button onClick={() => setStep('verify')} className="w-full">
            Próximo
          </Button>
        </Card>
      )}

      {step === 'verify' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Passo 2: Verificar Código</h2>
          <p className="text-gray-600 mb-4">
            Digite o código de 6 dígitos do seu app autenticador:
          </p>
          <Input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button onClick={() => setStep('setup')} variant="outline">
              Voltar
            </Button>
            <Button onClick={handleVerify} className="flex-1">
              Verificar e Ativar
            </Button>
          </div>
        </Card>
      )}

      {setupStatus === 'setup' && step === 'initial' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">✅ 2FA Ativo</h2>
          <p className="text-gray-600 mb-4">
            Sua conta está protegida com autenticação de dois fatores.
          </p>

          {backupCodes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Códigos de Backup</h3>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded">
                {backupCodes.map((code, i) => (
                  <code key={i} className="text-sm">{code}</code>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Guarde estes códigos em um lugar seguro.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={generateBackupCodes} variant="outline">
              Gerar Novos Códigos
            </Button>
            <Button onClick={disable} variant="destructive">
              Desativar 2FA
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
