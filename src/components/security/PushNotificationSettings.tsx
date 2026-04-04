import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, BellRing, TestTube, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationSettings: React.FC = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-600">Permitido</Badge>;
      case 'denied':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">Não solicitado</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Notificações Push Não Suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push. Tente usar um navegador moderno como Chrome, Firefox ou Edge.
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
            {isSubscribed ? (
              <BellRing className="h-5 w-5 text-success" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle>Notificações Push</CardTitle>
          </div>
          {getPermissionBadge()}
        </div>
        <CardDescription>
          Receba alertas de segurança em tempo real diretamente no seu navegador
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Alertas de Segurança</p>
              <p className="text-sm text-muted-foreground">
                Logins suspeitos, bloqueios de IP, tentativas de acesso
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isLoading || permission === 'denied'}
            />
          </div>
        </div>

        {/* Status Info */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status das notificações:</span>
            <span className="flex items-center gap-1">
              {isSubscribed ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">Ativas</span>
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Inativas</span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Permissão do navegador:</span>
            {getPermissionBadge()}
          </div>
        </div>

        {/* Permission Denied Warning */}
        {permission === 'denied' && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Notificações Bloqueadas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Você bloqueou as notificações para este site. Para ativar:
                </p>
                <ol className="text-sm text-muted-foreground mt-2 list-decimal list-inside space-y-1">
                  <li>Clique no ícone de cadeado na barra de endereço</li>
                  <li>Encontre "Notificações" nas permissões</li>
                  <li>Altere para "Permitir"</li>
                  <li>Recarregue a página</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Test Button */}
        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={sendTestNotification}
              disabled={isLoading}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Enviar Notificação de Teste
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Notificações são enviadas mesmo quando o navegador está fechado</p>
          <p>• Alertas incluem: login de dispositivo novo, bloqueio de IP, tentativas suspeitas</p>
          <p>• Você pode desativar a qualquer momento</p>
        </div>
      </CardContent>
    </Card>
  );
};
