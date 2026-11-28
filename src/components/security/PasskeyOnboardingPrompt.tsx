import { useEffect, useState } from 'react';
import { Fingerprint, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { useAuth } from '@/contexts/AuthContext';

const DISMISS_KEY = 'champions.passkey-onboarding-dismissed';
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readDismissed(userId: string): boolean {
  try {
    const raw = localStorage.getItem(`${DISMISS_KEY}:${userId}`);
    if (!raw) return false;
    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) return false;
    return Date.now() - timestamp < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

interface PasskeyOnboardingPromptProps {
  /** Esconde o convite depois que o usuário cria a primeira passkey. */
  className?: string;
}

/**
 * Convite para criar a primeira passkey, exibido só depois do login e apenas
 * quando o usuário ainda não tem nenhuma credencial. O login em si continua
 * obrigatório por senha; a passkey é um atalho e um fator a mais.
 */
export function PasskeyOnboardingPrompt({ className }: PasskeyOnboardingPromptProps) {
  const { user } = useAuth();
  const {
    isSupported,
    isAvailable,
    isLoading,
    loadError,
    credentials,
    loadCredentials,
    registerPasskey,
  } = useWebAuthn();
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user?.id || !isSupported || !isAvailable) return;
    setDismissed(readDismissed(user.id));
    void loadCredentials().finally(() => setReady(true));
  }, [user?.id, isSupported, isAvailable, loadCredentials]);

  const dismiss = () => {
    if (user?.id) {
      try {
        localStorage.setItem(`${DISMISS_KEY}:${user.id}`, String(Date.now()));
      } catch {
        // Armazenamento indisponível (modo privado): esconde só nesta sessão.
      }
    }
    setDismissed(true);
  };

  const handleCreate = async () => {
    const created = await registerPasskey();
    if (created) {
      await loadCredentials();
      setDismissed(true);
    }
  };

  if (!isSupported || !isAvailable || dismissed || !ready) return null;
  if (loadError) return null;
  if (credentials.length > 0) return null;

  return (
    <Card className={`border-status-info/30 bg-status-info/5 ${className ?? ''}`}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-status-info" />
          <div>
            <p className="text-sm font-semibold">Entre sem digitar senha</p>
            <p className="text-xs text-muted-foreground">
              Crie uma passkey neste aparelho: entrada com biometria ou PIN e menos risco
              de phishing. Sua senha continua funcionando.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" onClick={handleCreate} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar passkey'}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={dismiss}
            aria-label="Dispensar convite de passkey"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
