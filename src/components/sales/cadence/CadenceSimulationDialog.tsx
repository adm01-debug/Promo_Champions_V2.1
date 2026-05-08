
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, FileText, MousePointerClick, History, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSalespeople } from "@/hooks/useSalespeople";
import { useProspectCadences, useFunnelRules } from "@/hooks/cadences/useCadenceQueries";
import { useQueryClient } from "@tanstack/react-query";

interface SimulationLog {
  id: string;
  timestamp: string;
  event: string;
  lead: string;
  result: string;
}

export function CadenceSimulationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProspectId, setSelectedProspectId] = useState("");
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const { data: salespeople } = useSalespeople();
  const { data: prospects } = useProspectCadences();
  const { data: rules } = useFunnelRules();
  const queryClient = useQueryClient();

  const simulateEvent = async (type: "quote_open" | "price_click") => {
    if (!selectedProspectId) {
      toast.error("Selecione um lead para a simulação");
      return;
    }

    const prospect = prospects?.find(p => p.id === selectedProspectId);
    if (!prospect) return;

    const eventName = type === "quote_open" ? "Abertura de Proposta" : "Clique em Preço";
    const leadName = prospect.id.substring(0, 8); // Simplificado

    // Encontrar regra aplicável
    const applicableRule = rules?.find(r => 
      r.is_active && 
      r.from_stage === prospect.funnel_stage && 
      r.condition_type === type
    );

    let resultMsg = "Evento registrado";
    let newStage = prospect.funnel_stage;

    if (applicableRule) {
      newStage = applicableRule.to_stage as any;
      resultMsg = `Transição: ${prospect.funnel_stage} -> ${newStage}`;
      
      // Atualizar no banco
      const { error } = await supabase
        .from('prospect_cadences')
        .update({ funnel_stage: newStage })
        .eq('id', prospect.id);
        
      if (error) {
        toast.error("Erro ao atualizar estágio do funil");
        return;
      }
      
      queryClient.invalidateQueries({ queryKey: ["prospect-cadences"] });
    }

    const newLog: SimulationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      event: eventName,
      lead: `Lead ${leadName}`,
      result: resultMsg,
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
            Simulador de Gatilhos de Intenção
          </DialogTitle>
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
              className="h-24 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => simulateEvent("quote_open")}
            >
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-xs font-semibold">Abrir Proposta</div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:border-accent/50 hover:bg-accent/5"
              onClick={() => simulateEvent("price_click")}
            >
              <MousePointerClick className="h-8 w-8 text-accent" />
              <div className="text-xs font-semibold">Clicar em Preço</div>
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
                    <div key={log.id} className="flex items-start justify-between p-2 rounded bg-background/50 border border-border/30 text-[10px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          <span>{log.event}</span>
                        </div>
                        <div className="text-muted-foreground">Lead: {log.lead}</div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="text-muted-foreground">{log.timestamp}</div>
                        <div className="text-primary font-medium">{log.result}</div>
                      </div>
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
