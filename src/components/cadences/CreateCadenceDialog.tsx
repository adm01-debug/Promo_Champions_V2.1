import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCadence, useCreateCadenceStep, useCadenceSteps, ActionType } from "@/hooks/useCadences";
import { Plus, Trash2, Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const actionTypes: { value: ActionType; label: string; icon: typeof Phone }[] = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "call", label: "Ligação", icon: Phone },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

interface StepInput {
  day_number: number;
  action_type: ActionType;
  title: string;
  description: string;
}

export function CreateCadenceDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"info" | "steps">("info");
  const [cadenceId, setCadenceId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<StepInput[]>([
    { day_number: 1, action_type: "email", title: "Email de introdução", description: "" },
  ]);

  const createCadence = useCreateCadence();
  const createStep = useCreateCadenceStep();
  const { data: savedSteps } = useCadenceSteps(cadenceId || undefined);

  const resetForm = () => {
    setStep("info");
    setCadenceId(null);
    setName("");
    setDescription("");
    setSteps([{ day_number: 1, action_type: "email", title: "Email de introdução", description: "" }]);
  };

  const handleCreateCadence = async () => {
    if (!name.trim()) return;

    const result = await createCadence.mutateAsync({ name, description: description || undefined });
    setCadenceId(result.id);
    setStep("steps");
  };

  const addStep = () => {
    const lastDay = steps.length > 0 ? Math.max(...steps.map(s => s.day_number)) : 0;
    setSteps([...steps, { 
      day_number: lastDay + 2, 
      action_type: "call", 
      title: "", 
      description: "" 
    }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof StepInput, value: string | number) => {
    const updated = [...steps];
    (updated[index] as any)[field] = value;
    setSteps(updated);
  };

  const handleSaveSteps = async () => {
    if (!cadenceId) return;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.title.trim()) continue;

      await createStep.mutateAsync({
        cadence_id: cadenceId,
        day_number: step.day_number,
        action_type: step.action_type,
        title: step.title,
        description: step.description || undefined,
        step_order: i,
      });
    }

    setOpen(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="glow" className="gap-2 font-medium">
          <Plus className="h-4 w-4" />
          Nova Cadência
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass border-border/50 dark:border-glow">
        <DialogHeader>
          <DialogTitle className="font-display text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
              <Plus className="h-4 w-4 gradient-primary" />
            </div>
            {step === "info" ? "Criar Nova Cadência" : "Configurar Etapas"}
          </DialogTitle>
        </DialogHeader>

        {step === "info" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nome da Cadência</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cadência de Prospecção Inicial"
                className="bg-muted/30 border-border/50 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Descrição (opcional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o objetivo desta cadência..."
                className="resize-none bg-muted/30 border-border/50 focus:border-primary transition-colors"
              />
            </div>
            <Button
              variant="glow"
              className="w-full font-medium"
              onClick={handleCreateCadence}
              disabled={!name.trim() || createCadence.isPending}
            >
              {createCadence.isPending ? "Criando..." : "Continuar para Etapas"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground">
                Configure as etapas de contato da cadência "<span className="text-foreground font-medium">{name}</span>"
              </p>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">{steps.length} etapas</Badge>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {steps.map((s, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/40 space-y-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-primary/20 to-accent/10 text-primary border border-primary/20">
                      Etapa {index + 1}
                    </Badge>
                    {steps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Dia</Label>
                      <Input
                        type="number"
                        min={1}
                        value={s.day_number}
                        onChange={(e) => updateStep(index, "day_number", parseInt(e.target.value) || 1)}
                        className="h-8 text-sm bg-background/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Tipo de Ação</Label>
                      <Select
                        value={s.action_type}
                        onValueChange={(v) => updateStep(index, "action_type", v)}
                      >
                        <SelectTrigger className="h-8 text-sm bg-background/50 border-border/50 focus:border-primary transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass border-border/50">
                          {actionTypes.map(type => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-3.5 w-3.5" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Título da Ação</Label>
                    <Input
                      value={s.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Ex: Primeiro contato por email"
                      className="h-8 text-sm bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Descrição (opcional)</Label>
                    <Textarea
                      value={s.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                      placeholder="Instruções ou template..."
                      className="min-h-[60px] text-sm resize-none bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full gap-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors" onClick={addStep}>
              <Plus className="h-4 w-4" />
              Adicionar Etapa
            </Button>

            <Button
              variant="glow-success"
              className="w-full font-medium"
              onClick={handleSaveSteps}
              disabled={createStep.isPending || steps.every(s => !s.title.trim())}
            >
              {createStep.isPending ? "Salvando..." : "Salvar Cadência"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
