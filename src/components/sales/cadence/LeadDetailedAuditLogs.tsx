
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLeadDetailedLogs } from "@/hooks/cadences/useLeadLogs";
import { Activity, Zap, ArrowRight, Bell, CheckCircle2, Phone, Mail, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LeadDetailedAuditLogsProps {
  clientId: string;
  clientName?: string;
}

const EVENT_ICONS: Record<string, any> = {
  interaction: Activity,
  trigger: Zap,
  transition: ArrowRight,
  task_created: CheckCircle2,
  alert: Bell,
};

const EVENT_COLORS: Record<string, string> = {
  interaction: "text-blue-500 bg-blue-500/10",
  trigger: "text-orange-500 bg-orange-500/10",
  transition: "text-purple-500 bg-purple-500/10",
  task_created: "text-green-500 bg-green-500/10",
  alert: "text-red-500 bg-red-500/10",
};

export function LeadDetailedAuditLogs({ clientId, clientName }: LeadDetailedAuditLogsProps) {
  const { data: logs, isLoading } = useLeadDetailedLogs(clientId);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando auditoria...</div>;
  }

  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Auditoria de Interações: {clientName || "Lead"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {!logs || logs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhum evento registrado ainda.</p>
              </div>
            ) : (
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border/50 before:via-border/50 before:to-transparent">
                {logs.map((log) => {
                  const Icon = EVENT_ICONS[log.event_type] || Activity;
                  return (
                    <div key={log.id} className="relative pl-10 group">
                      <div className={cn(
                        "absolute left-0 top-1 p-2 rounded-full border border-border/40 transition-transform group-hover:scale-110",
                        EVENT_COLORS[log.event_type]
                      )}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider">{log.action}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {log.event_type === 'transition' && log.details && (
                          <div className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="text-[10px]">{log.details.from}</Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="secondary" className="text-[10px]">{log.details.to}</Badge>
                          </div>
                        )}
                        {log.details?.message && (
                          <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-border/20">
                            {log.details.message}
                          </p>
                        )}
                        {log.details?.call_result && (
                          <Badge className="w-fit text-[10px]" variant="secondary">
                            Resultado: {log.details.call_result}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
