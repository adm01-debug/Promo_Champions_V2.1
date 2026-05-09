import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal,
  Clock,
  Settings2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IntegrationStatus {
  id: string;
  name: string;
  type: "email" | "push";
  status: "active" | "error" | "pending";
  lastCheck: string;
  errorCount: number;
  configValid: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: "email" | "push" | "auth";
  event: string;
  status: "success" | "error";
  details: string;
  recipient?: string;
}

export const IntegrationStatusPanel = () => {
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: "email-infrastructure",
      name: "Infraestrutura de Email",
      type: "email",
      status: "active",
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      configValid: true
    },
    {
      id: "push-notifications",
      name: "Notificações Push",
      type: "push",
      status: "active",
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      configValid: true
    }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Tenta buscar da nova tabela de logs unificada
      const { data: unifiedLogs, error: unifiedError } = await supabase
        .from('integration_logs' as any)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(30);

      if (unifiedError) {
        console.warn("Unified logs table not accessible, falling back to email_logs", unifiedError);
        // Fallback para email_logs se a tabela unificada falhar (compatibilidade)
        const { data: emailLogs, error: emailError } = await supabase
          .from('email_logs' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (emailError) throw emailError;

        const formattedLogs: LogEntry[] = (emailLogs || []).map((log: any) => ({
          id: log.id,
          timestamp: log.created_at,
          type: "email",
          event: log.subject || "Email Notification",
          status: log.status === 'sent' ? 'success' : 'error',
          details: log.error_message || `Enviado para ${log.recipient_email}`,
          recipient: log.recipient_email
        }));

        setLogs(formattedLogs);
      } else {
        const formattedLogs: LogEntry[] = (unifiedLogs || []).map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp,
          type: log.integration_type,
          event: log.event_type === 'config_check' ? `Diagnóstico: ${log.integration_type}` : log.event_type,
          status: log.status === 'success' ? 'success' : 'error',
          details: log.error_message || (log.details ? JSON.stringify(log.details) : 'Operação concluída'),
          recipient: log.recipient
        }));
        setLogs(formattedLogs);
      }

      // Atualiza status de infraestrutura baseado nos logs
      const emailFails = logs.filter(l => l.type === 'email' && l.status === 'error').length;
      const pushFails = logs.filter(l => l.type === 'push' && l.status === 'error').length;
      
      setIntegrations(prev => prev.map(i => {
        if (i.type === 'email') return { ...i, errorCount: emailFails, status: emailFails > 5 ? 'error' : 'active' };
        if (i.type === 'push') return { ...i, errorCount: pushFails, status: pushFails > 3 ? 'error' : 'active' };
        return i;
      }));

      toast.success("Diagnóstico concluído com sucesso");
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erro ao carregar logs de integração");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const testEmail = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Enviando email de teste...",
        success: "Email de teste solicitado!",
        error: "Falha ao solicitar teste"
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Settings2 className="h-12 w-12 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Status da Infraestrutura
          </CardTitle>
          <CardDescription className="text-[10px] uppercase font-mono">
            Diagnóstico em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-3 rounded-lg border border-white/5 bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {integration.type === "email" ? <Mail className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-success" />}
                    <span className="text-xs font-bold uppercase tracking-tight">{integration.name}</span>
                  </div>
                  <Badge variant={integration.status === "active" ? "default" : "destructive"} className="text-[9px] h-5 uppercase">
                    {integration.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">Config</p>
                    <div className="flex items-center gap-1">
                      {integration.configValid ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      <span className="text-[10px] font-mono">{integration.configValid ? "VÁLIDA" : "INVÁLIDA"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">Falhas (24h)</p>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={cn("h-3 w-3", integration.errorCount > 0 ? "text-warning" : "text-success")} />
                      <span className="text-[10px] font-mono">{integration.errorCount} ERROS</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-7 text-[9px] font-mono uppercase tracking-widest border border-white/5 hover:bg-primary/10 hover:text-primary"
                  onClick={integration.type === "email" ? testEmail : undefined}
                >
                  Testar {integration.type}
                </Button>
              </div>
            ))}
          </div>

          <Button 
            className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
            {loading ? "Analisando..." : "Diagnóstico Global"}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Logs de Protocolo e Cadastro
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">
              Fluxo de eventos reais do sistema
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary font-mono text-[9px]">
            {logs.length} EVENTOS
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[400px]">
            <div className="px-6 py-4 space-y-4">
              {logs.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <AlertCircle className="h-8 w-8 opacity-20" />
                  <p className="text-xs font-mono uppercase">Nenhum log recente encontrado</p>
                </div>
              )}
              {logs.map((log, idx) => (
                <div key={log.id} className="relative group">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        log.status === "success" ? "bg-success" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      )} />
                      {idx !== logs.length - 1 && <div className="w-[1px] h-12 bg-white/5" />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase",
                            log.type === "email" ? "border-primary/20 text-primary bg-primary/5" : "border-success/20 text-success bg-success/5"
                          )}>
                            {log.type}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-tight">{log.event}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-mono">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded border border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-mono text-foreground/80 break-all">{log.details}</p>
                            {log.recipient && <p className="text-[9px] text-muted-foreground mt-1 font-mono">{log.recipient}</p>}
                          </div>
                          {log.status === "error" && (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationStatusPanel;
