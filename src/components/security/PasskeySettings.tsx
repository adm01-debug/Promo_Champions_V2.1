import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fingerprint, Plus, Trash2, Loader2, AlertTriangle, Smartphone, Key, CheckCircle } from 'lucide-react';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const PasskeySettings: React.FC = () => {
  const {
    isSupported,
    isLoading,
    credentials,
    registerPasskey,
    deletePasskey,
    loadCredentials,
  } = useWebAuthn();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const handleRegister = async () => {
    await registerPasskey();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deletePasskey(id);
    setDeletingId(null);
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'platform') {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Key className="h-5 w-5" />;
  };

  if (!isSupported) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Passkeys Não Suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta WebAuthn/Passkeys. Atualize para um navegador moderno ou use outro método de autenticação.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <CardTitle>Passkeys / Login Biométrico</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-success/20 text-success">
            Suportado
          </Badge>
        </div>
        <CardDescription>
          Use seu rosto, impressão digital ou chave de segurança para fazer login de forma segura e sem senha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits Section */}
        <div className="grid gap-3 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Por que usar Passkeys?
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6">
            <li>• Login instantâneo com biometria (Face ID, Touch ID)</li>
            <li>• Mais seguro que senhas tradicionais</li>
            <li>• Resistente a phishing e ataques</li>
            <li>• Sincronizado entre seus dispositivos</li>
          </ul>
        </div>

        {/* Register Button */}
        <Button 
          onClick={handleRegister} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Adicionar Nova Passkey
        </Button>

        {/* Registered Passkeys */}
        {credentials.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Passkeys Registradas</h4>
            <div className="space-y-2">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getDeviceIcon(cred.device_type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cred.friendly_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Criada {formatDistanceToNow(new Date(cred.created_at), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                        {cred.last_used_at && (
                          <> • Usada {formatDistanceToNow(new Date(cred.last_used_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cred.backed_up && (
                      <Badge variant="secondary" className="text-xs">
                        Sincronizada
                      </Badge>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deletingId === cred.id}
                        >
                          {deletingId === cred.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Passkey?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Você não poderá mais usar esta passkey para fazer login.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cred.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {credentials.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Fingerprint className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma passkey registrada</p>
            <p className="text-xs mt-1">Adicione uma passkey para login biométrico</p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>• Suas passkeys são armazenadas de forma segura no seu dispositivo</p>
          <p>• Você pode adicionar múltiplas passkeys de diferentes dispositivos</p>
          <p>• Passkeys de plataforma são sincronizadas via iCloud/Google</p>
        </div>
      </CardContent>
    </Card>
  );
};
