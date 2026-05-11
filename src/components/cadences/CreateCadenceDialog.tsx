import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCadence, useCreateCadenceStep, useCadenceSteps, ActionType } from "@/hooks/useCadences";
import { Plus, Trash2, Phone, Mail, Linkedin, MessageCircle, Users, MoreHorizontal, Braces } from "lucide-react";
import { MergeTagPicker } from "./MergeTagPicker";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const actionTypes: { value: ActionType; label: string; icon: typeof Phone }[] = [
  { value: "email", label: "E-mail", icon: Mail },
  { value: "call", label: "Ligação", icon: Phone },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "meeting", label: "Reunião", icon: Users },
  { value: "other", label: "Outro", icon: MoreHorizontal },
];

const cadenceSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
});

type CadenceFormData = z.infer<typeof cadenceSchema>;

interface StepInput {
  day_number: number;
  action_type: ActionType;
  title: string;
  description: string;
  needs_approval: boolean;
  task_type: 'manual' | 'automatic';
}

export function CreateCadenceDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"info" | "steps">("info");
  const [cadenceId, setCadenceId] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepInput[]>([
    { day_number: 1, action_type: "email", title: "Email de introdução", description: "", needs_approval: false, task_type: "manual" },
  ]);

  const createCadence = useCreateCadence();
  const createStep = useCreateCadenceStep();
  const { data: _savedSteps } = useCadenceSteps(cadenceId || undefined);

  const form = useForm<CadenceFormData>({
    resolver: zodResolver(cadenceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const resetForm = () => {
    setStep("info");
    setCadenceId(null);
    form.reset();
    setSteps([{ day_number: 1, action_type: "email", title: "Email de introdução", description: "", needs_approval: false, task_type: "manual" }]);
  };

  const handleCreateCadence = async (data: CadenceFormData) => {
    const result = await createCadence.mutateAsync({ 
      name: data.name, 
      description: data.description || undefined 
    });
    setCadenceId(result.id);
    setStep("steps");
  };

  const addStep = () => {
    const lastDay = steps.length > 0 ? Math.max(...steps.map(s => s.day_number)) : 0;
    setSteps([...steps, { 
      day_number: lastDay + 2, 
      action_type: "call", 
      title: "", 
      description: "",
      needs_approval: false,
      task_type: "manual"
    }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = <K extends keyof StepInput>(index: number, field: K, value: StepInput[K]) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
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
        needs_approval: step.needs_approval,
        task_type: step.task_type,
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateCadence)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Cadência *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: Cadência de Prospecção Inicial"
                        className="bg-muted/30 border-border/50 focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descreva o objetivo desta cadência..."
                        className="resize-none bg-muted/30 border-border/50 focus:border-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                variant="glow"
                type="submit"
                className="w-full font-medium"
                disabled={createCadence.isPending}
              >
                {createCadence.isPending ? "Criando..." : "Continuar para Etapas"}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground">
                Configure as etapas de contato da cadência "<span className="text-foreground font-medium">{form.getValues("name")}</span>"
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
                        size="icon" aria-label="Excluir"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-muted-foreground">Dia *</FormLabel>
                      <Input
                        type="number"
                        min={1}
                        value={s.day_number}
                        onChange={(e) => updateStep(index, "day_number", parseInt(e.target.value) || 1)}
                        className="h-8 text-sm bg-background/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <FormLabel className="text-xs font-medium text-muted-foreground">Tipo de Ação</FormLabel>
                      <Select
                        value={s.action_type}
                        onValueChange={(v) => updateStep(index, "action_type", v as ActionType)}
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 rounded bg-background/40 border border-border/40">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[10px] font-medium">Aprovação</FormLabel>
                        <p className="text-[9px] text-muted-foreground">Exigir manual</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={s.needs_approval}
                        onChange={(e) => updateStep(index, "needs_approval", e.target.checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background/40 border border-border/40">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[10px] font-medium">Automática</FormLabel>
                        <p className="text-[9px] text-muted-foreground">Execução robô</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={s.task_type === 'automatic'}
                        onChange={(e) => updateStep(index, "task_type", e.target.checked ? 'automatic' : 'manual')}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-muted-foreground">Título da Ação *</FormLabel>
                    <Input
                      value={s.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Ex: Primeiro contato por email"
                      className="h-8 text-sm bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium text-muted-foreground">Conteúdo do Template</FormLabel>
                      <MergeTagPicker
                        preview={s.description}
                        onInsert={(token) => updateStep(index, "description", (s.description || "") + token)}
                      />
                    </div>
                    <Textarea
                      value={s.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                      placeholder="Instruções ou template da mensagem..."
                      className="min-h-[80px] text-sm resize-none bg-background/50 border-border/50 focus:border-primary transition-colors font-mono"
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
              variant="glow-pulse-success"
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