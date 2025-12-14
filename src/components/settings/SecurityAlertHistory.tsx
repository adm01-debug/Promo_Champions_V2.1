import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Mail, AlertTriangle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertHistory {
  id: string;
  alert_type: string;
  recipients: string[];
  access_count: number;
  time_window_hours: number;
  threshold_used: number;
  created_at: string;
}

export function SecurityAlertHistory() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['security-alert-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as AlertHistory[];
    }
  });

  if (isLoading) {
    return (
      <Card className="card-elevated border-border/40 dark:border-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-lg bg-gradient-primary">
              <History className="h-4 w-4 text-primary-foreground" />
            </div>
            Histórico de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated border-border/40 dark:border-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <div className="p-1.5 rounded-lg bg-gradient-primary">
            <History className="h-4 w-4 text-primary-foreground" />
          </div>
          Histórico de Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum alerta enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div 
                key={alert.id} 
                className="p-4 rounded-lg border border-border/40 bg-card/50 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-status-error/20">
                      <AlertTriangle className="h-4 w-4 text-status-error" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Pico de Acessos Negados
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error/30">
                    {alert.access_count} acessos
                  </Badge>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Threshold: <span className="text-foreground">{alert.threshold_used}</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Janela: <span className="text-foreground">{alert.time_window_hours}h</span>
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="text-foreground">{alert.recipients.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}