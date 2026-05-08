import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, Save, Plus, Trash2, GitBranch, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STAGES = [
  { id: "new", label: "Novo" },
  { id: "high_interest", label: "Interesse Alto" },
  { id: "waiting_approval", label: "Aguardando Aprovação" },
  { id: "scheduled", label: "Agendado" },
];

const OUTCOMES = [
  { id: "atendeu", label: "Atendeu" },
  { id: "nao_atendeu", label: "Não Atendeu" },
  { id: "interessado", label: "Interessado" },
  { id: "agendado", label: "Agendado" },
  { id: "rejeitado", label: "Rejeitado/Lixo" },
];

export function CadenceOutcomeConfig() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({
    outcome: "nao_atendeu",
    to_stage: "new",
    next_action: "retry",
    retry_delay_hours: 4,
    max_retries: 3
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const { data, error } = await supabase
      .from("cadence_outcome_rules")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) toast.error("Erro ao carregar regras");
    else setRules(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("cadence_outcome_rules")
        .insert([formData]);
      
      if (error) throw error;
      toast.success("Regra de desfecho adicionada");
      setIsAdding(false);
      fetchRules();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from("cadence_outcome_rules").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Regra excluída");
      fetchRules();
    }
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Regras de Desfecho de Ligação
            </CardTitle>
            <CardDescription className="text-xs">
              Automação do funil com base no resultado da chamada
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setIsAdding(true)}>
            <Plus className="h-3 w-3" />
            Nova Regra
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase">Resultado</Label>
                <Select value={formData.outcome} onValueChange={v => setFormData({ ...formData, outcome: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OUTCOMES.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase">Nova Etapa</Label>
                <Select value={formData.to_stage} onValueChange={v => setFormData({ ...formData, to_stage: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase">Ação</Label>
                <Select value={formData.next_action} onValueChange={v => setFormData({ ...formData, next_action: v })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next_step">Próximo Passo</SelectItem>
                    <SelectItem value="retry">Tentar Novamente</SelectItem>
                    <SelectItem value="pause">Pausar Cadência</SelectItem>
                    <SelectItem value="finish">Concluir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.next_action === "retry" && (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase">Intervalo (h)</Label>
                  <Input 
                    type="number" 
                    value={formData.retry_delay_hours} 
                    onChange={e => setFormData({ ...formData, retry_delay_hours: parseInt(e.target.value) })}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1" onClick={handleSave}>
                <Save className="h-3 w-3" />
                Salvar Regra
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/10 group">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-bold uppercase">{OUTCOMES.find(o => o.id === rule.outcome)?.label || rule.outcome}</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3 text-primary" />
                  <span className="text-xs">{STAGES.find(s => s.id === rule.to_stage)?.label || rule.to_stage}</span>
                </div>
                <div className="h-3 w-[1px] bg-border/40" />
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-status-warning" />
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {rule.next_action === 'retry' ? `Tentar em ${rule.retry_delay_hours}h (Max ${rule.max_retries})` : rule.next_action}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteRule(rule.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
