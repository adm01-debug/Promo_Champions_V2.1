
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Clock, Info, Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

export function RuleAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
    
    // Setup real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'intent_audit_logs'
        },
        (payload) => {
          setLogs(prev => [payload.new, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("intent_audit_logs")
      .select("*, leads:lead_id(client_name)")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (!error) {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.leads?.client_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-status-warning" />
              Auditoria de Transições e Regras
            </CardTitle>
            <CardDescription className="text-xs">
              Acompanhe por que cada lead mudou de etapa ou recebeu um alerta
            </CardDescription>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por lead ou evento..."
              className="h-8 pl-7 text-xs bg-muted/30"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-border/30 bg-muted/10 space-y-3 animate-in fade-in slide-in-from-right-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border/40">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{log.leads?.client_name || "Lead"}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{log.event_type}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">
                      {log.details?.transitioned ? "Transição de Etapa" : "Gatilho de Intenção"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/20">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <Info className="h-2.5 w-2.5" /> Motivo / Regra Aplicada
                    </span>
                    <p className="text-xs italic bg-background/50 p-2 rounded border border-border/20">
                      {log.rule_applied?.reason || log.details?.reason || "Processamento de rotina baseado no histórico de cliques."}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-2.5 w-2.5" /> Resultado
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {log.details?.transitioned ? (
                        <Badge variant="default" className="text-[9px] h-5">
                          {log.details.old_stage} {"->"} {log.details.new_stage}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] h-5">
                          Log registrado ({log.details?.event_count || 1}x)
                        </Badge>
                      )}
                      {log.details?.planned_actions?.map((action: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] h-5 bg-green-500/10 text-green-600 border-green-500/20">
                          +{action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Search className="h-12 w-12 opacity-10 mx-auto mb-3" />
                <p className="text-sm">Nenhum log de auditoria encontrado.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
