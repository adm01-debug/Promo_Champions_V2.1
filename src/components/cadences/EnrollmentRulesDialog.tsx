import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings2, Plus, Trash2, Zap } from "lucide-react";
import { useCadences } from "@/hooks/useCadences";
import {
  useEnrollmentRules,
  useCreateEnrollmentRule,
  useUpdateEnrollmentRule,
  useDeleteEnrollmentRule,
} from "@/hooks/cadences/useEnrollmentRules";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STAGES = ["lead", "prospecting", "qualified", "proposal", "negotiation", "won", "lost"];

export function EnrollmentRulesDialog() {
  const [open, setOpen] = useState(false);
  const { data: cadences } = useCadences();
  const { data: rules } = useEnrollmentRules();
  const createRule = useCreateEnrollmentRule();
  const updateRule = useUpdateEnrollmentRule();
  const deleteRule = useDeleteEnrollmentRule();

  const [form, setForm] = useState({
    cadence_id: "",
    name: "",
    description: "",
    trigger_stage: "any",
    trigger_category: "",
    trigger_source: "",
    min_amount: "",
    max_amount: "",
    priority: 100,
  });

  const [running, setRunning] = useState(false);

  const handleCreate = () => {
    if (!form.cadence_id || !form.name) {
      toast.error("Cadência e nome são obrigatórios");
      return;
    }
    createRule.mutate(
      {
        cadence_id: form.cadence_id,
        name: form.name,
        description: form.description || null,
        trigger_stage: form.trigger_stage === "any" ? null : form.trigger_stage,
        trigger_category: form.trigger_category || null,
        trigger_source: form.trigger_source || null,
        min_amount: form.min_amount ? Number(form.min_amount) : null,
        max_amount: form.max_amount ? Number(form.max_amount) : null,
        priority: form.priority,
        is_active: true,
      },
      {
        onSuccess: () => {
          setForm({ ...form, name: "", description: "", trigger_category: "", trigger_source: "", min_amount: "", max_amount: "" });
        },
      },
    );
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-enroll-cadence", { body: {} });
      if (error) throw error;
      toast.success(`${data?.enrolled ?? 0} prospect(s) inscritos automaticamente!`);
    } catch (e) {
      toast.error("Erro ao executar auto-enrollment");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Regras automáticas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Regras de Auto-Enrollment
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Form de criação */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <h3 className="text-sm font-medium">Nova regra</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Cadência*</Label>
                  <Select value={form.cadence_id} onValueChange={(v) => setForm({ ...form, cadence_id: v })}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {cadences?.filter(c => c.is_active).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nome da regra*</Label>
                  <Input className="h-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Leads quentes >R$10k" />
                </div>
                <div>
                  <Label className="text-xs">Estágio (gatilho)</Label>
                  <Select value={form.trigger_stage} onValueChange={(v) => setForm({ ...form, trigger_stage: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Input className="h-9" value={form.trigger_category} onChange={(e) => setForm({ ...form, trigger_category: e.target.value })} placeholder="opcional" />
                </div>
                <div>
                  <Label className="text-xs">Valor mínimo (R$)</Label>
                  <Input className="h-9" type="number" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: e.target.value })} placeholder="opcional" />
                </div>
                <div>
                  <Label className="text-xs">Valor máximo (R$)</Label>
                  <Input className="h-9" type="number" value={form.max_amount} onChange={(e) => setForm({ ...form, max_amount: e.target.value })} placeholder="opcional" />
                </div>
              </div>
              <Textarea className="text-xs" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição (opcional)" />
              <Button size="sm" onClick={handleCreate} disabled={createRule.isPending} className="gap-2">
                <Plus className="h-3.5 w-3.5" /> Adicionar regra
              </Button>
            </div>

            {/* Lista de regras */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Regras ativas ({rules?.length ?? 0})</h3>
                <Button size="sm" variant="default" onClick={handleRunNow} disabled={running} className="gap-2">
                  <Zap className="h-3.5 w-3.5" /> {running ? "Executando..." : "Executar agora"}
                </Button>
              </div>
              {rules?.length === 0 && (
                <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma regra criada ainda</p>
              )}
              {rules?.map(rule => {
                const cadenceName = cadences?.find(c => c.id === rule.cadence_id)?.name ?? "—";
                return (
                  <div key={rule.id} className="rounded-lg border border-border/50 p-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{rule.name}</span>
                        <Badge variant="outline" className="text-[10px]">→ {cadenceName}</Badge>
                        {rule.trigger_stage && <Badge variant="secondary" className="text-[10px]">stage: {rule.trigger_stage}</Badge>}
                        {rule.min_amount && <Badge variant="secondary" className="text-[10px]">≥R${rule.min_amount}</Badge>}
                        {rule.trigger_category && <Badge variant="secondary" className="text-[10px]">{rule.trigger_category}</Badge>}
                      </div>
                      {rule.description && <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(v) => updateRule.mutate({ id: rule.id, is_active: v })}
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteRule.mutate(rule.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
