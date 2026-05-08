
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useFunnelRules, FunnelRule } from "@/hooks/cadences/useCadenceQueries";
import { Zap, ArrowRight, Plus, Trash2, Settings2, Info } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const STAGES = [
  { id: "new", label: "Novo" },
  { id: "high_interest", label: "Interesse Alto" },
  { id: "waiting_approval", label: "Aguardando Aprovação" },
  { id: "scheduled", label: "Agendado" },
];

const CONDITION_TYPES = [
  { id: "email_open", label: "Abertura de E-mail" },
  { id: "quote_open", label: "Abertura de Proposta" },
  { id: "price_click", label: "Clique em Preço" },
  { id: "reply", label: "Resposta Recebida" },
  { id: "manual", label: "Ação Manual" },
];

export function CadenceFunnelConfig() {
  const { data: rules, isLoading } = useFunnelRules();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newRule, setNewRule] = useState<Partial<FunnelRule>>({
    from_stage: "new",
    to_stage: "high_interest",
    condition_type: "email_open",
    condition_value: 1,
    is_active: true
  });

  const handleAddRule = async () => {
    try {
      if (!newRule.from_stage || !newRule.to_stage || !newRule.condition_type) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      const { error } = await supabase
        .from("cadence_funnel_rules")
        .insert([{
          from_stage: newRule.from_stage,
          to_stage: newRule.to_stage,
          condition_type: newRule.condition_type,
          condition_value: newRule.condition_value,
          is_active: newRule.is_active
        }]);

      if (error) throw error;

      toast({
        title: "Regra adicionada",
        description: "A regra de transição foi criada com sucesso.",
      });
      
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["funnel-rules"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar regra",
        description: error.message,
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cadence_funnel_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Regra removida",
        description: "A regra de transição foi excluída.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["funnel-rules"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover regra",
        description: error.message,
      });
    }
  };

  const handleToggleRule = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("cadence_funnel_rules")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["funnel-rules"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar regra",
        description: error.message,
      });
    }
  };

  return (
    <Card className="glass border-border/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Regras e Transições do Funil
            </CardTitle>
            <CardDescription className="text-xs">
              Configure gatilhos automáticos para mover leads entre as etapas
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 gap-1 text-xs"
            onClick={() => setIsAdding(true)}
          >
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
                <label className="text-[10px] font-bold uppercase text-muted-foreground">De</label>
                <Select 
                  value={newRule.from_stage} 
                  onValueChange={(v) => setNewRule({...newRule, from_stage: v})}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Para</label>
                <Select 
                  value={newRule.to_stage} 
                  onValueChange={(v) => setNewRule({...newRule, to_stage: v})}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Gatilho</label>
                <Select 
                  value={newRule.condition_type} 
                  onValueChange={(v) => setNewRule({...newRule, condition_type: v as any})}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_TYPES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Ocorrências</label>
                <Input 
                  type="number"
                  min="1"
                  value={newRule.condition_value}
                  onChange={(e) => setNewRule({...newRule, condition_value: parseInt(e.target.value)})}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1" onClick={handleAddRule}>
                <Plus className="h-3 w-3" />
                Criar Regra
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {!rules || rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed rounded-xl border-border/40">
              <Info className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
              <p className="text-xs text-muted-foreground">Nenhuma regra configurada ainda.</p>
            </div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-medium uppercase px-1.5 py-0">
                      {STAGES.find(s => s.id === rule.from_stage)?.label}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="secondary" className="text-[10px] font-medium uppercase px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                      {STAGES.find(s => s.id === rule.to_stage)?.label}
                    </Badge>
                  </div>
                  
                  <div className="h-4 w-[1px] bg-border/40 hidden md:block" />
                  
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-status-warning" />
                    <span className="text-xs font-medium">
                      {CONDITION_TYPES.find(c => c.id === rule.condition_type)?.label} 
                      {rule.condition_type !== 'manual' && rule.condition_type !== 'reply' && ` (x${rule.condition_value})`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch 
                    checked={rule.is_active} 
                    onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)}
                    className="scale-75"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
