import { Bell, BellOff, BellRing, Check, AlertTriangle, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function BrowserPushSettings() {
  const { isAdmin, isManager } = useUserRoles();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications();

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge className="bg-muted/50 text-muted-foreground border-border">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Carregando
        </Badge>
      );
    }

    if (isSubscribed && permission === 'granted') {
      return (
        <Badge className="bg-status-success/20 text-status-success border-status-success/30">
          <Check className="h-3 w-3 mr-1" />
          Ativado
        </Badge>
      );
    }
    
    if (permission === 'denied') {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          <BellOff className="h-3 w-3 mr-1" />
          Bloqueado
        </Badge>
      );
    }

    return (
      <Badge className="bg-warning/20 text-warning border-warning/30">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  const getStatusIcon = () => {
    if (isSubscribed && permission === 'granted') {
      return <BellRing className="h-5 w-5 text-status-success" />;
    }
    if (permission === 'denied') {
      return <BellOff className="h-5 w-5 text-destructive" />;
    }
    return <Bell className="h-5 w-5 text-warning" />;
  };

  // Check if browser supports notifications
  if (!isSupported) {
    return (
      <Card className="glass border-warning/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle className="text-base">Push Notifications</CardTitle>
              <CardDescription>Navegador não suportado</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seu navegador não suporta notificações push. Use Chrome, Firefox, Edge ou Safari para receber alertas em tempo real.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isActive = isSubscribed && permission === 'granted';

  return (
    <Card className={`glass transition-all ${isActive ? "border-status-success/30" : permission === "denied" ? "border-destructive/30" : "border-warning/30"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? "bg-status-success/20" : permission === "denied" ? "bg-destructive/20" : "bg-warning/20"}`}>
              {getStatusIcon()}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Push Notifications
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                Alertas em tempo real com Service Worker
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive ? (
          <>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-status-success/10 border border-status-success/20">
              <Check className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-status-success">Notificações push ativas!</p>
                <p className="text-muted-foreground mt-0.5">
                  Você receberá alertas mesmo quando o navegador estiver em segundo plano:
                </p>
                <ul className="text-muted-foreground mt-1 space-y-0.5 text-xs">
                  {(isAdmin || isManager) && (
                    <>
                      <li>• Alertas de SDR abaixo da meta</li>
                      <li>• Alertas de segurança (pico de acessos negados)</li>
                    </>
                  )}
                  <li>• Celebrações de meta batida</li>
                  <li>• Recordes de streak pessoal</li>
                  <li>• Tarefas urgentes</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={sendTestNotification}
                className="flex-1"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Testar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={unsubscribe}
                disabled={isLoading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </>
        ) : permission === "denied" ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <BellOff className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Notificações bloqueadas</p>
              <p className="text-muted-foreground mt-1">
                Para receber alertas push, você precisa desbloquear as notificações nas configurações do seu navegador:
              </p>
              <ol className="text-muted-foreground mt-2 space-y-1 text-xs">
                <li>1. Clique no ícone de cadeado na barra de endereço</li>
                <li>2. Encontre "Notificações" nas permissões</li>
                <li>3. Altere para "Permitir"</li>
                <li>4. Recarregue a página</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>Ative as notificações push para receber alertas em tempo real, <strong>mesmo quando o navegador estiver fechado</strong>.</p>
                {(isAdmin || isManager) && (
                  <p className="mt-1 text-primary font-medium">
                    Como admin/manager, você receberá alertas críticos de SDR e segurança.
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={subscribe}
              disabled={isLoading}
              className="w-full gradient-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ativando...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Ativar notificações push
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
