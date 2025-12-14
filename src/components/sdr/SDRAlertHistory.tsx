import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, Users, AlertTriangle, Clock, Mail } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface SDRDetail {
  id: string;
  name: string;
  email: string | null;
  consecutiveDays: number;
  avgDeficit: number;
  dailyGoal: number;
}

interface SDRAlertHistoryItem {
  id: string;
  created_at: string;
  triggered_by: string;
  sdrs_notified: number;
  threshold_used: number;
  sdr_details: SDRDetail[];
  admin_emails: string[];
}

export function SDRAlertHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["sdr-alert-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sdr_alert_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        sdr_details: (Array.isArray(item.sdr_details) ? item.sdr_details : []) as unknown as SDRDetail[],
      })) as SDRAlertHistoryItem[];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <Card className="glass border-border/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/40 hover-lift">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/5">
            <History className="h-4 w-4 text-primary" />
          </div>
          Histórico de Alertas SDR
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!history?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum alerta enviado ainda</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <Badge variant={item.triggered_by === "manual" ? "secondary" : "outline"} className="text-xs">
                      {item.triggered_by === "manual" ? "Manual" : "Automático"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-destructive" />
                      <span className="font-medium">{item.sdrs_notified}</span>
                      <span className="text-muted-foreground">SDRs notificados</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-muted-foreground">Threshold: {item.threshold_used}d</span>
                    </div>
                  </div>

                  {item.sdr_details && item.sdr_details.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">SDRs afetados:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.sdr_details.map((sdr) => (
                          <Badge key={sdr.id} variant="destructive" className="text-xs gap-1">
                            {sdr.name} ({sdr.consecutiveDays}d)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.admin_emails && item.admin_emails.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Enviado para: {item.admin_emails.slice(0, 2).join(", ")}
                      {item.admin_emails.length > 2 && ` +${item.admin_emails.length - 2}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
