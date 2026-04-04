import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
   
  LogOut,
  Shield,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const getDeviceIcon = (deviceInfo: Record<string, string> | null) => {
  const os = deviceInfo?.os?.toLowerCase() || '';
  if (os.includes('android') || os.includes('ios')) {
    return <Smartphone className="h-5 w-5" />;
  }
  if (os.includes('ipad')) {
    return <Tablet className="h-5 w-5" />;
  }
  return <Monitor className="h-5 w-5" />;
};

const getBrowserName = (userAgent: string | null) => {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Browser';
};

export const SessionManager = () => {
  const {
    sessions,
    currentSession,
    isLoading,
    terminateSession,
    terminateOtherSessions,
    refreshSession,
  } = useSessionManagement();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Gerenciamento de Sessões</CardTitle>
          </div>
          <CardDescription>
            Gerencie suas sessões ativas. Sessões duram 24 horas com refresh automático.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {sessions.length} {sessions.length === 1 ? 'sessão ativa' : 'sessões ativas'}
              </p>
              <p className="text-xs text-muted-foreground">
                Duração máxima: 24 horas
              </p>
            </div>
            {sessions.length > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={terminateOtherSessions}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar outras
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session List */}
      <div className="space-y-4">
        {sessions.map((session) => {
          const isCurrent = session.id === currentSession?.id;
          const deviceInfo = session.device_info || {};
          const lastActivity = session.last_activity 
            ? formatDistanceToNow(new Date(session.last_activity), { addSuffix: true, locale: ptBR })
            : 'N/A';
          const expiresAt = session.expires_at 
            ? formatDistanceToNow(new Date(session.expires_at), { addSuffix: true, locale: ptBR })
            : 'N/A';

          return (
            <Card key={session.id} className={isCurrent ? 'border-primary' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      {getDeviceIcon(deviceInfo)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {getBrowserName(session.user_agent)} em {deviceInfo.os || 'Unknown OS'}
                        </p>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Sessão atual
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {session.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {session.ip_address}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ativo {lastActivity}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Expira {expiresAt}</span>
                        {session.refresh_count > 0 && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            {session.refresh_count} refreshes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshSession}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant={isCurrent ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Nenhuma sessão ativa</AlertTitle>
          <AlertDescription>
            Não há sessões ativas no momento.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
