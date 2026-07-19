import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Award, ShieldCheck, Activity, Terminal, RefreshCw, AlertTriangle } from "lucide-react";
import { useWebhookDeliveries } from "@/hooks/useWebhooks";
import { format } from "date-fns";

export const QualityReportView = () => {
  const { data: deliveries, isLoading, refetch } = useWebhookDeliveries();

  const cicdLogs = deliveries?.filter(d =>
    d.event_type.startsWith('cicd.') ||
    d.event_type.includes('test') ||
    d.event_type.includes('validation')
  ) || [];

  return (
    <Card className="glass border-primary/20 shadow-2xl overflow-hidden bg-gradient-to-br from-card/90 to-card/50">
      <CardHeader className="border-b border-border/10 bg-primary/5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-section-title font-black uppercase tracking-tighter italic">Relatório de Qualidade</CardTitle>
              <CardDescription className="text-primary/70 font-medium">Enterprise Quality Gate — dados ao vivo do CI/CD</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
              title="Sincronizar Logs"
            >
              <RefreshCw className={`h-4 w-4 text-primary/60 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Badge variant="outline" className="px-4 py-1.5 bg-muted/20 text-muted-foreground border-border font-black tracking-widest uppercase">
              MONITORANDO
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">

        {/* Coverage metrics — only shown when real CI/CD data is present */}
        {cicdLogs.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest italic">Métricas do último pipeline</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cicdLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-background/40 border border-border/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                      {log.event_type}
                    </span>
                    <span className={`text-xs font-bold ${log.success ? 'text-status-success' : 'text-status-error'}`}>
                      {log.success ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground/50">{log.duration_ms}ms</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground/50 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-muted-foreground">Nenhuma métrica de cobertura disponível</p>
              <p className="text-xs text-muted-foreground/60">
                Configure webhooks de CI/CD (GitHub Actions, GitLab CI) para que os resultados reais de
                testes e cobertura apareçam aqui. Não exibimos valores estimados para evitar dados enganosos.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Protocolos de Segurança</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
              <Badge className="bg-emerald-500">v1/v2</Badge>
              <span className="text-xs font-bold text-muted-foreground">Versionamento de Contrato</span>
            </div>
            <div className="p-3 rounded-xl bg-muted/5 border border-border/10 flex items-center gap-3">
              <Badge variant="outline">Pendente</Badge>
              <span className="text-xs font-bold text-muted-foreground">Fuzzing Suite — aguardando CI</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Logs do Quality Gate (CI/CD)</h3>
          </div>
          <ScrollArea className="h-[180px] w-full rounded-xl bg-black/40 border border-white/5 p-4 font-mono text-[10px] leading-relaxed">
            {isLoading ? (
              <div className="text-muted-foreground animate-pulse">Estabelecendo conexão com o túnel de auditoria...</div>
            ) : cicdLogs.length > 0 ? (
              <div className="space-y-1">
                {cicdLogs.map((log) => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-muted-foreground/50">[{format(new Date(log.created_at), 'HH:mm:ss')}]</span>
                    <span className={log.success ? "text-emerald-400" : "text-destructive"}>
                      [{log.success ? 'PASS' : 'FAIL'}] {log.event_type.toUpperCase()}: {log.response_body || 'Sem resposta'}
                      <span className="ml-2 text-muted-foreground/30">({log.duration_ms}ms)</span>
                    </span>
                  </div>
                ))}
                <div className="text-muted-foreground mt-2 border-t border-white/5 pt-2">
                  [INFO] {cicdLogs.length} evento(s) encontrado(s).
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-muted-foreground/60">
                <div className="italic mb-2 text-yellow-400/60">// Nenhum evento de CI/CD registrado ainda.</div>
                <div>[INFO] Configure webhooks do seu pipeline de CI/CD para enviar</div>
                <div>[INFO] eventos para esta instância do Quality Gate.</div>
                <div className="mt-2 text-muted-foreground/40">
                  [INFO] Consulte: Settings → Webhooks → CI/CD Integration
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border/10">
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <FileText className="h-4 w-4" />
            <span className="text-[10px] font-mono">Quality Gate — dados em tempo real</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Promo Champions</span>
        </div>
      </CardContent>
    </Card>
  );
};
