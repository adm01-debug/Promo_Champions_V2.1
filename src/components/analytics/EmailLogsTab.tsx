import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const FUNCTION_LABELS: Record<string, string> = {
  'send-alert-notifications': 'Alertas Gerais',
  'sdr-consecutive-alerts': 'Alertas SDR',
  'activity-goal-alerts': 'Alertas Metas',
  'access-denied-alerts': 'Alertas Segurança',
  'check-lead-sla': 'Lead SLA'
};

interface EmailLog {
  id: string;
  function_name: string;
  recipient_email: string;
  subject: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface EmailLogsTabProps {
  recentLogs: EmailLog[] | undefined;
}

export const EmailLogsTab = React.memo(function EmailLogsTab({ recentLogs }: EmailLogsTabProps) {
  return (
    <Card variant="elevated" className="glass border-border/40 dark:border-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Histórico de Emails</span>
          {recentLogs && (
            <Badge variant="secondary" className="text-xs ml-2">
              {recentLogs.length} registros
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {recentLogs?.map((log, index) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl glass border transition-all hover-lift cursor-default animate-fade-in ${
                  log.status === 'sent'
                    ? 'border-status-success/30 hover:border-status-success/50'
                    : 'border-status-error/30 hover:border-status-error/50'
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 text-status-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-status-error" />
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {FUNCTION_LABELS[log.function_name] || log.function_name}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{log.recipient_email}</p>
                {log.subject && <p className="text-xs text-muted-foreground truncate mt-1">{log.subject}</p>}
                {log.error_message && <p className="text-xs text-status-error mt-1">{log.error_message}</p>}
              </div>
            ))}
            {(!recentLogs || recentLogs.length === 0) && (
              <div className="text-center text-muted-foreground py-12">
                <Mail className="h-10 w-10 opacity-50 mx-auto mb-3" />
                <p className="font-display font-medium">Nenhum email registrado</p>
                <p className="text-xs mt-1">Os logs aparecerão conforme emails forem enviados</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
