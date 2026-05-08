
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

interface SimulationLog {
  id: string;
  timestamp: string;
  event: string;
  lead: string;
  result: string;
}

export function CadenceSimulationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState("");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const { data: salespeople } = useSalespeople();

  const simulateEvent = async (type: "proposal_view" | "price_click") => {
    if (!selectedSalesperson) {
      toast.error("Selecione um vendedor para a simulação");
      return;
    }

    const eventName = type === "proposal_view" ? "Abertura de Proposta" : "Clique em Preço";
    const leadName = selectedLead || "Lead Simulado";

    // Registrar log simulado
    const newLog: SimulationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      event: eventName,
      lead: leadName,
      result: "Gatilho 'Ligar Agora' Disparado",
    };

    setLogs([newLog, ...logs]);

    // Em um cenário real, inseriríamos na tabela 'activities'
    const { error } = await supabase.from('activities').insert({
      salesperson_id: selectedSalesperson,
      activity_type: type as any,
      notes: `Simulação: ${eventName} para ${leadName}`,
      outcome: 'connected' as any,
    });

    if (error) {
      console.error("Erro ao registrar atividade:", error);
    }

    toast.success(`${eventName} simulado com sucesso!`, {
      description: "Gatilho de intenção registrado nos logs de auditoria.",
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
              <Label>Vendedor Responsável</Label>
              <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {salespeople?.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome do Lead (Opcional)</Label>
              <div className="flex gap-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ex: João da Silva"
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 hover:border-primary/50 hover:bg-primary/5"
              onClick={() => simulateEvent("proposal_view")}
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
