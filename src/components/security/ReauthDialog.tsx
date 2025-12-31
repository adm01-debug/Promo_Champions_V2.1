import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useReauthentication } from "@/hooks/useReauthentication";
import { Lock, AlertTriangle, Loader2 } from "lucide-react";

interface ReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  action: 'password_change' | 'email_change' | 'mfa_config' | 'admin_action' | 'delete_account';
  title?: string;
  description?: string;
}

const ACTION_LABELS: Record<string, { title: string; description: string }> = {
  password_change: {
    title: "Alterar Senha",
    description: "Para alterar sua senha, confirme sua identidade.",
  },
  email_change: {
    title: "Alterar Email",
    description: "Para alterar seu email, confirme sua identidade.",
  },
  mfa_config: {
    title: "Configurar MFA",
    description: "Para modificar configurações de segurança, confirme sua identidade.",
  },
  admin_action: {
    title: "Ação Administrativa",
    description: "Esta ação requer verificação adicional.",
  },
  delete_account: {
    title: "Excluir Conta",
    description: "Esta ação é irreversível. Confirme sua identidade para continuar.",
  },
};

export const ReauthDialog = ({
  open,
  onOpenChange,
  onSuccess,
  action,
  title,
  description,
}: ReauthDialogProps) => {
  const { verifyPassword, isVerifying, requestReauth, cancelRequest } = useReauthentication();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const labels = ACTION_LABELS[action] || { title: "Verificação", description: "Confirme sua identidade." };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Digite sua senha");
      return;
    }

    // Criar request se ainda não existe
    if (!hasRequested) {
      await requestReauth(action);
      setHasRequested(true);
    }

    const success = await verifyPassword(password);
    
    if (success) {
      setPassword("");
      setHasRequested(false);
      onSuccess();
      onOpenChange(false);
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const handleCancel = () => {
    cancelRequest();
    setPassword("");
    setError(null);
    setHasRequested(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{title || labels.title}</DialogTitle>
              <DialogDescription>
                {description || labels.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {action === 'delete_account' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Atenção: Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Senha atual</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={isVerifying}
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Por razões de segurança, você precisa confirmar sua senha para realizar esta ação.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
