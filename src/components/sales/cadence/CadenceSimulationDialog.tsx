
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, FileText, MousePointerClick, History, CheckCircle2, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProspectCadences, useFunnelRules } from "@/hooks/cadences/useCadenceQueries";
import { useQueryClient } from "@tanstack/react-query";

interface SimulationLog {
  id: string;
  timestamp: string;
  event: string;
  lead: string;
  result: string;
  next_cadences?: string[];
  rule_details?: string;
}

export function CadenceSimulationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState("");
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const { data: prospects } = useProspectCadences();
  const queryClient = useQueryClient();

  const simulateEvent = async (type: "quote_open" | "price_click" | "reply" | "manual") => {
    if (!selectedProspectId) {
      toast.error("Selecione um lead para a simulação");
      return;
    }

    const prospect = prospects?.find(p => p.id === selectedProspectId);
    if (!prospect) return;

    const eventNames = {
      quote_open: "Abertura de Proposta",
      price_click: "Clique em Preço",
      reply: "Resposta Recebida",
      manual: "Ação Manual"
    };
    
    const eventName = eventNames[type];
    const leadName = prospect.id.substring(0, 8);

    // Chamar a função do banco de dados para processar o evento
    const { data, error } = await supabase.rpc('process_lead_intent_event', {
      p_prospect_cadence_id: prospect.id,
      p_event_type: type,
      p_details: { source: 'simulation' }
    });

    if (error) {
      toast.error("Erro ao processar evento no banco");
      console.error(error);
      return;
    }

    const result = data as { 
      transitioned: boolean; 
      new_stage: string; 
      event_count: number;
      applied_rule?: any;
      planned_actions?: string[];
    };

    let resultMsg = `Evento registrado (${result.event_count} ocorrências)`;
    let ruleDetails = result.applied_rule ? `Regra: ${result.applied_rule.condition}` : "Processamento padrão";
    
    if (result.transitioned) {
      resultMsg = `Transição: ${prospect.funnel_stage} -> ${result.new_stage}`;
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
      queryClient.invalidateQueries({ queryKey: ["todays-cadence-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }

    const newLog: SimulationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      event: eventName,
      lead: `Lead ${leadName}`,
      result: resultMsg,
      next_cadences: result.planned_actions || ["Follow-up Automático"],
      rule_details: ruleDetails
    };

    setLogs([newLog, ...logs]);

    toast.success(`${eventName} simulado!`, {
      description: resultMsg,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5 shadow-sm">
          <Play className="h-4 w-4 text-primary" />
          Simular Cenários
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass dark:border-glow">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Simulador de Gatilhos e Transições do Funil
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Teste regras de transição e veja as próximas cadências planejadas para o lead.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="space-y-2">
              <Label>Lead em Cadência</Label>
              <Select value={selectedProspectId} onValueChange={setSelectedProspectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o lead" />
                </SelectTrigger>
                <SelectContent>
                  {prospects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      Lead {p.id.substring(0, 8)} ({p.funnel_stage})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => simulateEvent("quote_open")}
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-xs font-semibold">Abrir Proposta</div>
              <div className="text-[9px] text-muted-foreground">Trigger: 1 clique</div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:border-accent/50 hover:bg-accent/5 transition-all"
              onClick={() => simulateEvent("price_click")}
            >
              <MousePointerClick className="h-8 w-8 text-accent" />
              <div className="text-xs font-semibold">Clicar em Preço</div>
              <div className="text-[9px] text-muted-foreground">Trigger: 3 cliques</div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:border-success/50 hover:bg-success/5 transition-all"
              onClick={() => simulateEvent("reply")}
            >
              <History className="h-8 w-8 text-success" />
              <div className="text-xs font-semibold">Resposta Recebida</div>
              <div className="text-[9px] text-muted-foreground">Trigger: Manual/Bot</div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:border-status-warning/50 hover:bg-status-warning/5 transition-all"
              onClick={() => simulateEvent("manual")}
            >
              <CheckCircle2 className="h-8 w-8 text-status-warning" />
              <div className="text-xs font-semibold">Ação Manual</div>
              <div className="text-[9px] text-muted-foreground">Qualquer momento</div>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Logs de Auditoria (Sessão)
              </Label>
              <Badge variant="outline" className="text-[10px]">{logs.length} eventos</Badge>
            </div>
            <ScrollArea className="h-[150px] w-full rounded-md border border-border/50 bg-muted/10 p-2">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic">
                  Nenhum evento disparado ainda
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex flex-col gap-2 p-3 rounded-lg bg-background/50 border border-border/30 text-[10px]">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            <span>{log.event}</span>
                          </div>
                          <div className="text-muted-foreground">Lead: {log.lead}</div>
                          <div className="text-primary/70 font-mono text-[9px]">{log.rule_details}</div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <div className="text-muted-foreground">{log.timestamp}</div>
                          <div className="text-primary font-bold">{log.result}</div>
                        </div>
                      </div>
                      
                      {log.next_cadences && log.next_cadences.length > 0 && (
                        <div className="pt-2 border-t border-border/20">
                          <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1">Ações Planejadas / Próximas Cadências:</div>
                          <div className="flex flex-wrap gap-1">
                            {log.next_cadences.map((cadence, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary text-[8px] h-4">
                                <GitBranch className="h-2 w-2 mr-1" />
                                {cadence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
