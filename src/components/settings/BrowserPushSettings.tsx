import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Check, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRoles } from "@/hooks/useUserRoles";
import { toast } from "sonner";

type NotificationPermission = "default" | "granted" | "denied";

export function BrowserPushSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);
  const { isAdmin, isManager } = useUserRoles();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Seu navegador não suporta notificações push");
      return;
    }

    setIsRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        toast.success("Notificações push ativadas!");
        // Send test notification
        new Notification("Notificações Ativadas! 🔔", {
          body: "Você receberá alertas de SDR e segurança em tempo real.",
          icon: "/favicon.ico",
        });
      } else if (result === "denied") {
        toast.error("Permissão negada. Você pode alterar isso nas configurações do navegador.");
      }
    } catch (error) {
      toast.error("Erro ao solicitar permissão");
    } finally {
      setIsRequesting(false);
    }
  };

  const sendTestNotification = () => {
    if (permission !== "granted") {
      toast.error("Permita as notificações primeiro");
      return;
    }

    new Notification("Teste de Notificação 🧪", {
      body: "Esta é uma notificação de teste. Alertas SDR e de segurança aparecerão assim!",
      icon: "/favicon.ico",
      tag: "test-notification",
    });
    toast.success("Notificação de teste enviada!");
  };

  const getStatusBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge className="bg-status-success/20 text-status-success border-status-success/30">
            <Check className="h-3 w-3 mr-1" />
            Ativado
          </Badge>
        );
      case "denied":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <BellOff className="h-3 w-3 mr-1" />
            Bloqueado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const getStatusIcon = () => {
    switch (permission) {
      case "granted":
        return <BellRing className="h-5 w-5 text-status-success" />;
      case "denied":
        return <BellOff className="h-5 w-5 text-destructive" />;
      default:
        return <Bell className="h-5 w-5 text-warning" />;
    }
  };

  // Check if browser supports notifications
  if (!("Notification" in window)) {
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

  return (
    <Card className={`glass transition-all ${permission === "granted" ? "border-status-success/30" : permission === "denied" ? "border-destructive/30" : "border-warning/30"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${permission === "granted" ? "bg-status-success/20" : permission === "denied" ? "bg-destructive/20" : "bg-warning/20"}`}>
              {getStatusIcon()}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Push Notifications
                {getStatusBadge()}
              </CardTitle>
              <CardDescription>
                Alertas em tempo real no navegador
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "granted" ? (
          <>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-status-success/10 border border-status-success/20">
              <Check className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-status-success">Notificações ativadas!</p>
                <p className="text-muted-foreground mt-0.5">
                  Você receberá alertas push para:
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
                </ul>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sendTestNotification}
              className="w-full"
            >
              <BellRing className="h-4 w-4 mr-2" />
              Enviar notificação de teste
            </Button>
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
                <p>Ative as notificações push para receber alertas em tempo real diretamente no seu navegador, mesmo quando não estiver com a aba ativa.</p>
                {(isAdmin || isManager) && (
                  <p className="mt-1 text-primary font-medium">
                    Como admin/manager, você receberá alertas de SDR e segurança.
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={requestPermission}
              disabled={isRequesting}
              className="w-full gradient-primary"
            >
              {isRequesting ? (
                <>Solicitando...</>
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
