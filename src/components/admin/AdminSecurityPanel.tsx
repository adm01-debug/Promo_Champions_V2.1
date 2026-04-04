import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Activity, Clock, CheckCircle2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface AdminSecurityPanelProps {
  recentAccessDenied: Array<Record<string, unknown>>;
  recentSecurityAlerts: Array<Record<string, unknown>>;
  recentSDRAlerts: Array<Record<string, unknown>>;
}

export function AdminSecurityPanel({ recentAccessDenied, recentSecurityAlerts, recentSDRAlerts }: AdminSecurityPanelProps) {
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-destructive/20 to-destructive/5">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            Segurança & Alertas
          </CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/notificacoes">Ver todos<ExternalLink className="h-3 w-3" /></Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="access" className="text-xs">Acessos Negados</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">Alertas Segurança</TabsTrigger>
            <TabsTrigger value="sdr" className="text-xs">Alertas SDR</TabsTrigger>
          </TabsList>

          <TabsContent value="access">
            <ScrollArea className="h-[280px]">
              {recentAccessDenied.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-sm">Nenhum acesso negado recente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAccessDenied.map((log) => (
                    <div key={log.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate max-w-[200px]">{log.user_email || "Usuário desconhecido"}</span>
                        <Badge variant="destructive" className="text-xs">{log.user_role || "N/A"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Tentou acessar: <code className="text-destructive">{log.attempted_path}</code></p>
                      <p className="text-xs text-muted-foreground mt-1"><Clock className="h-3 w-3 inline mr-1" />{format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="security">
            <ScrollArea className="h-[280px]">
              {recentSecurityAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-sm">Nenhum alerta de segurança recente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSecurityAlerts.map((alert) => (
                    <div key={String(alert.id)} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <Badge variant="destructive" className="gap-1 mb-1"><AlertTriangle className="h-3 w-3" />Pico de Acessos Negados</Badge>
                      <p className="text-sm"><span className="font-medium">{alert.access_count}</span> acessos negados em <span className="font-medium">{alert.time_window_hours}h</span></p>
                      <p className="text-xs text-muted-foreground mt-1"><Clock className="h-3 w-3 inline mr-1" />{format(new Date(String(alert.created_at)), "dd/MM HH:mm", { locale: ptBR })}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sdr">
            <ScrollArea className="h-[280px]">
              {recentSDRAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-sm">Nenhum alerta SDR recente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSDRAlerts.map((alert) => (
                    <div key={String(alert.id)} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="gap-1 text-warning border-warning"><Activity className="h-3 w-3" />{alert.sdrs_notified} SDR(s) abaixo da meta</Badge>
                        <Badge variant="secondary" className="text-xs">{alert.triggered_by === "manual" ? "Manual" : "Automático"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Threshold: {alert.threshold_used} dias consecutivos</p>
                      <p className="text-xs text-muted-foreground mt-1"><Clock className="h-3 w-3 inline mr-1" />{format(new Date(String(alert.created_at)), "dd/MM HH:mm", { locale: ptBR })}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
